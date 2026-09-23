import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  ShadingType,
  ImageRun
} from 'docx';

console.log('Generating 10-Page Master Connect Maratha Executive Profile with Background Images...');

// Color Constants
const COLOR_MAROON = '3D0D0D';
const COLOR_SAFFRON = 'EA580C';
const COLOR_DEEP_ORANGE = 'C2410C';
const COLOR_GOLD = 'B45309';
const COLOR_DARK = '1F2937';
const COLOR_MUTED = '4B5563';
const COLOR_LIGHT_BG = 'FFF7ED';
const COLOR_ALT_ROW = 'FFFDF9';
const COLOR_BORDER = 'FED7AA';

// Helper: Paragraph
function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: {
      before: opts.before ?? 30,
      after: opts.after ?? 60,
      line: opts.line ?? 240
    },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: opts.size || 20, // 10pt
        bold: opts.bold || false,
        italics: opts.italics || false,
        color: opts.color || COLOR_DARK
      })
    ]
  });
}

// Helper: Headings
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 60 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 28, // 14pt
        bold: true,
        color: COLOR_MAROON
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 80, after: 40 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 22, // 11pt
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  });
}

// Helper: Bullet
function bullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + ' ',
      font: 'Segoe UI',
      size: 19,
      bold: true,
      color: COLOR_DEEP_ORANGE
    }));
  }
  children.push(new TextRun({
    text,
    font: 'Segoe UI',
    size: 19,
    color: COLOR_DARK
  }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 20, after: 40, line: 230 },
    children
  });
}

// Helper: Callout Box
function callout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 28, color: COLOR_SAFFRON }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 140, right: 100 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 30 },
                children: [
                  new TextRun({
                    text: '🚩 ' + title,
                    font: 'Segoe UI',
                    size: 20,
                    bold: true,
                    color: COLOR_MAROON
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text,
                    font: 'Segoe UI',
                    size: 18,
                    italics: true,
                    color: COLOR_DARK
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// Helper: Table
function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  tableRows.push(new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: COLOR_MAROON, type: ShadingType.CLEAR },
      margins: { top: 70, bottom: 70, left: 90, right: 90 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: 'Segoe UI',
              size: 18,
              bold: true,
              color: 'FFFFFF'
            })
          ]
        })
      ]
    }))
  }));

  // Data Rows
  rows.forEach((r, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    tableRows.push(new TableRow({
      children: r.map((cellText, cellIdx) => new TableCell({
        width: colWidths[cellIdx] ? { size: colWidths[cellIdx], type: WidthType.PERCENTAGE } : undefined,
        shading: { fill: isAlt ? COLOR_ALT_ROW : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 50, bottom: 50, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: String(cellText),
                font: 'Segoe UI',
                size: 17,
                color: COLOR_DARK
              })
            ]
          })
        ]
      }))
    }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'F3F4F6' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'F3F4F6' }
    },
    rows: tableRows
  });
}

// Helper: Photographic Background / Hero Banner Image
function heroBanner(imageRelPath, width = 600, height = 105) {
  try {
    const imgPath = path.resolve(imageRelPath);
    if (fs.existsSync(imgPath)) {
      const data = fs.readFileSync(imgPath);
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new ImageRun({
            data,
            transformation: {
              width,
              height
            }
          })
        ]
      });
    }
  } catch (e) {
    console.warn('Could not load banner:', imageRelPath, e.message);
  }
  return new Paragraph({ spacing: { before: 0, after: 40 } });
}

function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()]
  });
}

const pages = [];

// ============================================================================
// PAGE 1: TITLE & EXECUTIVE COVER (मुखपृष्ठ)
// ============================================================================
pages.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: '🚩 ॥ श्री जगदंब ॥ 🚩',
        font: 'Segoe UI',
        size: 30,
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 20, after: 40 },
    children: [
      new TextRun({
        text: 'अखिल भारतीय मराठा महासंघ',
        font: 'Segoe UI',
        size: 38,
        bold: true,
        color: COLOR_MAROON
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({
        text: 'AKHIL BHARATIYA MARATHA MAHASANGH (REGD. ESTD. 1981)',
        font: 'Segoe UI',
        size: 18,
        bold: true,
        color: COLOR_GOLD
      })
    ]
  }),
  heroBanner('public/assets/images/real-raigad-panoramic.jpg', 600, 130),
  callout(
    'कनेक्ट मराठा महाप्रकल्प — अधिकृत १०-पानी संस्थात्मक महा-परिचय दस्तऐवज',
    'Connect Maratha Master Project Profile, Vision, Core Drivers & Future Tech Roadmap (2025–2035).\n' +
    'छत्रपती शिवाजी महाराजांच्या स्वराज्य प्रशासकीय आदर्शांवर आधारित, २१ व्या शतकातील तंत्रज्ञानस्नेही, ' +
    'आर्थिकदृष्ट्या स्वावलंबी, सामाजिकदृष्ट्या एकात्म आणि वैश्विक स्तरावर संघटित मराठा समाजाची १०-वर्षीय महा-योजना.'
  ),
  new Paragraph({ spacing: { before: 60, after: 40 } }),
  createTable(
    ['दस्तऐवज घटक (Specification)', 'अधिकृत तपशील (Project Specification)'],
    [
      ['प्रकल्प नाव (Project Name)', 'CONNECT MARATHA (कनेक्ट मराठा डिजिटल महाप्रकल्प)'],
      ['दस्तऐवज स्वरूप', '१०-पानी कार्यकारी प्रकल्प परिचय, कारणमीमांसा, ध्येय, व्हिजन व भावी विस्तार'],
      ['मान्यता व अधिकार', 'अखिल भारतीय मराठा महासंघ केंद्रीय नियामक मंडळ (Central Governing Council)'],
      ['केंद्रीय सचिवालये', 'पुणे (शिवाजीनगर) | मुंबई (नरिमन पॉईंट) | छत्रपती संभाजीनगर (ऑरिक सिटी)'],
      ['तांत्रिक व्यासपीठ', 'Vite 6 / React 18 / Node.js Microservices / Encrypted CMDB / Smart Card'],
      ['नियोजित भांडवली बजेट', '₹५२७ कोटी (५-वर्षीय महा-अंदाजपत्रक: २०२५-२०३०)'],
      ['लक्ष्यित डिजिटल सदस्यत्व', '१ कोटी+ पडताळणी झालेले डिजिटल स्मार्ट कार्डधारक मराठा बांधव']
    ],
    [38, 62]
  ),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 0 },
    children: [
      new TextRun({
        text: '॥ प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥',
        font: 'Segoe UI',
        size: 19,
        italics: true,
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  }),
  pageBreak()
);

// ============================================================================
// PAGE 2: WHY WE BUILT IT (प्रकल्प का उभारला? — The Need & Root Problem)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/maratha-kranti-morcha.jpg', 600, 105),
  h1('प्रकरण १: कनेक्ट मराठा प्रकल्प का उभारला? (Why We Built It)'),
  p(
    'मराठा समाजाचा इतिहास हा त्याग, पराक्रम, आणि राष्ट्ररक्षणाचा गौरवशाली इतिहास आहे. ' +
    'परंतु आज २१ व्या शतकात जमिनीवरील वास्तव पाहिले तर समाज अनेक गंभीर आर्थिक, शैक्षणिक व सामाजिक आव्हानांना तोंड देत आहे. ' +
    'या ऐतिहासिक संकटांवर मात करण्यासाठी आणि समाजाला आधुनिक युगात पुन्हा स्वाभिमानाने उभे करण्यासाठी "कनेक्ट मराठा" ची निर्मिती झाली.'
  ),
  h2('१.१ पाच मूलभूत संकटे व आव्हाने (The 5 Fundamental Crises We Must Solve)'),
  bullet('महाराष्ट्रातील ३६ जिल्ह्यांमध्ये आणि देशात पसरलेल्या ४ कोटींहून अधिक मराठा बांधवांना एकत्र आणणारी कोणतीही केंद्रीभूत, विश्वासार्ह डिजिटल सिस्टिम उपलब्ध नव्हती.', '१. सामाजिक विस्कळीतपणा:'),
  bullet('समाजातील ८०% जनता ग्रामीण भागात कोरडवाहू शेतीवर अवलंबून आहे. सततचे दुष्काळ, नापिकी आणि कर्जबाजारीपणामुळे मराठवाडा व विदर्भात सर्वाधिक शेतकरी आत्महत्या मराठा समाजात होत आहेत.', '२. कृषी संकट व शेतकरी आत्महत्या:'),
  bullet('इतर व्यापारी समाजांप्रमाणे मराठा समाजात स्वतःचे अंतर्गत B2B व्यावसायिक जाळे नव्हते; त्यामुळे मराठा तरुणांना नोकऱ्यांच्या शोधात वणवण भटकावे लागत होते.', '३. संघटित B2B व्यापारी व्यासपीठाचा अभाव:'),
  bullet('उच्च शिक्षणाचा (NEET, JEE, IAS, परदेशी शिक्षण) खर्च आवाक्याबाहेर गेला असून शासकीय योजना तळागाळातील गरजू विद्यार्थ्यांपर्यंत वेळेत पोहोचत नव्हत्या.', '४. शैक्षणिक व स्पर्धा परीक्षांमधील मागासलेपण:'),
  bullet('छत्रपती शिवाजी महाराजांच्या ३५०+ गड-किल्ल्यांचे संवर्धन, ऐतिहासिक बखरींचे जतन आणि संस्कृतीचे संवर्धन याकडे दुर्लक्ष होत होते.', '५. ऐतिहासिक वारशाची उपेक्षा:'),
  h2('१.२ ५८ मूक मोर्चे आणि संस्थात्मक उभारणीची ऐतिहासिक गरज'),
  p(
    '२०१६-१७ मध्ये ५ कोटी मराठ्यांनी ५८ मूक मोर्चे काढून जगाला शांततामय क्रांतीचे दर्शन घडवले. ' +
    'परंतु रस्त्यावरचे आंदोलन संपल्यानंतर त्याचा पाठपुरावा करणारी, समाजाला स्वावलंबी बनवणारी एक कायमस्वरूपी संस्थात्मक डिजिटल चौकट ' +
    'हवी होती. केवळ घोषणा न देता प्रत्यक्ष रोजगार, व्यवसाय आणि मदत देणारी शाश्वत परिसंस्था म्हणून कनेक्ट मराठा प्रकल्प उभारला गेला.'
  ),
  callout(
    'उभारणीचे मूळ सूत्र (The Core Imperative)',
    '"केवळ रस्त्यावरील आंदोलनाने समाज पुढे जात नाही; तर तंत्रज्ञान, उद्योग, शिक्षण आणि आर्थिक ऐक्य या चार स्तंभांवरच ' +
    'समाजाचे भवितव्य सुरक्षित होते. हेच कनेक्ट मराठाचे मूळ अधिष्ठान आहे."'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 3: VISION, MISSION & 10-YEAR GOALS (2025-2035)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/real-raigad-bastions.jpg', 600, 105),
  h1('प्रकरण २: व्हिजन, मिशन व १०-वर्षीय ठोस ध्येये (Vision & Goals)'),
  h2('२.१ दूरदृष्टी व ध्येय (Vision & Mission Statements)'),
  bullet(
    'छत्रपती शिवाजी महाराज व राजर्षी छत्रपती शाहू महाराज यांच्या कल्याणकारी तत्त्वांवर आधारित ' +
    'आर्थिकदृष्ट्या समृद्ध, शैक्षणिकदृष्ट्या प्रगत, सामाजिकदृष्ट्या एकात्म आणि जागतिक पातळीवर संघटित मराठा समाज घडवणे.',
    'दूरदृष्टी (Vision):'
  ),
  bullet(
    'आधुनिक तंत्रज्ञानाच्या आधारे १ कोटी कुटुंबांची सुरक्षित डिजिटल ओळख निर्माण करणे, बिझनेस संगममधून उद्योजकता वाढवणे, ' +
    'शेतकऱ्यांना शेतीमाल प्रक्रिया व निर्यात पाठबळ देणे, आणि २४x७ संकटसमयी सामाजिक सुरक्षा पुरवणे.',
    'ध्येय (Mission):'
  ),
  h2('२.२ दहा-वर्षीय ६ मोजता येणारी ठोस उद्दिष्टे: २०२५-२०३५ (Measurable 10-Year Goals)'),
  createTable(
    ['लक्ष्य क्र.', 'कार्यक्षेत्र (Domain)', '१०-वर्षीय साध्य उद्दिष्ट (Target 2025-2035)', 'अपेक्षित परिणाम (Expected Impact)'],
    [
      ['लक्ष्य १', 'डिजिटल ओळख', '१ कोटी+ सदस्यांची बायोमेट्रिक QR/NFC स्मार्ट कार्डद्वारे नोंदणी.', 'बनावट ओळखपत्रांचे उच्चाटन, अचूक कल्याणकारी डेटाबेस.'],
      ['लक्ष्य २', 'आर्थिक उलाढाल', 'बिझनेस संगम B2B मधून ५०,००० कोटी रुपयांची वार्षिक उलाढाल.', 'समाजात ५ लाख नवीन रोजगार व १ लाख नवउद्योजक निर्मिती.'],
      ['लक्ष्य ३', 'नागरी सेवा', '५,०००+ मराठा युवक-युवतींना UPSC/MPSC स्पर्धा परीक्षांतून अधिकारी बनवणे.', 'प्रशासनात समाजाचे कार्यक्षम व प्रामाणिक प्रतिनिधित्व.'],
      ['लक्ष्य ४', 'शेतकरी स्वावलंबन', '१० लाख शेतकरी कुटुंबांना कृषी प्रक्रिया, सिंचन व ॲग्रो-एक्सपोर्टशी जोडणे.', 'मराठवाडा व विदर्भात शून्य शेतकरी आत्महत्या मिशन साध्य.'],
      ['लक्ष्य ५', 'दुर्ग संवर्धन', 'सह्याद्रीतील ३५०+ गड-किल्ल्यांचे डिजिटायझेशन, स्वच्छता व ऐतिहासिक वास्तूंचे जतन.', 'भावी पिढ्यांमध्ये राष्ट्रभक्ती व इतिहासाची ज्योत तेवत ठेवणे.'],
      ['लक्ष्य ६', 'आरोग्य व सुरक्षा', '३६ जिल्ह्यांत २४x७ शिवकल्याण रुग्णवाहिका व आपत्कालीन कायदेशीर मदत कक्ष.', 'कोणताही मराठा बांधव संकटात असहाय्य राहणार नाही याची खात्री.']
    ],
    [12, 18, 42, 28]
  ),
  h2('२.३ संस्थात्मक मूल्यप्रणाली (The Core Values)'),
  p(
    '१. सत्य (पारदर्शक कारभार)  |  २. शौर्य (नवोन्मेषी उद्योजकता)  |  ३. सेवा (निस्वार्थ समाजकार्य)  |  ' +
    '४. स्वाभिमान (आत्मनिर्भरता)  |  ५. संघटन (अखंडित एकात्मता). या मूल्यांवरच कनेक्ट मराठाचा प्रत्येक निर्णय घेतला जातो.'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 4: HISTORICAL HERITAGE & SWARAJYA
// ============================================================================
pages.push(
  heroBanner('public/assets/images/real-shivaji-coronation.jpg', 600, 105),
  h1('प्रकरण ३: ऐतिहासिक वारसा व स्वराज्य प्रशासकीय मॉडेल'),
  h2('३.१ छत्रपती शिवाजी महाराजांचे जनकल्याणकारी स्वराज्य'),
  p(
    'छत्रपती शिवाजी महाराजांनी १६४५ मध्ये स्थापन केलेले हिंदवी स्वराज्य हे जगातील सर्वोत्तम जनकल्याणकारी राज्य होते. ' +
    'महाराजांनी जहागिरी-वतनदारी संपवून अधिकाऱ्यांना रोख वेतन दिले, शेतकऱ्यांच्या भाजीच्या देठालाही हात लावू नये अशी सक्त ताकीद दिली, ' +
    'आणि रयतेला दुष्काळात तगावी कर्ज व करमाफी दिली. हेच सुशासनाचे मॉडेल कनेक्ट मराठाचे वैचारिक मूळ आहे.'
  ),
  h2('३.२ अष्टप्रधान मंडळ रचना व आधुनिक समांतर पदे (Ashtapradhan Model)'),
  createTable(
    ['पदनाम (Designation)', 'शिवकालीन मंत्री', 'स्वराज्य कार्यकक्षा (Portfolio)', 'आधुनिक समांतर पद'],
    [
      ['१. पेशवे (मुख्य प्रधान)', 'मोरो त्रिंबक पिंगळे', 'समग्र राज्यकारभार, सैन्याचे संचालन व मुख्य नेतृत्व', 'Prime Minister / CEO'],
      ['२. अमात्य (मुजुमदार)', 'रामचंद्र नीळकंठ', 'जमा-खर्च, वित्त व्यवस्था, खजिन्याची तपासणी', 'Finance & Revenue Minister'],
      ['३. सचिव (सुरनिस)', 'अण्णाजी दत्तो', 'सरकारी फर्माने, जमीन मोजणी सुधारणा (काठी पद्धत)', 'Home & Revenue Reforms'],
      ['४. मंत्री (वाकनीस)', 'दत्ताजी त्रिंबक', 'दरबारातील दैनंदिन नोंदी, गुप्तहेर खाते, सुरक्षा', 'Home Affairs & Intelligence'],
      ['५. सेनापती (सरनोबत)', 'हंबीरराव मोहिते', 'अश्वदल, पायदळ, युद्धव्यूह, भरती व लष्करप्रमुख', 'Defense / Chief of Army'],
      ['६. सुमंत (डबीर)', 'रामचंद्र त्रिंबक', 'परराष्ट्र संबंध, राजकीय वकील व आंतरराज्य दूत', 'External Affairs Minister'],
      ['७. न्यायाधीश', 'निराजी रावजी', 'दिवाणी व फौजदारी न्यायदान, न्यायव्यवस्था', 'Chief Justice / Law Minister'],
      ['८. पंडितराव', 'मोरेश्वर पंडितराव', 'धर्मदान, विद्वान सत्कार, सांस्कृतिक धोरण', 'Cultural & Social Affairs']
    ],
    [24, 22, 34, 20]
  ),
  h2('३.३ ३५०+ गड-किल्ले, मराठा आरमार व अटकेपार विस्तार'),
  p(
    'सह्याद्रीचे ३५०+ किल्ले (राजगड, रायगड, तोरणा, प्रतापगड, पन्हाळा) आणि आरमारी जलदुर्ग (सिंधुदुर्ग, विजयदुर्ग, सुवर्णदुर्ग) ' +
    'हे भारताच्या लष्करी स्थापत्यशास्त्राचे चमत्कार आहेत. सरखेल कान्होजी आंग्रे यांनी सलग चार दशके अरबी समुद्रावर अजिंक्य वर्चस्व गाजवले. ' +
    '१६८१-१७०७ च्या २७ वर्षांच्या स्वातंत्र्यसंग्रामात मुघल बादशाह औरंगजेबाचा पराभव करून मराठ्यांनी अटकेपार भगवा फडकावला.'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 5: DIGITAL ECOSYSTEM & SMART CARD
// ============================================================================
pages.push(
  heroBanner('public/assets/images/connect-maratha-council.jpg', 600, 105),
  h1('प्रकरण ४: कनेक्ट मराठा डिजिटल इकोसिस्टम व स्मार्ट कार्ड'),
  h2('४.१ डिजिटल सार्वभौमत्व व तंत्रज्ञान आर्किटेक्चर'),
  p(
    'कनेक्ट मराठा ही भारताच्या डिजिटल पर्सनल डेटा प्रोटेक्शन कायदा २०२३ (DPDP Act 2023) चे काटेकोर पालन करणारी ' +
    'अत्याधुनिक, सुरक्षित आणि स्वदेशी प्रणाली आहे. समाजाचा डेटा कोणत्याही खाजगी परदेशी सर्व्हरवर न जाता ' +
    'पूर्णपणे AES-256 बिट एन्क्रिप्शनने सुरक्षित ठेवला जातो.'
  ),
  h2('४.२ डिजिटल स्मार्ट कार्ड तपशील व सुरक्षा वैशिष्ट्ये (Smart Card Specs)'),
  createTable(
    ['वैशिष्ट्य घटक (Feature)', 'तांत्रिक तपशील (Specs)', 'सुरक्षा व प्रशासकीय लाभ (Benefits)'],
    [
      ['रंगसंगती व डिझाइन', 'रॉयल मरून (#3D0D0D) ते गोल्ड फॉइल बॉर्डर', 'शिवकालीन राजमुद्रा व मराठा साम्राज्याच्या राजेशाही परंपरेचे प्रतीक.'],
      ['अँटी-काउंटरफीट चिप', 'सोन्यासारखा मायक्रोचिप सिस्टिम लोगो', 'बनावट ओळखपत्र बनवण्यास प्रतिबंध; डिजिटल स्वाक्षरीचे प्रमाणिकरण.'],
      ['डायनॅमिक QR कोड', 'एन्क्रिप्टेड SHA-256 ऑथेंटिकेशन टोकन', 'स्कॅन करताच सदस्याचे अधिकृत नाव, जिल्हा, पद व वैधता क्षणात तपासता येते.'],
      ['लेझर बीम स्कॅनर', 'अ‍ॅनिमेटेड ऑडिओ-व्हिज्युअल बीम पडताळणी', 'सभागृहात किंवा आपत्कालीन स्थितीत उपस्थिती नोंदवणे आणि बनावटगिरी रोखणे.'],
      ['ऑफलाइन PWA मोड', 'कॅश्ड लोकल क्रेडेंशियल्स', 'दुर्गम भागात इंटरनेट नसतानाही कार्ड ऑफलाइन व्हॅलिडेट होते व सेव्ह राहते.']
    ],
    [24, 36, 40]
  ),
  h2('४.३ तांत्रिक स्टॅक व सिस्टिम रचना'),
  bullet('Vite 6 + React 18, अत्यंत वेगवान (Sub-second load), सर्व स्मार्टफोन्सवर विनाअडथळा चालणारे सिमेंटिक UI.', 'फ्रंटएंड स्टॅक:'),
  bullet('Node.js (ESM) + Express Gateway, मायक्रोसर्व्हिसेस, RESTful APIs आणि RBAC सुरक्षा.', 'बॅकएंड गेटवे:'),
  bullet('Encrypted CMDB + PostgreSQL 16, स्थानिक पातळीवर रिअल-टाइम कॅशिंग आणि सुरक्षित क्लाउड बॅकअप.', 'डेटाबेस सुरक्षा:'),
  pageBreak()
);

// ============================================================================
// PAGE 6: ENTERPRISE CRM & 7-DIMENSIONAL REPORTING
// ============================================================================
pages.push(
  heroBanner('public/assets/images/meeting.jpg', 600, 105),
  h1('प्रकरण ५: एंटरप्राइज ६-रोल CRM व ७-मितीय अहवाल प्रणाली'),
  h2('५.१ सहा मुख्य प्रशासकीय भूमिका (The 6 Enterprise Roles)'),
  createTable(
    ['भूमिका (Role)', 'पदनाम (Designation)', 'कार्यकक्षा व अधिकार (Scope)', 'मुख्य वर्कफ्लो व वैशिष्ट्ये'],
    [
      ['ROLE 1', 'केंद्रीय सुपर ॲडमिन (Super Admin)', 'समग्र महाराष्ट्र व जागतिक चॅप्टर्स', 'वापरकर्ता व्यवस्थापन, सिस्टिम सुरक्षा, DPDP ऑडिट, डेटा बॅकअप.'],
      ['ROLE 2', 'कार्याध्यक्ष / राज्य अध्यक्ष (CEO)', '६ महसूल विभाग व कोटींचे प्रकल्प', 'B2B धोरणात्मक करार, MoUs, विभागीय प्रगती आढावा, उच्च समन्वय.'],
      ['ROLE 3', 'जिल्हा समन्वयक (District President)', '३६ जिल्हे व तालुका कार्यक्षेत्र', 'स्थानिक सदस्यांची KYC पडताळणी, तालुका समित्यांचे संचालन, तक्रार निवारण.'],
      ['ROLE 4', 'चॅप्टर अध्यक्ष (Chapter President)', 'स्थानिक बिझनेस संगम चॅप्टर', 'साप्ताहिक ब्रेकफास्ट बैठका, रेफरल्स देवाणघेवाण, उद्योग नेटवर्किंग.'],
      ['ROLE 5', 'मदत कक्ष ऑपरेटर (24x7 Helpdesk)', 'नागरिक सेवा व आपत्कालीन कक्ष', 'तक्रार नोंदणी, हॉस्पिटल बेड सहाय्य, कायदेशीर सल्ला, तिकीट ट्रॅकिंग.'],
      ['ROLE 6', 'सेवा स्वयंसेवक (Seva Volunteer)', 'प्रत्यक्ष मैदानी कार्य व गड संवर्धन', 'दुर्ग स्वच्छता, रक्तदान शिबिरे, सभा नियोजन, गरजूंपर्यंत थेट मदत.']
    ],
    [14, 26, 28, 32]
  ),
  h2('५.२ युनिव्हर्सल ७-मितीय अहवाल प्रणाली (7-Dimensional Reporting Matrix)'),
  p(
    'प्रशासकीय अचूकतेसाठी आणि पारदर्शकतेसाठी प्रत्येक अहवालात खालील ७ परिमाणांचा समावेश करण्यात आला आहे:'
  ),
  bullet('2024, 2025, 2026... वार्षिक वाढ व तुलना अचूक मोजण्यासाठी.', '१. वर्ष (Year):'),
  bullet('01 ते 12 (जानेवारी ते डिसेंबर) मासिक उद्दिष्टे व ताळेबंद तपासण्यासाठी.', '२. महिना (Month):'),
  bullet('Week 01 ते Week 52 साप्ताहिक बिझनेस बैठकांची उलाढाल ट्रॅक करण्यासाठी.', '३. आठवडा (Week):'),
  bullet('Day 01 ते Day 31 दैनंदिन सदस्य नोंदणी, देणग्या आणि हेल्पलाईन कॉल्स विश्लेषणासाठी.', '४. दिवस (Day):'),
  bullet('CM-10291, ADM-02... प्रत्येक नोंदीचे संपूर्ण ऑडिट ट्रेल आणि जबाबदारी निश्चितीसाठी.', '५. युझर आयडी (User ID):'),
  bullet('महाराष्ट्र, कर्नाटक, गोवा, गुजरात... राज्यनिहाय विस्तार व सीमाभागाच्या प्रगतीसाठी.', '६. राज्य (State):'),
  bullet('पुणे, मुंबई, सातारा, कोल्हापूर... तालुका व जिल्हानिहाय सूक्ष्म मूल्यमापनासाठी.', '७. शहर / जिल्हा (City):'),
  callout(
    'रंगसंगती व अहवाल कार्यक्षमता नियम',
    'CRM सिस्टिम केवळ पांढरा (#FFFFFF, #FFF7ED) आणि भगवा/नारंगी (#EA580C, #C2410C) रंगांमध्येच चालते. ' +
    'फिल्टर निवडताच एकूण आकडे, यशस्वी सौदे आणि उलाढाल एका सेकंदात स्क्रीनवर बदलते व CSV मध्ये सेव्ह होते.'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 7: BUSINESS SANGAM B2B NETWORK
// ============================================================================
pages.push(
  heroBanner('public/assets/images/handshake.jpg', 600, 105),
  h1('प्रकरण ६: बिझनेस संगम B2B नेटवर्क व आर्थिक सक्षमीकरण'),
  h2('६.१ बिझनेस संगमची संकल्पना व उद्दिष्ट'),
  p(
    'मराठा समाजाने शेतीसोबतच उद्योग, व्यापार, उत्पादन, तंत्रज्ञान आणि आंतरराष्ट्रीय व्यापारात आघाडी घेतली पाहिजे. ' +
    'या हेतूने "बिझनेस संगम" (Business Sangam) हे विश्वासार्ह B2B व्यावसायिक जाळे उभारण्यात आले आहे. ' +
    'येथे उद्योजक एकमेकांना प्रामाणिक ग्राहक (Referrals), कच्चा माल, आणि सहकार्य देऊन सामूहिक संपत्ती निर्माण करतात.'
  ),
  h2('६.२ साप्ताहिक ब्रेकफास्ट बैठका व ५-टप्प्यांची रेफरल सायकल'),
  bullet('प्रत्येक उद्योजक स्वतःच्या व्यवसायाची, उत्पादनांची आणि अपेक्षित ग्राहकांची माहिती देतो.', '१. ६० सेकंदांचा पिच:'),
  bullet('एका सदस्याच्या उद्योगाचे सविस्तर १० मिनिटांचे प्रेझेंटेशन व फॅक्टरी केस स्टडी.', '२. मुख्य व्यवसाय सादरीकरण:'),
  bullet('सभासद एकमेकांना खात्रीशीर ग्राहकांचे संदर्भ (Referrals) कागदावर किंवा ॲपमध्ये देतात.', '३. संदर्भ देवाणघेवाण:'),
  bullet('New (नवीन) ➔ Contacted (संपर्क) ➔ Qualified (पात्र) ➔ Proposal (प्रस्ताव) ➔ Won (यशस्वी सौदा).', '४. ५-टप्प्यांची पायपलाईन:'),
  bullet('झालेल्या व्यवसायाचे आभार मानून "थँक यू फॉर बिझनेस" स्लिप जाहीर करणे व महसूल नोंदवणे.', '५. कृतज्ञता मूल्य (TYFCB):'),
  h2('६.३ मराठा एक्स्पोर्ट हब व आंतरराष्ट्रीय निर्यात कॉरिडोर्स'),
  p(
    'महाराष्ट्रातील शेतकऱ्यांचा हापूस आंबा, द्राक्षे, डाळिंब, हळद, कांदा, गूळ आणि कोल्हापुरी चपला, पैठणी साड्या थेट ' +
    'दुबई, लंडन, सिंगापूर आणि अमेरिकेतील बाजारपेठेत पोहोचवण्यासाठी "मराठा एक्स्पोर्ट हब" कार्यरत आहे. ' +
    'मध्यस्थांची दलाली संपवून थेट उत्पादक शेतकऱ्यांना जागतिक नफ्याचा वाटा मिळवून देणे हा यामागील मुख्य उद्देश आहे.'
  ),
  h2('६.४ अण्णासाहेब पाटील महामंडळ व एमएसएमई क्लस्टर साहाय्य'),
  p(
    'अण्णासाहेब पाटील महामंडळाच्या १५ लाख रुपयांच्या बिनव्याजी कर्ज योजनेचा लाभ प्रत्येक तालुक्यातील होतकरू तरुणांना ' +
    'मिळवून देण्यासाठी महासंघाची विशेष टास्क फोर्स कार्यरत आहे. डीपीआर तयार करणे, बँक मंजुरी आणि व्यवसाय मार्गदर्शन ' +
    'एकाच छताखाली मोफत दिले जाते.'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 8: 50-DEPARTMENT 10-YEAR BLUEPRINT
// ============================================================================
pages.push(
  heroBanner('public/assets/images/fort-wall.jpg', 600, 105),
  h1('प्रकरण ७: ५० विभागांचा १०-वर्षीय मास्टर ब्लूप्रिंट (२०२५-२०३५)'),
  p(
    'समाजाच्या सर्वांगीण विकासासाठी महासंघाने ५० स्वतंत्र विभागांची रचना केली असून ते ५ मुख्य स्तंभांमध्ये विभागले आहेत:'
  ),
  createTable(
    ['स्तंभ (Pillar)', 'समाविष्ट विभाग (Departments)', 'मुख्य उद्दिष्टे व कार्यकक्षा (Core Mandates)', '१०-वर्षीय बजेट'],
    [
      [
        'स्तंभ १: डिजिटल ओळख व सुशासन',
        'DEPT-01 ते DEPT-10 (१० विभाग)',
        'स्मार्ट कार्ड वाटप, केंद्रीय सचिवालय, विधी सेल, आयटी सायबर सुरक्षा, जनसंपर्क, शाखा विस्तार, महिला सक्षमीकरण, आपत्कालीन मदत, दक्षता आयोग.',
        '₹१०७ कोटी'
      ],
      [
        'स्तंभ २: आर्थिक व उद्योग स्वावलंबन',
        'DEPT-11 ते DEPT-20 (१० विभाग)',
        'बिझनेस संगम, बळीराजा शेतकरी परिषद, अण्णासाहेब पाटील सेल, इंडस्ट्रियल पार्क्स, ॲग्रो-एक्स्पोर्ट, पतसंस्था, स्टार्टअप सीड फंड, डेअरी, हॉस्पिटॅलिटी.',
        '₹३६८ कोटी'
      ],
      [
        'स्तंभ ३: शिक्षण, कौशल्य व करिअर',
        'DEPT-21 ते DEPT-30 (१० विभाग)',
        'छत्रपती शिवाजी नागरी सेवा अकादमी, सारथी फेलोशिप, आंतरराष्ट्रीय ज्ञानपीठ विवि, कोडिंग व AI, परदेशी शिक्षण व्हिसा डेस्क, ३५८ तालुक्यांत अभ्यासिका-हॉस्टेल्स.',
        '₹३४८ कोटी'
      ],
      [
        'स्तंभ ४: दुर्ग संवर्धन, कला व संस्कृती',
        'DEPT-31 ते DEPT-40 (१० विभाग)',
        '३५० गड-किल्ले स्वच्छता व संवर्धन, मराठा महाग्रंथालय व ई-बखरी, शिवकालीन युद्धकला आखाडे, मंदिरे जीर्णोद्धार, ज्ञानकोश निर्मिती, शिवराज्याभिषेक सोहळा.',
        '₹१७४ कोटी'
      ],
      [
        'स्तंभ ५: आरोग्य, सामाजिक न्याय व कल्याण',
        'DEPT-41 ते DEPT-50 (१० विभाग)',
        'शिवकल्याण २४x७ आपत्कालीन मदत कक्ष, फिरते दवाखाने, शेतकरी आत्महत्या प्रतिबंध मिशन, सामुदायिक विवाह, व्यसनमुक्ती, सीमाभाग हक्क संरक्षण, जागतिक परिषद.',
        '₹१५५ कोटी'
      ]
    ],
    [24, 22, 42, 12]
  ),
  h2('७.१ अंमलबजावणी व प्रगती निर्देशांक (Execution Milestones)'),
  p(
    'प्रत्येक विभागाला स्वतंत्र आयडी (DEPT-01 ते DEPT-50), नोडल ऑफिसर, आणि त्रैमासिक Key Performance Indicators (KPIs) ' +
    'दिले गेले आहेत. दर तीन महिन्यांनी केंद्रीय नियामक मंडळाकडून प्रत्येक विभागाच्या प्रत्यक्ष प्रगतीचे ऑडिट केले जाते.'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 9: FUTURE ENHANCEMENTS & TECH ROADMAP
// ============================================================================
pages.push(
  heroBanner('public/assets/images/modern-maratha-achievers.jpg', 600, 105),
  h1('प्रकरण ८: भविष्यातील तांत्रिक विस्तार व पुढील टप्पे (Future Enhancements)'),
  h2('८.१ सहा क्रांतिकारी तांत्रिक टप्पे: २०२५-२०३० (Future Tech Roadmap)'),
  createTable(
    ['टप्पा क्र.', 'तांत्रिक उपक्रम (Future Enhancement)', 'कार्यप्रणाली व स्वरूप (Mechanism)', 'नियोजित वेळ'],
    [
      ['टप्पा १', 'AI-Driven B2B Matchmaking Engine', 'आर्टिफिशियल इंटेलिजन्सद्वारे मराठा शेतकरी, उत्पादक व खरेदीदारांचे स्वयंचलित मॅचमेकिंग.', '२०२५-२६'],
      ['टप्पा २', 'Blockchain Tamper-Proof Smart Credentials', 'स्मार्ट कार्ड व सदस्यत्व नोंदी ब्लॉकचेनवर स्टोअर करून १००% बनावटगिरीमुक्त ओळख.', '२०२६-२७'],
      ['टप्पा ३', 'Satellite GIS Fort Mapping & Drone Patrols', 'सह्याद्रीतील ३५० किल्ल्यांचे इस्रो/सॅटेलाइट GIS मॅपिंग व ड्रोनद्वारे अतिक्रमणांवर लक्ष.', '२०२६-२७'],
      ['टप्पा ४', 'Maratha Angel Network & Seed Fund', 'मराठा तरुण स्टार्टअप संस्थापकांसाठी १०० कोटी रुपयांचा व्हेंचर कॅपिटल सीड फंड.', '२०२७-२८'],
      ['टप्पा ५', 'Global Maratha Trade Logistics Corridors', 'दुबई, लंडन, सिंगापूर येथे स्वतःचे वेअरहाऊसिंग व शीतगृह लॉजिस्टिक्स हब उभारणे.', '२०२७-२९'],
      ['टप्पा ६', 'AI Telemedicine & Mental Wellness Kiosks', 'शेतकरी आत्महत्या निर्मूलनासाठी ग्रामीण भागात मोफत एआय मानसोपचार व डॉक्टरी सल्ला.', '२०२५-२८']
    ],
    [12, 34, 40, 14]
  ),
  h2('८.२ पुढील ५ वर्षांचा टप्प्याटप्प्याने विस्तार (Phased Implementation)'),
  bullet('डिजिटल स्मार्ट कार्ड १ कोटी नोंदणी, ३६ जिल्हा सचिवालये पूर्ण क्षमतेने सुरू करणे, २४x७ मदत कक्ष विस्तार.', 'टप्पा १ (२०२५-२६ पायाभरणी):'),
  bullet('३५८ तालुक्यांत अभ्यासिका, ५ इंडस्ट्रियल पार्क्स, आणि बिझनेस संगमचे ५०,००० कोटी उलाढाल उद्दिष्ट.', 'टप्पा २ (२०२७-२८ विस्तार):'),
  bullet('आंतरराष्ट्रीय ज्ञानपीठ विद्यापीठ, जागतिक मराठा चेंबर, आणि १००% शेतकरी आत्महत्यामुक्त महाराष्ट्र.', 'टप्पा ३ (२०२९-३५ जागतिक नेतृत्व):'),
  callout(
    'तंत्रज्ञानाचे अंतिम उद्दिष्ट',
    '"तंत्रज्ञान हे केवळ शोभेचे साधन नसून ते समाजातील शेवटच्या बांधवाच्या डोळ्यातील अश्रू पुसण्याचे आणि ' +
    'त्याच्या हाताला काम देण्याचे प्रभावी अस्त्र आहे. या ध्येयानेच आमचा तांत्रिक विस्तार सुरू राहील."'
  ),
  pageBreak()
);

// ============================================================================
// PAGE 10: GOVERNANCE, BUDGET, 80G & CONTACTS
// ============================================================================
pages.push(
  heroBanner('public/assets/images/palace.jpg', 600, 105),
  h1('प्रकरण ९: संस्थात्मक सुशासन, ५-वर्षीय अंदाजपत्रक व संपर्क'),
  h2('९.१ पाच-वर्षीय महा-अंदाजपत्रक सारणी: २०२५-२०३० (5-Year Budget)'),
  createTable(
    ['खर्च घटक (Budget Head)', 'वर्ष १', 'वर्ष २', 'वर्ष ३', 'वर्ष ४', 'वर्ष ५', 'एकूण ५ वर्षे'],
    [
      ['१. डिजिटल प्लॅटफॉर्म, सर्व्हर व सायबर सुरक्षा', '५.० कोटी', '४.० कोटी', '३.५ कोटी', '३.० कोटी', '३.० कोटी', '१८.५ कोटी'],
      ['२. डिजिटल स्मार्ट कार्ड निर्मिती व वाटप', '८.० कोटी', '६.० कोटी', '५.० कोटी', '४.० कोटी', '४.० कोटी', '२७.० कोटी'],
      ['३. ३५८ तालुक्यांत अभ्यासिका व वसतिगृहे', '२५.० कोटी', '३०.० कोटी', '३५.० कोटी', '३०.० कोटी', '२०.० कोटी', '१४०.० कोटी'],
      ['४. स्पर्धा परीक्षा अकादमी व शिष्यवृत्ती निधी', '१०.० कोटी', '१२.० कोटी', '१५.० कोटी', '१५.० कोटी', '१५.० कोटी', '६७.० कोटी'],
      ['५. बिझनेस संगम B2B व एमएसएमई इन्क्युबेशन', '१२.० कोटी', '१५.० कोटी', '२०.० कोटी', '२५.० कोटी', '२५.० कोटी', '९७.० कोटी'],
      ['६. सह्याद्री ३५० गड-किल्ले संवर्धन मोहिमा', '६.० कोटी', '८.० कोटी', '१०.० कोटी', '१०.० कोटी', '१०.० कोटी', '४४.० कोटी'],
      ['७. २४x७ मदत कक्ष, आरोग्य व शेतकरी आधार', '८.० कोटी', '१०.० कोटी', '१२.० कोटी', '१२.० कोटी', '१२.० कोटी', '५४.० कोटी'],
      ['८. ग्रंथालय, ज्ञानकोश व इतर कल्याणकारी', '१३.० कोटी', '१५.० कोटी', '१७.५ कोटी', '१७.० कोटी', '१७.० कोटी', '७९.५ कोटी'],
      ['एकूण वार्षिक अंदाजपत्रक (Total Budget)', '८७.० कोटी', '१००.० कोटी', '११८.० कोटी', '११६.० कोटी', '१०६.० कोटी', '५२७.० कोटी']
    ],
    [36, 10, 10, 11, 11, 11, 11]
  ),
  h2('९.२ वित्तीय पारदर्शकता, 80G करसवलत व CSR सहभाग'),
  p(
    'महासंघाला मिळणाऱ्या सर्व देणग्यांना आयकर कायदा कलम 80G अंतर्गत १००% करसवलत उपलब्ध आहे. ' +
    'सर्व जमा-खर्च चार्टर्ड अकाउंटंटकडून ऑडिट करून दरवर्षी सार्वजनिकरीत्या संकेतस्थळावर प्रसिद्ध केला जातो.'
  ),
  h2('९.३ अधिकृत मध्यवर्ती सचिवालये व संपर्क निर्देशिका'),
  callout(
    'अधिकृत संपर्क व केंद्रीय सचिवालये (Official Secretariats)',
    '• केंद्रीय सचिवालय (पुणे): मराठा भवन, १२०६/४-बी, संभाजी उद्यानासमोर, शिवाजीनगर, पुणे — ४११००५ | फोन: +९१ २० २५५३ ०२२२\n' +
    '• मुंबई संपर्क कार्यालय: १०२, मित्तल टॉवर्स, सी-विंग, नरिमन पॉईंट, मुंबई — ४०००२१ | ई-मेल: contact@connectmaratha.org\n' +
    '• मराठवाडा सचिवालय: ऑरिक सिटी हॉल, शेंद्रा MIDC, छत्रपती संभाजीनगर — ४३१०१५\n' +
    '• अधिकृत संकेतस्थळ: https://connectmaratha.org  |  हेल्पलाईन: १८००-२३३-१६७४ (२४x७ टोल-फ्री)'
  )
);

// ============================================================================
// DOCUMENT WRAPPING & SAVING
// ============================================================================
const doc = new Document({
  creator: 'Akhil Bharatiya Maratha Mahasangh - Connect Maratha Technical Core',
  title: 'Connect Maratha 10-Page Master Project Profile (2025-2035)',
  description: '10-Page Executive Profile with Background Images, Vision, Goals, Why We Built It and Future Tech Roadmap',
  styles: {
    default: {
      document: {
        run: {
          font: 'Segoe UI',
          size: 20,
          color: COLOR_DARK
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 720, // 0.5 inch margins = 720 twips (allows exact 1 page per section)
            bottom: 720,
            left: 1000,
            right: 1000
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 60 },
              children: [
                new TextRun({
                  text: 'अखिल भारतीय मराठा महासंघ — कनेक्ट मराठा महाप्रकल्प (Connect Maratha 10-Page Dossier)',
                  font: 'Segoe UI',
                  size: 15,
                  italics: true,
                  color: COLOR_MUTED
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.SPACE_BETWEEN,
              spacing: { before: 60, after: 0 },
              children: [
                new TextRun({
                  text: 'अधिकृत संस्थात्मक दस्तऐवज (Confidential & Official)  |  ',
                  font: 'Segoe UI',
                  size: 15,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  text: 'पृष्ठ ',
                  font: 'Segoe UI',
                  size: 15,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Segoe UI',
                  size: 15,
                  color: COLOR_DEEP_ORANGE,
                  bold: true
                }),
                new TextRun({
                  text: ' / ',
                  font: 'Segoe UI',
                  size: 15,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: 'Segoe UI',
                  size: 15,
                  color: COLOR_MUTED
                })
              ]
            })
          ]
        })
      },
      children: pages
    }
  ]
});

const target10PagePath = path.resolve('c:/Users/Yashraj Sathe/Downloads/cm/Connect_Maratha_10_Page_Executive_Profile.docx');
const altPath = path.resolve('c:/Users/Yashraj Sathe/Downloads/cm/Connect_Maratha_Project_Profile_10_Pages.docx');

console.log('Packing and writing 10-page document...');

Packer.toBuffer(doc).then(buffer => {
  try {
    fs.writeFileSync(target10PagePath, buffer);
    console.log(`Document saved to: ${target10PagePath}`);
  } catch (e1) {
    console.warn(`Could not save to ${target10PagePath}: ${e1.message}`);
  }

  try {
    fs.writeFileSync(altPath, buffer);
    console.log(`Document also saved to: ${altPath}`);
  } catch (e2) {
    console.warn(`Could not save to ${altPath}: ${e2.message}`);
  }

  const fileToStat = fs.existsSync(target10PagePath) ? target10PagePath : altPath;
  const stats = fs.statSync(fileToStat);
  console.log(`\n==================================================`);
  console.log(`SUCCESS! 10-Page Master Executive Dossier Generated.`);
  console.log(`File: ${fileToStat}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB (includes all photographic background images)`);
  console.log(`==================================================\n`);
}).catch(err => {
  console.error('Error generating 10-page docx:', err);
  process.exit(1);
});
