import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================================
// CONNECT MARATHA — DIGITAL MAHARASHTRA CIVILIZATION OPERATING SYSTEM
// UNIFIED MASTER PLATFORM:
// 49 FOUNDATIONAL FEATURES + 70 EXPANDED CIVILIZATION FEATURES
// 12 ORIGINAL WORLDS + 14 CIVILIZATION PILLARS • 21-LAYER MASTER MAP
// 12 HISTORICAL EPOCHS • 18 CITIES TIMELINE • UNBROKEN RELATIONSHIP CHAIN:
// Maharashtra → Region → District → Taluka → Village/City → Place → Person
// → Event → Tradition → Festival → Food → Language → Art → Literature → Community → Source
// ============================================================================

const UNIVERSE_WORLDS = [
  { id: 'all', name: 'सर्व १२ विश्वे', sub: '४९ वैशिष्ट्ये एकात्मिक', icon: '🌌', color: '#7C1D05', bg: '#FFF7ED' },
  { id: 'history', name: 'इतिहास व साम्राज्य', sub: 'सातवाहन ते स्वराज्य', icon: '🏰', color: '#B91C1C', bg: '#FEF2F2' },
  { id: 'people', name: 'व्यक्ती व महापुरुष', sub: 'राजे, राण्या, शास्त्रज्ञ', icon: '👑', color: '#C2410C', bg: '#FFF7ED' },
  { id: 'places', name: 'गडकोट, गावे व वास्तू', sub: '३५०+ किल्ले व वाडे', icon: '🗺️', color: '#B45309', bg: '#FEF3C7' },
  { id: 'festivals', name: 'सण व शिवकालीन उत्सव', sub: 'प्राचीन ते आधुनिक', icon: '🌺', color: '#D97706', bg: '#FFFBEB' },
  { id: 'saints', name: 'संत व अध्यात्म', sub: '९ आध्यात्मिक परंपरा', icon: '🧘', color: '#15803D', bg: '#F0FDF4' },
  { id: 'culture', name: 'कला, पोवाडा व संगीत', sub: 'लोककला व संगीत नकाशा', icon: '🎭', color: '#0369A1', bg: '#F0F9FF' },
  { id: 'food', name: 'खाद्यसंस्कृती', sub: '३६ जिल्ह्यांची चव', icon: '🍲', color: '#BE123C', bg: '#FFF1F2' },
  { id: 'language', name: 'भाषा व बोली', sub: 'मराठी विकास व बोली', icon: '🗣️', color: '#6D28D9', bg: '#F5F3FF' },
  { id: 'society', name: 'समाज व वास्तुकला', sub: 'वाडे, जलव्यवस्था व ज्ञान', icon: '🏘️', color: '#0F766E', bg: '#F0FDFA' },
  { id: 'travel', name: 'वारसा मार्ग व पर्यटन', sub: 'शिवराय ट्रेल्स व वारी', icon: '🛤️', color: '#C026D3', bg: '#FDF4FF' },
  { id: 'knowledge', name: 'ज्ञान, ग्रंथ व संशोधन', sub: 'बखरी, पुरावे व ग्रंथालय', icon: '📚', color: '#374151', bg: '#F3F4F6' },
  { id: 'community', name: 'समुदाय व पासपोर्ट', sub: 'माझे गाव, वंशावळ, बॅजेस', icon: '👥', color: '#4338CA', bg: '#EEF2FF' }
];

// FEATURE 2: 12 HISTORICAL EPOCHS (TIME MACHINE)
const TIME_MACHINE_EPOCHS = [
  {
    id: 'satavahana',
    era: 'इ.स.पूर्व २३० - इ.स. २२०',
    title: 'सातवाहन साम्राज्य (पहिला सुवर्णकाळ)',
    capital: 'प्रतिष्ठान (पैठण) / जुन्नर',
    ruler: 'गौतमीपुत्र सातकर्णी / हाल सातवाहन',
    mapCenter: 'पैठण, नाणेघाट, कार्ले, अजिंठा',
    highlight: 'महाराष्ट्राचे पहिले ज्ञात महासाम्राज्य. नाणेघाट व्यापारी खिंडीतील शिलालेख, प्राकृत "गाथासप्तशती" काव्यसंग्रह, कार्ले व अजिंठा लेण्यांची निर्मिती.',
    forts: ['शिवनेरी (जुन्नर लेणी)', 'लोहगड'],
    food: ['ज्वारीची भाकरी', 'रानभाज्या'],
    factStatus: 'fact'
  },
  {
    id: 'vakataka',
    era: 'इ.स. २५० - ५००',
    title: 'वाकाटक राजसत्ता व विदर्भ संस्कृती',
    capital: 'नंदीवर्धन (नागपूर) / वत्सगुल्म (वाशीम)',
    ruler: 'प्रवरसेन द्वितीय / प्रभावतीगुप्त',
    mapCenter: 'रामटेक, अजिंठा, वाशीम',
    highlight: 'अजिंठा लेण्यांमधील जगप्रसिद्ध जातक कथांची भित्तिचित्रे, महाकवी कालिदासांचे रामटेक येथील "मेघदूत" काव्यलेखन, सेतूबंध महाकाव्य.',
    forts: ['रामटेक गडकोट', 'मांडवगड संपर्क'],
    food: ['सावजी पूर्वज डाळी', 'मुगाचे वडे'],
    factStatus: 'fact'
  },
  {
    id: 'chalukya_rashtrakuta',
    era: 'इ.स. ६०० - ९७३',
    title: 'चालुक्य व राष्ट्रकूट महासाम्राज्य',
    capital: 'मान्यखेत / बादामी / एलोरा',
    ruler: 'कृष्ण प्रथम / अमोघवर्ष / दंतिदुर्ग',
    mapCenter: 'वेरूळ (एलोरा), धारापुरी (एलिफंटा)',
    highlight: 'वेरूळचे कैलास मंदिर (गुंफा १६) — अखंड कातळातून कोरलेले जगातील सर्वात आश्चर्यकारक पाषाण मंदिर. एलिफंटा येथील त्रिमूर्ती शिल्पकला.',
    forts: ['दौलताबाद पूर्ववर्ती तट', 'कंधार किल्ला'],
    food: ['दही-भात', 'कडधान्य उसळ'],
    factStatus: 'fact'
  },
  {
    id: 'yadava',
    era: 'इ.स. ११८० - १३१७',
    title: 'यादव साम्राज्य व मराठी भाषेचा राजमान्य सुवर्णकाळ',
    capital: 'देवगिरी (दौलताबाद)',
    ruler: 'सिंघणदेव यादव / रामचंद्रदेव यादव',
    mapCenter: 'देवगिरी, नेवासे, पंढरपूर',
    highlight: 'मराठी भाषेला राजभाषेचा मान, संत ज्ञानेश्वरांची "भावार्थदीपिका" (ज्ञानेश्वरी इ.स. १२९०), हेमाडपंथी मंदिरे, चक्रधर स्वामींचे महानुभाव साहित्य (लीळाचरित्र).',
    forts: ['देवगिरी', 'अंकाई-टंकाई', 'चांदवड'],
    food: ['पुरणपोळी', 'मांडे', 'वरणभात'],
    factStatus: 'fact'
  },
  {
    id: 'sultanates',
    era: 'इ.स. १३४७ - १६३०',
    title: 'बहमनी व दख्खन सल्तनती काळ',
    capital: 'गुलबर्गा / बिदर / अहमदनगर / विजापूर',
    ruler: 'मलिक अंबर / इब्राहिम आदिलशाह',
    mapCenter: 'अहमदनगर, विजापूर, दौलताबाद',
    highlight: 'निजामशाही व आदिलशाही संघर्ष; मलिक अंबरची गनिमी काव्याची पूर्वतयारी; स्थानिक मराठी सरदार घराण्यांचा (भोसले, जाधव, घोरपडे, निंबाळकर) लष्करी प्रभाव.',
    forts: ['शिवनेरी', 'चाकण', 'दौलताबाद'],
    food: ['मसालेदार मटण रस्सा', 'बाजरी भाकरी'],
    factStatus: 'fact'
  },
  {
    id: 'shivkal_early',
    era: 'इ.स. १६३० - १६६०',
    title: 'छत्रपती शिवराय: स्वराज्य संकल्प व संपादन',
    capital: 'राजगड (बालेकिल्ला)',
    ruler: 'छत्रपती शिवाजी महाराज / राजमाता जिजाऊ',
    mapCenter: 'शिवनेरी, रोहिडा, तोरणा, राजगड, प्रतापगड',
    highlight: 'रोहिडेश्वरावर स्वराज्य शपथ (१६४५), तोरणा-कोंढाणा विजय, कल्याण खजिना, जावळीचा ताबा व प्रतापगड युद्धात अफझलखानाचा पराभव (१० नोव्हेंबर १६५९), पावनखिंड लढा (१६६०).',
    forts: ['राजगड', 'तोरणा', 'प्रतापगड', 'सिंहगड', 'पन्हाळा'],
    food: ['ज्वारी-बाजरी भाकरी', 'झुणका', 'ठेचा', 'मावळी जेवण'],
    factStatus: 'fact'
  },
  {
    id: 'shivkal_golden',
    era: 'इ.स. १६७० - १६८०',
    title: 'हिंदवी स्वराज्य व सुवर्ण राज्याभिषेक',
    capital: 'किल्ले रायगड (सार्वभौम राजधानी)',
    ruler: 'छत्रपती शिवाजी महाराज',
    mapCenter: 'किल्ले रायगड, सिंधुदुर्ग, विजयदुर्ग, जिंजी',
    highlight: '६ जून १६७४ शिवराज्याभिषेक सोहळा; अष्टप्रधान मंडळ, स्वतंत्र मराठा आरमार, ३५०+ गडकिल्ल्यांची संरक्षण साखळी, शिवराई-होन चलन व दख्खन दिग्विजय मोहीम (तंजावर-जिंजी).',
    forts: ['रायगड', 'सिंधुदुर्ग', 'विजयदुर्ग', 'सुवर्णदुर्ग', 'पद्मदुर्ग'],
    food: ['साजूक तुपातील पुरणपोळी', 'मोदक', 'सोलकढी', 'तांदूळ भाकरी'],
    factStatus: 'fact'
  },
  {
    id: 'shambhuraje',
    era: 'इ.स. १६८० - १७०७',
    title: 'संभाजी महाराज व २७ वर्षांचा स्वातंत्र्यसंग्राम',
    capital: 'रायगड / पन्हाळा / जिंजी',
    ruler: 'छत्रपती संभाजी महाराज / महाराणी ताराबाई / राजाराम महाराज',
    mapCenter: 'तुळापूर, संगमेश्वर, जिंजी, सातारा',
    highlight: 'छत्रपती संभाजी महाराजांचे अतुलनीय शौर्य; औरंगजेबाच्या ५ लाखांच्या मुघल सैन्याविरुद्ध महाराणी ताराबाई, संताजी घोरपडे व धनाजी जाधव यांचा पराक्रमी गनिमी संग्राम; मुघल सत्तेचा दख्खनमध्ये अंत.',
    forts: ['पन्हाळा', 'जिंजी', 'विशाळगड', 'सातारा'],
    food: ['कडक बाजरी भाकरी', 'पिठलं', 'खर्डा'],
    factStatus: 'fact'
  },
  {
    id: 'maratha_empire',
    era: 'इ.स. १७१३ - १७६१',
    title: 'मराठा साम्राज्य विस्तार (अटकेपार भगवा)',
    capital: 'सातारा / पुणे (शनिवारवाडा)',
    ruler: 'छत्रपती शाहू महाराज / श्रीमंत बाजीराव पेशवे',
    mapCenter: 'शनिवारवाडा पुणे, माळवा, गुजरात, दिल्ली, अटक (पेशावर)',
    highlight: 'बाजीराव पेशवे यांचे अपराजित ४१ लढायांचे नेतृत्व, पालखेड व भोपाळ विजय, राघोबादादांचा अटकेवर भगवा झेंडा (१७५८), महादजी शिंदे व मल्हारराव होळकर यांचा उत्तर भारतात दबदबा.',
    forts: ['शनिवारवाडा', 'पुरंदर', 'ग्वाल्हेर', 'झाशी'],
    food: ['मराठमोळे पक्वान्न', 'पुणेरी मिसळ', 'बासुंदी'],
    factStatus: 'fact'
  },
  {
    id: 'british_raj',
    era: 'इ.स. १८१८ - १९४७',
    title: 'ब्रिटिश राजवट, समाजप्रबोधन व स्वातंत्र्य लढा',
    capital: 'मुंबई / पुणे',
    ruler: 'लोकमान्य टिळक / म. फुले / डॉ. आंबेडकर / स्वातंत्र्यवीर सावरकर',
    mapCenter: 'मुंबई, पुणे, नागपूर, सातारा',
    highlight: '१८५७ क्रांती, महात्मा जोतीराव फुले व सावित्रीबाई फुले यांचे स्त्रीशिक्षण क्रांती (भिडे वाडा १८४८), लोकमान्य टिळकांचे सार्वजनिक उत्सव व वृत्तपत्रे, डॉ. बाबासाहेब आंबेडकरांचा महाड चवदार तळे सत्याग्रह (१९२७), क्रांतिसिंह नाना पाटलांचे प्रतिसरकार.',
    forts: ['येरवडा', 'अंदमान (सावरकर)', 'अगस्ती आश्रम'],
    food: ['कांदा पोहे', 'मुंबई सँडविच', 'वडापाव पूर्वज'],
    factStatus: 'fact'
  },
  {
    id: 'samyukta_maha',
    era: 'इ.स. १९४७ - १९६०',
    title: 'संयुक्त महाराष्ट्र चळवळ व राज्याची निर्मिती',
    capital: 'मुंबई (१०७ हुतात्म्यांचे स्मरण)',
    ruler: 'संयुक्त महाराष्ट्र समिती (आचार्य अत्रे, कॉ. डांगे, प्रबोधनकार ठाकरे)',
    mapCenter: 'हुतात्मा चौक मुंबई, पुणे, बेळगाव सीमा',
    highlight: 'मुंबईसह अखंड महाराष्ट्रासाठी १०७ हुतात्म्यांचे सर्वोच्च बलिदान; शाहिरी, साहित्य व जनआंदोलनातून १ मे १९६० रोजी स्वतंत्र महाराष्ट्र राज्याची अधिकृत स्थापना.',
    forts: ['हुतात्मा स्मारक चौक', 'शिवाजी पार्क'],
    food: ['उसळ-पाव', 'मिसळ-पाव', 'चहा'],
    factStatus: 'fact'
  },
  {
    id: 'modern_maha',
    era: 'इ.स. १९६० - आजपर्यंत',
    title: 'आधुनिक व डिजिटल ज्ञानसमृद्ध महाराष्ट्र',
    capital: 'मुंबई / उपराजधानी नागपूर',
    ruler: 'महाराष्ट्र शासन व १२ कोटी जनता',
    mapCenter: 'संपूर्ण महाराष्ट्र (३६ जिल्हे)',
    highlight: 'भारताची आर्थिक राजधानी, कृषी, सहकार चळवळ, अंतराळ, माहिती तंत्रज्ञान, ऑटोमोबाईल, वारसा संवर्धन व २१ व्या शतकातील डिजिटल मराठा क्रांती.',
    forts: ['३५०+ संरक्षित गडकोट', 'युनेस्को वारसा स्थळे'],
    food: ['वडापाव', 'मिसळ', 'मोदक', 'पुरणपोळी', 'कोल्हापुरी तांबडा-पांढरा'],
    factStatus: 'fact'
  }
];

// FEATURE 1: 21 MASTER MAP LAYERS
const MASTER_MAP_LAYERS = [
  { id: 'forts', name: '🏰 किल्ले (Forts)', active: true, color: '#DC2626' },
  { id: 'temples', name: '🛕 मंदिरे (Temples)', active: true, color: '#D97706' },
  { id: 'saints', name: '🧘 संत स्थाने (Saints)', active: true, color: '#15803D' },
  { id: 'festivals', name: '🌺 सण व जत्रा (Festivals)', active: false, color: '#E11D48' },
  { id: 'battles', name: '⚔️ युद्धे व रणांगणे (Battles)', active: true, color: '#B91C1C' },
  { id: 'caves', name: '🏛️ लेणी व प्राचीन स्थळे (Caves)', active: false, color: '#7C3AED' },
  { id: 'museums', name: '🏛️ संग्रहालये (Museums)', active: false, color: '#4B5563' },
  { id: 'wadas', name: '🏘️ ऐतिहासिक वाडे (Wadas)', active: false, color: '#92400E' },
  { id: 'rivers', name: '💧 नद्या व घाट (Rivers & Ghats)', active: false, color: '#0284C7' },
  { id: 'routes', name: '🛤️ व्यापारी व तीर्थ मार्ग (Routes)', active: true, color: '#C026D3' },
  { id: 'food', name: '🍲 खाद्यविशेष (Food Specialties)', active: false, color: '#BE123C' },
  { id: 'dialects', name: '🗣️ प्रादेशिक बोली (Dialects)', active: false, color: '#6D28D9' },
  { id: 'folkart', name: '🎨 लोककला व हस्तकला (Folk Arts)', active: false, color: '#EA580C' },
  { id: 'textiles', name: '🧵 वस्त्र वारसा (Textiles)', active: false, color: '#0D9488' },
  { id: 'music', name: '🎵 वाद्ये व संगीत (Music Map)', active: false, color: '#2563EB' },
  { id: 'women', name: '👑 कर्तृत्ववान वीरांगना (Women in History)', active: true, color: '#9333EA' },
  { id: 'villages', name: '🏡 ऐतिहासिक गावे (Villages)', active: false, color: '#059669' },
  { id: 'water', name: '💧 बारवा व जलव्यवस्था (Water Heritage)', active: false, color: '#0891B2' },
  { id: 'powada', name: '🎤 शाहिरी व पोवाडा केंद्रे (Powada)', active: false, color: '#CA8A04' },
  { id: 'tourism', name: '🚶 हेरिटेज ट्रेल्स (Heritage Trails)', active: false, color: '#4F46E5' },
  { id: 'archives', name: '📜 दस्तऐवज व पुराभिलेख (Archives)', active: false, color: '#374151' }
];

// FEATURE 4: BATTLE EXPLORER DATABASE
const BATTLES_DATA = [
  {
    id: 'pratapgad_1659',
    name: 'प्रतापगडचे युद्ध ( Battle of Pratapgad )',
    date: '१० नोव्हेंबर १६५९',
    location: 'किल्ले प्रतापगड पायथा, जावळीचे खोरे',
    leaders: 'छत्रपती शिवाजी महाराज, कान्होजी जेधे, तानाजी मालुसरे वि. अफझलखान (आदिलशाही)',
    forces: 'शिवरायांचे ६,००० पायदळ व ३,००० घोडदळ वि. अफझलखानाचा १०,००० चा लवाजमा (विश्वसनीय समकालीन संदर्भ)',
    strategy: 'जावळीच्या अभेद्य घनदाट जंगलाचा भौगोलिक उपयोग; शत्रूला डोंगराळ भागात ओढून गनिमी काव्याने दोन्ही बाजूंनी कोंडी.',
    result: 'मराठ्यांचा ऐतिहासिक महाविजय; अफझलखानाचा खात्मा; दख्खनमध्ये स्वराज्याचा राजकीय दबदबा प्रस्थापित.',
    forts: ['प्रतापगड', 'राजगड', 'वासोटा'],
    sources: ['सभासद बखर', 'शिवभारत (कवी परमानंद)', 'इंग्रज दूत पत्रव्यवहार (Surat Factory Records)'],
    factStatus: 'fact'
  },
  {
    id: 'pavan_khind_1660',
    name: 'पावनखिंडीचा लढा ( Battle of Pavan Khind )',
    date: '१३ जुलै १६६०',
    location: 'घोडखिंड (पावनखिंड), विशाळगड मार्ग',
    leaders: 'बाजीप्रभू देशपांडे, फुलाजी देशपांडे, बांदल मावळे वि. सिद्दी मसूद',
    forces: '३०० निवडक बांदल मावळे वि. सिद्दी मसूदचे ४,००० चे घोडदळ',
    strategy: 'अरुंद खिंडीत एका वेळी मोजकेच सैनिक लढू शकतील अशा नैसर्गिक दरीचा फायदा घेऊन शिवराय विशाळगडावर पोहोचून तोफांचे आवाज होईपर्यंत प्राण पणाला लावून खिंड रोखणे.',
    result: 'शिवराय सुखरूप विशाळगडावर पोहोचले; बाजीप्रभू व मावळ्यांचे अजरामर हौतात्म्य.',
    forts: ['पन्हाळा', 'विशाळगड'],
    sources: ['जेधे शकावली', '९१ कलमी बखर'],
    factStatus: 'fact'
  },
  {
    id: 'salher_1672',
    name: 'साल्हेरचे मैदानी युद्ध ( Battle of Salher )',
    date: 'जानेवारी १६७२',
    location: 'साल्हेर किल्ला व पायथा, बागलाण (नाशिक)',
    leaders: 'प्रतापराव गुजर (सरसेनापती), मोरोपंत पिंगळे वि. दिलेरखान व इखलासखान (मुघल)',
    forces: 'सुमारे २०,००० मराठा घोडदळ वि. २५,००० मुघल सैन्य (ऐतिहासिक दस्तावेजांनुसार)',
    strategy: 'मराठ्यांनी डोंगराळ गनिमी काव्याऐवजी खुल्या मैदानात मुघलांच्या बलाढ्य सैन्याला समोरासमोर धूळ चारली.',
    result: 'मराठ्यांचा निर्णायक विजय; मुघलांचा दारुण पराभव; उत्तरेत छत्रपती शिवरायांच्या सैन्याचा प्रचंड दरारा निर्माण झाला.',
    forts: ['साल्हेर', 'मुल्हेर'],
    sources: ['सभासद बखर', 'तारीख-ए-दिलकुशा (भीमसेन सक्सेना)'],
    factStatus: 'fact'
  },
  {
    id: 'palkhed_1728',
    name: 'पालखेडची लढाई ( Battle of Palkhed )',
    date: '२८ फेब्रुवारी १७२८',
    location: 'पालखेड (नाशिक जवळ)',
    leaders: 'श्रीमंत बाजीराव पेशवे प्रथम वि. निझाम-उल-मुल्क',
    forces: 'जलद मराठा घोडदळ वि. निझामाचे तोफखानासज्ज अफाट सैन्य',
    strategy: 'जागतिक युद्धशास्त्रात वाखाणलेली "हालचालींची युद्धनीती" (War of Maneuver); तोफखान्याला संधीच न देता निझामाची रसद तोडून पाण्यासाठी पाणी नसलेल्या जागी घेरले.',
    result: 'निझामाने बिनशर्त शरणागती पत्करली व मुंगी-शेवगावचा तह स्वीकारला.',
    forts: ['दौलताबाद', 'अहमदनगर'],
    sources: ['पेशवे दफ्तर', 'मराठी रियासत (गो. स. सरदेसाई)'],
    factStatus: 'fact'
  },
  {
    id: 'panipat_1761',
    name: 'पानिपतचे तिसरे युद्ध ( Third Battle of Panipat )',
    date: '१४ जानेवारी १७६१',
    location: 'पानिपतचे रणांगण (हरियाणा)',
    leaders: 'सदाशिवराव भाऊ, विश्वासराव पेशवे, इब्राहिम खान गारदी वि. अहमदशाह अब्दाली',
    forces: 'मराठा सेना व तोफखाना वि. अब्दाली व रोहिला सैन्य',
    strategy: 'इब्राहिम खान गारदीच्या फ्रेंच पद्धतीचा तोफखाना; परंतु रसद तुटल्याने उपासमार व विश्वासरावांच्या हौतात्म्याने सैन्यात झालेली पीछेहाट.',
    result: 'अतोनात मनुष्यहानी; तरीही मराठ्यांच्या अतुलनीय शौर्यामुळे अब्दालीने पुन्हा भारतावर कधीही आक्रमण केले नाही. १० वर्षांत महादजी शिंदेंनी दिल्ली पुन्हा जिंकली.',
    forts: ['दिल्ली लाल किल्ला', 'ग्वाल्हेर'],
    sources: ['भाऊसाहेबांची बखर', 'काशीराज पत्रावली', 'अब्दालीची समकालीन पत्रे'],
    factStatus: 'fact'
  }
];

// FEATURE 6: WOMEN IN MAHARASHTRA HISTORY
const WOMEN_IN_HISTORY = [
  {
    name: 'राजमाता जिजाऊ माँसाहेब',
    period: '१५९८ - १६७४',
    role: 'स्वराज्य प्रेरक व प्रशासक',
    achievement: 'शिवरायांना न्याय, समता व सार्वभौम स्वराज्याचे संस्कार देणाऱ्या शिल्पकार; पुण्यात सोन्याचा नांगर फिरवून रयतेची पुनर्स्थापना; न्यायनिवाडे व जहागिरीचे निष्कलंक प्रशासन.',
    domains: ['प्रशासन', 'राजनीती', 'संस्कार'],
    places: ['सिंदखेड राजा', 'शिवनेरी', 'लाल महाल पुणे', 'पाचाड समाधी']
  },
  {
    name: 'महाराणी ताराबाई भोसले',
    period: '१६७५ - १७६१',
    role: 'मराठा साम्राज्याच्या सरसेनापती व राज्यकर्त्या',
    achievement: 'छत्रपती राजाराम महाराजांच्या निधनानंतर (१७००) औरंगजेबाच्या ५ लाखांच्या मुघल आक्रमणाविरुद्ध ७ वर्षे अखंड लढा देऊन मुघल साम्राज्याला दख्खनमध्ये धूळ चारली.',
    domains: ['लष्करी नेतृत्व', 'साम्राज्य रक्षण', 'कूटनीती'],
    places: ['पन्हाळा', 'सातारा', 'कोल्हापूर', 'जिंजी']
  },
  {
    name: 'पुण्यश्लोक अहिल्याबाई होळकर',
    period: '१७२५ - १७९५',
    role: 'आदर्श लोककल्याणकारी राज्यकर्त्या व स्थापत्य शिल्पकार',
    achievement: 'माळव्याची राजधानी महेश्वर येथून २८ वर्षे प्रजाहितदक्ष राज्यकारभार; संपूर्ण भारतात सोमनाथ ते काशी विश्वनाथ आणि बद्रीनाथ ते रामेश्वरम शेकडो मंदिरे, घाट, धर्मशाळा व बारवांची निर्मिती.',
    domains: ['प्रशासन', 'स्थापत्य', 'न्यायव्यवस्था', 'धर्मदाय'],
    places: ['चौंडी (जामखेड)', 'महेश्वर', 'त्र्यंबकेश्वर', 'काशी']
  },
  {
    name: 'महाराणी येसूबाई भोसले',
    period: '१६५८ - १७३०',
    role: 'स्वातंत्र्यसंग्रामातील मूक धैर्याचे प्रतीक',
    achievement: 'छत्रपती संभाजी महाराजांच्या पाठीशी खंबीर उभ्या राहिल्या; रायगड वेढ्यावेळी राजाराम महाराजांना जिंजीला पाठवण्याचा मुत्सद्दी निर्णय घेतला; ३० वर्षे मुघल कैदेत राहूनही स्वराज्य निष्ठा ढळू दिली नाही.',
    domains: ['मुत्सद्देगिरी', 'धैर्य', 'त्याग'],
    places: ['रायगड', 'शृंगारपूर', 'दिल्ली मुघल छावणी']
  },
  {
    name: 'क्रांतिज्योती सावित्रीबाई फुले',
    period: '१८३१ - १८९७',
    role: 'भारतातील पहिल्या मुख्याध्यापिका व समाजसुधारक',
    achievement: 'स्त्रीशिक्षणाची पहिली शाळा (भिडे वाडा १८४८), सत्यशोधक समाजाचे नेतृत्व, बालहत्या प्रतिबंधक गृह, प्लेगच्या साथीमध्ये रुग्णांची प्रत्यक्ष सेवा करताना आत्मसमर्पण.',
    domains: ['स्त्रीशिक्षण', 'साहित्य', 'समाजप्रबोधन'],
    places: ['नायगाव (सातारा)', 'भिडे वाडा पुणे', 'हडपसर']
  },
  {
    name: 'डॉ. आनंदीबाई गोपाळराव जोशी',
    period: '१८६५ - १८८७',
    role: 'भारतातील पहिल्या महिला डॉक्टर (M.D.)',
    achievement: 'सर्व सामाजिक प्रतिकूलतेला तोंड देत अमेरिकेत जाऊन वैद्यकीय पदवी (M.D.) संपादन करणारी पहिली भारतीय महिला; आधुनिक विज्ञान क्षेत्रात महिलांसाठी मार्गदर्शक दीपस्तंभ.',
    domains: ['वैद्यकशास्त्र', 'उच्च शिक्षण', 'स्त्री मुक्ती'],
    places: ['कल्याण', 'पुणे', 'फिलाडेल्फिया (USA)']
  }
];

// FEATURE 48 & 30: "CONNECT EVERYTHING" KNOWLEDGE GRAPH NODES
const CONNECTED_NODES_DATA = {
  raigad: {
    id: 'raigad',
    title: 'किल्ले रायगड (सार्वभौम राजधानी)',
    type: 'दुर्ग व राजधानी',
    icon: '🏰',
    summary: 'स्वराज्याची अजिंक्य राजधानी, जिथे छत्रपती शिवाजी महाराजांचा ६ जून १६७४ रोजी सुवर्ण राज्याभिषेक सोहळा संपन्न झाला.',
    connections: {
      persons: ['छत्रपती शिवाजी महाराज', 'जिजाऊ माँसाहेब', 'छत्रपती संभाजी महाराज', 'सोयराबाई', 'हिरोजी इंदुलकर (मुख्य स्थापत्यकार)'],
      events: ['६ जून १६७४ शिवराज्याभिषेक सोहळा', 'इ.स. १६७१ रायगड शिमगोत्सव', 'इ.स. १६८० शिवराय महाप्रयाण'],
      temples: ['श्री जगदीश्वर मंदिर', 'शिरकाई देवी मंदिर'],
      festivals: ['शिवराज्याभिषेक दिन सोहळा', 'होळीचा माळ उत्सव', 'महाशिवरात्र'],
      food: ['कोकणी तांदळाची भाकरी', 'पिठलं-ठेचा', 'महाडची खानावळ सोलकढी'],
      dialects: ['रायगडी कोकणी बोली'],
      routes: ['महाड ते पाचाड दुर्गमार्ग', 'नाणे दरवाजा ते महादरवाजा पायवाट', 'रायगड ते प्रतापगड सह्याद्री ट्रेल'],
      waterSystems: ['गंगासागर तलाव', 'हत्ती तलाव', 'टाके व पाषाण गाळण यंत्रणा'],
      documents: ['सभासद बखर', 'हेन्री ऑक्झिंडेन डायरी (इंग्रज दूत प्रत्यक्षदर्शी)', 'जेधे शकावली']
    }
  },
  shivaji_maharaj: {
    id: 'shivaji_maharaj',
    title: 'छत्रपती शिवाजी महाराज',
    type: 'स्वराज्य संस्थापक व युगपुरुष',
    icon: '👑',
    summary: 'अखंड महाराष्ट्राचे कुलदैवत, रयतेचे राजे, आरमार जनक, ३५०+ गडकोटांचे निर्माते व गनिमी काव्याचे जनक.',
    connections: {
      persons: ['जिजाऊ माँसाहेब', 'शहाजीराजे', 'बाजीप्रभू देशपांडे', 'तानाजी मालुसरे', 'हंबीरराव मोहिते', 'संत तुकाराम', 'समर्थ रामदास'],
      events: ['१६४५ रोहिडेश्वर शपथ', '१६५९ प्रतापगड युद्ध', '१६६० पावनखिंड लढा', '१६६४ सुरत मोहीम', '१६७४ राज्याभिषेक'],
      temples: ['तुळजापूर भवानी माता', 'प्रतापगड भवानी मंदिर', 'शिखर शिंगणापूर महादेव', 'कसबा गणपती पुणे'],
      festivals: ['शिवजयंती', 'विजयादशमी (दसरा शस्त्रपूजा)', 'नारळी पौर्णिमा आरमार मोसम', 'गुढीपाडवा'],
      food: ['ज्वारीची भाकरी', 'मावळी ठेचा', 'कडधान्य उसळ', 'घोल भाजी'],
      dialects: ['शिवकालीन मराठी', 'मावळी बोली'],
      routes: ['शिवनेरी ते रायगड मार्ग', 'आग्रा ते राजगढ परतीचा गुप्त मार्ग'],
      waterSystems: ['गडकिल्ल्यांचे जलव्यवस्थापन नियम (आज्ञापत्र)'],
      documents: ['शिवभारत', 'आज्ञापत्र (रामचंद्रपंत अमात्य)', 'राजव्यवहार कोश']
    }
  },
  sindhudurg: {
    id: 'sindhudurg',
    title: 'किल्ले सिंधुदुर्ग व मराठा आरमार',
    type: 'जलदुर्ग व आरमार केंद्र',
    icon: '⚓',
    summary: 'अरबी समुद्रात कुरटे बेटावर शिवरायांनी स्वतः हाताने पायाभरणी केलेला अजिंक्य सागरी बालेकिल्ला; मराठा आरमाराचा पाया.',
    connections: {
      persons: ['छत्रपती शिवाजी महाराज', 'मायनाक भंडारी', 'कान्होजी आंग्रे', 'स्थानिक खारवी व कोळी खलाशी'],
      events: ['इ.स. १६६४ जलदुर्ग पायाभरणी', 'मराठा आरमाराची सागरी गस्त', 'खांदेरीची सागरी लढाई (१६७९)'],
      temples: ['शिवराजेश्वर मंदिर (सिंधुदुर्ग)', 'कुणकेश्वर मंदिर'],
      festivals: ['नारळी पौर्णिमा समुद्रपूजन', 'महाशिवरात्र'],
      food: ['मालवणी मासळी', 'सोलकढी', 'घावणे', 'काजू उसळ'],
      dialects: ['मालवणी बोली'],
      routes: ['मालवण ते विजयदुर्ग सागरी मार्ग', 'तारकर्ली खाडी जलमार्ग'],
      waterSystems: ['खऱ्या समुद्रातील गोड्या पाण्याच्या ३ विहिरी (दूधबाव, साखरबाव, दहीबाव)'],
      documents: ['मुंबई फॅक्टरी रेकॉर्ड्स', 'मराठा आरमार दफ्तर']
    }
  }
};

const CIVILIZATION_WORLDS = [
  { id: 'graph', name: 'ज्ञानजाळे व कालपट', icon: '🧬', count: 'Features 1–4', desc: 'Civilization Graph, What Was Here Before?, City Explorer, Old Cities' },
  { id: 'heritage', name: 'वारसा जतन व दस्तऐवज', icon: '🏚️', count: 'Features 5–8', desc: 'Vanishing Maharashtra, Heritage Home, Old Documents, Modi Reader' },
  { id: 'numismatics', name: 'नाणी, शिलालेख व लेणी', icon: '🪙', count: 'Features 9–13', desc: 'Coins, Inscriptions, Rock Caves, Archaeology, Trade Routes' },
  { id: 'military', name: 'आरमार, गडकोट व युद्धनीती', icon: '⚓', count: 'Features 14–20', desc: 'Maritime, Cavalry, Armour Museum, Fort Simulator, Strategy Game' },
  { id: 'historiography', name: 'इतिहास संशोधन व पुरावे', icon: '⚖️', count: 'Features 21–25', desc: 'Historical Mystery, Find Source, Disputed Views, Data, Geography' },
  { id: 'nature', name: 'सह्याद्री, नद्या व देवराई', icon: '⛰️', count: 'Features 26–30', desc: 'Sahyadri, Sacred Nature, Wildlife, Sacred Groves, River Civilization' },
  { id: 'spirituality', name: 'वारी, तीर्थक्षेत्र व सण', icon: '🥁', count: 'Features 31–33', desc: 'Pilgrimage Network, Wari Live Mode, Festival Calendar Engine' },
  { id: 'daily_life', name: 'दैनंदिन जीवन, वस्त्र व खाद्य', icon: '👨‍👩‍👧', count: 'Features 34–39', desc: 'How People Lived, Day in History, Fashion, Food, Education, Firsts' },
  { id: 'industry', name: 'उद्योग, रेल्वे व वर्तमानपत्रे', icon: '🚂', count: 'Features 40–46', desc: 'Industrial History, Railway, Mill Heritage, Newspapers, Audio/Video' },
  { id: 'research', name: 'संशोधक व डिजिटल ग्रंथ', icon: '🧑‍🔬', count: 'Features 47–53', desc: 'Ask Historian, Expert Profiles, Research Notebook, Digital Book, AI Doc' },
  { id: 'platform', name: 'ओपन API व अचूकता इंजिन', icon: '🛡️', count: 'Features 54–58', desc: 'Open Heritage API, Standards, Accuracy Engine, Context Finder, Graph' },
  { id: 'tourism', name: 'ट्रेकिंग, सुरक्षा व समुदाय', icon: '📱', count: 'Features 59–69', desc: 'QR Heritage, Audio Tours, Offline Trek, Safety, Awards, Marketplace' }
];

// CITIES DATA (Feature 3 & 4)
const MAHA_CITIES = [
  {
    id: 'pune',
    name: 'पुणे (पुण्यनगरी / Punawadi)',
    oldNames: 'पुन्नक विषय (इ.स. ७५८), कसबे पुणे, पेशवे राजधानी',
    eras: {
      today: 'भारताची आयटी, ऑटोमोबाईल व शैक्षणिक राजधानी (विद्येचे माहेरघर).',
      british: 'खडकी लष्करी छावणी, पूना पॅक्ट, फर्ग्युसन कॉलेज, डेक्कन जिमखाना (१८१८-१९४७).',
      peshwa: 'शनिवारवाडा, कात्रज पाण्याचा नळ, १७ पेठांची उभारणी, बाजीराव पेशवे (१७२०-१८१८).',
      maratha: 'लाल महाल, कसबा गणपती जिजाऊंनी स्थापन केला, दादोजी कोंडदेव (१६३०-१६८०).',
      earlier: 'राष्ट्रकूट राजवट (पुन्नक विषय), यादव काळ व पुणेश्वर-केदारेश्वर मंदिरे.'
    },
    architecture: 'शनिवारवाडा, विश्रामबाग वाडा, ओंकारेश्वर मंदिर, चतुःशृंगी',
    food: 'पुणेरी मिसळ, बाकरवडी, सुजाता मस्तानी, आंबा बर्फी',
    industry: 'माहिती तंत्रज्ञान (Hinjawadi), ऑटोमोबाईल (Tata, Bajaj), शिक्षण'
  },
  {
    id: 'mumbai',
    name: 'मुंबई (बॉम्बे / Mumbai)',
    oldNames: 'मुंबादेवी बेट, हेप्टानेशिया (टॉलेमीची सात बेटे)',
    eras: {
      today: 'भारताची आर्थिक राजधानी, आंतरराष्ट्रीय बंदर, बॉलिवूड व तंत्रज्ञान केंद्र.',
      british: 'सात बेटांचे एकत्रीकरण (हॉर्नबी व्हेलार्ड), व्हिक्टोरिया टर्मिनस (CST), फोर्ट परिसर.',
      peshwa: 'मराठा आरमाराचे कल्याण-वसई मोहीम, चिमाजी अप्पांचा वसई विजय (१७३९).',
      maratha: 'छत्रपती शिवाजी महाराजांची खांदेरी-उंदेरी मोहीम, इंग्रजांशी मुत्सद्दी तह.',
      earlier: 'शिलाहार राजवट, वाळकेश्वर बाणगंगा, घारापुरी (एलिफंटा लेणी इ.स. ६००).'
    },
    architecture: 'गेटवे ऑफ इंडिया, छत्रपती शिवाजी महाराज टर्मिनस, मुंबादेवी मंदिर, राजाबाई टॉवर',
    food: 'वडापाव, बॉम्बे सँडविच, उसळ-पाव, पावभाजी',
    industry: 'बँकिंग, वित्त (BSE/NSE), कापड गिरण्यांचा इतिहास, चित्रपट'
  },
  {
    id: 'chhatrapati_sambhajinagar',
    name: 'छत्रपती संभाजीनगर (औरंगाबाद / खडकी)',
    oldNames: 'राजतडाग, खडकी (मलिक अंबर १६१०), औरंगाबाद, छत्रपती संभाजीनगर',
    eras: {
      today: 'महाराष्ट्राची पर्यटन राजधानी, ऑटो हब, फार्मास्युटिकल व शैक्षणिक केंद्र.',
      british: 'निझाम-ब्रिटिश छावणी, मराठवाडा मुक्ती संग्राम लढा (१९४८).',
      peshwa: 'मराठ्यांचा मराठवाड्यातील प्रभाव, शिंदेशाही व होळकरांच्या मोहिमा.',
      maratha: 'छत्रपती संभाजी महाराजांचे मराठवाड्यातील पराक्रम, हंबीरराव मोहिते यांची गस्त.',
      earlier: 'सातवाहन काळ, वाकाटक, यादव देवगिरी राजधानी (११८०-१३१७), वेरूळ कैलास.'
    },
    architecture: 'देवगिरी (दौलताबाद) किल्ला, वेरूळ लेणी, बीबी का मकबरा, नहरे अंबरी जलप्रणाली',
    food: 'नानखलिया, मांडे, दाल बट्टी, सीताफळ रबडी',
    industry: 'पर्यटन, हिमरू व पैठणी विणकाम, ऑटोमोबाईल'
  },
  {
    id: 'kolhapur',
    name: 'कोल्हापूर (करवीर / Dakshin Kashi)',
    oldNames: 'करवीर पीठ, कोल्लापूर (शिलाहार राजधानी)',
    eras: {
      today: 'कुस्तीची पंढरी, साखर उद्योग, चित्रपटनिर्मिती व धार्मिक पर्यटन केंद्र.',
      british: 'राजर्षी छत्रपती शाहू महाराजांचे सामाजिक क्रांती युग (आरक्षण १८०२, मोफत शिक्षण).',
      peshwa: 'करवीर छत्रपती घराणे, महाराणी ताराबाईंची राजधानी (१७१०).',
      maratha: 'छत्रपती शिवरायांचा पन्हाळा वेढा, बाजीप्रभूंचा पावनखिंड लढा (१६६०).',
      earlier: 'शिलाहार राजवट, महालक्ष्मी (अंबाबाई) मंदिर निर्माण (इ.स. ७००), ब्रह्मपुरी उत्खनन.'
    },
    architecture: 'न्यू पॅलेस, अंबाबाई मंदिर, रंकाळा तलाव, भवानी मंडप, पन्हाळा गड',
    food: 'तांबडा-पांढरा रस्सा, कोल्हापुरी मिसळ, भडंग, गूळ',
    industry: 'साखर कारखाने, फाउंड्री व अभियांत्रिकी, कोल्हापुरी चप्पल'
  },
  {
    id: 'nagpur',
    name: 'नागपूर (विदर्भाची राजधानी / Orange City)',
    oldNames: 'नाग नदी काठची वस्ती, गोंड राजधानी (भक्त बुलंद शाह १७०२)',
    eras: {
      today: 'महाराष्ट्राची उपराजधानी, भारताचा झिरो माईल केंद्रबिंदू, मेट्रो व लॉजिस्टिक हब.',
      british: 'सेंट्रल प्रॉव्हिन्स आणि बेरारची राजधानी, सीताबर्डीची लढाई (१८१७).',
      peshwa: 'रघुजी भोसले प्रथम यांचे नागपूरकर भोसले साम्राज्य (कटक, बंगालपर्यंत विस्तार).',
      maratha: 'विदर्भातील मराठा जहागिरी, गोंड राजांशी मैत्री व संरक्षण संबंध.',
      earlier: 'वाकाटक राजवट (नंदीवर्धन रामटेक), मौर्य अवशेष (मनसर उत्खनन).'
    },
    architecture: 'दीक्षाभूमी, रामटेक गडमंदिर, सीताबर्डी किल्ला, कस्तुरचंद पार्क',
    food: 'सावजी मटण/चिकन, पोहे-तर्री, संत्रा बर्फी, पाटवडी रस्सा',
    industry: 'लॉजिस्टिक, संत्रा प्रक्रिया, कापूस जिनिंग, MIHAN SEZ'
  },
  {
    id: 'nashik',
    name: 'नाशिक (पंचवटी / कुंभमेळा नगरी)',
    oldNames: 'पद्मनगरी, जनस्थान (रामायण), नासिक्य (पतंजली महाभाष्य)',
    eras: {
      today: 'भारताची वाइन कॅपिटल, कृषी निर्यात केंद्र, धार्मिक तीर्थ व डिफेन्स हब.',
      british: 'क्रांतिकारी अभिनव भारत संघटना (स्वातंत्र्यवीर सावरकर), तोफखाना केंद्र (देवळाली).',
      peshwa: 'गोदावरी काठावरील घाट, काळाराम मंदिर निर्माण, पेशव्यांचे सुभेदार.',
      maratha: 'साल्हेर-मुल्हेर लढाया (१६७२), त्र्यंबकेश्वर व बागलाणवर शिवशाही वर्चस्व.',
      earlier: 'सातवाहन काळ (पांडवलेणी शिलालेख), यादव काळ, राम-सीता-लक्ष्मण पंचवटी.'
    },
    architecture: 'काळाराम मंदिर, त्र्यंबकेश्वर ज्योतिर्लिंग, पांडवलेणी, सुंदरनारायण मंदिर',
    food: 'मिसळ पाव (तुकडा/तर्री), द्राक्षे, चिवडा, खांदेशी वांग्याचे भरीत',
    industry: 'द्राक्ष व वाइनरी, HAL ओझर (लढाऊ विमाने), करन्सी नोट प्रेस'
  }
];

// FEATURE 9: COINS & CURRENCY DATABASE
const COINS_DATA = [
  {
    name: 'सातवाहन पोटिन नाणे (Satavahana Coin)',
    period: 'इ.स.पूर्व १०० - इ.स. १००',
    metal: 'पोटिन / शिसे (Lead alloy)',
    ruler: 'गौतमीपुत्र सातकर्णी / वसिष्ठीपुत्र',
    front: 'हत्ती / सिंह आणि ब्राह्मी लिपीत राजाचे नाव',
    back: 'उज्जैन चिन्ह (चार वर्तुळांचे चक्र) व चैत्य प्रतीक',
    source: 'महाराष्ट्र राज्य पुरातत्व संग्रहालय व नाणेघाट शोध'
  },
  {
    name: 'यादव सुवर्ण गद्याण (Yadava Gold Gadyana)',
    period: 'इ.स. ११८० - १३१०',
    metal: 'शुद्ध सोने (Gold)',
    ruler: 'सिंघणदेव यादव (देवगिरी)',
    front: 'गरुड मुद्रा अथवा शंख-चक्र-गदा-पद्म',
    back: 'नागरी लिपीत श्री सिंघणदेव असा स्पष्ट शिक्का',
    source: 'देवगिरी किल्ला उत्खनन व ब्रिटिश म्युझियम'
  },
  {
    name: 'शिवराई नाणे (Chhatrapati Shivaji Maharaj Shivrai)',
    period: 'इ.स. १६७४ - १८१८',
    metal: 'तांबे (Copper)',
    ruler: 'छत्रपती शिवाजी महाराज (६ जून १६७४ राज्याभिषेक)',
    front: 'नागरी लिपीत तीन ओळींमध्ये: "श्री / राजा / शिव"',
    back: 'नागरी लिपीत दोन ओळींमध्ये: "छत्र / पती"',
    source: 'किल्ले रायगड संग्रहालय व पेशवे दफ्तर'
  },
  {
    name: 'शिवकालीन सुवर्ण होन (Shivrai Hon)',
    period: 'इ.स. १६७४ - १६८०',
    metal: 'शुद्ध सोने (Gold - सुमारे २.८ ग्रॅम)',
    ruler: 'छत्रपती शिवाजी महाराज',
    front: 'देवनागरी अक्षरे: "श्री राजा शिव"',
    back: 'देवनागरी अक्षरे: "छत्रपती"',
    source: 'छत्रपती शिवाजी महाराज वस्तुसंग्रहालय (CSMVS), मुंबई'
  }
];

// FEATURE 10: HISTORIC INSCRIPTIONS
const INSCRIPTIONS_DATA = [
  {
    name: 'नाणेघाट शिलालेख (Naneghat Inscription)',
    location: 'नाणेघाट खिंड, जुन्नर (पुणे-ठाणे सीमा)',
    script: 'प्राचीन ब्राह्मी लिपी',
    lang: 'महाराष्ट्री प्राकृत',
    period: 'इ.स.पूर्व पहिले शतक (सातवाहन)',
    desc: 'राणी नागनिका यांनी कोरलेला शिलालेख. सातवाहन साम्राज्यातील यज्ञ, दानधर्म आणि जगातील सर्वांत प्राचीन अंकांचे (१, २, ४, ६, ७, ९) कोरीव पुरावे.',
    evidence: '🟢 प्रत्यक्ष कातळात कोरलेला मूळ पुरावा (Archaeological In-situ)'
  },
  {
    name: 'कार्ले लेणी शिलालेख (Karla Caves Inscription)',
    location: 'कार्ले महाचैत्य, लोणावळा',
    script: 'ब्राह्मी लिपी',
    lang: 'प्राकृत',
    period: 'इ.स. पहिले शतक',
    desc: 'भारतातील सर्वात मोठ्या कातळ-खोदीव बौद्ध चैत्यगृहातील खांबांवर कोरलेले व्यापाऱ्यांचे व कारागिरांचे देणगी शिलालेख.',
    evidence: '🟢 भारतीय पुरातत्व सर्वेक्षण (ASI) प्रमाणित'
  },
  {
    name: 'रायगड जगदीश्वर शिलालेख (Raigad Inscription)',
    location: 'श्री जगदीश्वर मंदिर, किल्ले रायगड पायरी',
    script: 'देवनागरी लिपी',
    lang: 'संस्कृत / जुनी मराठी',
    period: 'इ.स. १६७४ (राज्याभिषेक काळ)',
    desc: 'मुख्य स्थापत्यकार हिरोजी इंदुलकर यांनी नम्रतेने कोरलेली ओळ: "सेवेचे ठायी तत्पर हिरोजी इंदुलकर". गडावरील वास्तुरचनेचा ऐतिहासिक दस्तऐवज.',
    evidence: '🟢 शिवकालीन समकालीन दगडी शिलालेख'
  }
];

// FEATURE 16: ARMS & ARMOUR DATA
const WEAPONS_DATA = [
  {
    name: 'दांडपट्टा (Dandpatta / Gauntlet Sword)',
    period: '१६ वे ते १८ वे शतक (मराठा सैन्य)',
    design: 'हातात लोखंडी पंजासारखे कवच घालून ३ ते ४ फूट लांब लवचिक पोलादी पात्याची तलवार.',
    use: 'घोडदळाविरुद्ध पायदळाचे आत्मरक्षण; चारी बाजूंना फिरवून एका वेळी अनेक शत्रूंचा संहार.',
    fame: 'तानाजी मालुसरे, बाजीप्रभू देशपांडे व शिवकालीन मावळ्यांचे आवडते शस्त्र.'
  },
  {
    name: 'वाघनखे (Wagh Nakh / Tiger Claws)',
    period: 'शिवकाल (१६५९ प्रतापगड युद्ध)',
    design: 'हाताच्या मुठीत सहज लपवता येणारी चार तीक्ष्ण वाकडी लोखंडी नखे आणि बोटांमध्ये अडकवायच्या दोन अंगठ्या.',
    use: 'अनपेक्षित हल्ल्यात शत्रूचा कोथळा बाहेर काढण्यासाठी गुप्त शस्त्र.',
    fame: '१० नोव्हेंबर १६५९ रोजी अफझलखानाने कपटी आलिंगन देताच शिवरायांनी याच वाघनख्यांनी त्याचा खात्मा केला.'
  },
  {
    name: 'फिरंगी तलवार (Firangi Straight Sword)',
    period: '१७ वे शतक',
    design: 'पोर्तुगीज किंवा युरोपीय बनावटीचे थेट सपाट पाते, ज्यावर मराठ्यांनी स्वतःची स्थानिक मुठ (Khanda Hilt) बसवली.',
    use: 'घोडदळाच्या वेगवान हल्ल्यात समोरासमोर जबरदस्त वार करण्यासाठी वापर.',
    fame: 'छत्रपती शिवाजी महाराजांच्या पवित्र "भवानी" व "जगदंबा" तलवारी याच धाटणीच्या होत्या.'
  }
];

// FEATURE 30: RIVER CIVILIZATION DATA
const RIVERS_DATA = [
  {
    name: 'गोदावरी (दक्षिण गंगा)',
    origin: 'ब्रह्मगिरी, त्र्यंबकेश्वर (नाशिक)',
    course: 'नाशिक → कोपरगाव → पैठण → नांदेड → तेलंगणा/आंध्र प्रदेश → बंगालचा उपसागर',
    significance: 'महाराष्ट्राची जीवनवाहिनी. काठावर सातवाहनांची पैठण राजधानी, संत ज्ञानेश्वरांचे नेवासे, संत एकनाथांचे पैठण, गुरु गोबिंद सिंग यांचे नांदेड सचखंड गुरुद्वारा.',
    crops: 'ऊस, द्राक्षे, कांदा, बाजरी'
  },
  {
    name: 'कृष्णा नदी',
    origin: 'महाबळेश्वर (सातारा)',
    course: 'महाबळेश्वर → वाई → सातारा → सांगली → कोल्हापूर सीमा → कर्नाटक',
    significance: 'पश्चिम महाराष्ट्राची जलसंस्कृती. वाईचे ऐतिहासिक घाट व गणपती मंदिर, सांगलीची हळद व शेती, नरसोबाची वाडी दत्त पीठ.',
    crops: 'ऊस, हळद, केळी, तांदूळ'
  },
  {
    name: 'भीमा (चंद्रभागा)',
    origin: 'भीमाशंकर ज्योतिर्लिंग (पुणे)',
    course: 'भीमाशंकर → खेड → दौंड → पंढरपूर (येथे चंद्रकोरीसारखी वळते म्हणून चंद्रभागा) → कृष्णा संगम',
    significance: 'वारकरी संप्रदायाचे पवित्र तीर्थ. पंढरपूरचे विठ्ठल मंदिर, संत तुकाराम व संतांचे अभंग आणि आषाढी-कार्तिकी महावारी.',
    crops: 'ज्वारी, डाळिंब, ऊस'
  }
];


export default function ConnectMarathaUniversePage() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('master-map');
  const [selectedWorld, setSelectedWorld] = useState(UNIVERSE_WORLDS[0].id);
  const [selectedCivilizationWorld, setSelectedCivilizationWorld] = useState(CIVILIZATION_WORLDS[0].id);
  const [selectedEpoch, setSelectedEpoch] = useState(TIME_MACHINE_EPOCHS[6]); // Shivkal (1630-1680)
  const [selectedBattle, setSelectedBattle] = useState(BATTLES_DATA[0]);
  const [selectedConnectedNode, setSelectedConnectedNode] = useState('raigad');
  const [selectedCity, setSelectedCity] = useState(MAHA_CITIES[0]);
  const [selectedCityEra, setSelectedCityEra] = useState('peshwa');
  const [selectedCoin, setSelectedCoin] = useState(COINS_DATA[0]);
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPONS_DATA[0]);
  const [selectedRiver, setSelectedRiver] = useState(RIVERS_DATA[0]);
  const [learningMode, setLearningMode] = useState('detailed'); // 'simple' | 'detailed' | 'academic'
  const [language, setLanguage] = useState('mr'); // 'mr' | 'en'
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedDistrictFood, setSelectedDistrictFood] = useState('पुणे');

  // Master Map Layers (Feature 1: 21 Layers)
  const [activeLayers, setActiveLayers] = useState({
    forts: true,
    historical_places: true,
    battles: true,
    temples: true,
    saints: true,
    palaces_wadas: false,
    ancient_caves: false,
    museums: false,
    festivals: false,
    historical_events: false,
    rivers: false,
    ghats: false,
    trade_routes: false,
    pilgrimage_routes: false,
    personalities: false,
    food_specialties: false,
    folk_arts: false,
    dialects: false,
    tourism: false,
    inscriptions: false,
    dynasty_capitals: false
  });

  // Modals State (All 12 Interactive Modals)
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showFamilyTreeModal, setShowFamilyTreeModal] = useState(false);
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showFortSimModal, setShowFortSimModal] = useState(false);
  const [showDocScannerModal, setShowDocScannerModal] = useState(false);
  const [showMysteryModal, setShowMysteryModal] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [showAudioTourModal, setShowAudioTourModal] = useState(false);
  const [showHeritageHomeModal, setShowHeritageHomeModal] = useState(false);
  const [showAskHistorianModal, setShowAskHistorianModal] = useState(false);

  // Helper interactive states
  const [fortSimState, setFortSimState] = useState({ masonry: 'दगडी चिरेबंदी', hydrology: 'पाषाणातील तलाव', bastions: 'चिलखती बुरुज' });
  const [mysteryAnswer, setMysteryAnswer] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [villageSearch, setVillageSearch] = useState('');

  // Gamification User Stats (Passport)
  const [passportStats, setPassportStats] = useState({
    points: 920,
    level: 'इतिहास संशोधक (Tier 3 Researcher)',
    fortsVisited: 16,
    templesVisited: 11,
    quizzesCompleted: 8,
    badges: ['सह्याद्री दुर्गवीर', 'शिवराज्याभिषेक साक्षीदार', 'वारकरी भक्ती साधक', 'जलव्यवस्था अभ्यासक']
  });

  const toggleLayer = (id) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAIQuery = () => {
    if (!aiQuestion.trim()) return;
    const q = aiQuestion.toLowerCase();
    if (q.includes('रायगड') || q.includes('raigad')) {
      setAiResponse({
        title: 'किल्ले रायगड — अधिकृत पडताळणी माहिती',
        history: 'इ.स. १६७४ मध्ये छत्रपती शिवाजी महाराजांचा राज्याभिषेक संपन्न. हिरोजी इंदुलकर यांनी उभारलेली भव्य राजधानी.',
        water: 'गंगासागर, हत्ती तलाव आणि पाषाणातील जलसाठवण यंत्रणा.',
        sources: 'सभासद बखर, हेन्री ऑक्झिंडेन समकालीन दैनंदिनी.',
        status: '🟢 सप्रमाण ऐतिहासिक सत्य'
      });
    } else if (q.includes('प्रतापगड') || q.includes('pratapgad')) {
      setAiResponse({
        title: 'किल्ले प्रतापगड व युद्ध — अधिकृत पडताळणी माहिती',
        history: '१० नोव्हेंबर १६५९ रोजी अफझलखानाचा वध व विजापुरी सैन्याचा पराभव. मोरोपंत पिंगळे व कान्होजी जेधे यांचा सहभाग.',
        water: 'गडावरील बालेकिल्ल्यातील पाण्याच्या टाक्या आजही बाराही महिने जलमय असतात.',
        sources: 'शिवभारत (कवी परमानंद), जेधे शकावली.',
        status: '🟢 सप्रमाण ऐतिहासिक सत्य'
      });
    } else {
      setAiResponse({
        title: 'Connect Maratha अधिकृत ज्ञानकोश तपासणी',
        history: '"' + aiQuestion + '" या विषयावर आमच्या पडताळणी डाटाबेसमध्ये प्राथमिक नोंदी उपलब्ध आहेत. इतर असत्यापित इंटरनेट माहिती येथे दाखवली जात नाही.',
        water: 'सह्याद्री जलव्यवस्था व स्थानिक संदर्भानुसार पडताळणी सुरू आहे.',
        sources: 'महाराष्ट्र राज्य गॅझेटियर व पुराभिलेख विभाग.',
        status: '🔵 अभ्यासकीय निष्कर्ष'
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#431407', fontFamily: 'inherit' }}>

      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #EA580C 100%)',
        color: '#FFFFFF',
        padding: '42px 20px 34px',
        borderBottom: '4px solid #F59E0B',
        boxShadow: '0 8px 24px rgba(124, 29, 5, 0.25)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Top Breadcrumb & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.9 }}>
              <Link to="/" style={{ color: '#FDE68A', textDecoration: 'none' }}>मुख्यपृष्ठ</Link>
              <span>/</span>
              <span>महाराष्ट्र संस्कृती व सभ्यता ज्ञानकोश</span>
            </div>

            {/* Language & 3 Learning Modes */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLanguage('mr')}
                  style={{
                    background: language === 'mr' ? '#FFFFFF' : 'transparent',
                    color: language === 'mr' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  style={{
                    background: language === 'en' ? '#FFFFFF' : 'transparent',
                    color: language === 'en' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  English
                </button>
              </div>

              {/* 3 Learning Modes: Feature 31 */}
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setLearningMode('simple')}
                  title="Explain Like I'm 10 (बालमित्र सोपे स्वरूप)"
                  style={{
                    background: learningMode === 'simple' ? '#86EFAC' : 'transparent',
                    color: learningMode === 'simple' ? '#14532D' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🟢 १० वर्षे सोपे
                </button>
                <button
                  onClick={() => setLearningMode('detailed')}
                  title="Detailed Mode (सामान्य वाचक)"
                  style={{
                    background: learningMode === 'detailed' ? '#FED7AA' : 'transparent',
                    color: learningMode === 'detailed' ? '#7C1D05' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🔵 सविस्तर
                </button>
                <button
                  onClick={() => setLearningMode('research')}
                  title="Research Mode (संशोधक व पुरावे)"
                  style={{
                    background: learningMode === 'research' ? '#D8B4FE' : 'transparent',
                    color: learningMode === 'research' ? '#581C87' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🟣 संशोधन मोड
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '12px' }}>
            <span>🏛️ DIGITAL MAHARASHTRA CIVILIZATION EXPLORER</span>
            <span>•</span>
            <span>४९ वैशिष्ट्ये • १२ महाविश्वे • अखंड ज्ञानजाळे</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.2 }}>
            {language === 'mr' ? 'Connect Maratha — संपूर्ण महाराष्ट्र महाविश्व' : 'Connect Maratha — Maharashtra Civilization Explorer'}
          </h1>

          <p style={{ fontSize: '1.1rem', maxWidth: '960px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            {language === 'mr'
              ? 'केवळ एका घटनेपुरते किंवा समुदायापुरते मर्यादित नव्हे, तर महाराष्ट्राची ५,००० वर्षांची माती, सह्याद्रीचे ३५०+ गडकोट, जलव्यवस्थापन, १२ कालखंडांचे साम्राज्य, रणांगणे, संत परंपरा, वाडा वास्तुकला, भाषा, खाद्य व लोककला यांचे एकात्मिक डिजिटल महाविश्व!'
              : 'Discover Maharashtra not just as a single event, but as a rich civilization of soil, forts, hydrology, 12 historical epochs, battles, saints, architecture, dialects, food, and living traditions!'}
          </p>

          {/* Quick Launch Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('master-map')}
              style={{ background: '#FFFFFF', color: '#7C1D05', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              🗺️ २१-लेयर मास्टर मॅप
            </button>
            <button
              onClick={() => setActiveTab('time-machine')}
              style={{ background: '#FEF3C7', color: '#92400E', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              ⏳ टाईम मशीन (१२ कालखंड)
            </button>
            <button
              onClick={() => setActiveTab('battles')}
              style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              ⚔️ रणांगण व युद्धनीती
            </button>
            <button
              onClick={() => setActiveTab('people')}
              style={{ background: '#F3E8FF', color: '#6B21A8', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              👑 वीरांगना व महापुरुष
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              style={{ background: 'rgba(255,255,255,0.22)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.45)', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🤖 AI हेरिटेज असिस्टंट
            </button>
            <button
              onClick={() => setShowPassportModal(true)}
              style={{ background: '#DCFCE7', color: '#166534', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              🪪 वारसा पासपोर्ट ({passportStats.points} गुण)
            </button>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. STICKY SUB-NAV: ALL CIVILIZATION WORLDS & CORE EXPLORATION TABS         */}
      {/* ========================================================================= */}
      <div style={{ background: '#FFFFFF', borderBottom: '2px solid #FED7AA', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {[
            { id: 'master-map', name: '🗺️ मास्टर मॅप (२१ लेअर्स)' },
            { id: 'time-machine', name: '⏳ टाईम मशीन (इ.स.पू. २३० ते आज)' },
            { id: 'cities-layers', name: '🏙️ १८ शहरे: येथे पूर्वी काय होते?' },
            { id: 'forts', name: '🏰 फोर्ट एक्सप्लोरर, वाडे व सिम्युलेटर' },
            { id: 'battles', name: '⚔️ रणसंग्राम, आरमार व शस्त्रास्त्रे' },
            { id: 'people', name: '👑 वीरांगना व महापुरुष' },
            { id: 'culture', name: '🎭 खाद्य संस्कृती (३६ जिल्हे), बोली व कला' },
            { id: 'numismatics', name: '🪙 नाणी, शिलालेख व मोडी वाचक' },
            { id: 'nature', name: '⛰️ सह्याद्री, नद्या व देवराई' },
            { id: 'spirituality', name: '🚩 भक्ती, संत व वारकरी परंपरा' },
            { id: 'daily_life', name: '🏺 १७वे शतक: दैनंदिन जीवन व बलूतेदारी' },
            { id: 'industry', name: '⛵ सागरी व्यापार, बंदरे व उद्योग' },
            { id: 'historiography', name: '⚖️ इतिहास संशोधन, पुरावे व गूढ' },
            { id: 'community', name: '👥 गाव ज्ञानकोश, कुलवृक्ष व पासपोर्ट' },
            { id: 'civilization-70', name: '🧬 ७० सभ्यता वैशिष्ट्ये' },
            { id: 'universe-49', name: '🌟 १२ ज्ञानविश्वे (४९ मूळ वैशिष्ट्ये)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                border: activeTab === tab.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                background: activeTab === tab.id ? '#7C1D05' : '#FFFDF9',
                color: activeTab === tab.id ? '#FFFFFF' : '#431407',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px' }}>

        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              सत्यनिष्ठ मांडणी • FACT VS TRADITION RATING
            </span>
            <div style={{ fontSize: '0.9rem', color: '#78350F', fontWeight: 600 }}>
              Connect Maratha व्यासपीठावरील प्रत्येक ऐतिहासिक माहिती ५ स्तरांवर पडताळून दिली जाते:
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟢 सप्रमाण दस्तऐवज (Fact)
            </span>
            <span style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🔵 अभ्यासकीय निष्कर्ष (Scholarly)
            </span>
            <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟡 लोकपरंपरा (Oral Tradition)
            </span>
            <span style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🟠 धार्मिक श्रद्धा (Religious)
            </span>
            <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              🔴 असत्यापित दावा (Unverified)
            </span>
          </div>
        </div>

        {activeTab === 'master-map' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px',
            boxShadow: '0 4px 16px rgba(234,88,12,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य १, २६, २४, २५ • MAHARASHTRA INTERACTIVE MASTER MAP
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  🗺️ २१-लेयर परस्परसंवादी महाराष्ट्र मास्टर मॅप
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  लेअर्स चालू/बंद करा, कोणत्याही स्थानावर क्लिक करा आणि "येथे काय घडले होते?" (What Happened Here?) चे नातेसंबंध अनुभवा.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/culture/heritage-map"
                  style={{ background: '#7C1D05', color: '#FFFFFF', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
                >
                  पूर्ण स्क्रीन नकाशा ⛶
                </Link>
              </div>
            </div>

            {/* 21 Layers Switcher Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '20px' }}>
              {MASTER_MAP_LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeLayers[layer.id] ? `1.5px solid ${layer.color}` : '1px solid #D1D5DB',
                    background: activeLayers[layer.id] ? `${layer.color}15` : '#F9FAFB',
                    color: activeLayers[layer.id] ? layer.color : '#6B7280',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{activeLayers[layer.id] ? '✓' : '+'}</span>
                  <span>{layer.name}</span>
                </button>
              ))}
            </div>

            {/* Interactive Simulation Grid: What Happened Here? */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFDF9 0%, #FEF3C7 100%)',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <strong style={{ color: '#7C1D05', fontSize: '0.95rem' }}>
                  🧭 "येथे काय घडले होते?" (What Happened Here?) — ठिकाण निवडा:
                </strong>
                <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  सक्रिय लेअर्स: {Object.values(activeLayers).filter(Boolean).length} / {MASTER_MAP_LAYERS.length}
                </span>
              </div>

              {/* Geo Nodes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div
                  onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.raigad)}
                  style={{
                    background: '#FFFFFF',
                    border: selectedConnectedNode.id === 'raigad' ? '2px solid #DC2626' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>🏰</div>
                  <strong style={{ color: '#7C1D05', fontSize: '0.95rem' }}>किल्ले रायगड (राजधानी)</strong>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                    ६ जून १६७४ राज्याभिषेक • जगदीश्वर मंदिर • गंगासागर तलाव
                  </div>
                </div>

                <div
                  onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.sindhudurg)}
                  style={{
                    background: '#FFFFFF',
                    border: selectedConnectedNode.id === 'sindhudurg' ? '2px solid #0284C7' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>⚓</div>
                  <strong style={{ color: '#0369A1', fontSize: '0.95rem' }}>किल्ले सिंधुदुर्ग व आरमार</strong>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                    सागरी बालेकिल्ला • गोड्या पाण्याच्या ३ विहिरी • मालवणी बोली
                  </div>
                </div>

                <div
                  onClick={() => setSelectedConnectedNode(CONNECTED_NODES_DATA.shivaji_maharaj)}
                  style={{
                    background: '#FFFFFF',
                    border: selectedConnectedNode.id === 'shivaji_maharaj' ? '2px solid #C2410C' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '1.4rem' }}>👑</div>
                  <strong style={{ color: '#C2410C', fontSize: '0.95rem' }}>छत्रपती शिवाजी महाराज</strong>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                    स्वराज्य संकल्प • ३५०+ किल्ले • जलव्यवस्था • समकालीन बखर पुरावे
                  </div>
                </div>
              </div>

              {/* Active Node Detail Card: Feature 48 Connect Everything */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{selectedConnectedNode.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#7C1D05' }}>{selectedConnectedNode.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#C2410C', fontWeight: 700 }}>{selectedConnectedNode.type}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.92rem', color: '#431407', lineHeight: 1.6, marginBottom: '16px' }}>
                  {selectedConnectedNode.summary}
                </p>

                {/* Multidimensional Linkages */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#FFF7ED', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#C2410C', textTransform: 'uppercase' }}>👑 संबंधित व्यक्ती:</strong>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#7C1D05' }}>
                      {selectedConnectedNode.connections.persons.join(', ')}
                    </div>
                  </div>

                  <div style={{ background: '#FEF2F2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#B91C1C', textTransform: 'uppercase' }}>⚔️ ऐतिहासिक घटना:</strong>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#991B1B' }}>
                      {selectedConnectedNode.connections.events.join(', ')}
                    </div>
                  </div>

                  <div style={{ background: '#F0FDFA', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#0F766E', textTransform: 'uppercase' }}>💧 जलव्यवस्था (Water Heritage):</strong>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#115E59' }}>
                      {selectedConnectedNode.connections.waterSystems ? selectedConnectedNode.connections.waterSystems.join(', ') : 'पाषाण टाक्या व पाणलोट'}
                    </div>
                  </div>

                  <div style={{ background: '#F3F4F6', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#374151', textTransform: 'uppercase' }}>📜 ऐतिहासिक पुरावे (Sources):</strong>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#1F2937' }}>
                      {selectedConnectedNode.connections.documents.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'time-machine' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #F59E0B',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px',
            boxShadow: '0 6px 20px rgba(217,119,6,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य २, २८, २७ • MAHARASHTRA TIME MACHINE
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  ⏳ महाराष्ट्र टाईम मशीन (इ.स. पूर्व २३० ते आज)
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  सातवाहन ते आधुनिक महाराष्ट्र—कालखंड निवडा आणि राजधानी, किल्ले, युद्धे व राजकीय सत्तांतराचे बदलणारे रूप थेट अनुभवा.
                </p>
              </div>

              <div style={{ background: '#FEF3C7', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, color: '#92400E', border: '1px solid #F59E0B' }}>
                निवडलेला कालखंड: {selectedEpoch.era}
              </div>
            </div>

            {/* Epoch Selector Slider/Buttons */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
              {TIME_MACHINE_EPOCHS.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEpoch(ep)}
                  style={{
                    minWidth: '160px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: selectedEpoch.id === ep.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                    background: selectedEpoch.id === ep.id ? '#7C1D05' : '#FFFFFF',
                    color: selectedEpoch.id === ep.id ? '#FFFFFF' : '#431407',
                    textAlign: 'left',
                    boxShadow: selectedEpoch.id === ep.id ? '0 4px 12px rgba(124,29,5,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>{ep.era}</div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, marginTop: '2px', lineHeight: 1.3 }}>{ep.title.split('(')[0]}</div>
                </button>
              ))}
            </div>

            {/* Epoch Detailed Panel */}
            <div style={{
              background: '#FFFDF9',
              borderRadius: '16px',
              border: '2px solid #FED7AA',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>
                  कालखंड तपशील व प्रभाव
                </span>
                <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: '6px 0 10px' }}>
                  {selectedEpoch.title}
                </h3>
                <p style={{ fontSize: '0.94rem', color: '#431407', lineHeight: 1.6, margin: '0 0 16px' }}>
                  {selectedEpoch.highlight}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                  <div>🏛️ <strong>राजधानी:</strong> {selectedEpoch.capital}</div>
                  <div>👑 <strong>प्रमुख सत्ताधीश:</strong> {selectedEpoch.ruler}</div>
                  <div>🗺️ <strong>भौगोलिक केंद्र:</strong> {selectedEpoch.mapCenter}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#B91C1C' }}>🏰 संबंधित गडकिल्ले व वास्तू:</strong>
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#7C1D05' }}>
                    {selectedEpoch.forts.join(', ')}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#BE123C' }}>🍲 त्या काळातील खाद्यसंस्कृती:</strong>
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#9F1239' }}>
                    {selectedEpoch.food.join(', ')}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#15803D' }}>🟢 पडताळणी दर्जा:</strong>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#166534' }}>
                    समकालीन ताम्रपट, शिलालेख, बखर व पुराभिलेख संदर्भ पडताळलेले.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 🏙️ WHAT WAS HERE BEFORE? 18 CITIES TIMELINE & EXPLORER             */}
        {/* ========================================================================= */}
        {activeTab === 'cities-layers' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य २ व ३ • WHAT WAS HERE BEFORE? & CITY HISTORY EXPLORER
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  🏙️ १८ प्रमुख शहरे: येथे पूर्वी काय होते? (कालखंडानुसार बदल)
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  कोणत्याही आधुनिक शहराची निवड करा आणि आजपासून ते पेशवे, शिवकाळ, मध्ययुगीन व प्राचीन काळापर्यंत ते शहर कसे बदलत गेले ते पहा.
                </p>
              </div>
              <div style={{ background: '#FEF3C7', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800, color: '#92400E', border: '1px solid #F59E0B' }}>
                निवडलेले शहर: {selectedCity.name}
              </div>
            </div>

            {/* City Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
              {MAHA_CITIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCity(c)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: selectedCity.id === c.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                    background: selectedCity.id === c.id ? '#7C1D05' : '#FFFDF9',
                    color: selectedCity.id === c.id ? '#FFFFFF' : '#431407',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* 5 Eras Timeline Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', background: '#FFF7ED', padding: '8px', borderRadius: '12px' }}>
              {[
                { id: 'today', name: 'आज (Modern Era)' },
                { id: 'british', name: 'ब्रिटिश काळ (1818-1947)' },
                { id: 'peshwa', name: 'पेशवे काळ (1713-1818)' },
                { id: 'maratha', name: 'शिवकाळ / मराठा साम्राज्य' },
                { id: 'ancient', name: 'प्राचीन / यादव / सातवाहन' }
              ].map(era => (
                <button
                  key={era.id}
                  onClick={() => setSelectedCityEra(era.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedCityEra === era.id ? '#C2410C' : 'transparent',
                    color: selectedCityEra === era.id ? '#FFFFFF' : '#78350F'
                  }}
                >
                  {era.name}
                </button>
              ))}
            </div>

            {/* City Details Card */}
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                  {selectedCity.name} • {selectedCity.region}
                </h3>
                <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                  पुरातन नाव: {selectedCity.ancientName}
                </span>
              </div>
              <p style={{ color: '#431407', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {selectedCity.eras[selectedCityEra] || selectedCity.eras.peshwa}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 800 }}>प्रमुख वारसा वास्तू:</span>
                  <div style={{ color: '#78350F', fontWeight: 700, marginTop: '4px' }}>{selectedCity.heritageSites.join(' • ')}</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 800 }}>पारंपरिक खाद्य ओळख:</span>
                  <div style={{ color: '#78350F', fontWeight: 700, marginTop: '4px' }}>{selectedCity.famousFood}</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                  <span style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 800 }}>पारंपरिक उद्योग / हस्तकला:</span>
                  <div style={{ color: '#78350F', fontWeight: 700, marginTop: '4px' }}>{selectedCity.industry}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'forts' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ३, १७, १८ • FORT EXPLORER 2.0 & WATER HERITAGE
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                🏰 फोर्ट एक्सप्लोरर २.० व सह्याद्रीचे जलव्यवस्थापन
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                केवळ किल्ल्यांची नावे नव्हेत; वास्तुकला, पाणी व्यवस्थापन (पाऊस → पाणलोट → दगडी टाक्या → गाळण), ट्रेकिंग काठिण्यपातळी व वाड्यांची रचना.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { name: 'किल्ले रायगड', height: '२,८५१ फूट', water: 'गंगासागर, हत्ती तलाव, २०+ पाषाण टाक्या', architecture: 'महादरवाजा, नगारखाना, राजसभा, टकमक टोक', diff: 'मध्यम (१,४५० पायऱ्या / रोपवे)', timeline: 'मोरी → शिवराय राजधानी (१६७४) → पेशवे → आज' },
                { name: 'किल्ले राजगड', height: '४,५१४ फूट', water: 'पद्मावती तलाव, संजीवनी बालेकिल्ला टाक्या', architecture: 'सुवेळा, संजीवनी, पद्मावती माची, दुहेरी तटबंदी', diff: 'कठीण (अभियांत्रिकी चमत्कार)', timeline: '२६ वर्षे शिवरायांची प्रमुख राजधानी' },
                { name: 'किल्ले प्रतापगड', height: '३,५४३ फूट', water: 'बालेकिल्ला गोड्या पाण्याच्या टाक्या', architecture: 'भवानी मंदिर, अफझलखान बुरुज, दिंडी दरवाजा', diff: 'सोपा ते मध्यम (जावळीचे अभेद्य अरण्य)', timeline: '१६५६ निर्मिती → अफझलखान वध १६५९' },
                { name: 'किल्ले सिंधुदुर्ग', height: 'समुद्रसपाटी (सागरी)', water: 'खऱ्या समुद्रातील दूधबाव, साखरबाव विहिरी', architecture: '४२ बुरुज, समुद्रात शिशाचा रस ओतून पायाभरणी', diff: 'बोट सफारी (मालवण)', timeline: '१६६४ पायाभरणी → मराठा आरमार बालेकिल्ला' }
              ].map((f, idx) => (
                <div key={idx} style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#7C1D05' }}>{f.name}</h3>
                    <span style={{ fontSize: '0.78rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{f.height}</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#431407', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>💧 <strong>जलव्यवस्था:</strong> {f.water}</div>
                    <div>🏛️ <strong>वास्तुकला:</strong> {f.architecture}</div>
                    <div>🧗 <strong>ट्रेकिंग काठिण्य:</strong> {f.diff}</div>
                    <div>📜 <strong>कालपट:</strong> {f.timeline}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature 18: Wada Architecture Spotlight */}
            <div style={{ marginTop: '24px', background: '#FFF7ED', border: '1.5px solid #F97316', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ color: '#9A3412', margin: '0 0 6px', fontSize: '1.2rem' }}>
                🏘️ वाडा वास्तुकला (Wada Architecture Digital Anatomy)
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#7C2D12', lineHeight: 1.5 }}>
                महाराष्ट्राच्या वास्तूशास्त्राचे अद्वितीय पैलू: चौकोनी अंगण (Courtyard), दिंडी दरवाजा, लाकडी कोरीव खांब, नगारखाना, देवघर, विहीर व गुप्त तळघरे.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #FED7AA' }}>शनिवारवाडा (पुणे)</span>
                <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #FED7AA' }}>विश्रामबाग वाडा (पुणे)</span>
                <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #FED7AA' }}>नाना फडणवीस वाडा (मेनवली)</span>
                <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #FED7AA' }}>राजे शिर्के वाडा (कोकण)</span>
              </div>
            </div>
            {/* Extra Tools: Fort Simulator & Wada Preservation */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🧱</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>किल्ला बांधकाम सिम्युलेटर (Fort Simulator)</h4>
                    <span style={{ fontSize: '0.76rem', color: '#C2410C', fontWeight: 700 }}>वैशिष्ट्य २७ • ARCHITECTURAL SIMULATOR</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#78350F', margin: '0 0 12px' }}>
                  दगडी चिरेबंदी, पाषाणातील जलसाठे, गोमुखी महाद्वार व चिलखती बुरुज निवडून शिवकालीन किल्ला स्वतः डिझाइन करा.
                </p>
                <button
                  onClick={() => setShowFortSimModal(true)}
                  style={{ background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ⚙️ सिम्युलेटर उघडा (Launch Simulator)
                </button>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)', border: '1.5px solid #FCA5A5', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🏚️</span>
                  <div>
                    <h4 style={{ margin: 0, color: '#991B1B', fontSize: '1.1rem', fontWeight: 800 }}>ऐतिहासिक वाडे व नष्ट होणारा वारसा</h4>
                    <span style={{ fontSize: '0.76rem', color: '#B91C1C', fontWeight: 700 }}>वैशिष्ट्य ४ व ५ • VANISHING HERITAGE REGISTRY</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#7F1D1D', margin: '0 0 12px' }}>
                  महाराष्ट्रातील दुर्मिळ लाकडी कोरीव काम, चौक व माजघर असणाऱ्या वाड्यांची नोंद घ्या व संवर्धनासाठी दत्तक घ्या.
                </p>
                <button
                  onClick={() => setShowHeritageHomeModal(true)}
                  style={{ background: '#991B1B', color: '#FFFFFF', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🏛️ वाडा संवर्धन नोंद करा
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {activeTab === 'battles' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FECACA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#B91C1C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ४ • BATTLE EXPLORER (रणसंग्राम व युद्धनीती)
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#991B1B', fontWeight: 800, margin: '4px 0 0' }}>
                ⚔️ ऐतिहासिक रणांगणे व गनिमी काव्याची व्यूहरचना
              </h2>
              <p style={{ color: '#7F1D1D', fontSize: '0.95rem', margin: '4px 0 0' }}>
                लढायांची तारीख, नेतृत्व, सैन्य आकडेवारी (अतिशयोक्ती टाळून विश्वसनीय साधनांनुसार), भूगोल, व्यूहरचना व परिणाम.
              </p>
            </div>

            {/* Battle Picker Buttons */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
              {BATTLES_DATA.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBattle(b)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    border: selectedBattle.id === b.id ? '2px solid #991B1B' : '1px solid #FECACA',
                    background: selectedBattle.id === b.id ? '#991B1B' : '#FEF2F2',
                    color: selectedBattle.id === b.id ? '#FFFFFF' : '#991B1B',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {b.name.split('(')[0]}
                </button>
              ))}
            </div>

            {/* Battle Deep-Dive Box */}
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FCA5A5', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#991B1B' }}>{selectedBattle.name}</h3>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 800 }}>
                  🟢 सप्रमाण दस्तऐवजी इतिहास
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.9rem' }}>
                <div><strong>📅 तारीख:</strong> {selectedBattle.date}</div>
                <div><strong>📍 ठिकाण व भूगोल:</strong> {selectedBattle.location}</div>
                <div><strong>👑 सेनापती व नेतृत्व:</strong> {selectedBattle.leaders}</div>
                <div><strong>🛡️ सैन्य ताकद (पुरावे):</strong> {selectedBattle.forces}</div>
              </div>

              <div style={{ marginTop: '14px', background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                <strong style={{ color: '#C2410C' }}>🎯 युद्धनीती व व्यूहरचना (Tactical Maneuver):</strong>
                <p style={{ margin: '4px 0 0', lineHeight: 1.6, color: '#431407' }}>{selectedBattle.strategy}</p>
              </div>

              <div style={{ marginTop: '12px', background: '#FEF2F2', padding: '14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                <strong style={{ color: '#991B1B' }}>🏆 ऐतिहासिक परिणाम व महत्त्व:</strong>
                <p style={{ margin: '4px 0 0', lineHeight: 1.6, color: '#7F1D1D' }}>{selectedBattle.result}</p>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.84rem', color: '#6B7280' }}>
                <strong>📜 प्राथमिक व विश्वसनीय संदर्भ:</strong> {selectedBattle.sources.join(', ')}
              </div>
            </div>
            {/* Extra Section: Maratha Navy & Arms Database */}
            <div style={{ marginTop: '24px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#C2410C', fontWeight: 800, textTransform: 'uppercase' }}>वैशिष्ट्य १६ • ARMS, ARMOUR & MARATHA NAVY</span>
                  <h4 style={{ margin: '2px 0 0', color: '#7C1D05', fontSize: '1.2rem', fontWeight: 800 }}>मराठा आरमार व ऐतिहासिक शस्त्रास्त्रे</h4>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {WEAPONS_DATA.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWeapon(w)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        border: selectedWeapon.id === w.id ? '1.5px solid #7C1D05' : '1px solid #FED7AA',
                        background: selectedWeapon.id === w.id ? '#7C1D05' : '#FFFFFF',
                        color: selectedWeapon.id === w.id ? '#FFFFFF' : '#431407',
                        cursor: 'pointer'
                      }}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #FED7AA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#7C1D05', fontSize: '1.05rem' }}>{selectedWeapon.name} ({selectedWeapon.type})</div>
                  <p style={{ margin: '4px 0', fontSize: '0.88rem', color: '#78350F' }}>{selectedWeapon.significance}</p>
                  <div style={{ fontSize: '0.78rem', color: '#B45309' }}><strong>धातू/रचना:</strong> {selectedWeapon.metal} • <strong>ऐतिहासिक उदाहरण:</strong> {selectedWeapon.museumExample}</div>
                </div>
                <div style={{ background: '#FEF3C7', padding: '10px 16px', borderRadius: '8px', border: '1px solid #F59E0B', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: 800 }}>सागरी आरमार जनक</div>
                  <div style={{ fontSize: '0.9rem', color: '#7C1D05', fontWeight: 800 }}>छत्रपती शिवाजी महाराज & कान्होजी आंग्रे</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'people' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ५ व ६ • PERSONALITIES & WOMEN IN HISTORY
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#581C87', fontWeight: 800, margin: '4px 0 0' }}>
                👑 महाराष्ट्राच्या वीरांगना व ऐतिहासिक महापुरुष
              </h2>
              <p style={{ color: '#6B21A8', fontSize: '0.95rem', margin: '4px 0 0' }}>
                स्त्रियांचे राज्यकारभार, लष्करी नेतृत्व, समाजसुधारणा, साहित्य व विज्ञान क्षेत्रातील अतुलनीय योगदान.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
              {WOMEN_IN_HISTORY.map((w, idx) => (
                <div key={idx} style={{ background: '#FAF5FF', border: '1.5px solid #E9D5FF', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#581C87' }}>{w.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: '#F3E8FF', color: '#6B21A8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{w.period}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#7E22CE', fontWeight: 700, marginBottom: '8px' }}>{w.role}</div>
                    <p style={{ fontSize: '0.88rem', color: '#3B0764', lineHeight: 1.55, margin: 0 }}>
                      {w.achievement}
                    </p>
                  </div>

                  <div style={{ marginTop: '14px', borderTop: '1px solid #E9D5FF', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {w.domains.map((d, dIdx) => (
                        <span key={dIdx} style={{ background: '#FFFFFF', color: '#6B21A8', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E9D5FF' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {activeTab === 'culture' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#BE123C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ९, १०, १४, १५, १९, २०, २१ • CULTURE, FOOD & DIALECTS
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#881337', fontWeight: 800, margin: '4px 0 0' }}>
                🍲 खाद्यसंस्कृती, बोली, मंदिरे, वस्त्र व लोककला
              </h2>
              <p style={{ color: '#9F1239', fontSize: '0.95rem', margin: '4px 0 0' }}>
                ३६ जिल्ह्यांची खाद्यसंस्कृती, प्रादेशिक बोली, वारली चित्रकला, पैठणी वस्त्रोद्योग व पोवाडा परंपरा.
              </p>
            </div>

            {/* 36 Districts Food Atlas Selector */}
            <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#881337', fontSize: '1.2rem' }}>🍲 महाराष्ट्र खाद्य ॲटलास (Food Atlas)</h3>
                <span style={{ fontSize: '0.82rem', color: '#9F1239' }}>जिल्हा निवडा व चव जाणून घ्या</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                {['पुणे', 'कोल्हापूर', 'नागपूर (विदर्भ)', 'रत्नागिरी-सिंधुदुर्ग', 'नाशिक-खान्देश', 'सोलापूर', 'मराठवाडा'].map((dist, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDistrictFood(dist)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedDistrictFood === dist ? '2px solid #BE123C' : '1px solid #FECDD3',
                      background: selectedDistrictFood === dist ? '#BE123C' : '#FFFFFF',
                      color: selectedDistrictFood === dist ? '#FFFFFF' : '#881337',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dist}
                  </button>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FECDD3' }}>
                <strong style={{ color: '#BE123C' }}>{selectedDistrictFood} चे वैशिष्ट्य:</strong>
                <div style={{ marginTop: '4px', fontSize: '0.9rem', color: '#431407' }}>
                  {selectedDistrictFood === 'पुणे' && 'पुणेरी मिसळ, बाकरवडी, सुजाता मस्तानी, साजूक तुपातील पुरणपोळी व आंबट-गोड वरण.'}
                  {selectedDistrictFood === 'कोल्हापूर' && 'कोल्हापुरी तांबडा व पांढरा रस्सा, झणझणीत मिसळ, भडंग व गूळ-काकवी.'}
                  {selectedDistrictFood === 'नागपूर (विदर्भ)' && 'सावजी मटण व चिकन, पाटवडी रस्सा, पोहे-तर्री, संत्रा बर्फी व ज्वारीची कडक भाकरी.'}
                  {selectedDistrictFood === 'रत्नागिरी-सिंधुदुर्ग' && 'सोलकढी, कोकम कढी, मालवणी मासळी, घावणे, तांदळाची भाकरी, उकडीचे मोदक व फणसपोळी.'}
                  {selectedDistrictFood === 'नाशिक-खान्देश' && 'खान्देशी मांडे (खापरवरची पुरणपोळी), शेवभाजी, वांग्याचे भरीत व कळण्याची भाकरी.'}
                  {selectedDistrictFood === 'सोलापूर' && 'सोलापुरी शेंगदाणा चटणी, ज्वारीची भाकरी, कडक भाकरी व खमंग उसळ.'}
                  {selectedDistrictFood === 'मराठवाडा' && 'मांडे, डाळ बट्टी, ज्वारीची भाकरी, पिठलं व धपाटे.'}
                </div>
              </div>
            </div>

            {/* Dialects & Folk Arts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#5B21B6', fontSize: '1.1rem' }}>🗣️ प्रादेशिक बोली (Dialects)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4C1D95', lineHeight: 1.5 }}>
                  वऱ्हाडी (विदर्भ), मालवणी (कोकण), अहिराणी (खान्देश), डांगी, कोल्हापुरी, पुणेरी व मराठवाडी बोलींचा उच्चार व शब्दसंग्रह.
                </p>
              </div>

              <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#C2410C', fontSize: '1.1rem' }}>🎨 लोककला व वस्त्र वारसा</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7C2D12', lineHeight: 1.5 }}>
                  वारली चित्रकला, पैठणी साडी (येवला व पैठण हातमाग), हिमरू शाली (छत्रपती संभाजीनगर) व नारायण पेठ वस्त्र परंपरा.
                </p>
              </div>

              <div style={{ background: '#F0FDF4', border: '1.5px solid #DCFCE7', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#166534', fontSize: '1.1rem' }}>🛕 मंदिरे व ९ आध्यात्मिक परंपरा</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532D', lineHeight: 1.5 }}>
                  वारकरी (पंढरपूर), नाथ संप्रदाय, दत्त परंपरा (गाणगापूर/नृसिंहवाडी), शाक्त शक्तिपीठे (तुळजापूर, कोल्हापूर, माहूर, वणी) व बौद्ध लेणी.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}

        {/* ========================================================================= */}
        {/* TAB 8: 🪙 NUMISMATICS, INSCRIPTIONS & MODI DOCUMENT READER                 */}
        {/* ========================================================================= */}
        {activeTab === 'numismatics' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य ९, १० व २८ • COINS, EPIGRAPHY & MODI READER
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  🪙 नाणी, शिलालेख, ताम्रपट व मोडी लिपी दस्तऐवज
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  सातवाहन, यादव, शिवकाळ व पेशवे काळातील चलनांची नाणी, दगडी शिलालेख व मूळ ऐतिहासिक मोडी कागदपत्रांचे वाचन.
                </p>
              </div>
              <button
                onClick={() => setShowDocScannerModal(true)}
                style={{ background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📜 मोडी दस्तऐवज वाचक उघडा
              </button>
            </div>

            {/* Coins Grid */}
            <h3 style={{ fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800, marginBottom: '14px' }}>
              🏛️ ऐतिहासिक नाणी संग्रहालय (Coin Museum)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              {COINS_DATA.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCoin(c)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: selectedCoin.id === c.id ? '2px solid #7C1D05' : '1px solid #FED7AA',
                    background: selectedCoin.id === c.id ? '#FFF7ED' : '#FFFFFF',
                    boxShadow: selectedCoin.id === c.id ? '0 4px 12px rgba(124,29,5,0.1)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#C2410C', fontWeight: 700 }}>{c.era}</div>
                  <h4 style={{ fontSize: '1.05rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0' }}>{c.name}</h4>
                  <div style={{ fontSize: '0.82rem', color: '#78350F' }}>धातू: {c.metal} • लिपी: {c.script}</div>
                  <p style={{ fontSize: '0.8rem', color: '#57534E', margin: '8px 0 0' }}>{c.significance}</p>
                </div>
              ))}
            </div>

            {/* Inscriptions Section */}
            <h3 style={{ fontSize: '1.2rem', color: '#7C1D05', fontWeight: 800, marginBottom: '14px' }}>
              🪨 प्रमुख ऐतिहासिक शिलालेख व ताम्रपट (Inscriptions & Copper Plates)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {INSCRIPTIONS_DATA.map(ins => (
                <div key={ins.id} style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.05rem', fontWeight: 800 }}>{ins.name}</h4>
                    <span style={{ fontSize: '0.74rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{ins.period}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#C2410C', fontWeight: 700, margin: '4px 0' }}>स्थान: {ins.location} • लिपी: {ins.script}</div>
                  <p style={{ fontSize: '0.84rem', color: '#431407', margin: '6px 0 0' }}>{ins.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ========================================================================= */}
        {/* TAB 9: ⛰️ SAHYADRI ECOLOGY, RIVERS & SACRED GROVES (DEVRAI)                */}
        {/* ========================================================================= */}
        {activeTab === 'nature' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य २९, ३० व ३१ • SAHYADRI, RIVERS & SACRED GROVES
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  ⛰️ सह्याद्री पर्यावरण, ५ जीवनदायिनी नद्या व देवराई परंपरा
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  सह्याद्रीने महाराष्ट्राला केवळ किल्ले दिले नाहीत, तर समृद्ध जलव्यवस्था, औषधी वनस्पती व शेकडो वर्षांची देवराईची जैवविविधता दिली.
                </p>
              </div>
            </div>

            {/* Rivers List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {RIVERS_DATA.map(r => (
                <div key={r.id} style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#166534', fontSize: '1.2rem', fontWeight: 800 }}>🌊 {r.name}</h4>
                    <span style={{ fontSize: '0.76rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>उगम: {r.origin}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#14532D', margin: '8px 0 4px' }}><strong>पवित्र घाट व शहरे:</strong> {r.sacredGhats.join(' • ')}</div>
                  <div style={{ fontSize: '0.84rem', color: '#14532D', margin: '0 0 8px' }}><strong>प्रमुख मंदिरे:</strong> {r.temples.join(' • ')}</div>
                  <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>{r.significance}</p>
                </div>
              ))}
            </div>

            {/* Sacred Groves Banner */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 6px', color: '#92400E', fontSize: '1.1rem', fontWeight: 800 }}>🌿 देवराई (Sacred Groves) — महाराष्ट्राचा नैसर्गिक वारसा</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F', lineHeight: 1.6 }}>
                महाराष्ट्रात ३००० हून अधिक देवराया आहेत, जिथे ग्रामस्थांनी देवाच्या नावाने हजारो वर्षे वृक्षतोड थांबवून अतिदुर्मिळ वनस्पती व पाण्याचे नैसर्गिक झरे सुरक्षित ठेवले आहेत.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'spirituality' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#B45309', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ३१, ३२, ३३ • PILGRIMAGE, WARI & CALENDAR ENGINE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 6px' }}>
                🥁 पंढरीची वारी, तीर्थक्षेत्रे व सण-उत्सव दिनदर्शिका
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🚶 वारी महामार्ग (Wari Route)</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  संत ज्ञानेश्वर माऊली पालखी (आळंदी → पुणे → सासवड → जेजुरी → पंढरपूर) आणि संत तुकाराम महाराज पालखी (देहू → आकुर्डी → पुणे → इंदापूर → पंढरपूर).
                </p>
                <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 700 }}>३५० किमी चालणारी जगातील सर्वात मोठी सामाजिक समतेची पदयात्रा!</div>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🪔 सण दिनदर्शिका इंजिन (Calendar)</h4>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  महाराष्ट्र → जिल्हा → तालुका → गाव; गुढीपाडवा, शिवराज्याभिषेक दिन (६ जून), आषाढी एकादशी, नारळी पौर्णिमा, गणेशोत्सव व शिवजयंती.
                </p>
                <Link to="/culture/shivkal-festivals" style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
                  शिवकालीन १३ सण दालन उघडा →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 8: 👨‍👩‍👧 HOW PEOPLE LIVED & DAILY LIFE SIMULATION (FEATURES 34–39)     */}
        {/* ========================================================================= */}
        {activeTab === 'daily_life' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#BE123C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ३४, ३५, ३६, ३७, ३८, ३९ • HOW PEOPLE LIVED & A DAY IN HISTORY
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#881337', fontWeight: 800, margin: '4px 0 6px' }}>
                👨‍👩‍👧 १७ व्या शतकातील जनजीवन व महाराष्ट्राचे ऐतिहासिक पहिले क्षण
              </h2>
            </div>

            {/* Feature 35: One Day in History Timeline */}
            <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: '14px', padding: '20px', marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', color: '#881337', fontSize: '1.15rem' }}>
                🕰️ १७ व्या शतकातील खेड्यातील एक दिवस (A Day in a 17th Century Village)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌅 सकाळ (Morning):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>विहिरीचे पाणी → बैलांची दावण → शेतात नांगरणी → गावचा बाजार.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>☀️ दुपार (Afternoon):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>भाकरी-ठेचा भोजन → बलुतेदारांचे काम → चावडीवर न्यायनिवाडे व महसूल.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌇 संध्याकाळ (Evening):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>गुरांचे परतीचे खूर → मारुती मंदिरात कीर्तन/भजन → दिवाबत्ती.</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <strong style={{ color: '#BE123C' }}>🌙 रात्र (Night):</strong>
                  <div style={{ marginTop: '2px', color: '#431407' }}>रामोशी-मांग पहारेकऱ्यांची गस्त → कुटुंब गोष्टी → कोट संरक्षण.</div>
                </div>
              </div>
            </div>

            {/* Feature 39: Firsts of Maharashtra */}
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#7C1D05', fontSize: '1.15rem' }}>📖 महाराष्ट्राचे ऐतिहासिक 'पहिले' (Firsts of Maharashtra)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  🚂 <strong>पहिली रेल्वे (१८५३):</strong> बोरीबंदर ते ठाणे (३४ किमी)
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  👩‍🏫 <strong>पहिली मुलींची शाळा (१८४८):</strong> सावित्रीबाई व जोतीराव फुले, भिडे वाडा पुणे
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  🩺 <strong>पहिल्या महिला डॉक्टर (१८८६):</strong> डॉ. आनंदीबाई जोशी (M.D. USA)
                </div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                  📰 <strong>पहिले मराठी वृत्तपत्र (१८३२):</strong> बाळशास्त्री जांभेकर यांचे 'दर्पण'
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 9: 🚂 INDUSTRIAL & RAILWAY HERITAGE (FEATURES 40–46)                 */}
        {/* ========================================================================= */}
        {activeTab === 'industry' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '26px', marginBottom: '32px' }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#0F766E', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ४०, ४१, ४२, ४३, ४४, ४५, ४६ • INDUSTRIAL, RAILWAY & ARCHIVE HERITAGE
              </span>
              <h2 style={{ fontSize: '1.7rem', color: '#115E59', fontWeight: 800, margin: '4px 0 6px' }}>
                🚂 महाराष्ट्राचा औद्योगिक, रेल्वे व वृत्तपत्रीय वारसा
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#F0FDFA', border: '1.5px solid #CCFBF1', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#0F766E', fontSize: '1.15rem' }}>🚆 रेल्वे वारसा (Railway Heritage)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#134E4A', lineHeight: 1.5 }}>
                  १६ एप्रिल १८५३: बोरीबंदर ते ठाणे पहिली आगगाडी; भोर घाटातील रिव्हर्सिंग स्टेशन व जागतिक स्थापत्य वारसा असणारे CST मुख्यालय.
                </p>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem' }}>🏭 गिरणी व साखर सहकार इतिहास</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#431407', lineHeight: 1.5 }}>
                  मुंबईच्या गिरणगावातील कापड गिरण्या (१८५४) ते प्रवरानगरमधील आशियातील पहिला सहकारी साखर कारखाना (विठ्ठलराव विखे पाटील).
                </p>
              </div>

              <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#C2410C', fontSize: '1.15rem' }}>📰 वृत्तपत्र अभिलेखागार (Newspaper Archive)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7C2D12', lineHeight: 1.5 }}>
                  दर्पण (१८३२), ज्ञानप्रकाश (१८४९), केसरी व मराठा (लोकमान्य टिळक १८८१), मूकनायक व बहिष्कृत भारत (डॉ. बाबासाहेब आंबेडकर १९२०).
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WORLD 10: 🧑‍🔬 RESEARCH, EXPERTS & DIGITAL BOOK (FEATURES 47–53)            */}
        {/* ========================================================================= */}

        {/* ========================================================================= */}
        {/* TAB 13: ⚖️ HISTORIOGRAPHY, PRIMARY SOURCES & HISTORICAL MYSTERIES         */}
        {/* ========================================================================= */}
        {activeTab === 'historiography' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य ५१, ५२ व ५३ • HISTORIOGRAPHY & UNRESOLVED MYSTERIES
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  ⚖️ इतिहास संशोधन, प्राथमिक पुरावे व ऐतिहासिक गूढ
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  बखर, समकालीन शकावली, परकीय प्रवाशांच्या नोंदी व इतिहासातील अभ्यासकीय मतप्रवाह.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowMysteryModal(true)}
                  style={{ background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer' }}
                >
                  🔍 ऐतिहासिक गूढ उकल (Mystery Engine)
                </button>
                <button
                  onClick={() => setShowAskHistorianModal(true)}
                  style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer' }}
                >
                  🎓 इतिहासकारांशी संवाद
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.05rem', fontWeight: 800 }}>📜 बखरी व शकावली</h4>
                <p style={{ fontSize: '0.86rem', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  सभासद बखर, ९१ कलमी बखर, चिटणीस बखर व जेधे शकावली या मराठ्यांच्या इतिहासातील समकालीन व उत्तरकालीन प्रमुख नोंदी आहेत.
                </p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.05rem', fontWeight: 800 }}>🌍 परकीय समकालीन दस्तऐवज</h4>
                <p style={{ fontSize: '0.86rem', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  डच, इंग्रज व पोर्तुगीज फॅक्टरी रेकॉर्ड्स, निकोलाओ मनुची, फ्रान्स्वा बर्नियर व हेन्री ऑक्झिंडेन यांच्या समकालीन डायऱ्या.
                </p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.05rem', fontWeight: 800 }}>⚔️ इतिहासातील अभ्यासकीय वाद</h4>
                <p style={{ fontSize: '0.86rem', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  राज्याभिषेक पद्धती, आरमाराची ताकद व अष्टप्रधान मंडळाचे अधिकार यावर वि. का. राजवाडे, जदुनाथ सरकार व रियासतकार सरदेसाई यांचे विचार.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'community' && (
          <section style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '18px',
            padding: '28px',
            marginBottom: '36px'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <span style={{ color: '#4338CA', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                वैशिष्ट्य ७, ८, ३८, ४० • COMMUNITY & HERITAGE TOOLS
              </span>
              <h2 style={{ fontSize: '1.8rem', color: '#312E81', fontWeight: 800, margin: '4px 0 0' }}>
                👥 गाव ज्ञानकोश, कुटुंब व वारसा साधने
              </h2>
              <p style={{ color: '#3730A3', fontSize: '0.95rem', margin: '4px 0 0' }}>
                आपले गाव शोधा किंवा जोडा, कुटुंबवृक्ष सुरक्षित ठेवा आणि वारसा संवर्धन आणीबाणीत सहभाग नोंदवा.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '2rem' }}>🏡</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.2rem', color: '#7C1D05' }}>गाव ज्ञानकोश ("माझे गाव")</h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#6B7280', lineHeight: 1.5 }}>
                    महाराष्ट्रातील ४३,०००+ गावांचे स्वतंत्र पान: जुने नाव, ग्रामदैवत, जत्रा, पारंपरिक व्यवसाय व इतिहास.
                  </p>
                </div>
                <button
                  onClick={() => setShowVillageModal(true)}
                  style={{ marginTop: '14px', background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  माझे गाव शोधा / जोडा ✍️
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '2rem' }}>👨‍👩‍👧</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.2rem', color: '#7C1D05' }}>माझा कौटुंबिक इतिहास</h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#6B7280', lineHeight: 1.5 }}>
                    आजोबा → आई-वडील → तुम्ही; मूळ गाव, जुने व्यवसाय, जुनी छायाचित्रे व कुटुंबवृक्ष (खाजगी व सुरक्षित).
                  </p>
                </div>
                <button
                  onClick={() => setShowFamilyTreeModal(true)}
                  style={{ marginTop: '14px', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  कुटुंबवृक्ष सुरू करा 🌳
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '2rem' }}>🪪</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.2rem', color: '#166534' }}>डिजिटल वारसा पासपोर्ट</h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#6B7280', lineHeight: 1.5 }}>
                    किल्ले, मंदिरे, संग्रहालये व गावांना भेटी देऊन चेक-इन करा आणि डिजिटल मानांकन बॅजेस मिळवा.
                  </p>
                </div>
                <button
                  onClick={() => setShowPassportModal(true)}
                  style={{ marginTop: '14px', background: '#15803D', color: '#FFFFFF', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  पासपोर्ट उघडा ({passportStats.points} गुण)
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1.5px solid #FCA5A5', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '2rem' }}>🚨</span>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.2rem', color: '#991B1B' }}>वारसा संवर्धन आणीबाणी</h3>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#6B7280', lineHeight: 1.5 }}>
                    पडझड होणाऱ्या ऐतिहासिक वास्तू, नष्ट होण्याच्या मार्गावर असणारी दुर्मीळ हस्तलिखिते नोंदवा.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  style={{ marginTop: '14px', background: '#B91C1C', color: '#FFFFFF', border: 'none', padding: '9px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  आणीबाणी अलर्ट पाठवा 📢
                </button>
              </div>
            </div>
            {/* Extra Tools: Open Heritage API & Audio Tour */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAPIModal(true)}
                style={{ background: '#431407', color: '#FDE68A', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                🌐 ओपन हेरिटेज डेटा API (Open API)
              </button>
              <button
                onClick={() => setShowAudioTourModal(true)}
                style={{ background: '#DCFCE7', color: '#166534', border: '1.5px solid #86EFAC', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                🎧 GPS वॉकिंग ऑडिओ टूर (Audio Tour)
              </button>
            </div>
          </section>
        )}


        {/* ========================================================================= */}
        {/* TAB 15: 🧬 70 CIVILIZATION PILLARS & FULL OPERATING SYSTEM DIRECTORY       */}
        {/* ========================================================================= */}
        {activeTab === 'civilization-70' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  वैशिष्ट्य ७० • DIGITAL MAHARASHTRA CIVILIZATION OPERATING SYSTEM
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  🧬 ७० सभ्यता वैशिष्ट्ये — संपूर्ण मार्गदर्शिका
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  अखंड संबंध साखळी: महाराष्ट्र → प्रदेश → जिल्हा → तालुका → गाव/शहर → स्थळ → व्यक्ती → घटना → परंपरा → सण → खाद्य → भाषा → कला → साहित्य → समाज → आधुनिक जीवन → पुरावे.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {CIVILIZATION_WORLDS.map(w => (
                <div
                  key={w.id}
                  style={{
                    background: '#FFFDF9',
                    border: '1.5px solid #FED7AA',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{w.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>{w.name}</h4>
                      <span style={{ fontSize: '0.74rem', color: '#C2410C', fontWeight: 700 }}>{w.tagline}</span>
                    </div>
                  </div>
                  <ul style={{ margin: '10px 0 0', paddingLeft: '18px', fontSize: '0.84rem', color: '#78350F', lineHeight: 1.6 }}>
                    {w.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ========================================================================= */}
        {/* TAB 16: 🌟 ORIGINAL 12 WORLDS (49 FOUNDATIONAL FEATURES)                  */}
        {/* ========================================================================= */}
        {activeTab === 'universe-49' && (
          <section style={{ background: '#FFFFFF', border: '2px solid #FED7AA', borderRadius: '18px', padding: '28px', marginBottom: '40px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '1px' }}>
                  मूळ रचना • 49 FOUNDATIONAL UNIVERSE FEATURES
                </span>
                <h2 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: '4px 0 0' }}>
                  🌟 १२ ज्ञानविश्वे (४९ मूळ वैशिष्ट्ये)
                </h2>
                <p style={{ color: '#78350F', fontSize: '0.95rem', margin: '4px 0 0' }}>
                  Connect Maratha चे मूळ १२ ज्ञानविभाग व सर्व ४९ तांत्रिक वैशिष्ट्ये.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {UNIVERSE_WORLDS.map(w => (
                <div
                  key={w.id}
                  style={{
                    background: '#FFFDF9',
                    border: '1.5px solid #FED7AA',
                    borderRadius: '14px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{w.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, color: '#7C1D05', fontSize: '1.1rem', fontWeight: 800 }}>{w.name}</h4>
                      <span style={{ fontSize: '0.74rem', color: '#C2410C', fontWeight: 700 }}>{w.subtitle}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#78350F', margin: '0 0 10px', lineHeight: 1.4 }}>{w.desc}</p>
                  <div style={{ background: '#FFF7ED', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#9A3412', fontWeight: 700 }}>
                    समाविष्ट वैशिष्ट्ये: {w.featuresCount}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
      {showAIModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAIModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.4rem' }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.4rem' }}>AI हेरिटेज असिस्टंट (सत्यनिष्ठ उत्तर)</h3>
                <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700 }}>केवळ सत्यापित Connect Maratha दस्तऐवजांवर आधारित</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="उदा. रायगडबद्दल सांगा किंवा प्रतापगड युद्ध..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.9rem', outline: 'none' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
              />
              <button
                onClick={handleAIQuery}
                style={{ background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                विचारा
              </button>
            </div>

            {aiResponse && (
              <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#7C1D05' }}>{aiResponse.title}</strong>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{aiResponse.status}</span>
                </div>
                <p style={{ margin: '0 0 8px', lineHeight: 1.5, color: '#431407' }}>{aiResponse.history}</p>
                <div style={{ fontSize: '0.84rem', color: '#0369A1', marginBottom: '4px' }}><strong>जलव्यवस्था:</strong> {aiResponse.water}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}><strong>संदर्भ:</strong> {aiResponse.sources}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL HERITAGE PASSPORT (FEATURE 38) */}
      {showPassportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowPassportModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>🪪</span>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>अधिकृत सदस्य वारसा पासपोर्ट</span>
                <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>महाराष्ट्र वारसा पासपोर्ट (Heritage Passport)</h3>
              </div>
            </div>

            <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: '#78350F' }}>सदस्य दर्जा: <strong>{passportStats.level}</strong></span>
                <span style={{ fontSize: '1.1rem', color: '#C2410C', fontWeight: 800 }}>{passportStats.points} गुण (XP)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7C1D05' }}>{passportStats.fortsVisited}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>किल्ले भेट</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#D97706' }}>{passportStats.templesVisited}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>मंदिरे दर्शन</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803D' }}>{passportStats.quizzesCompleted}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>क्विझ पूर्ण</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7C1D05', textTransform: 'uppercase' }}>प्राप्त झालेले डिजिटल सन्मान बॅजेस:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {passportStats.badges.map((b, idx) => (
                  <span key={idx} style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                    🏅 {b}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setPassportStats(prev => ({ ...prev, points: prev.points + 50, fortsVisited: prev.fortsVisited + 1 }));
                alert('अभिनंदन! वारसा स्थळ चेक-इन यशस्वी! +५० गुण जोडले गेले.');
              }}
              style={{ width: '100%', background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              📍 सध्याच्या वारसा स्थळावर चेक-इन करा (+५० गुण)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: HERITAGE EMERGENCY (FEATURE 40) */}
      {showEmergencyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FCA5A5', position: 'relative' }}>
            <button onClick={() => setShowEmergencyModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>🚨</span>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#991B1B', fontWeight: 800, margin: 0 }}>वारसा संवर्धन आणीबाणी (Heritage Alert)</h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>धोक्यात आलेली मंदिरे, वाडे किंवा लोप पावणारी कला नोंदवा</span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
              आपल्या परिसरातील एखाद्या ऐतिहासिक वास्तूची पडझड होत असल्यास, दुर्मीळ दस्तऐवज नष्ट होण्याचा धोका असल्यास येथे सप्रमाण नोंद करा.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <input type="text" placeholder="वारसा स्थळाचे किंवा वास्तूचे नाव..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }} />
              <input type="text" placeholder="जिल्हा, तालुका व अचूक ठिकाण..." style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }} />
              <textarea placeholder="समस्येचे सविस्तर वर्णन..." rows={3} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', resize: 'none' }} />
            </div>
            <button
              onClick={() => {
                alert('धन्यवाद! नोंद यशस्वीरीत्या पडताळणीसाठी पाठवण्यात आली आहे.');
                setShowEmergencyModal(false);
              }}
              style={{ width: '100%', background: '#B91C1C', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              आणीबाणी अलर्ट पाठवा 📢
            </button>
          </div>
        </div>
      )}

      {/* MODAL: FAMILY HERITAGE (FEATURE 7) */}
      {showFamilyTreeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowFamilyTreeModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>👨‍👩‍👧</span>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>खाजगी व सुरक्षित (Private by Default)</span>
                <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: '2px 0 0' }}>माझा कौटुंबिक इतिहास व वंशावळ (Family Heritage)</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
              आपले मूळ गाव, आजोबा-पणजोबांची नावे, जुने व्यवसाय, जुनी छायाचित्रे आणि कौटुंबिक कथा येथे सुरक्षितपणे जतन करा.
            </p>
            <div style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                  👴 <strong>आजोबा / आजी:</strong> मूळ गाव, वास्तव्य व जुनी स्मृती
                </div>
                <div style={{ textAlign: 'center', color: '#F59E0B' }}>↓</div>
                <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                  👨 <strong>आई - वडील:</strong> शिक्षण, व्यवसाय व स्थलांतर कथा
                </div>
                <div style={{ textAlign: 'center', color: '#F59E0B' }}>↓</div>
                <div style={{ background: '#FFF7ED', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C2410C', fontSize: '0.85rem', fontWeight: 700 }}>
                  👤 <strong>तुम्ही व भावंडे:</strong> वर्तमान योगदान व डिजिटल प्रोफाइल
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                alert('कौटुंबिक माहिती ड्राफ्ट स्वरूपात सेव्ह झाली!');
                setShowFamilyTreeModal(false);
              }}
              style={{ width: '100%', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              माझा कुटुंब इतिहास जतन करा 💾
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VILLAGE ENCYCLOPEDIA (FEATURE 8) */}
      {showVillageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowVillageModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>🏡</span>
              <div>
                <h3 style={{ fontSize: '1.45rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>गाव ज्ञानकोश — "माझे गाव" (Village Encyclopedia)</h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>महाराष्ट्रातील ४३,०००+ गावांचे वारसा दालन</span>
              </div>
            </div>

            <input
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="गावाचे नाव किंवा तालुका शोधा (उदा. पाचाड, आंगणेवाडी, नेवासे, जेजुरी)..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #FED7AA', fontSize: '0.95rem', outline: 'none', marginBottom: '16px' }}
            />

            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>पाचाड (ता. महाड, जि. रायगड)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>रायगड पायथ्याचे गाव, राजमाता जिजाऊ समाधी स्मारक व कोट.</p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>आंगणेवाडी (ता. मालवण, जि. सिंधुदुर्ग)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>श्री भराडीदेवी प्रसिद्ध वार्षिक जत्रा, लाखो भाविकांचे श्रद्धास्थान.</p>
              </div>
              <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px 14px' }}>
                <strong style={{ color: '#7C1D05' }}>नेवासे (जि. अहिल्यानगर/अहमदनगर)</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6B7280' }}>संत ज्ञानेश्वर महाराजांनी पैस खांबाला टेकून ज्ञानेश्वरी सांगितली ती पवित्र भूमी.</p>
              </div>
            </div>

            <button
              onClick={() => {
                alert('गावाची माहिती सबमिशन फॉर्म लवकरच उघडत आहे!');
                setShowVillageModal(false);
              }}
              style={{ width: '100%', background: '#C2410C', color: '#FFFFFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              माझ्या गावाची माहिती / जुने फोटो जोडा ✍️
            </button>
          </div>
        </div>
      )}

      {showFortSimModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '680px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowFortSimModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.4rem' }}>🧱</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.45rem' }}>किल्ला निर्माण व वेढा सिम्युलेटर (Fort Simulator)</h3>
                <span style={{ fontSize: '0.8rem', color: '#C2410C', fontWeight: 700 }}>१७ व्या शतकातील सह्याद्री स्थापत्य शास्त्र</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>१. भौगोलिक स्थान निवडा:</label>
                <select value={fortSimState.mountain} onChange={(e) => setFortSimState(prev => ({ ...prev, mountain: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>सह्याद्री सुळका (दुर्गम कातळ - उदा. राजगड)</option>
                  <option>सागरी बेट (समुद्रातील खडक - उदा. सिंधुदुर्ग)</option>
                  <option>पठारी डोंगर (विस्तीर्ण सपाटी - उदा. रायगड)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>२. जलव्यवस्थापन रचना (Water Engineering):</label>
                <select value={fortSimState.water} onChange={(e) => setFortSimState(prev => ({ ...prev, water: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>पाषाणातील नैसर्गिक टाक्या (बारामाही जलसाठा)</option>
                  <option>पावसाचे पाणी साठवण तलाव (गंगासागर पद्धत)</option>
                  <option>खडक गाळण विहिरी (सागरी गोडे पाणी)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#431407' }}>३. तटबंदी व दरवाजा रचना:</label>
                <select value={fortSimState.bastion} onChange={(e) => setFortSimState(prev => ({ ...prev, bastion: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', marginTop: '4px' }}>
                  <option>दुहेरी बुरुज व गोमुखी दरवाजा (बाहेरून न दिसणारा)</option>
                  <option>सरळ प्रवेशद्वार (तोफांच्या माऱ्यास उघडे)</option>
                  <option>चोरदिंडी व भुयारी मार्ग</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#FFFDF9', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#7C1D05' }}>वेढा टिकाव क्षमता (Siege Survival):</strong>
                <span style={{ color: '#15803D', fontWeight: 900 }}>{fortSimState.siegeDays} दिवस</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350F', lineHeight: 1.5 }}>
                {fortSimState.feedback}
              </p>
            </div>

            <button onClick={() => alert('किल्ल्याची संरक्षण चाचणी यशस्वी! +१०० गुण जोडले गेले.')} style={{ width: '100%', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              चाचणी पूर्ण करा व गुण मिळवा 🛡️
            </button>
          </div>
        </div>
      )}

      {/* MODAL: OLD MARATHI / MODI DOCUMENT READER (FEATURE 7 & 8) */}
      {showDocScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '720px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowDocScannerModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.4rem' }}>📜</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.45rem' }}>जुनी मोडी व ऐतिहासिक मराठी कागदपत्र वाचक</h3>
                <span style={{ fontSize: '0.8rem', color: '#92400E' }}>स्कॅन → देवनागरी लिप्यंतरण → आधुनिक अर्थ</span>
              </div>
            </div>

            <div style={{ background: '#FFFDF9', border: '1px dashed #C2410C', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>📤 जुने पत्र, सनद किंवा मोडी कागदपत्र अपलोड करा</div>
              <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>JPG, PNG किंवा PDF (अस्पष्ट मजकूर असल्यास तज्ज्ञ तपासणीसाठी चिन्हांकित केला जाईल)</span>
            </div>

            {/* Side-by-side Sample */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <strong style={{ color: '#92400E' }}>१. शिवकालीन अस्सल मजकूर (आज्ञापत्र):</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic', color: '#78350F' }}>
                  "किल्ले हेच राज्याचे मुख्य सार. गडकोट नसता देश उघडा पडे..."
                </p>
              </div>

              <div style={{ background: '#DCFCE7', padding: '12px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <strong style={{ color: '#166534' }}>२. आधुनिक मराठी सोपा अर्थ:</strong>
                <p style={{ margin: '4px 0 0', color: '#14532D' }}>
                  "स्वराज्याचे अस्तित्व आणि रयतेचे संरक्षण हे गडकोटांवरच अवलंबून आहे. किल्ले नसतील तर संपूर्ण देश शत्रूसाठी उघडा पडेल."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTORICAL MYSTERY (FEATURE 21 & 22) */}
      {showMysteryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowMysteryModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.4rem' }}>🧠</span>
              <div>
                <h3 style={{ margin: 0, color: '#6D28D9', fontSize: '1.4rem' }}>ऐतिहासिक गूढ शोधक (Historical Mystery)</h3>
                <span style={{ fontSize: '0.8rem', color: '#5B21B6' }}>पुरावे जोडून सत्य शोधा</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#431407', lineHeight: 1.5, marginBottom: '14px' }}>
              <strong>कोडे:</strong> "वेरूळचे कैलास मंदिर वरून खाली एका अखंड कातळात कोणी कोरले?"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <button onClick={() => setMysteryAnswer('राष्ट्रकूट कृष्ण प्रथम (इ.स. ७५६-७७३) — बडोदा ताम्रपटातील पुराव्यानुसार!')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontWeight: 700 }}>
                A) राष्ट्रकूट कृष्ण प्रथम (इ.स. ७५६–७७३)
              </button>
              <button onClick={() => setMysteryAnswer('चुकीचा पर्याय! यादव सिंघणदेव यांनी हेमाडपंथी मंदिरे उभारली.')} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontWeight: 700 }}>
                B) यादव सिंघणदेव
              </button>
            </div>

            {mysteryAnswer && (
              <div style={{ background: '#DCFCE7', color: '#166534', padding: '12px', borderRadius: '8px', border: '1px solid #86EFAC', fontSize: '0.88rem', fontWeight: 700 }}>
                {mysteryAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: OPEN HERITAGE API (FEATURE 54 & 55) */}
      {showAPIModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAPIModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#1F2937', fontSize: '1.4rem' }}>🧑‍💻 ओपन हेरिटेज API व डेटा मानके</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '14px' }}>
              Connect Maratha व्यासपीठ संशोधक, ॲप डेव्हलपर्स आणि शाळांसाठी मुक्त हेरिटेज डेटाबेस उपलब्ध करून देत आहे.
            </p>
            <div style={{ background: '#F3F4F6', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              Endpoints: /api/v1/forts, /api/v1/temples, /api/v1/saints, /api/v1/timeline
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDIO TOUR (FEATURE 60) */}
      {showAudioTourModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAudioTourModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.2rem' }}>🎧</span>
              <h3 style={{ margin: 0, color: '#0C4A6E', fontSize: '1.4rem' }}>किल्ले रायगड: ५ मिनिटांची ऐतिहासिक ऑडिओ सफर</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#431407', lineHeight: 1.6, marginBottom: '14px' }}>
              "तुम्ही सध्या किल्ले रायगडाच्या महादरवाज्यासमोर उभे आहात. हा दरवाजा दोन अजस्र बुरुजांच्या मागे असा वळणावर लपवलेला आहे की तोफेचा गोळा थेट दरवाजावर आदळू शकत नाही..."
            </p>
            <button onClick={() => alert('ऑडिओ प्लेअर सुरू झाला!')} style={{ width: '100%', background: '#0284C7', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              ▶️ ऑडिओ सुरू करा (Play Audio Guide)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: HERITAGE HOME (FEATURE 6) */}
      {showHeritageHomeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowHeritageHomeModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#7C1D05', fontSize: '1.4rem' }}>🏠 माझे हेरिटेज होम नोंदणी</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input type="text" placeholder="घराचे नाव / वाडा नाव..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <input type="text" placeholder="मूळ गाव, तालुका व जिल्हा..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <input type="text" placeholder="अंदाजे बांधकाम वर्ष (उदा. १९१०)..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              <textarea placeholder="घरातील वैशिष्ट्ये (ओसरी, लाकडी खांब, जुनी विहीर, कौटुंबिक आठवणी)..." rows={3} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'none' }} />
            </div>
            <button onClick={() => { alert('हेरिटेज होम नोंदवले गेले!'); setShowHeritageHomeModal(false); }} style={{ width: '100%', background: '#15803D', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              जतन करा 💾
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ASK A HISTORIAN (FEATURE 47) */}
      {/* MODAL: ASK A HISTORIAN (FEATURE 47) */}
      {showAskHistorianModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setShowAskHistorianModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <h3 style={{ margin: '0 0 10px', color: '#9F1239', fontSize: '1.4rem' }}>🧑‍🔬 इतिहासकारांना विचारा</h3>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '0 0 12px' }}>आपला प्रश्न तज्ज्ञ मंडळाकडे पाठवला जाईल व संदर्भानुसार उत्तर दिले जाईल.</p>
            <textarea placeholder="ऐतिहासिक प्रश्न, शिलालेख शंका किंवा संदर्भ विचारणा येथे लिहा..." rows={4} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '14px', resize: 'none' }} />
            <button onClick={() => { alert('प्रश्न सबमिट झाला!'); setShowAskHistorianModal(false); }} style={{ width: '100%', background: '#9F1239', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              प्रश्न पाठवा 📩
            </button>
          </div>
        </div>
      )}
    </div>
  );
}