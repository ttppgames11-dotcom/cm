import '../models/user_role.dart';

/// Authentic reference datasets for the registration form (Bilingual: Marathi & English).
class RegistrationOptionsData {
  RegistrationOptionsData._();

  /// 1. States in India
  static const List<String> states = [
    'महाराष्ट्र / Maharashtra',
    'गोवा / Goa',
    'कर्नाटक / Karnataka',
    'गुजरात / Gujarat',
    'मध्य प्रदेश / Madhya Pradesh',
    'छत्तीसगढ / Chhattisgarh',
    'तेलंगणा / Telangana',
    'आंध्र प्रदेश / Andhra Pradesh',
    'तामिळनाडू / Tamil Nadu',
    'दिल्ली / Delhi',
    'राजस्थान / Rajasthan',
    'इतर राज्य / Other State',
  ];

  /// 2. Districts in Maharashtra
  static const List<String> maharashtraDistricts = [
    'पुणे / Pune',
    'सातारा / Satara',
    'कोल्हापूर / Kolhapur',
    'सांगली / Sangli',
    'सोलापूर / Solapur',
    'छत्रपती संभाजीनगर / Chhatrapati Sambhajinagar',
    'अहिल्यानगर (अहमदनगर) / Ahilyanagar',
    'नाशिक / Nashik',
    'रायगड / Raigad',
    'ठाणे / Thane',
    'मुंबई शहर / Mumbai City',
    'मुंबई उपनगर / Mumbai Suburban',
    'पालघर / Palghar',
    'रत्नागिरी / Ratnagiri',
    'सिंधुदुर्ग / Sindhudurg',
    'धाराशिव (उस्मानाबाद) / Dharashiv',
    'लातूर / Latur',
    'बीड / Beed',
    'जालना / Jalna',
    'परभणी / Parbhani',
    'हिंगोली / Hingoli',
    'नांदेड / Nanded',
    'नागपूर / Nagpur',
    'वर्धा / Wardha',
    'भंडारा / Bhandara',
    'गोंदिया / Gondia',
    'चंद्रपूर / Chandrapur',
    'गडचिरोली / Gadchiroli',
    'अमरावती / Amravati',
    'अकोला / Akola',
    'यवतमाळ / Yavatmal',
    'बुलढाणा / Buldhana',
    'वाशिम / Washim',
    'धुळे / Dhule',
    'जळगाव / Jalgaon',
    'नंदुरबार / Nandurbar',
  ];

  /// 3. Talukas by District
  static const Map<String, List<String>> talukasByDistrict = {
    'पुणे / Pune': [
      'हवेली / Haveli',
      'पुणे शहर / Pune City',
      'वेल्हे (राजगड) / Velhe (Rajgad)',
      'भोर / Bhor',
      'मुळशी / Mulshi',
      'मावळ / Maval',
      'जुन्नर (शिवनेरी) / Junnar (Shivneri)',
      'आंबेगाव / Ambegaon',
      'खेड / Khed',
      'शिरूर / Shirur',
      'दौंड / Daund',
      'पुरंदर / Purandar',
      'बारामती / Baramati',
      'इंदापूर / Indapur',
    ],
    'सातारा / Satara': [
      'सातारा / Satara',
      'जावळी / Jaavali',
      'कराड / Karad',
      'कोरेगाव / Koregaon',
      'खटाव / Khatav',
      'माण / Maan',
      'फलटण / Phaltan',
      'खंडाळा / Khandala',
      'वाई / Wai',
      'महाबळेश्वर / Mahabaleshwar',
      'पाटण / Patan',
    ],
    'कोल्हापूर / Kolhapur': [
      'करवीर / Karveer',
      'कागल / Kagal',
      'हातकणंगले / Hatkanangle',
      'शिरोळ / Shirol',
      'पन्हाळा / Panhala',
      'शाहूवाडी / Shahuwadi',
      'राधानगरी / Radhanagari',
      'भुदरगड / Bhudargad',
      'आजरा / Ajara',
      'गडहिंग्लज / Gadhinglaj',
      'चंदगड / Chandgad',
      'गगनबावडा / Gaganbawda',
    ],
    'रायगड / Raigad': [
      'अलिबाग / Alibag',
      'महाड (रायगड) / Mahad (Raigad)',
      'माणगाव / Mangaon',
      'रोहा / Roha',
      'पनवेल / Panvel',
      'कर्जत / Karjat',
      'खालापूर / Khalapur',
      'पेण / Pen',
      'पोलादपूर / Poladpur',
      'श्रीवर्धन / Shrivardhan',
      'म्हसळा / Mhasla',
      'तळा / Tala',
      'सुधागड (पाली) / Sudhagad',
      'उरण / Uran',
      'मुरूड / Murud',
    ],
    'छत्रपती संभाजीनगर / Chhatrapati Sambhajinagar': [
      'छत्रपती संभाजीनगर / Chhatrapati Sambhajinagar',
      'पैठण / Paithan',
      'वैजापूर / Vaijapur',
      'गंगापूर / Gangapur',
      'कन्नड / Kannad',
      'खुलताबाद / Khultabad',
      'सिल्लोड / Sillod',
      'सोयगाव / Soegaon',
      'फुलंब्री / Phulambri',
    ],
    'नाशिक / Nashik': [
      'नाशिक / Nashik',
      'सिन्नर / Sinnar',
      'इगतपुरी / Igatpuri',
      'दिंडोरी / Dindori',
      'निफाड / Niphad',
      'येवला / Yeola',
      'चांदवड / Chandwad',
      'नांदगाव / Nandgaon',
      'मालेगाव / Malegaon',
      'सटाणा (बागलाण) / Satana',
      'कळवण / Kalwan',
      'देवळा / Deola',
      'त्र्यंबकेश्वर / Trimbakeshwar',
      'सुरगाणा / Surgana',
      'पेठ / Peth',
    ],
    'सांगली / Sangli': [
      'मिरज / Miraj',
      'तासगाव / Tasgaon',
      'वाळवा (इस्लामपूर) / Walwa',
      'शिराळा / Shirala',
      'खानापूर (विटा) / Khanapur',
      'आटपाडी / Atpadi',
      'जत / Jat',
      'कडेगाव / Kadegaon',
      'कवठे महांकाळ / Kavathe Mahankal',
      'पलूस / Palus',
    ],
    'सोलापूर / Solapur': [
      'उत्तर सोलापूर / North Solapur',
      'दक्षिण सोलापूर / South Solapur',
      'बार्शी / Barshi',
      'अक्कलकोट / Akkalkot',
      'पंढरपूर / Pandharpur',
      'सांगोला / Sangola',
      'माळशिरस / Malshiras',
      'करमाळा / Karmala',
      'माढा / Madha',
      'मोहोळ / Mohol',
      'मंगळवेढा / Mangalwedha',
    ],
    'ठाणे / Thane': [
      'ठाणे / Thane',
      'कल्याण / Kalyan',
      'मुरबाड / Murbad',
      'भिवंडी / Bhiwandi',
      'शहापूर / Shahapur',
      'उल्हासनगर / Ulhasnagar',
      'अंबरनाथ / Ambarnath',
    ],
  };

  /// Fallback talukas when a district doesn't have a specific list
  static const List<String> defaultTalukas = [
    'मध्यवर्ती तालुका / Central Taluka',
    'उत्तर तालुका / North Taluka',
    'दक्षिण तालुका / South Taluka',
    'पूर्व तालुका / East Taluka',
    'पश्चिम तालुका / West Taluka',
    'इतर / Other',
  ];

  static List<String> getTalukasForDistrict(String district) {
    return talukasByDistrict[district] ?? defaultTalukas;
  }

  /// 4. Roles matching user mockup image exactly
  static const List<Map<String, dynamic>> roles = [
    {'role': UserRole.member, 'label': 'सदस्य (General Member)'},
    {
      'role': UserRole.business,
      'label': 'व्यावसायिक / उद्योजक (Business Owner)',
    },
    {'role': UserRole.provider, 'label': 'सेवा प्रदाता (Service Provider)'},
    {
      'role': UserRole.karyakarta,
      'label': 'कार्यकर्ता / समन्वयक (Coordinator)',
    },
  ];

  /// 6. Education Options (Bilingual)
  static const List<String> educationOptions = [
    'पदवीधर (Graduate / Bachelor\'s Degree)',
    'पदव्युत्तर (Post Graduate / Master\'s Degree)',
    'अभियांत्रिकी व तंत्रज्ञान (Engineering / B.Tech / BE)',
    'वैद्यकीय व आरोग्य (Medical / MBBS / BDS / BAMS / Pharmacy)',
    'व्यवस्थापन व वाणिज्य (MBA / M.Com / B.Com / CA)',
    'कायदा व न्यायशास्त्र (Law / LLB / LLM)',
    'उच्च माध्यमिक (12वी / Higher Secondary - HSC)',
    'माध्यमिक (10वी / Secondary - SSC)',
    'डिप्लोमा व पॉलिटेक्निक (Diploma / Polytechnic)',
    'डॉक्टरेट व संशोधन (Ph.D / Doctorate)',
    'इतर शिक्षण (Other Education)',
  ];

  /// 7. Interest Options (According to Connect मराठा Project)
  static const List<String> interestOptions = [
    'दुर्ग संवर्धन व गडभ्रमण (Fort Conservation & Trekking)',
    'मराठा इतिहास व संशोधन (Maratha History & Research)',
    'व्यापार, व्यवसाय व उद्योग (Business & Entrepreneurship)',
    'सामाजिक कार्य व समाजसेवा (Social Work & Community Welfare)',
    'युवक सक्षमीकरण व क्रीडा (Youth Empowerment & Sports)',
    'कला, संस्कृती व साहित्य (Art, Culture & Literature)',
    'शिक्षण व स्पर्धा परीक्षा मार्गदर्शन (Education & Career Guidance)',
    'शेती व ग्रामीण विकास (Agriculture & Rural Development)',
    'महिला सक्षमीकरण (Women Empowerment)',
  ];
}
