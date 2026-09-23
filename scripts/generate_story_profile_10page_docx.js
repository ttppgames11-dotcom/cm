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

console.log('Generating Enriched, Comprehensive Connect Maratha 10-Page Master Story Dossier (Like Master Spec)...');

// Color Constants matching Brand Guide
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
      before: opts.before ?? 25,
      after: opts.after ?? 50,
      line: opts.line ?? 235
    },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: opts.size || 19, // ~9.5pt
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
    spacing: { before: 80, after: 35 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 26, // 13pt
        bold: true,
        color: COLOR_MAROON
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 55, after: 25 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 21, // 10.5pt
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 40, after: 20 },
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 19,
        bold: true,
        color: COLOR_DEEP_ORANGE
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
      size: 18,
      bold: true,
      color: COLOR_DEEP_ORANGE
    }));
  }
  children.push(new TextRun({
    text,
    font: 'Segoe UI',
    size: 18,
    color: COLOR_DARK
  }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 15, after: 25, line: 225 },
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
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SAFFRON }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLOR_LIGHT_BG, type: ShadingType.CLEAR },
            margins: { top: 50, bottom: 50, left: 120, right: 80 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({
                    text: '🚩 ' + title,
                    font: 'Segoe UI',
                    size: 19,
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
                    size: 17,
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

// Helper: Story Note Box (Bottom of page reflection)
function storyNote(question, answer) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_GOLD },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_GOLD },
      left: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'FFFDF5', type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 10 },
                children: [
                  new TextRun({
                    text: '💡 STORY KEYNOTE: ' + question,
                    font: 'Segoe UI',
                    size: 17,
                    bold: true,
                    color: COLOR_MAROON
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: answer,
                    font: 'Segoe UI',
                    size: 16,
                    italics: true,
                    color: COLOR_MUTED
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

  tableRows.push(new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: COLOR_MAROON, type: ShadingType.CLEAR },
      margins: { top: 45, bottom: 45, left: 70, right: 70 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: 'Segoe UI',
              size: 17,
              bold: true,
              color: 'FFFFFF'
            })
          ]
        })
      ]
    }))
  }));

  rows.forEach((r, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    tableRows.push(new TableRow({
      children: r.map((cellText, cellIdx) => new TableCell({
        width: colWidths[cellIdx] ? { size: colWidths[cellIdx], type: WidthType.PERCENTAGE } : undefined,
        shading: { fill: isAlt ? COLOR_ALT_ROW : 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 35, bottom: 35, left: 60, right: 60 },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: String(cellText),
                font: 'Segoe UI',
                size: 16,
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

// Helper: Photographic Banner Image
function heroBanner(imageRelPath, width = 600, height = 90) {
  try {
    const imgPath = path.resolve(imageRelPath);
    if (fs.existsSync(imgPath)) {
      const data = fs.readFileSync(imgPath);
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
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
  return new Paragraph({ spacing: { before: 0, after: 20 } });
}

function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()]
  });
}

const pages = [];

// ============================================================================
// PAGE 1 — CONNECT MARATHA म्हणजे काय? (आपण कोण आहोत?)
// ============================================================================
pages.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 10, after: 15 },
    children: [
      new TextRun({
        text: '🚩 ॥ श्री जगदंब ॥ 🚩',
        font: 'Segoe UI',
        size: 24,
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  }),
  heroBanner('public/assets/images/real-raigad-panoramic.jpg', 600, 100),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 10, after: 10 },
    children: [
      new TextRun({
        text: 'CONNECT MARATHA',
        font: 'Segoe UI',
        size: 34,
        bold: true,
        color: COLOR_MAROON
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({
        text: 'एक समाज • एक नेटवर्क • एक डिजिटल व्यासपीठ',
        font: 'Segoe UI',
        size: 20,
        bold: true,
        color: COLOR_DEEP_ORANGE
      })
    ]
  }),
  callout(
    'महा-संकल्पना व अधिकृत संस्थात्मक परिचय',
    'Connect Maratha ही छत्रपती शिवाजी महाराजांच्या स्वराज्य आदर्शांवर आधारित आणि २१ व्या शतकातील तंत्रज्ञानाने सज्ज असलेली मराठा समाजाची सर्वोच्च डिजिटल परिसंस्था आहे. इतिहास, संस्कृती, समाज, व्यवसाय, शिक्षण, रोजगार आणि अखंड नेटवर्किंग यांना एकाच छताखाली आणून समाजाची सामूहिक ताकद (Collective Strength) राष्ट्रीय व जागतिक स्तरावर प्रस्थापित करण्याचा हा ऐतिहासिक महाप्रयत्न आहे.'
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('१.१ पाच स्तरांचे एकात्मिक मॉडेल (The 5-Level Progressive Ecosystem)'),
  createTable(
    ['स्तर (Level)', 'परिसंस्था घटक', 'मुख्य स्वरूप व समाजासाठी योगदान'],
    [
      ['Level 1', 'Individual (व्यक्ती व कुटुंबे)', 'प्रत्येक मराठा बांधवाची सुरक्षित डिजिटल ओळख, स्मार्ट कार्ड, कौटुंबिक कल्याण व मदत.'],
      ['Level 2', 'Professional (व्यावसायिक वर्ग)', 'डॉक्टर्स, वकील, सीए, इंजिनिअर्स, प्राध्यापक यांचे ज्ञानसंपन्न व मार्गदर्शक नेटवर्क.'],
      ['Level 3', 'Entrepreneur (उद्योजक व व्यापारी)', 'उद्योग, कारखाने, दुकाने व सेवांचा B2B व्यापार, अंतर्गत रेफरल्स व सामूहिक संपत्ती.'],
      ['Level 4', 'Organization (संस्था व मंडळे)', 'विविध मराठा संघटना, पतसंस्था, शिक्षण संस्था, ट्रस्ट व चॅप्टर्सचे डिजिटल संलग्नीकरण.'],
      ['Level 5', 'Global Community (वैश्विक समाज)', 'महाराष्ट्र, देश आणि ३०+ देशांतील अनिवासी मराठा बांधवांची अखंड, अभेद्य एकजूट.']
    ],
    [16, 28, 56]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('१.२ अधिकृत प्रकल्प तपशील (Master Project Specifications)'),
  bullet('अखिल भारतीय मराठा महासंघ केंद्रीय नियामक मंडळ (Central Governing Council) व तज्ज्ञ संचालक मंडळ.', 'प्रकल्प प्राधिकरण:'),
  bullet('पुणे (शिवाजीनगर मुख्यालय) | मुंबई (नरिमन पॉईंट कॉर्पोरेट डेस्क) | छत्रपती संभाजीनगर (ऑरिक हब).', 'केंद्रीय सचिवालये:'),
  bullet('Vite / React 18 / Node.js Microservices / Encrypted CMDB / Biometric QR-NFC Smart Card.', 'तांत्रिक व्यासपीठ:'),
  bullet('१ कोटी+ पडताळणी झालेले डिजिटल सदस्य आणि ₹५०,००० कोटींचे अंतर्गत B2B व्यावसायिक जाळे.', '१०-वर्षीय मुख्य लक्ष्य:'),
  new Paragraph({ spacing: { before: 20, after: 5 } }),
  storyNote('“आपण कोण आहोत?”', 'मराठा समाज हा केवळ इतिहासाचा वारसदार नाही, तर आजच्या डिजिटल युगात संघटित होऊन जगाचे नेतृत्व करण्यास सज्ज असलेला महासमूह आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 2 — CONNECT MARATHA ची गरज का? (समस्या काय?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/maratha-kranti-morcha.jpg', 600, 85),
  h1('PAGE 2 — CONNECT MARATHA ची गरज का?'),
  h2('२.१ आजची गरज — समाजाला अधिक प्रभावीपणे जोडण्याची'),
  p(
    'आज समाजात प्रत्येक क्षेत्रात अफाट क्षमता, ज्ञान आणि कर्तृत्व आहे. परंतु ही सर्व ताकद विस्कळीत (fragmented) स्वरूपात असल्यामुळे ' +
    'परस्परांना त्याचा लाभ होत नाही. एकात्मिक डिजिटल कनेक्टिव्हिटी आणि डिस्कव्हरी नसल्याने समाजाच्या हजारो संधी वाया जातात.'
  ),
  createTable(
    ['सक्षम घटक', 'सध्याची सक्षमता व ताकद', 'केंद्रीभूत कनेक्टिव्हिटी अभावी होणारे नुकसान'],
    [
      ['उद्योजक व व्यापारी', 'उत्कृष्ट उत्पादने, फॅक्टरीज व सेवा', 'हक्काचे अंतर्गत ग्राहक मिळत नाहीत, इतर व्यापारी समाजांप्रमाणे B2B जाळे नाही.'],
      ['Professionals (IT/CA/Law)', 'सर्वोच्च पदांवरील ज्ञान व कौशल्य', 'स्थानिक मराठा स्टार्टअप्स, तरुण व संस्थांना त्यांचे मार्गदर्शन वेळेत लाभत नाही.'],
      ['डॉक्टर्स व आरोग्य तज्ज्ञ', 'अद्ययावत हॉस्पिटल्स व क्लिनिक्स', 'ग्रामीण व गरीब मराठा रुग्णांपर्यंत मोफत किंवा सवलतीची वैद्यकीय मदत पोहोचत नाही.'],
      ['विद्यार्थी व तरुण पिढी', 'उत्साही, मेहनती व हुशार युवा', 'महागडे शिक्षण, स्पर्धा परीक्षांचे योग्य मार्गदर्शन व हक्काचा रोजगार मिळत नाही.'],
      ['महिला उद्योजिका', 'बचत गट, गृहउद्योग व बुटीक्स', 'मोठ्या बाजारपेठा, संस्थात्मक भांडवल आणि राज्यव्यापी प्रदर्शने मिळत नाहीत.'],
      ['शेतकरी व बळीराजा', 'कष्टाळू शेतकरी वर्ग', 'दलालांकडून होणारी लूट, शेतीमाल प्रक्रिया नसणे आणि कर्जबाजारीपणामुळे होणाऱ्या आत्महत्या.']
    ],
    [22, 28, 50]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('२.२ पाच मूलभूत संरचनात्मक संकटे (The 5 Fundamental Structural Crises)'),
  bullet('महाराष्ट्रातील ३६ जिल्हे आणि जगभरातील ४ कोटी बांधवांना जोडणारी कोणतीही अधिकृत डिजिटल यंत्रणा उपलब्ध नव्हती.', '१. सामाजिक विस्कळीतपणा:'),
  bullet('इतर व्यापारी समाजांप्रमाणे मराठा समाजात अंतर्गत B2B खरेदी-विक्रीची चौकट नसल्याने पैसा समाजात फिरत नाही.', '२. अंतर्गत B2B व्यापाराचा अभाव:'),
  bullet('NEET, JEE, UPSC, परदेशी शिक्षण आवाक्याबाहेर असून शासकीय योजना तळागाळापर्यंत पोहोचण्यात मोठी दरी आहे.', '३. करिअर व शिक्षणातील दरी:'),
  bullet('८०% समाज शेतीवर अवलंबून असून प्रक्रिया व थेट निर्यातीअभावी मराठवाडा-विदर्भात शेतकरी आत्महत्यांचे संकट गडद आहे.', '४. शेती संकट व दलालांची साखळी:'),
  bullet('सह्याद्रीतील ३५०+ किल्ल्यांचे संवर्धन, बखरींचे डिजिटायझेशन आणि इतिहासाचे जतन याकडे दुर्लक्ष होत होते.', '५. ऐतिहासिक वारशाची उपेक्षा:'),
  new Paragraph({ spacing: { before: 15, after: 15 } }),
  callout(
    'मुख्य प्रश्न व Connect Maratha चे चतुःसूत्री उत्तर',
    'प्रश्न: “आपल्या समाजातील व्यक्तीला योग्य व्यक्ती, योग्य व्यवसाय, योग्य mentor किंवा योग्य opportunity कशी सापडेल?”\n\n' +
    'उत्तर: “Connect the People ➔ Connect the Knowledge ➔ Connect the Business ➔ Connect the Opportunities.”\n' +
    'जेव्हा माणसे जोडली जातात, तेव्हा ज्ञानाचा प्रवाह सुरू होतो; त्यातून व्यापार विस्तारतो आणि अमर्याद संधी निर्माण होतात!'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“समस्या काय आहे?”', 'प्रतिभा आणि संधी यातील दरी मिटवून समाजातील प्रत्येक बांधवाला हक्काचे डिजिटल व्यासपीठ उपलब्ध करून देणे ही काळाची गरज आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 3 — आमचे VISION (आपल्याला कुठे जायचे आहे?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/real-raigad-bastions.jpg', 600, 85),
  h1('PAGE 3 — आमचे VISION'),
  callout(
    'सर्वोच्च ध्येयविधान (The Grand Vision Statement)',
    '“छत्रपती शिवाजी महाराज व राजर्षी शाहू महाराजांच्या कल्याणकारी तत्त्वांवर आधारित संघटित, सक्षम, स्वावलंबी आणि प्रगत मराठा समाजासाठी आधुनिक डिजिटल परिसंस्था निर्माण करणे.”'
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('३.१ चार मुख्य ध्येयक्षेत्रे (The 4 Strategic Vision Pillars)'),
  createTable(
    ['चिन्ह', 'ध्येयक्षेत्र', 'स्ट्रॅटेजिक उद्दिष्ट', 'दीर्घकालीन परिणाम'],
    [
      ['🏰', 'इतिहास\n(Heritage)', 'आपला गौरवशाली इतिहास, गड-किल्ले, अस्सल संदर्भ आणि वारसा पुढील पिढीपर्यंत पोहोचवणे.', 'नव्या पिढीत स्वाभिमान व राष्ट्रभक्तीची ज्योत तेवत राहणे.'],
      ['👥', 'समाज\n(Community)', 'समाजातील प्रत्येक व्यक्ती, कुटुंबे, संस्था, तालुके व चॅप्टर्स यांना एका कुटुंबासारखे जोडणे.', 'संकटसमयी २४x७ पाठीशी उभा राहणारा एकसंध समाज निर्माण होणे.'],
      ['💼', 'व्यवसाय\n(Economy)', 'Entrepreneurs आणि Professionals साठी सशक्त B2B networking ecosystem तयार करणे.', 'मराठा समाजाचे ५०,००० कोटी रुपयांचे अंतर्गत आर्थिक साम्राज्य उभे राहणे.'],
      ['🚀', 'भविष्य\n(Future)', 'Youth, Education, Skill, Career आणि Leadership साठी अमर्याद संधी निर्माण करणे.', 'प्रशासनात, राजकारणात, तंत्रज्ञानात व उद्योगात मराठा नेतृत्वाचा उदय.']
    ],
    [8, 18, 44, 30]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('३.२ दहा-वर्षीय ६ मोजता येणारी ठोस उद्दिष्टे: २०२५-२०३५ (Measurable 10-Year Goals)'),
  bullet('३६ जिल्हे व ३५८ तालुक्यांमधील १ कोटी मराठा कुटुंबांची बायोमेट्रिक QR/NFC स्मार्ट कार्डद्वारे अचूक नोंदणी.', 'लक्ष्य १: डिजिटल ओळख —'),
  bullet('बिझनेस संगमच्या माध्यमातून ५०,००० कोटींची वार्षिक B2B उलाढाल आणि ५ लाख नवीन नोकऱ्यांची निर्मिती.', 'लक्ष्य २: आर्थिक उलाढाल —'),
  bullet('छत्रपती शिवाजी नागरी सेवा मिशनमधून ५,०००+ मराठा युवक-युवतींना IAS, IPS, IRS, MPSC अधिकारी बनवणे.', 'लक्ष्य ३: स्पर्धा परीक्षा यश —'),
  bullet('१० लाख शेतकरी कुटुंबांना थेट ॲग्रो-प्रोसेसिंग, शीतगृहे व जागतिक निर्यातीशी जोडून आत्महत्या शून्य करणे.', 'लक्ष्य ४: शेतकरी स्वावलंबन —'),
  bullet('सह्याद्रीतील ३५०+ किल्ल्यांचे डिजिटल जीआयएस मॅपिंग, स्वच्छता मोहिमा व ऐतिहासिक ऐतिहासिक वास्तूंचे जतन.', 'लक्ष्य ५: दुर्ग संवर्धन —'),
  bullet('३६ जिल्ह्यांत २४x७ रुग्णवाहिका, हॉस्पिटल बेड सहाय्य आणि तज्ज्ञ वकिलांमार्फत कायदेशीर सुरक्षा.', 'लक्ष्य ६: सामाजिक सुरक्षा —'),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“आपल्याला कुठे जायचे आहे?”', 'केवळ समस्यांची चर्चा न करता पुढील १० वर्षांत मोजता येणाऱ्या ठोस उद्दिष्टांसह प्रगती साधण्याचा हा स्पष्ट दिशादर्शक आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 4 — CONNECT MARATHA चे 4 PILLARS (कार्य कसे करायचे?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/fort-wall.jpg', 600, 85),
  h1('PAGE 4 — CONNECT MARATHA चे 4 PILLARS'),
  h2('४.१ जतन करा • गौरव करा • जोडा • घडवा (Preserve • Celebrate • Connect • Build)'),
  p('कनेक्ट मराठा प्रकल्पाची संपूर्ण कार्यप्रणाली खालील चार अविभाज्य स्तंभांवर आधारलेली आहे:'),
  createTable(
    ['स्तंभ क्रमांक', 'स्तंभ व संकल्पना', 'कार्यक्षेत्र, उपक्रम व अंमलबजावणी स्वरूप'],
    [
      [
        'स्तंभ ०१',
        '🏰 जतन करा\n(PRESERVE)\nवारसा व संस्कृती',
        '• इतिहास: अस्सल शिवकालीन ऐतिहासिक तथ्ये व संशोधन\n• गड-किल्ले: ३५०+ सह्याद्री दुर्गांचे ३D डिजिटायझेशन व स्वच्छता मोहीम\n• व्यक्तिमत्त्वे: शूरवीर मावळे, सेनापती, विचारवंत यांची चरित्रे\n• दस्तऐवज: मोडी लिपी, बखरी, अप्रकाशित पत्रे व ऐतिहासिक ग्रंथ जतन\n• संस्कृती: पारंपरिक खेळ, युद्धकला (मर्दानी खेळ) व लोकसंस्कृती'
      ],
      [
        'स्तंभ ०२',
        '🌟 गौरव करा\n(CELEBRATE)\nकर्तृत्व व प्रेरणा',
        '• Achievers: देश-विदेशात सर्वोच्च कीर्ती मिळवणारे मराठा सुपुत्र-कन्या\n• Entrepreneurs: शून्यातून उद्योग साम्राज्य उभे करणारे उद्योजक\n• Professionals: जागतिक बहुराष्ट्रीय कंपन्यांमधील CXO व उच्चपदस्थ\n• Women Leaders: उद्योग, प्रशासन व समाजसेवेतील कर्तृत्ववान महिला\n• Youth: क्रीडा, विज्ञान, कोडिंग व कला क्षेत्रातील युवा विजेते'
      ],
      [
        'स्तंभ ०३',
        '🤝 जोडा\n(CONNECT)\nएकात्मिक नेटवर्क',
        '• Members: प्रत्येक कुटुंबाची सुरक्षित डिजिटल प्रोफाइल व स्मार्ट कार्ड\n• Businesses: ५०+ कॅटेगरीतील पडताळणीकृत मराठा उद्योजकांची डिरेक्टरी\n• Professionals: डॉक्टर, वकील, सीए, वास्तुविशारद यांचे नेटवर्क\n• Chapters: गाव, तालुका, जिल्हा व ३०+ देशांतील स्थानिक चॅप्टर्स\n• Community: सुख-दुःखात, सणांमध्ये व आपत्काळात एकत्र येणारा समाज'
      ],
      [
        'स्तंभ ०४',
        '🚀 घडवा\n(BUILD)\nभावी नेतृत्व',
        '• Career: जॉब पोर्टल्स, रोजगार मेळावे व करिअर समुपदेशन\n• Education: स्पर्धा परीक्षा ग्रंथालये, अभ्यासिका व उच्च शिक्षण मार्गदर्शन\n• Mentorship: यशस्वी उद्योजक व अधिकाऱ्यांकडून १-ऑन-१ मार्गदर्शन\n• Entrepreneurship: नवीन स्टार्टअप्सना इनक्युबेशन, फंडिंग व मार्केट\n• Future Leaders: समाजाचे नैतिक, दूरदर्शी व सक्षम नेतृत्व घडवणे'
      ]
    ],
    [12, 22, 66]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  callout(
    '४ स्तंभांचे कार्यकारी सूत्र (Execution Formula)',
    '“इतिहासाचे जतन केल्याने स्वाभिमान मिळतो, कर्तृत्वाचा गौरव केल्याने प्रेरणा मिळते, समाजात जोडले गेल्याने ताकद निर्माण होते आणि तरुणांना घडवल्याने उज्ज्वल भविष्य साकारते!”'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“Connect Maratha ने काम कसे करायचे आहे?”', 'या चार स्तंभांच्या एकात्मिक समन्वयातूनच समाजाच्या सर्वांगीण सक्षमीकरणाचा पाया रचला गेला आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 5 — HISTORY & HERITAGE (आपली ओळख कुठून आली?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/real-shivaji-coronation.jpg', 600, 85),
  h1('PAGE 5 — HISTORY & HERITAGE'),
  h2('५.१ 🏰 आपला इतिहास — आपली ओळख'),
  p(
    'मराठा समाजाचा इतिहास हा केवळ लढायांचा इतिहास नसून तो स्वातंत्र्य, समता, रयतेचे कल्याण आणि आदर्श राज्यकारभाराचा सुवर्णकाळ आहे. ' +
    'Connect Maratha मध्ये आपल्या ३५०+ वर्षांच्या पराक्रमी इतिहासाचे अत्याधुनिक **Digital Preservation** करण्यात आले आहे.'
  ),
  createTable(
    ['विभाग क्र.', 'ऐतिहासिक दालन (Heritage Module)', 'सविस्तर संशोधन व डिजिटल वैशिष्ट्ये'],
    [
      ['दालन १', 'छत्रपती शिवाजी महाराज', 'हिंदवी स्वराज्याची स्थापना, आदर्श प्रशासन, शेती धोरण, करपद्धती व रयतेची अजोड काळजी.'],
      ['दालन २', 'राजमाता जिजाऊ साहेब', 'स्वराज्याची मूळ प्रेरणा, संस्कार, न्यायनिवाडा, राजनीती आणि शिवरायांचे चरित्र घडवणारी माता.'],
      ['दालन ३', 'छत्रपती संभाजी महाराज', 'अद्वितीय पराक्रम, प्रखर धर्मनिष्ठा, संस्कृत ग्रंथसंपदा (बुधभूषण), वयाच्या १४ व्या वर्षापासून लढाया व सर्वोच्च बलिदान.'],
      ['दालन ४', 'मराठा साम्राज्य व विस्तार', 'पेशवे, शिंदे, होळकर, गायकवाड, भोसले, पवार यांचा अटकेपार भगवा विस्तार आणि दिल्लीचे रक्षण.'],
      ['दालन ५', '३५०+ गड-किल्ले (Forts)', 'राजगड, रायगड, तोरणा, सिंधुदुर्ग, प्रतापगड यांचे ३D मॅपिंग, ट्रेकिंग गाइड्स व संवर्धन मोहीम.'],
      ['दालन ६', 'मराठा आरमार (Navy)', 'सरखेल कान्होजी आंग्रे, सिंधुदुर्ग-विजयदुर्ग-सुवर्णदुर्ग आरमारी तळ आणि समुद्रावरील अजिंक्य सत्ता.'],
      ['दालन ७', 'ऐतिहासिक व्यक्तिमत्त्वे', 'बाजीप्रभू, तानाजी, शिवा काशिद, संताजी, धनाजी, अहिल्याबाई, ताराबाई या महानायकांची चरित्रे.'],
      ['दालन ८', 'इतिहास कालपट (Timeline)', '१६३० ते १८१८ आणि स्वातंत्र्यापर्यंतच्या प्रत्येक महत्त्वाच्या ऐतिहासिक घटनेची अचूक शृंखला.'],
      ['दालन ९', 'ग्रंथ व ज्ञानसंपदा', 'दुर्मीळ बखरी, मोडी कागदपत्रे, ऐतिहासिक नकाशे व ई-पुस्तकांचे सर्वात मोठे डिजिटल संग्रहालय.']
    ],
    [14, 30, 56]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  callout(
    'ऐतिहासिक मुख्य विचार (Guiding Philosophy)',
    '“इतिहास केवळ आठवण्यासाठी नाही; पुढील पिढीला दिशा देण्यासाठी आहे.”\n' +
    'शिवरायांचे अष्टप्रधान मॉडेल, आरमार आणि जलव्यवस्थापन आजच्या २१ व्या शतकातील कॉर्पोरेट व प्रशासनालाही दिशा देणारे आहे.'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“आपली ओळख कुठून आली?”', 'ज्या समाजाला आपला खरा इतिहास ठाऊक असतो, तो समाज स्वतःचे वर्तमान व भविष्य स्वाभिमानाने जिंकू शकतो.'),
  pageBreak()
);

// ============================================================================
// PAGE 6 — MARATHA BUSINESS NETWORK (व्यवसायाला कसे जोडणार?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/handshake.jpg', 600, 85),
  h1('PAGE 6 — MARATHA BUSINESS NETWORK'),
  h2('६.१ 💼 समाजातून Business Network कडे — आर्थिक क्रांतीचे पर्व'),
  p(
    'मराठा समाजाने शेतीसोबतच उद्योग, व्यापार, उत्पादन, तंत्रज्ञान आणि आंतरराष्ट्रीय व्यापारात आघाडी घेतली पाहिजे. ' +
    'या हेतूने "बिझनेस संगम" (Business Sangam) हे विश्वासार्ह B2B व्यावसायिक जाळे उभारण्यात आले आहे.'
  ),
  createTable(
    ['व्यावसायिक सुविधा', 'कार्यपद्धती व स्वरूप', 'उद्योजकांसाठी थेट लाभ'],
    [
      ['Business Directory', '५०+ श्रेणींमधील पडताळणीकृत मराठा उद्योजकांची यादी', 'थेट विश्वासार्ह स्थानिक, राज्यव्यापी व राष्ट्रीय ग्राहक शोधणे.'],
      ['Professional Directory', 'डॉक्टर्स, वकील, सीए, आर्किटेक्ट्स, कन्सल्टंट्स', 'व्यावसायिक सेवांची त्वरित देवाणघेवाण व सल्लामसलत.'],
      ['Business Chapters', 'तालुका व शहर पातळीवर नियमित साप्ताहिक बिझनेस ग्रुप्स', 'स्थानिक उद्योजकांमध्ये घट्ट मैत्री, संवाद व व्यावसायिक सहकार्य.'],
      ['Referrals & 1-to-1 Meets', 'एकमेकांना हक्काचे ग्राहक संदर्भ व सखोल व्यावसायिक बैठका', 'कोणत्याही जाहिरात खर्चाविना खात्रीशीर विक्री वाढवणे.'],
      ['Business Opportunities', 'मोठ्या कंपन्यांचे उपकंत्राटे, सरकारी निविदा व पुरवठादार नोंदणी', 'मराठा उद्योजकांना मोठ्या प्रकल्पांमध्ये भागीदारी मिळवून देणे.'],
      ['मराठा एक्स्पोर्ट हब', 'शेतीमाल, औद्योगिक उत्पादने थेट परदेशात निर्यात', 'दुबई, लंडन, सिंगापूरमध्ये थेट विक्री करून जागतिक नफ्यात वाटा.'],
      ['अण्णासाहेब पाटील सेल', '१५ लाख बिनव्याजी कर्ज योजना, डीपीआर व बँक समन्वय', 'होतकरू तरुणांना विना-अडथळा व्यवसाय भांडवल उपलब्ध करणे.']
    ],
    [24, 38, 38]
  ),
  new Paragraph({ spacing: { before: 20, after: 5 } }),
  h3('Business Flow (व्यवसाय वृद्धी चक्र):'),
  p('Business Profile  ➔  Connect  ➔  1-to-1 Meeting  ➔  Referral  ➔  Collaboration  ➔  Business Growth', {
    bold: true,
    size: 20,
    color: COLOR_MAROON,
    align: AlignmentType.CENTER
  }),
  new Paragraph({ spacing: { before: 15, after: 15 } }),
  callout(
    'उद्योग क्रांतीचे महावाक्य (The Economic Manifesto)',
    '“आपण एकमेकांचे स्पर्धकच नाही — आपण एकमेकांचे Business Network Partners होऊ शकतो.”\n' +
    'जेव्हा मराठा समाज मराठ्याकडूनच खरेदी करेल आणि एकमेकांना व्यवसाय देईल, तेव्हा समाजाची आर्थिक संपन्नता कोणीही रोखू शकत नाही!'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“समाजाची ताकद Business Opportunity मध्ये कशी बदलायची?”', 'आपल्या अंतर्गत ग्राहक क्षमतेचा वापर करून समाजातील संपत्ती समाजातच फिरवण्याचे हे क्रांतिकारी मॉडेल आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 7 — YOUTH • EDUCATION • CAREER (Youth ला काय देणार?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/modern-maratha-achievers.jpg', 600, 85),
  h1('PAGE 7 — YOUTH • EDUCATION • CAREER'),
  h2('७.१ 🎓 आजचा युवा — उद्याचा Leader'),
  p(
    'मराठा समाजाचे भवितव्य आजच्या तरुण पिढीच्या हातात आहे. त्यामुळे शिक्षण, कौशल्य विकास, रोजगार, महिला सक्षमीकरण ' +
    'आणि नेतृत्व घडवण्यासाठी कनेक्ट मराठाने ५-आयामी सक्षमीकरण आराखडा तयार केला आहे.'
  ),
  createTable(
    ['विकास आयाम', 'प्रकल्प घटक व उपक्रम', 'विद्यार्थी व तरुणांसाठी उपलब्ध थेट लाभ'],
    [
      [
        'Education\n(शिक्षण व ज्ञान)',
        '• Knowledge Repository\n• Scholarships Portal\n• Educational Resources',
        'MPSC/UPSC, NEET, JEE परीक्षा तयारी, सारथी व शासकीय शिष्यवृत्तींची एकाच ठिकाणी माहिती, ३५८ तालुक्यांत डिजिटल अभ्यासिका व लायब्ररी.'
      ],
      [
        'Career\n(रोजगार व करिअर)',
        '• Job Opportunities\n• Career Guidance Desk\n• Corporate Placement',
        'मराठा उद्योजकांच्या कंपन्यांमधील नोकऱ्या, रेझ्युमे बिल्डिंग, मुलाखत तंत्र, आणि अनुभवी एचआर अधिकाऱ्यांकडून योग्य करिअर समुपदेशन.'
      ],
      [
        'Mentorship\n(तज्ज्ञ मार्गदर्शन)',
        '• Industry Experts Connect\n• Leadership Dialogues\n• 1-on-1 Mentoring',
        'आयटी, उत्पादन, बँकिंग व प्रशासनातील वरिष्ठ अधिकाऱ्यांकडून वैयक्तिक मार्गदर्शन; तरुणांची दिशाभूल टाळून त्यांना यशाचा मार्ग दाखवणे.'
      ],
      [
        'Entrepreneurship\n(उद्योजकता)',
        '• Startup Incubation\n• Angel Seed Funding\n• Business Visibility',
        'तरुणांच्या नावीन्यपूर्ण कल्पनांना स्टार्टअप्सचे रूप देणे, प्रकल्प अहवाल (DPR) बनवणे, आणि सुरुवातीचे भांडवल मिळवून देणे.'
      ],
      [
        'Women Empowerment\n(महिला सक्षमीकरण)',
        '• Women Entrepreneurs\n• Professionals Forum\n• Leadership Roles',
        'महिला बचत गट, गृहउद्योग व कॉर्पोरेट महिलांना बाजारपेठ, कौशल्य प्रशिक्षण आणि महासंघाच्या निर्णयप्रक्रियेत अग्रगण्य स्थान.'
      ]
    ],
    [20, 26, 54]
  ),
  new Paragraph({ spacing: { before: 20, after: 5 } }),
  h3('Career Journey (प्रगतीचा अखंड ६-टप्प्यांचा प्रवास):'),
  p('Student  ➔  Skill Training  ➔  Job  ➔  Corporate Professional  ➔  Entrepreneur  ➔  Society Mentor', {
    bold: true,
    size: 19,
    color: COLOR_DEEP_ORANGE,
    align: AlignmentType.CENTER
  }),
  new Paragraph({ spacing: { before: 15, after: 15 } }),
  callout(
    'युवा सक्षमीकरणाचा निर्धार',
    '“केवळ नोकरी मागणारा लाचार तरुण नाही, तर शेकडो तरुणांना रोजगार देणारा मराठा उद्योजक आणि प्रशासनात धोरण ठरवणारा मराठा अधिकारी घडवणे हेच आमचे अंतिम ध्येय आहे!”'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“पुढील पिढीसाठी आपण काय निर्माण करणार?”', 'तरुणांना स्वावलंबी बनवून समाजाचे भावी आधारस्तंभ घडवण्याचे नियोजन या पानातून मांडले आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 8 — CONNECT MARATHA DIGITAL ECOSYSTEM (Ecosystem कसा काम करतो?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/connect-maratha-council.jpg', 600, 85),
  h1('PAGE 8 — CONNECT MARATHA DIGITAL ECOSYSTEM'),
  h2('८.१ 🌐 एक Website नाही — एक Digital Ecosystem'),
  p(
    'Connect Maratha ही केवळ माहिती देणारी साधी वेबसाईट नसून, संपूर्ण मराठा समाजाच्या गरजा भागवणारी अत्याधुनिक, ' +
    'सुरक्षित, स्केलेबल आणि स्वदेशी डिजिटल परिसंस्था आहे. यामध्ये ५ मुख्य स्तर एकमेकांशी अखंड जोडलेले आहेत.'
  ),
  createTable(
    ['इकोसिस्टम स्तर', 'प्रमुख तंत्रज्ञान घटक', 'डिजिटल कार्यप्रणाली व वैशिष्ट्ये'],
    [
      ['स्तर १: 👤 MEMBER', 'Digital Profile, Smart Card, KYC Verification', 'प्रत्येक कुटुंबाची सुरक्षित प्रोफाइल, QR/NFC स्मार्ट ओळखपत्र, रक्तगट, कौशल्ये व पत्ता नोंदणी.'],
      ['स्तर २: 💼 BUSINESS', 'Business Directory, Chapters, Referrals Engine', 'उद्योगांची वर्गवारी, साप्ताहिक बैठकांचे ट्रॅकिंग, लीड मॅनेजमेंट आणि B2B उलाढाल अहवाल.'],
      ['स्तर ३: 🎓 KNOWLEDGE', 'History Portal, Granthalaya, LMS, Mentorship', 'शिवकालीन इतिहास, डिजिटल ग्रंथालय, ई-पुस्तके, स्पर्धा परीक्षा साहित्य व मार्गदर्शन वर्ग.'],
      ['स्तर ४: 🤝 COMMUNITY', 'Groups, Discussions, Events, Seva, Safety', 'तालुका व विषयनिहाय गट, रक्तपेढी समन्वय, २४x७ शिवकल्याण मदत कक्ष व कायदेशीर सल्ला.'],
      ['स्तर ५: 📊 MANAGEMENT', 'Super Admin, CEO, District CRM, Analytics', '६-रोल एंटरप्राइज प्रशासकीय डॅशबोर्ड, ७-मितीय प्रगती निर्देशांक आणि पारदर्शक कारभार.']
    ],
    [22, 32, 46]
  ),
  new Paragraph({ spacing: { before: 20, after: 5 } }),
  h3('एकात्मिक डिजिटल डेटा फ्लो (Integrated Architecture Flow):'),
  p('👤 MEMBER  ➔  💼 BUSINESS  ➔  🎓 KNOWLEDGE  ➔  🤝 COMMUNITY  ➔  📊 MANAGEMENT', {
    bold: true,
    size: 19,
    color: COLOR_MAROON,
    align: AlignmentType.CENTER
  }),
  new Paragraph({ spacing: { before: 15, after: 15 } }),
  callout(
    'तांत्रिक सार्वभौमत्व व डेटा सुरक्षा (DPDP Act 2023 Compliance)',
    '“एकाच digital platform वर व्यक्ती, व्यवसाय, ज्ञान आणि संधी यांना जोडणे.”\n' +
    'समाजाचा संपूर्ण डेटा भारताच्या डिजिटल डेटा प्रोटेक्शन कायदा २०२३ नुसार १००% सुरक्षित, AES-256 एन्क्रिप्टेड आणि कोणत्याही परदेशी सर्व्हरच्या हस्तक्षेपाशिवाय सुरक्षित ठेवला जातो.'
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“हे सर्व एकत्र कसे काम करणार?”', 'सर्व विभाग, साधने आणि घटक परस्परांना पूरक कसे ठरतात हे या आर्किटेक्चर पानातून स्पष्ट होते.'),
  pageBreak()
);

// ============================================================================
// PAGE 9 — FUTURE VISION (भविष्य काय आहे?)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/meeting.jpg', 600, 85),
  h1('PAGE 9 — FUTURE VISION'),
  h2('९.१ 🚀 आजची जोडणी — उद्याची संधी (2025–2035 Roadmap)'),
  p(
    'Connect Maratha चे व्हिजन केवळ आजच्या गरजांपुरते मर्यादित नसून, पुढील २५ वर्षांचे नियोजन समोर ठेवून ५ टप्प्यांचा ' +
    'क्रांतिकारी तांत्रिक व सामाजिक रोडमॅप आखण्यात आला आहे.'
  ),
  createTable(
    ['टप्पा (Phase)', 'रोडमॅप उद्दिष्ट', 'साध्य करावयाची प्रगती व परिणाम'],
    [
      ['Phase 1', 'Digital Community (पायाभरणी)', '१ कोटी मराठा बांधवांची सुरक्षित डिजिटल स्मार्ट कार्ड नोंदणी व ३६ जिल्हा सचिवालये.'],
      ['Phase 2', 'Business & Professional Network', '५०,०००+ उद्योजकांचे सक्रिय B2B जाळे, ५ इंडस्ट्रियल क्लस्टर्स व ₹१०,००० कोटी उलाढाल.'],
      ['Phase 3', 'Education & Mentorship Ecosystem', '३५८ तालुक्यांत मॉडर्न अभ्यासिका, परदेशी शिक्षण डेस्क व IAS/IPS फेलोशिप.'],
      ['Phase 4', 'AI-Powered Platform & Smart Matching', 'कृत्रिम बुद्धिमत्तेवर आधारित स्मार्ट जॉब मॅचिंग, बिझनेस लीड्स व २४x७ व्हर्च्युअल असिस्टंट.'],
      ['Phase 5', '🌎 Global Maratha Network', 'अमेरिका, युरोप, गल्फ व आशियातील ३०+ देशांमध्ये चॅप्टर्स, जागतिक निर्यात कॉरिडोर्स.']
    ],
    [16, 36, 48]
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  h2('९.२ आगामी ९ क्रांतिकारी तंत्रज्ञान उपक्रम (Future Possibilities)'),
  bullet('अत्यंत जलद, ऑफलाइन चालणारे, सुरक्षित आणि सुलभ वापरकर्ता अनुभव.', '१. Native Mobile Apps:'),
  bullet('आवश्यक डॉक्टर, वकील, उद्योजक किंवा मेंटॉर सेकंदात शोधणारी अल्गोरिदम प्रणाली.', '२. AI Smart Search:'),
  bullet('सदस्यांच्या प्रश्नांना २४ तास उत्तरे देणारा व शासकीय योजनांची माहिती देणारा बॉट.', '३. AI Community Assistant:'),
  bullet('जगभरातील अनिवासी मराठा व्यावसायिकांची एकाच क्लिकवर पडताळणीकृत यादी.', '४. Global Business Directory:'),
  bullet('घाऊक खरेदी-विक्री, शेतीमाल पुरवठा व कच्च्या मालाचे थेट ऑनलाइन ट्रेडिंग पोर्टल.', '५. B2B Marketplace:'),
  bullet('उच्च कौशल्य, कोडिंग, उद्योजकता आणि स्पर्धा परीक्षांचे ई-लर्निंग कोर्सेस.', '६. Learning Platform (LMS):'),
  bullet('देश-विदेशातील सर्वोच्च पदांवरील मार्गदर्शकांकडून थेट व्हिडिओ संवाद.', '७. Mentorship Network:'),
  bullet('स्थानिक चॅप्टर्सच्या बैठका, हजेरी, देणग्या व मिनिट्सचे संपूर्ण ऑटोमेशन.', '८. Chapter Management Tool:'),
  bullet('समाजाची आर्थिक, शैक्षणिक व आरोग्य प्रगती दाखवणारे पारदर्शक डेटा निर्देशांक.', '९. Community Analytics:'),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“आज आपण कुठे आहोत आणि उद्या कुठे पोहोचू शकतो?”', 'भविष्यातील संभाव्यता आणि आंतरराष्ट्रीय पातळीवरील मराठा समाजाचे स्थान या पानातून मांडले आहे.'),
  pageBreak()
);

// ============================================================================
// PAGE 10 — CALL TO ACTION (चला, आपण सर्व Connect Maratha सोबत जोडूया!)
// ============================================================================
pages.push(
  heroBanner('public/assets/images/quote.jpg', 600, 85),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 10, after: 10 },
    children: [
      new TextRun({
        text: '🚩 चला… CONNECT होऊया! 🚩',
        font: 'Segoe UI',
        size: 30,
        bold: true,
        color: COLOR_MAROON
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 30 },
    children: [
      new TextRun({
        text: 'चला… BUILD करूया!',
        font: 'Segoe UI',
        size: 26,
        bold: true,
        color: COLOR_SAFFRON
      })
    ]
  }),
  p('मराठा समाजाच्या वैभवाचा, स्वाभिमानाचा आणि स्वावलंबनाचा अंतिम प्रवास:', { align: AlignmentType.CENTER, size: 19, italics: true }),
  new Paragraph({ spacing: { before: 10, after: 10 } }),
  createTable(
    ['टप्पा', 'ध्येय प्रवास (The Transformation Arc)', 'प्रत्यक्ष कृती (Action Step)'],
    [
      ['१', '🏰 इतिहास जपूया (Preserve)', 'ऐतिहासिक सत्य, गड-किल्ले व संस्कृतीचे रक्षण करूया.'],
      ['२', '🌟 कर्तृत्वाचा गौरव करूया (Celebrate)', 'समाजातील गुणवंत, उद्योजक व अचीव्हर्सना सन्मान देऊया.'],
      ['३', '🤝 समाजाला जोडूया (Connect)', 'प्रत्येक कुटुंबाची डिजिटल नोंदणी करून एकसंध कुटुंब बनूया.'],
      ['४', '💼 व्यवसाय वाढवूया (Prosper)', 'आपसात व्यापार करून कोट्यवधींचे आर्थिक साम्राज्य उभे करूया.'],
      ['५', '🎓 युवकांना संधी देऊया (Empower)', 'तरुणांना शिक्षण, कौशल्य, नोकऱ्या व स्टार्टअप्सचे पंख देऊया.'],
      ['६', '🚀 भविष्यातील नेतृत्व घडवूया (Lead)', 'राष्ट्र उभारणीत मराठा समाजाचे नैतिक व समर्थ नेतृत्व घडवूया.']
    ],
    [10, 45, 45]
  ),
  new Paragraph({ spacing: { before: 20, after: 15 } }),
  callout(
    'अंतिम संदेश (The Final Inspirational Call)',
    '“भूतकाळातून प्रेरणा,\n' +
    'वर्तमानात जोडणी,\n' +
    'भविष्यासाठी उभारणी.”\n\n' +
    'CONNECT MARATHA\n' +
    'History | Community | Business | Education | Opportunity | Growth\n\n' +
    '🚩 जय जिजाऊ! 🚩 जय शिवराय! 🚩 जय शंभूराजे!'
  ),
  new Paragraph({ spacing: { before: 20, after: 10 } }),
  createTable(
    ['अधिकृत संपर्क केंद्र', 'तपशील व पत्ता'],
    [
      ['मध्यवर्ती सचिवालय (पुणे)', 'मराठा भवन, १२०६/४-बी, संभाजी उद्यानासमोर, शिवाजीनगर, पुणे — ४११००५ | फोन: +९१ २० २५५३ ०२२२'],
      ['मुंबई संपर्क कार्यालय', '१०२, मित्तल टॉवर्स, सी-विंग, नरिमन पॉईंट, मुंबई — ४०००२१ | ईमेल: contact@connectmaratha.org'],
      ['मराठवाडा सचिवालय', 'ऑरिक सिटी हॉल, शेंद्रा MIDC, छत्रपती संभाजीनगर — ४३१०१५'],
      ['अधिकृत संकेतस्थळ व हेल्पलाईन', 'वेबसाइट: https://connectmaratha.org  |  २४x७ टोल-फ्री हेल्पलाईन: १८००-२३३-१६७४']
    ],
    [32, 68]
  ),
  new Paragraph({ spacing: { before: 15, after: 5 } }),
  storyNote('“PAGE 10: चला, आपण सर्व Connect Maratha सोबत जोडूया!”', 'या अंतिम पानातून श्रोत्यांना, संस्थांना, नेत्यांना आणि उद्योजकांना एकत्र येऊन प्रत्यक्ष कृती करण्याचे थेट आवाहन दिले आहे.')
);

// Build Document
const doc = new Document({
  creator: 'Akhil Bharatiya Maratha Mahasangh - Connect Maratha Technical Core',
  title: 'Connect Maratha 10-Page Master Project Profile (Story Flow Edition)',
  description: '10-Page Executive Story Profile with Full Multi-Section Tables, Background Banners and Strategic Roadmap',
  styles: {
    default: {
      document: {
        run: {
          font: 'Segoe UI',
          size: 19,
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
            top: 720,    // 0.5 inch
            bottom: 720, // 0.5 inch
            left: 900,   // ~0.625 inch
            right: 900
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 30 },
              children: [
                new TextRun({
                  text: '🚩 CONNECT MARATHA — १०-पानी कथाप्रवाह प्रोफाइल (Master Executive Story Dossier)',
                  font: 'Segoe UI',
                  size: 14,
                  bold: true,
                  color: COLOR_GOLD
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
              spacing: { before: 30, after: 0 },
              children: [
                new TextRun({
                  text: 'Connect Maratha • एक समाज, एक नेटवर्क, एक डिजिटल व्यासपीठ  |  ',
                  font: 'Segoe UI',
                  size: 14,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  text: 'पृष्ठ ',
                  font: 'Segoe UI',
                  size: 14,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Segoe UI',
                  size: 14,
                  bold: true,
                  color: COLOR_MAROON
                }),
                new TextRun({
                  text: ' / ',
                  font: 'Segoe UI',
                  size: 14,
                  color: COLOR_MUTED
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  font: 'Segoe UI',
                  size: 14,
                  bold: true,
                  color: COLOR_MAROON
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

// Pack and write to both target file paths
const targetPath1 = path.resolve('c:/Users/Yashraj Sathe/Downloads/cm/Connect_Maratha_10_Page_Story_Profile.docx');
const targetPath2 = path.resolve('c:/Users/Yashraj Sathe/Downloads/cm/Connect_Maratha_Project_Profile_10_Pages.docx');
const targetPath3 = path.resolve('c:/Users/Yashraj Sathe/Downloads/cm/Connect_Maratha_10_Page_Executive_Profile.docx');

Packer.toBuffer(doc).then((buffer) => {
  [targetPath1, targetPath2, targetPath3].forEach(fp => {
    try {
      fs.writeFileSync(fp, buffer);
      console.log('✅ Successfully generated and saved to:', fp);
    } catch (e) {
      console.warn('Could not write to:', fp, e.message);
    }
  });
  console.log(`\n==================================================`);
  console.log(`SUCCESS! 10-Page Master Story Dossier Generated.`);
  console.log(`Buffer size: ${(buffer.length / 1024).toFixed(2)} KB`);
  console.log(`==================================================\n`);
}).catch((err) => {
  console.error('❌ Error generating docx:', err);
  process.exit(1);
});
