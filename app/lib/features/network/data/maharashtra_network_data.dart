import 'package:flutter/material.dart';

class NetworkDivisionItem {
  final String id;
  final String titleMr;
  final String titleEn;
  final String districts;
  final String description;
  final int branchCount;
  final int memberCount;
  final IconData icon;

  const NetworkDivisionItem({
    required this.id,
    required this.titleMr,
    required this.titleEn,
    required this.districts,
    required this.description,
    required this.branchCount,
    required this.memberCount,
    required this.icon,
  });
}

class NetworkSection {
  final String id;
  final String titleMr;
  final String titleEn;
  final IconData icon;
  final Color accentColor;
  final Color pastelColor;
  final List<NetworkDivisionItem> items;

  const NetworkSection({
    required this.id,
    required this.titleMr,
    required this.titleEn,
    required this.icon,
    required this.accentColor,
    required this.pastelColor,
    required this.items,
  });
}

class MaharashtraNetworkData {
  MaharashtraNetworkData._();

  static const String headlineBadge = '३६ जिल्हे • ३५८ तालुके';
  static const String mainTitle = 'महाराष्ट्र नेटवर्क';
  static const String mainSubtitle =
      'महाराष्ट्राच्या प्रत्येक कानाकोपऱ्यात जोडलेले सशक्त समाज नेटवर्क व संघटनात्मक चौकट.';

  static const Map<String, String> summaryStats = {
    '३६': 'जिल्हे (Districts)',
    '३५८': 'तालुके (Talukas)',
  };

  static const List<NetworkSection> sections = [
    // 1. पश्चिम व कोकण विभाग
    NetworkSection(
      id: 'west_konkan',
      titleMr: 'पश्चिम व कोकण विभाग',
      titleEn: 'West & Konkan',
      icon: Icons.account_balance_rounded,
      accentColor: Color(0xFFE84C10),
      pastelColor: Color(0xFFFFF1E6),
      items: [
        NetworkDivisionItem(
          id: 'pune_div',
          titleMr: 'पुणे विभाग',
          titleEn: 'Pune Division',
          districts: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर',
          description:
              'पश्चिम महाराष्ट्रातील प्रमुख केंद्र. ऐतिहासिक दुर्ग संवर्धन व सामाजिक उपक्रमांचे केंद्रस्थान.',
          branchCount: 680,
          memberCount: 14200,
          icon: Icons.castle_rounded,
        ),
        NetworkDivisionItem(
          id: 'mumbai_div',
          titleMr: 'कोकण विभाग (मुंबई, ठाणे, पालघर)',
          titleEn: 'Mumbai, Thane, Palghar',
          districts: 'मुंबई शहर, मुंबई उपनगर, ठाणे, पालघर',
          description:
              'महानगर क्षेत्रात व्यवसाय नेटवर्किंग, युवा रोजगार मेळावे व कायदेशीर मार्गदर्शन मंच.',
          branchCount: 420,
          memberCount: 11800,
          icon: Icons.location_city_rounded,
        ),
        NetworkDivisionItem(
          id: 'raigad_div',
          titleMr: 'रायगड, रत्नागिरी, सिंधुदुर्ग',
          titleEn: 'South Konkan Coast',
          districts: 'रायगड, रत्नागिरी, सिंधुदुर्ग',
          description:
              'शिवकालीन सागरी दुर्ग व किनारपट्टी सामाजिक विकास. पर्यटन, फलोत्पादन व स्थानिक व्यवसाय सहाय्य.',
          branchCount: 390,
          memberCount: 7500,
          icon: Icons.sailing_rounded,
        ),
        NetworkDivisionItem(
          id: 'state_map_div',
          titleMr: 'संपूर्ण राज्य शाखा नकाशा',
          titleEn: 'Statewide Branch Directory',
          districts: 'महाराष्ट्रातील सर्व ३६ जिल्हे',
          description:
              'डिजिटल व्यासपीठावर जोडलेल्या सर्व शाखा, जिल्हा संपर्क कार्यालये व प्रतिनिधींची डिजिटल यादी.',
          branchCount: 3200,
          memberCount: 52000,
          icon: Icons.map_rounded,
        ),
      ],
    ),

    // 2. मराठवाडा व उत्तर महाराष्ट्र
    NetworkSection(
      id: 'marathwada_north',
      titleMr: 'मराठवाडा व उत्तर महाराष्ट्र',
      titleEn: 'Marathwada & North',
      icon: Icons.terrain_rounded,
      accentColor: Color(0xFFD97706),
      pastelColor: Color(0xFFFEF3C7),
      items: [
        NetworkDivisionItem(
          id: 'sambhajinagar_div',
          titleMr: 'छ. संभाजीनगर, जालना, बीड',
          titleEn: 'Central Marathwada',
          districts: 'छत्रपती संभाजीनगर, जालना, बीड',
          description:
              'मराठवाड्यातील शैक्षणिक क्रांती व उद्योग मंच. शेतकरी साहाय्यता व उच्च शिक्षण मार्गदर्शन.',
          branchCount: 480,
          memberCount: 8900,
          icon: Icons.menu_book_rounded,
        ),
        NetworkDivisionItem(
          id: 'nashik_div',
          titleMr: 'नाशिक, अहमदनगर, जळगाव, धुळे',
          titleEn: 'North Maharashtra',
          districts: 'नाशिक, अहिल्यानगर (अहमदनगर), जळगाव, धुळे, नंदुरबार',
          description:
              'कृषी प्रक्रिया, द्राक्ष-कांदा बागायतदार नेटवर्क व खान्देश विभागीय सहकार्य मंच.',
          branchCount: 520,
          memberCount: 9400,
          icon: Icons.agriculture_rounded,
        ),
        NetworkDivisionItem(
          id: 'dharashiv_div',
          titleMr: 'धाराशिव, लातूर, नांदेड, परभणी',
          titleEn: 'South Marathwada',
          districts: 'धाराशिव, लातूर, नांदेड, परभणी, हिंगोली',
          description:
              'जलसंधारण उपक्रम, स्पर्धा परीक्षा मार्गदर्शन केंद्रे व महिला बचतगट सक्षमीकरण.',
          branchCount: 410,
          memberCount: 7100,
          icon: Icons.water_drop_rounded,
        ),
        NetworkDivisionItem(
          id: 'regional_contacts',
          titleMr: 'विभागीय संपर्क व प्रतिनिधी',
          titleEn: 'Regional Contacts & Reps',
          districts: 'मराठवाडा व उत्तर महाराष्ट्र विभाग',
          description:
              'तालुका स्तरावरील अधिकृत पदाधिकारी, कायदेविषयक सल्लागार व युवा प्रतिनिधींची समन्वय समिती.',
          branchCount: 1410,
          memberCount: 25400,
          icon: Icons.groups_rounded,
        ),
      ],
    ),

    // 3. विदर्भ व सीमावर्ती भाग
    NetworkSection(
      id: 'vidarbha_border',
      titleMr: 'विदर्भ व सीमावर्ती भाग',
      titleEn: 'Vidarbha & Border',
      icon: Icons.spa_rounded,
      accentColor: Color(0xFF16A34A),
      pastelColor: Color(0xFFDCFCE7),
      items: [
        NetworkDivisionItem(
          id: 'amravati_div',
          titleMr: 'अमरावती, अकोला, बुलढाणा, यवतमाळ',
          titleEn: 'West Vidarbha',
          districts: 'अमरावती, अकोला, बुलढाणा, यवतमाळ, वाशीम',
          description:
              'कापूस-सोयाबीन उत्पादक समाज संघटन, कृषी प्रक्रिया उद्योग व समाज कल्याण निधी.',
          branchCount: 380,
          memberCount: 6800,
          icon: Icons.yard_rounded,
        ),
        NetworkDivisionItem(
          id: 'nagpur_div',
          titleMr: 'नागपूर, वर्धा, चंद्रपूर, गडचिरोली',
          titleEn: 'East Vidarbha',
          districts: 'नागपूर, वर्धा, चंद्रपूर, गडचिरोली, भंडारा, गोंदिया',
          description:
              'उद्योग-व्यापार कॉरिडोर, आदिवासी क्षेत्र समाजसेवा व तांत्रिक शिक्षण शिष्यवृत्ती.',
          branchCount: 340,
          memberCount: 5900,
          icon: Icons.factory_rounded,
        ),
        NetworkDivisionItem(
          id: 'belgaum_border_div',
          titleMr: 'बेळगाव, कारवार सीमावर्ती शाखा',
          titleEn: 'Belgaum & Karwar Border',
          districts: 'बेळगाव, कारवार, निपाणी, बिदर सीमाभाग',
          description:
              'मराठी भाषा, सांस्कृतिक वारसा जतन व सीमावर्ती मराठी बांधवांसाठी विशेष शैक्षणिक साह्य.',
          branchCount: 180,
          memberCount: 4200,
          icon: Icons.flag_rounded,
        ),
        NetworkDivisionItem(
          id: 'local_business_div',
          titleMr: 'स्थानिक व्यापारी व उद्योजक',
          titleEn: 'Local Traders & Entrepreneurs',
          districts: 'विदर्भ व सीमावर्ती व्यापारी पेठा',
          description:
              'व्यापारी संगम, स्थानिक कृषी बाजारपेठ लिंकेज व व्यावसायिक पतपुरवठा साहाय्यता.',
          branchCount: 900,
          memberCount: 16900,
          icon: Icons.storefront_rounded,
        ),
      ],
    ),

    // 4. संघटनात्मक चौकट
    NetworkSection(
      id: 'organization_structure',
      titleMr: 'संघटनात्मक चौकट',
      titleEn: 'Structure & Governance',
      icon: Icons.corporate_fare_rounded,
      accentColor: Color(0xFF2563EB),
      pastelColor: Color(0xFFDBEAFE),
      items: [
        NetworkDivisionItem(
          id: 'state_central_committee',
          titleMr: 'राज्य मध्यवर्ती कार्यकारिणी',
          titleEn: 'State Central Executive Committee',
          districts: 'महाराष्ट्र राज्य मुख्यालय, पुणे / मुंबई',
          description:
              'सर्वोच्च धोरण ठरवणारी समिती. समाजाचे शैक्षणिक, आर्थिक व सामाजिक धोरण निश्चिती.',
          branchCount: 1,
          memberCount: 51,
          icon: Icons.shield_rounded,
        ),
        NetworkDivisionItem(
          id: 'district_coordination_centers',
          titleMr: '३६ जिल्हा समन्वय केंद्रे',
          titleEn: '36 District Coordination Centers',
          districts: 'सर्व ३६ जिल्ह्यांमध्ये स्वतंत्र कार्यालये',
          description:
              'जिल्हा स्तरावरील प्रशासकीय कार्यालय, हेल्पडेस्क, कायदेशीर व शैक्षणिक सहाय्यता केंद्र.',
          branchCount: 36,
          memberCount: 1800,
          icon: Icons.apartment_rounded,
        ),
        NetworkDivisionItem(
          id: 'taluka_committees',
          titleMr: '३५८+ तालुका समित्या',
          titleEn: '358+ Taluka Committees',
          districts: 'महाराष्ट्रातील सर्व तालुके',
          description:
              'तालुका स्तरावर उपक्रम राबवणारी कार्यकारिणी. गाव-पातळीवरील समस्यांचे निवारण मंच.',
          branchCount: 358,
          memberCount: 10740,
          icon: Icons.domain_rounded,
        ),
        NetworkDivisionItem(
          id: 'village_branches',
          titleMr: 'ग्रामशाखा नेटवर्क',
          titleEn: 'Village Branch Network',
          districts: 'ग्रामीण व निमशहरी गावे',
          description:
              'तळागाळातील प्रत्येक समाजबांधवापर्यंत पोहोचलेली प्रभावी गाव शाखा रचना व युवक मंडळे.',
          branchCount: 3200,
          memberCount: 38000,
          icon: Icons.holiday_village_rounded,
        ),
      ],
    ),
  ];
}
