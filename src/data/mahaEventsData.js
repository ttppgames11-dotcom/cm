/* =======================================================================
   🚩 CONNECT MARATHA — १५ महा-उपक्रम मास्टर कॉन्फिगरेशन व डेटा मॉडेल
   15 Maha-Events Master Directory with Dedicated Fields, KPIs, and Forms
   ======================================================================= */

export const MAHA_EVENTS_LIST = [
  {
    id: 'EVT-01-JOBFAIR',
    number: 1,
    name: 'मेगा जॉब फेयर (Mega Job Fair)',
    category: 'Employment',
    plannedMonth: 'जुलै (July)',
    monthIndex: 7,
    level: 'State / District',
    icon: '💼',
    themeColor: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    tagline: 'मराठा युवक-युवतींना थेट नामांकित कॉर्पोरेट कंपन्यांमध्ये रोजगार संधी',
    primaryKPIs: [
      { key: 'candidates', label: 'नोंदणीकृत उमेदवार', defaultTarget: 5000, unit: 'उमेदवार' },
      { key: 'companies', label: 'सहभागी कंपन्या', defaultTarget: 120, unit: 'कंपन्या' },
      { key: 'vacancies', label: 'उपलब्ध नोकऱ्या', defaultTarget: 3500, unit: 'पदे' },
      { key: 'selected', label: 'अंतिम निवड / ऑफर्स', defaultTarget: 1800, unit: 'उमेदवार' }
    ],
    specialFields: [
      { id: 'companyName', label: 'कंपनीचे नाव', type: 'text', placeholder: 'उदा. Tata Motors / Infosys' },
      { id: 'sector', label: 'उद्योग क्षेत्र', type: 'select', options: ['IT & Software', 'Manufacturing', 'Banking & Finance', 'Automobile', 'Pharma', 'Logistics'] },
      { id: 'vacancies', label: 'जागा संख्या', type: 'number', placeholder: 'उदा. 50' },
      { id: 'qualificationReq', label: 'आवश्यक पात्रता', type: 'text', placeholder: 'उदा. BE, BCom, MBA, ITI, 12th Pass' },
      { id: 'interviewBooth', label: 'मुलाखत बूथ / कक्ष क्र.', type: 'text', placeholder: 'उदा. हॉल A - बूथ क्र. १२' },
      { id: 'packageRange', label: 'अपेक्षित वेतनश्रेणी (CTC)', type: 'text', placeholder: 'उदा. ₹२.५ ते ₹६.० लाख प्रतिवर्ष' }
    ],
    actionChecklist: [
      'कॉर्पोरेट कंपन्यांशी सामंजस्य करार व जागांची यादी संकलन',
      'उमेदवारांची शैक्षणिक व कौशल्यानुसार डिजिटल नोंदणी',
      'मुलाखत कक्ष व हॉलचे प्रत्यक्ष नियोजन',
      'ऑन-स्पॉट मुलाखती व तात्काळ ऑफर लेटर वितरण ट्रॅकिंग'
    ]
  },
  {
    id: 'EVT-02-BLOOD',
    number: 2,
    name: 'रक्तदान शिबिर व आरोग्य तपासणी',
    category: 'Healthcare & Seva',
    plannedMonth: 'ऑगस्ट (August)',
    monthIndex: 8,
    level: 'District / Taluka',
    icon: '🩸',
    themeColor: '#dc2626',
    gradient: 'linear-gradient(135deg, #991b1b, #dc2626)',
    tagline: '२४x७ आपत्कालीन रक्तसाठा व मोफत प्राथमिक आरोग्य तपासणी अभियान',
    primaryKPIs: [
      { key: 'bloodBags', label: 'संकलित रक्त पिशव्या', defaultTarget: 500, unit: 'बॅग्ज' },
      { key: 'donors', label: 'नोंदणीकृत रक्तदाते', defaultTarget: 750, unit: 'दाते' },
      { key: 'healthCheckups', label: 'आरोग्य तपासणी लाभार्थी', defaultTarget: 1200, unit: 'व्यक्ती' },
      { key: 'partnerBanks', label: 'सहभागी रक्तपेढ्या', defaultTarget: 6, unit: 'रक्तपेढ्या' }
    ],
    specialFields: [
      { id: 'bloodBankName', label: 'अधिकृत रक्तपेढीचे नाव', type: 'text', placeholder: 'उदा. ससून सर्वोपचार रक्तपेढी' },
      { id: 'doctorInCharge', label: 'प्रमुख वैद्यकीय अधिकारी', type: 'text', placeholder: 'उदा. डॉ. सचिन भोसले (MD)' },
      { id: 'screeningStatus', label: 'वैद्यकीय तपासणी स्थिती', type: 'select', options: ['पात्र (Eligible)', 'तात्पुरते अपात्र (Temporary Defer)', 'अपात्र (Ineligible)'] },
      { id: 'bloodGroup', label: 'रक्तगट (Blood Group)', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { id: 'hbCount', label: 'हिमोग्लोबिन पातळी (Hb)', type: 'text', placeholder: 'उदा. 13.5 g/dL' }
    ],
    actionChecklist: [
      'जिल्हा सरकारी रक्तपेढीशी अधिकृत करार व कोल्ड-चेन व्हॅन',
      'दात्यांची वजन, बीपी व हिमोग्लोबिन पूर्व-तपासणी',
      'रक्त संकलन व तातडीचे प्रमाणपत्र/कार्ड वितरण',
      'ससून/सिव्हिल हॉस्पिटल २४x७ रक्त साठा पोर्टलवर डेटा सिंक'
    ]
  },
  {
    id: 'EVT-03-MATRIMONY',
    number: 3,
    name: 'भव्य वैवाहिक वधू-वर परिचय मेळावा',
    category: 'Matrimony & Social',
    plannedMonth: 'मे (May)',
    monthIndex: 5,
    level: 'State / District',
    icon: '💍',
    themeColor: '#db2777',
    gradient: 'linear-gradient(135deg, #9d174d, #db2777)',
    tagline: 'मराठा समाजातील उच्चशिक्षित व अनुरूप वधू-वर थेट संवाद व परिचय',
    primaryKPIs: [
      { key: 'profiles', label: 'नोंदणीकृत प्रोफाइल्स', defaultTarget: 2500, unit: 'बायोडाटा' },
      { key: 'attendees', label: 'उपस्थित पालक व उमेदवार', defaultTarget: 4000, unit: 'पालक' },
      { key: 'matches', label: 'प्राथमिक जुळलेले परिचय', defaultTarget: 450, unit: 'जोड्या' },
      { key: 'verified', label: 'सत्यापित प्रोफाइल्स', defaultTarget: 2400, unit: 'सत्यापित' }
    ],
    specialFields: [
      { id: 'candidateName', label: 'उमेदवाराचे नाव', type: 'text', placeholder: 'उदा. चि. अमित पाटील' },
      { id: 'gender', label: 'लिंग', type: 'select', options: ['वर (Groom)', 'वधू (Bride)'] },
      { id: 'educationJob', label: 'शिक्षण व व्यवसाय', type: 'text', placeholder: 'उदा. B.Tech (Mechanical), MNC Pune' },
      { id: 'kulGotra', label: 'कुळ व गोत्र', type: 'text', placeholder: 'उदा. मोरे, भारद्वाज गोत्र' },
      { id: 'heightDob', label: 'उंची व जन्मतारीख', type: 'text', placeholder: 'उदा. 5 ft 10 in | 15-08-1996' },
      { id: 'privacyConsent', label: 'पालक संपर्क संमती', type: 'select', options: ['होय - संमत (Authorized)', 'फक्त केंद्रात दाखवा (Restricted)'] }
    ],
    actionChecklist: [
      'सत्यापित डिजिटल पत्रिका व बायोडाटा पुस्तिका तयार करणे',
      'शिक्षण व क्षेत्रनिहाय स्टेज व समुपदेशन टेबल वाटप',
      'पालक संवाद व गोपनीय संपर्क देवाणघेवाण कक्ष',
      'कार्यक्रमानंतर डिजिटल मॅट्रिमोनी पोर्टलवर फॉलो-अप'
    ]
  },
  {
    id: 'EVT-04-B2B',
    number: 4,
    name: 'मराठा B2B बिझनेस व इंडस्ट्रियल एक्स्पो',
    category: 'Business & Economy',
    plannedMonth: 'वर्षभर (Year-round)',
    monthIndex: 0,
    level: 'State / District',
    icon: '🏭',
    themeColor: '#d97706',
    gradient: 'linear-gradient(135deg, #92400e, #d97706)',
    tagline: 'मराठा उद्योजकांचे जाळे, स्थानिक उत्पादने व आंतरराष्ट्रीय व्यापार संधी',
    primaryKPIs: [
      { key: 'exhibitors', label: 'सहभागी स्टॉल्स / प्रदर्शक', defaultTarget: 200, unit: 'स्टॉल्स' },
      { key: 'b2bDeals', label: 'B2B बिझनेस लीड्स', defaultTarget: 1500, unit: 'लीड्स' },
      { key: 'mouValue', label: 'प्रस्तावित व्यवसाय उलाढाल', defaultTarget: 25, unit: '₹ कोटी' },
      { key: 'visitors', label: 'व्यापारी अभ्यागत', defaultTarget: 10000, unit: 'अभ्यागत' }
    ],
    specialFields: [
      { id: 'bizName', label: 'उद्योगाचे नाव', type: 'text', placeholder: 'उदा. शिवनेरी ॲग्रो फूड्स प्रा. लि.' },
      { id: 'productCategory', label: 'उत्पादन वर्गवारी', type: 'select', options: ['इंजिनिअरिंग व मॅन्युफॅक्चरिंग', 'अन्न प्रक्रिया व शेतमाल', 'बांधकाम व रिअल इस्टेट', 'आयटी व सॉफ्टवेअर', 'कापड उद्योग व हस्तकला'] },
      { id: 'stallNumber', label: 'स्टॉल / पॅव्हेलियन क्र.', type: 'text', placeholder: 'उदा. Stall #C-14' },
      { id: 'targetBuyer', label: 'अपेक्षित ग्राहक / भागीदार', type: 'text', placeholder: 'उदा. संस्थात्मक खरेदीदार, एक्सपोर्टर्स' },
      { id: 'turnover', label: 'वार्षिक उलाढाल', type: 'text', placeholder: 'उदा. ₹१.५ कोटी' }
    ],
    actionChecklist: [
      'एक्स्पो स्थळ, पॅव्हिलियन लेआउट व स्टॉल आरक्षण',
      'बायर्स आणि सेलर्स यांच्यात १-to-१ बैठकांचे वेळापत्रक',
      'सामंजस्य करार (MOU) व अधिकृत ऑर्डर नोंदी',
      'व्यापारी निर्देशिकेत (Business Directory) समावेश'
    ]
  },
  {
    id: 'EVT-05-FREEHEALTH',
    number: 5,
    name: 'सर्वोपचार मोफत महा-आरोग्य तपासणी शिबिर',
    category: 'Healthcare & Seva',
    plannedMonth: 'डिसेंबर (December)',
    monthIndex: 12,
    level: 'District / Taluka',
    icon: '🏥',
    themeColor: '#059669',
    gradient: 'linear-gradient(135deg, #065f46, #059669)',
    tagline: 'तज्ज्ञ डॉक्टरांकडून हृदयरोग, कर्करोग, डोळे व मोफत औषधोपचार',
    primaryKPIs: [
      { key: 'patients', label: 'एकूण तपासलेले रुग्ण', defaultTarget: 3000, unit: 'रुग्ण' },
      { key: 'specialists', label: 'तज्ज्ञ डॉक्टर चमू', defaultTarget: 45, unit: 'डॉक्टर' },
      { key: 'surgeries', label: 'मोफत शस्त्रक्रियेसाठी निवड', defaultTarget: 150, unit: 'रुग्ण' },
      { key: 'medicines', label: 'औषध किट्स वाटप', defaultTarget: 2800, unit: 'किट्स' }
    ],
    specialFields: [
      { id: 'department', label: 'तपासणी विभाग', type: 'select', options: ['हृदयरोग (Cardiology)', 'नेत्ररोग (Ophthalmology)', 'स्त्रीरोग (Gynecology)', 'दंतरोग (Dental)', 'अस्थिरोग (Orthopedic)', 'जनरल मेडिसिन'] },
      { id: 'tokenNumber', label: 'ओपीडी टोकन क्र.', type: 'text', placeholder: 'उदा. MED-0428' },
      { id: 'govtScheme', label: 'शासकीय योजना जोडणी', type: 'select', options: ['महात्मा फुले जन आरोग्य योजना', 'आयुष्मान भारत', 'ट्रस्ट मोफत मदत'] },
      { id: 'referralHospital', label: 'पुढील संदर्भासाठी रुग्णालय', type: 'text', placeholder: 'उदा. दीनानाथ मंगेशकर रुग्णालय' }
    ],
    actionChecklist: [
      'मोठ्या सुपर-स्पेशालिटी हॉस्पिटल्सशी समन्वय व डॉक्टर्स नियुक्ती',
      'ईसीजी, रक्त तपासणी, डोळे तपासणी मोबाईल व्हॅन व्यवस्था',
      'मोफत औषध वाटप काउंटर व फार्मसी व्यवस्था',
      'गंभीर रुग्णांचे महात्मा फुले योजनेतून शस्त्रक्रिया शेड्युलिंग'
    ]
  },
  {
    id: 'EVT-06-WOMENSHG',
    number: 6,
    name: 'महिला स्वावलंबन व बचत गट महापरिषद',
    category: 'Women Empowerment',
    plannedMonth: 'मार्च (March)',
    monthIndex: 3,
    level: 'State / District',
    icon: '🌸',
    themeColor: '#9333ea',
    gradient: 'linear-gradient(135deg, #6b21a8, #9333ea)',
    tagline: 'राजमाता जिजाऊंच्या आदर्शाने महिला उद्योजकता, बचत गट व आर्थिक स्वावलंबन',
    primaryKPIs: [
      { key: 'shgGroups', label: 'सहभागी बचत गट', defaultTarget: 350, unit: 'बचत गट' },
      { key: 'womenEntrepreneurs', label: 'महिला उद्योजक', defaultTarget: 1500, unit: 'भगिनी' },
      { key: 'loanDisbursed', label: 'कर्ज/अनुदान मंजुरी', defaultTarget: 5, unit: '₹ कोटी' },
      { key: 'productsDisplayed', label: 'प्रदर्शित उत्पादने', defaultTarget: 800, unit: 'उत्पादने' }
    ],
    specialFields: [
      { id: 'shgName', label: 'बचत गटाचे नाव', type: 'text', placeholder: 'उदा. जिजाऊ प्रेरणा महिला बचत गट' },
      { id: 'shgLeader', label: 'अध्यक्षा / सचिव नाव', type: 'text', placeholder: 'उदा. सौ. अनिता जाधव' },
      { id: 'businessNature', label: 'व्यवसायाचे स्वरूप', type: 'select', options: ['मसाले व खाद्यपदार्थ', 'हस्तकला व शिवणकाम', 'सेंद्रिय शेतमाल', 'ब्युटी व वेलनेस', 'सेवा व्यवसाय'] },
      { id: 'bankLoanStatus', label: 'बँक कर्ज स्थिती', type: 'select', options: ['कर्ज मंजूर (Sanctioned)', 'प्रस्तावित (Pending)', 'स्वभांडवल (Self-funded)'] }
    ],
    actionChecklist: [
      'बचत गटांचे स्टॉल वाटप व पॅकेजिंग/ब्रँडिंग कार्यशाळा',
      'अण्णासाहेब पाटील महामंडळ व बँकांचे थेट कर्ज मार्गदर्शन डेस्क',
      'यशस्वी महिला उद्योजक सत्कार व यशोगाथा सत्र',
      'डिजिटल पेमेंट व ऑनलाइन विक्री (ई-कॉमर्स) प्रशिक्षण'
    ]
  },
  {
    id: 'EVT-07-SENIOR',
    number: 7,
    name: 'ज्येष्ठ नागरिक सन्मान, पेन्शन व स्वास्थ्य शिबिर',
    category: 'Senior Citizens & Social Welfare',
    plannedMonth: 'नोव्हेंबर (November)',
    monthIndex: 11,
    level: 'District / Taluka',
    icon: '👴',
    themeColor: '#4f46e5',
    gradient: 'linear-gradient(135deg, #3730a3, #4f46e5)',
    tagline: 'ज्येष्ठ नागरिकांचा कृतज्ञता सन्मान, पेन्शन अडचणी निवारण व आरोग्य आधार',
    primaryKPIs: [
      { key: 'seniorsHonored', label: 'सन्मानित ज्येष्ठ नागरिक', defaultTarget: 800, unit: 'ज्येष्ठ' },
      { key: 'pensionResolved', label: 'निकाली पेन्शन अडचणी', defaultTarget: 250, unit: 'केसेस' },
      { key: 'healthAids', label: 'श्रवणयंत्र/काठी वाटप', defaultTarget: 300, unit: 'साहित्य' },
      { key: 'legalGuidance', label: 'वारसाहक्क कायदे सल्ला', defaultTarget: 180, unit: 'नागरिक' }
    ],
    specialFields: [
      { id: 'seniorName', label: 'ज्येष्ठ नागरिकाचे नाव', type: 'text', placeholder: 'उदा. श्री. बाबुराव कदम (वय ७२)' },
      { id: 'pensionType', label: 'पेन्शनचा प्रकार', type: 'select', options: ['शासकीय सेवा निवृत्त', 'श्रावणबाळ योजना', 'संजय गांधी निराधार', 'किसान पेन्शन'] },
      { id: 'assistanceNeeded', label: 'आवश्यक मदत', type: 'select', options: ['डिजिटल जीवन प्रमाणपत्र (Life Cert)', 'वारसा नोंद सल्ला', 'आरोग्य तपासणी व चष्मे', 'काठी/श्रवणयंत्र'] },
      { id: 'emergencyContact', label: 'कुटुंबीय संपर्क क्रमांक', type: 'tel', placeholder: 'उदा. 9822000000' }
    ],
    actionChecklist: [
      'ज्येष्ठांसाठी रॅम्प, व्हीलचेअर व आरामदायक आसनव्यवस्था',
      'डिजिटल जीवन प्रमाणपत्र (Digital Life Certificate) कॅम्प',
      'वारसापत्र, इच्छापत्र (Will) कायदेशीर मार्गदर्शन',
      'मोफत चष्मे, काठ्या व श्रवणयंत्र वाटप'
    ]
  },
  {
    id: 'EVT-08-BALKIDS',
    number: 8,
    name: 'बाल संस्कार, शिवकालीन युद्धकला व क्रीडा शिबिर',
    category: 'Youth & Culture',
    plannedMonth: 'एप्रिल (April)',
    monthIndex: 4,
    level: 'Taluka / Branch',
    icon: '⚔️',
    themeColor: '#b45309',
    gradient: 'linear-gradient(135deg, #78350f, #b45309)',
    tagline: 'मर्दानगी खेळ, लाठी-काठी, दांडपट्टा, गडकिल्ले संवर्धन व राष्ट्रभक्ती संस्कार',
    primaryKPIs: [
      { key: 'children', label: 'प्रशिक्षित बालके व युवक', defaultTarget: 1000, unit: 'विद्यार्थी' },
      { key: 'trainers', label: 'प्रशिक्षित आखाडा उस्ताद', defaultTarget: 25, unit: 'प्रशिक्षक' },
      { key: 'fortVisits', label: 'गड-दुर्ग अभ्यास मोहिमा', defaultTarget: 12, unit: 'मोहिमा' },
      { key: 'certificates', label: 'प्रमाणपत्र वाटप', defaultTarget: 1000, unit: 'प्रमाणपत्रे' }
    ],
    specialFields: [
      { id: 'childName', label: 'विद्यार्थ्याचे नाव', type: 'text', placeholder: 'उदा. कुमार तेजस शिंदे (वय १२)' },
      { id: 'ageGroup', label: 'वयोगट', type: 'select', options: ['६ ते १० वर्षे', '११ ते १५ वर्षे', '१६ ते २२ वर्षे (युवा)'] },
      { id: 'martialArt', label: 'क्रीडा / युद्धकला प्रकार', type: 'select', options: ['दांडपट्टा व तलवारबाजी', 'लाठी-काठी व ढाल', 'कुस्ती व मल्लखांब', 'किल्ले बांधणी व इतिहास'] },
      { id: 'parentConsent', label: 'पालक संमतीपत्र', type: 'select', options: ['प्राप्त व स्वाक्षरीकृत', 'प्रलंबित'] }
    ],
    actionChecklist: [
      'प्रशिक्षित शिवकालीन युद्धकला आखाडा उस्तादांची नेमणूक',
      'सराव साहित्य (लाकडी दांडपट्टे, लाठ्या, सुरक्षा पॅड्स) सज्जता',
      'आपत्कालीन प्रथमोपचार व रुग्णवाहिका उपस्थिती',
      'दीक्षांत समारंभ व पालकांसमोर प्रात्यक्षिके'
    ]
  },
  {
    id: 'EVT-09-CAREER',
    number: 9,
    name: 'युवा करिअर समुपदेशन व दिशा-दर्शन परिषद',
    category: 'Education & Career',
    plannedMonth: 'जानेवारी (January)',
    monthIndex: 1,
    level: 'District / Taluka',
    icon: '🧭',
    themeColor: '#0284c7',
    gradient: 'linear-gradient(135deg, #075985, #0284c7)',
    tagline: '१०वी, १२वी, पदवीधर युवकांसाठी आधुनिक करिअर, AI, एव्हिएशन व उद्योग संधी',
    primaryKPIs: [
      { key: 'students', label: 'समुपदेशन घेतलेले विद्यार्थी', defaultTarget: 3500, unit: 'विद्यार्थी' },
      { key: 'counselors', label: 'करिअर तज्ज्ञ व वक्ते', defaultTarget: 30, unit: 'तज्ज्ञ' },
      { key: 'aptitudeTests', label: 'कौशल्य चाचणी (Aptitude)', defaultTarget: 2200, unit: 'चाचण्या' },
      { key: 'mentorships', label: '१-to-१ मेंटॉरशिप वाटप', defaultTarget: 600, unit: 'जोड्या' }
    ],
    specialFields: [
      { id: 'studentName', label: 'विद्यार्थ्याचे नाव', type: 'text', placeholder: 'उदा. कु. प्रणाली निकम' },
      { id: 'currentClass', label: 'सद्य शिक्षण', type: 'select', options: ['१० वी', '१२ वी (विज्ञान/कला/वाणिज्य)', 'इंजिनिअरिंग', 'वैद्यकीय', 'पदवीधर / स्पर्धा परीक्षा'] },
      { id: 'interestStream', label: 'रुची असलेले क्षेत्र', type: 'select', options: ['डिफेन्स (NDA/CDS)', 'सॉफ्टवेअर व AI', 'कृषी उद्योग', 'परदेश शिक्षण', 'शासकीय सेवा'] },
      { id: 'assignedMentor', label: 'नेमलेले मार्गदर्शक', type: 'text', placeholder: 'उदा. डॉ. अनिल पाटील (करिअर कौन्सिलर)' }
    ],
    actionChecklist: [
      'तज्ज्ञ कौन्सिलर्स व करिअर मॅन्युअल पुस्तकांचे वाटप',
      'ऑन-स्पॉट डिजिटल ॲप्टिट्यूड टेस्ट व विश्लेषणात्मक रिपोर्ट',
      'डिफेन्स, एव्हिएशन व आयटी इंडस्ट्री मधील अधिकाऱ्यांचे मार्गदर्शन',
      'सारथी शिष्यवृत्ती योजना नोंदणी साहाय्य'
    ]
  },
  {
    id: 'EVT-10-UPSC',
    number: 10,
    name: 'MPSC / UPSC व प्रशासकीय सेवा महामार्गदर्शन',
    category: 'Competitive Exams',
    plannedMonth: 'जून (June)',
    monthIndex: 6,
    level: 'State / District',
    icon: '🏛️',
    themeColor: '#7c2d12',
    gradient: 'linear-gradient(135deg, #451a03, #7c2d12)',
    tagline: 'IAS, IPS, DySP, उपजिल्हाधिकारी मराठा अधिकाऱ्यांकडून थेट कानमंत्र व टेस्ट सिरीज',
    primaryKPIs: [
      { key: 'aspirants', label: 'सहभागी विद्यार्थी', defaultTarget: 4000, unit: 'परीक्षार्थी' },
      { key: 'officers', label: 'मार्गदर्शक IAS/IPS अधिकारी', defaultTarget: 18, unit: 'अधिकारी' },
      { key: 'mockInterviews', label: 'मॉक मुलाखती पूर्ण', defaultTarget: 300, unit: 'मुलाखती' },
      { key: 'studyKits', label: 'अभ्यासक्रम किट्स वाटप', defaultTarget: 3500, unit: 'पुस्तके' }
    ],
    specialFields: [
      { id: 'aspirantName', label: 'परीक्षार्थीचे नाव', type: 'text', placeholder: 'उदा. राहुल घोरपडे' },
      { id: 'targetExam', label: 'लक्ष्य परीक्षा', type: 'select', options: ['UPSC Civil Services', 'MPSC राज्यसेवा', 'MPSC PSI/STI/ASO', 'पोलीस भरती व सैन्यदल'] },
      { id: 'attemptsMade', label: 'दिलेल्या प्रयत्नांची संख्या', type: 'select', options: ['नवीन विद्यार्थी (Fresher)', '१ प्रयत्न', '२ किंवा अधिक प्रयत्न', 'मुलाखत पात्र'] },
      { id: 'guidanceNeed', label: 'अपेक्षित मार्गदर्शन', type: 'select', options: ['पूर्व परीक्षा रणनीती', 'मुख्य परीक्षा उत्तरलेखन', 'मॉक मुलाखत (Interview)', 'अभ्यासिका साहाय्य'] }
    ],
    actionChecklist: [
      'मराठा समाजातील आयएएस, आयपीएस व वर्ग-१ अधिकाऱ्यांना निमंत्रित करणे',
      'मोफत दर्जेदार संदर्भ पुस्तके व डिजिटल प्रश्नपत्रिका संच वाटप',
      'मुख्य परीक्षा उत्तरपत्रिका तपासणी कार्यशाळा',
      'अंतिम मुलाखत तयारीसाठी तज्ज्ञ पॅनेलची मॉक मुलाखत'
    ]
  },
  {
    id: 'EVT-11-DIWALI',
    number: 11,
    name: 'दिवाळी शॉपिंग मेळा – महिला बचत गट व कारागीर',
    category: 'Shopping & Artisan Fair',
    plannedMonth: 'ऑक्टोबर (October)',
    monthIndex: 10,
    level: 'District / Taluka',
    icon: '🪔',
    themeColor: '#ea580c',
    gradient: 'linear-gradient(135deg, #9a3412, #ea580c)',
    tagline: 'घरगुती फराळ, पारंपरिक कंदील, कापड व मराठा कारागिरांचे भव्य प्रदर्शन',
    primaryKPIs: [
      { key: 'stalls', label: 'सजावट व फराळ स्टॉल्स', defaultTarget: 180, unit: 'स्टॉल्स' },
      { key: 'salesVolume', label: 'थेट विक्री उलाढाल', defaultTarget: 1.8, unit: '₹ कोटी' },
      { key: 'footfall', label: 'ग्राहक अभ्यागत संख्या', defaultTarget: 25000, unit: 'ग्राहक' },
      { key: 'shgProfits', label: 'सरासरी बचत गट नफा', defaultTarget: 45000, unit: '₹ प्रति गट' }
    ],
    specialFields: [
      { id: 'artisanName', label: 'कारागीर / बचत गटाचे नाव', type: 'text', placeholder: 'उदा. महालक्ष्मी फराळ व गृहोद्योग' },
      { id: 'productType', label: 'उत्पादनाचे नाव', type: 'select', options: ['दिवाळी शुद्ध तुपातील फराळ', 'पारंपरिक आकाशकंदील व पणत्या', 'कोल्हापुरी चप्पल व चामड्याच्या वस्तू', 'पैठणी व हातमाग साड्या', 'रांगोळी व सजावट साहित्य'] },
      { id: 'fssaiStatus', label: 'FSSAI अन्न सुरक्षा परवाना', type: 'select', options: ['नोंदणीकृत (Verified)', 'केंद्राकडून साहाय्य हवे'] },
      { id: 'stallAllocated', label: 'स्टॉल क्रमांक', type: 'text', placeholder: 'उदा. Stall D-22' }
    ],
    actionChecklist: [
      'मध्यवर्ती मोक्याच्या ठिकाणी भव्य मंडप व विद्युत रोषणाई',
      'अन्न सुरक्षा (FSSAI) स्वच्छता तपासणी व स्वच्छता प्रमाणपत्र',
      'डिजिटल बारकोड / QR पेमेंट सुविधा प्रत्येक स्टॉलवर सक्तीची',
      'स्थानिक वृत्तपत्रे व सोशल मीडियातून व्यापक प्रसिद्धी'
    ]
  },
  {
    id: 'EVT-12-GAURAV',
    number: 12,
    name: 'सांस्कृतिक महोत्सव – मराठा गौरव महामेळावा',
    category: 'Culture & Heritage',
    plannedMonth: 'फेब्रुवारी (February)',
    monthIndex: 2,
    level: 'State / District',
    icon: '🚩',
    themeColor: '#c2410c',
    gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)',
    tagline: 'शिवजयंती पूर्वसंध्येला शाहिरी जलसे, पोवाडे, इतिहास व्याख्याने व गौरव पुरस्कार',
    primaryKPIs: [
      { key: 'attendees', label: 'एकत्रित नागरिक जनसमुदाय', defaultTarget: 20000, unit: 'नागरिक' },
      { key: 'shahirArtists', label: 'पारंपरिक कलावंत व शाहीर', defaultTarget: 60, unit: 'कलावंत' },
      { key: 'awardees', label: 'मराठा गौरव पुरस्कारार्थी', defaultTarget: 15, unit: 'मान्यवर' },
      { key: 'fortExhibition', label: 'किल्ले प्रतिकृती व शस्त्रास्त्रे', defaultTarget: 120, unit: 'शस्त्रे' }
    ],
    specialFields: [
      { id: 'performerGroup', label: 'कलापथक / शाहिरांचे नाव', type: 'text', placeholder: 'उदा. शाहीर देवानंद माळी कलापथक' },
      { id: 'artForm', label: 'कला प्रकार', type: 'select', options: ['ऐतिहासिक पोवाडा व शाहिरी', 'शिवकालीन शस्त्रास्त्र प्रात्यक्षिक', 'पारंपरिक गोंधळ व भारूड', 'शिवचरित्र महानाट्य', 'ऐतिहासिक व्याख्यान'] },
      { id: 'stageRequirement', label: 'स्टेज व ध्वनी आवश्यकता', type: 'text', placeholder: 'उदा. ४०x३० फूट मुख्य व्यासपीठ, ३० वायरलेस माईक्स' },
      { id: 'awardCategory', label: 'गौरव पुरस्कार वर्गवारी', type: 'select', options: ['शिवनेरी जीवनगौरव', 'जिजाऊ रणरागिणी पुरस्कार', 'तानाजी शौर्य पुरस्कार', 'उद्योगरत्न सन्मान'] }
    ],
    actionChecklist: [
      'भव्य ऐतिहासिक मुख्य व्यासपीठ व शिवकालीन तोफांची प्रतिकृती',
      'ऐतिहासिक शस्त्रास्त्रांचे कडेकोट सुरक्षेत सार्वजनिक प्रदर्शन',
      'राज्यस्तरीय सन्माननीय पुरस्कारार्थींची निवड समिती',
      'हजारो शिवभक्तांसाठी महाप्रसाद व पाणी नियोजन'
    ]
  },
  {
    id: 'EVT-13-ADHIVESHAN',
    number: 13,
    name: 'वार्षिक राज्य महाअधिवेशन व रणनीती परिषद',
    category: 'Apex Governance & Strategy',
    plannedMonth: 'वर्षातून एकदा (Annual)',
    monthIndex: 0,
    level: 'State Apex',
    icon: '🦅',
    themeColor: '#312e81',
    gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    tagline: 'राज्यातील सर्व ३६ जिल्हे, ३५८ तालुके व शाखा प्रमुखांची वार्षिक धोरण परिषद',
    primaryKPIs: [
      { key: 'delegates', label: 'अधिकृत प्रतिनिधी व पदाधिकारी', defaultTarget: 3500, unit: 'प्रतिनिधी' },
      { key: 'resolutions', label: 'मंजूर धोरणात्मक ठराव', defaultTarget: 12, unit: 'ठराव' },
      { key: 'annualBudgetApproved', label: 'वार्षिक अर्थसंकल्प मंजुरी', defaultTarget: 15, unit: '₹ कोटी' },
      { key: 'districtsPresent', label: 'उपस्थित जिल्हे व शाखा', defaultTarget: 36, unit: 'जिल्हे' }
    ],
    specialFields: [
      { id: 'delegateName', label: 'प्रतिनिधीचे नाव', type: 'text', placeholder: 'उदा. श्री. चंद्रकांत कदम (जिल्हाध्यक्ष)' },
      { id: 'designation', label: 'पदभार व प्रशासकीय स्तर', type: 'select', options: ['राज्य कार्यकारिणी', 'विभागीय अध्यक्ष', 'जिल्हाध्यक्ष', 'तालुकाध्यक्ष', 'शाखाध्यक्ष', 'केंद्र संचालक'] },
      { id: 'resolutionProposal', label: 'प्रस्तावित ठराव विषय', type: 'text', placeholder: 'उदा. मराठा उद्योजकांसाठी ₹५० कोटी व्हेंचर फंड निर्मिती' },
      { id: 'votingStatus', label: 'मतदान / अनुमोदन अधिकार', type: 'select', options: ['मतदान पात्र प्रतिनिधी (Voting Delegate)', 'निमंत्रित निरीक्षक (Observer)'] }
    ],
    actionChecklist: [
      'राज्यातील सर्व नियुक्त पदाधिकाऱ्यांचे अधिकृत डिजिटल डेलीगेट पासेस',
      'संस्थेचे वार्षिक आर्थिक ताळेबंद व ऑडिट अहवाल सादरीकरण',
      'आगामी वर्षाचे उद्दिष्टे (KPI Targets) व कृती आराखडा मंजुरी',
      'कार्यकारिणी पुनर्रचना व नवीन जबाबदाऱ्यांचे वाटप'
    ]
  },
  {
    id: 'EVT-14-AGRO',
    number: 14,
    name: 'कृषी महापरिषद, आधुनिक ॲग्रो तंत्रज्ञान व शेतकरी मेळावा',
    category: 'Agriculture & Farmers Welfare',
    plannedMonth: 'हंगामानुसार (Seasonal)',
    monthIndex: 9,
    level: 'District / Taluka',
    icon: '🌾',
    themeColor: '#15803d',
    gradient: 'linear-gradient(135deg, #14532d, #15803d)',
    tagline: 'शेतकरी ते थेट ग्राहक, सेंद्रिय शेती, ॲग्री-ड्रोन, निर्यात व हमीभाव परिषद',
    primaryKPIs: [
      { key: 'farmers', label: 'सहभागी शेतकरी बांधव', defaultTarget: 8000, unit: 'शेतकरी' },
      { key: 'fpoGroups', label: 'शेतकरी उत्पादक कंपन्या (FPO)', defaultTarget: 85, unit: 'FPO गट' },
      { key: 'exportOrders', label: 'थेट शेतमाल खरेदी करार', defaultTarget: 12, unit: '₹ कोटी' },
      { key: 'droneDemos', label: 'आधुनिक तंत्रज्ञान प्रात्यक्षिके', defaultTarget: 20, unit: 'डेमो' }
    ],
    specialFields: [
      { id: 'farmerName', label: 'शेतकऱ्याचे नाव', type: 'text', placeholder: 'उदा. श्री. ज्ञानेश्वर शिंदे' },
      { id: 'cropType', label: 'प्रमुख पिके', type: 'select', options: ['ऊस व गूळ उत्पादने', 'सोयाबीन व कडधान्ये', 'द्राक्षे, डाळिंब व फलोत्पादन', 'कांदा व भाजीपाला', 'सेंद्रिय धान्य (Organic)'] },
      { id: 'landHolding', label: 'जमीन धारणा', type: 'text', placeholder: 'उदा. ५ एकर बागायत' },
      { id: 'guidanceNeeded', label: 'अपेक्षित साहाय्य', type: 'select', options: ['थेट कॉर्पोरेट खरेदीदार जोडणी', 'ॲग्री ड्रोन फवारणी तंत्र', 'FPO स्थापन व शासकीय अनुदान', 'शीतगृह (Cold Storage) आरक्षण'] }
    ],
    actionChecklist: [
      'शेतमाल प्रदर्शन व कॉर्पोरेट खरेदीदार थेट करार कक्ष',
      'ॲग्री ड्रोन्स, सोलर पंप व स्वयंचलित सिंचन यंत्रे थेट प्रात्यक्षिके',
      'कृषी विद्यापीठ शास्त्रज्ञांची शेती समस्या निवारण ओपीडी',
      'शेतकरी पुत्रांच्या ॲग्री-स्टार्टअप्सना गुंतवणूकदार साहाय्य'
    ]
  },
  {
    id: 'EVT-15-FOODFEST',
    number: 15,
    name: 'पारंपरिक स्थानिक खाद्य महोत्सव व पाककला स्पर्धा',
    category: 'Culinary, Tourism & Culture',
    plannedMonth: 'वर्षभर (Year-round)',
    monthIndex: 0,
    level: 'Taluka / District',
    icon: '🍲',
    themeColor: '#b91c1c',
    gradient: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
    tagline: ' अस्सल कोल्हापुरी तांबडा-पांढरा रस्सा, खानदेशी मांडे, मराठवाडी धपाटे व पाककला स्पर्धा',
    primaryKPIs: [
      { key: 'foodStalls', label: 'पारंपरिक खाद्य स्टॉल्स', defaultTarget: 120, unit: 'स्टॉल्स' },
      { key: 'cookContestants', label: 'पाककला स्पर्धक', defaultTarget: 250, unit: 'स्पर्धक' },
      { key: 'foodies', label: 'आस्वाद घेणारे खवय्ये', defaultTarget: 30000, unit: 'खवय्ये' },
      { key: 'chefsAwarded', label: 'गौरविलेले पारंपरिक शेफ', defaultTarget: 25, unit: 'कुक' }
    ],
    specialFields: [
      { id: 'vendorChef', label: 'स्टॉलधारक / शेफचे नाव', type: 'text', placeholder: 'उदा. सौ. सुरेखा माने (माउली मेस)' },
      { id: 'cuisineSpecialty', label: 'खाद्यपदार्थ प्रकार', type: 'select', options: ['कोल्हापुरी तांबडा-पांढरा रस्सा मटण थाळी', 'मालवणी पद्धतीची मासे थाळी व वडे', 'खानदेशी मांडे (खापरच्या पोळ्या) व शेवभाजी', 'मराठवाडी ज्वारी भाकरी व झुणका-ठेचा', 'पारंपरिक गोडधोड (पूरणपोळी, उकडीचे मोदक)'] },
      { id: 'hygieneGrade', label: 'अन्न स्वच्छता रेटिंग', type: 'select', options: ['Grade A+ (उत्कृष्ट स्वच्छता)', 'Grade A (चांगली)'] },
      { id: 'competitionEntry', label: 'पाककला स्पर्धा प्रवेश', type: 'select', options: ['होय - स्पर्धक', 'फक्त व्यावसायिक स्टॉलधारक'] }
    ],
    actionChecklist: [
      'स्वच्छ पाणी, हात धुण्याची व्यवस्था व कचरा व्यवस्थापन सज्जता',
      'अन्न व औषध प्रशासन (FDA) मानकांनुसार तपासणी',
      'प्रसिद्ध सेलिब्रिटी शेफद्वारे पाककला स्पर्धेचे परीक्षण',
      'पारंपरिक मराठी सुगरणींना मानाचा सन्मान व रोख पारितोषिके'
    ]
  }
];

// Helper to find single event
export function getMahaEventById(id) {
  return MAHA_EVENTS_LIST.find(e => e.id === id || String(e.number) === String(id)) || MAHA_EVENTS_LIST[0];
}
