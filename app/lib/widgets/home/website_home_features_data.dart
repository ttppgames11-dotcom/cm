import 'package:flutter/material.dart';

/// Data model for the Maratha Empire statistics strip
class EmpireStatItem {
  final String value;
  final String titleMr;
  final String subtitleEn;
  final IconData icon;
  final Color accentColor;

  const EmpireStatItem({
    required this.value,
    required this.titleMr,
    required this.subtitleEn,
    required this.icon,
    required this.accentColor,
  });

  static const List<EmpireStatItem> defaultStats = [
    EmpireStatItem(
      value: '३.९ दशलक्ष',
      titleMr: 'चौ.किमी सर्वोच्च भूभाग',
      subtitleEn: 'Peak Empire Territory (1758)',
      icon: Icons.public_rounded,
      accentColor: Color(0xFFE84C10),
    ),
    EmpireStatItem(
      value: 'अटकेपार',
      titleMr: 'सिंधू नदीवर भगवा ध्वज',
      subtitleEn: 'Flag at Attock & Lahore',
      icon: Icons.flag_rounded,
      accentColor: Color(0xFFD97706),
    ),
    EmpireStatItem(
      value: '४१ लढाया',
      titleMr: 'बाजीराव पेशवे — अपराजित',
      subtitleEn: '41 Battles Undefeated',
      icon: Icons.shield_rounded,
      accentColor: Color(0xFF9E360B),
    ),
    EmpireStatItem(
      value: '३५०+',
      titleMr: 'अभ्यासित गड-किल्ले',
      subtitleEn: 'Forts in Swarajya',
      icon: Icons.castle_rounded,
      accentColor: Color(0xFFB45309),
    ),
  ];
}

/// Data model for Ashtapradhan Council (8 Ministers)
class AshtapradhanMember {
  final String designation;
  final String englishDesignation;
  final String historicPerson;
  final String portfolio;
  final IconData icon;

  const AshtapradhanMember({
    required this.designation,
    required this.englishDesignation,
    required this.historicPerson,
    required this.portfolio,
    required this.icon,
  });

  static const List<AshtapradhanMember> council = [
    AshtapradhanMember(
      designation: 'पंतप्रधान (पेशवे)',
      englishDesignation: 'Prime Minister',
      historicPerson: 'मोरोपंत त्र्यंबक पिंगळे',
      portfolio: 'समग्र राज्यकारभार चालवणे व राजाच्या अनुपस्थितीत राज्याचे नेतृत्व करणे.',
      icon: Icons.account_balance_rounded,
    ),
    AshtapradhanMember(
      designation: 'पंत अमात्य',
      englishDesignation: 'Finance Minister',
      historicPerson: 'रामचंद्र नीलकंठ मुजुमदार',
      portfolio: 'राज्याचा जमाखर्च, वित्तव्यवस्था व महसूल प्रशासनावर नियंत्रण ठेवणे.',
      icon: Icons.account_balance_wallet_rounded,
    ),
    AshtapradhanMember(
      designation: 'पंत सचिव (सुरनिस)',
      englishDesignation: 'State Secretary',
      historicPerson: 'अण्णाजी दत्तो',
      portfolio: 'राजकीय आज्ञापत्रे, सनदा तपासणे व जमीन महसूल मोजणी पद्धत राबवणे.',
      icon: Icons.description_rounded,
    ),
    AshtapradhanMember(
      designation: 'पंत मंत्री (वाकनीस)',
      englishDesignation: 'Interior Minister',
      historicPerson: 'दत्ताजी त्रिंबक वाकनीस',
      portfolio: 'राजाची दैनंदिन दिनचर्या, गुप्तवार्ता व राजदरबारातील कामकाजाची नोंद ठेवणे.',
      icon: Icons.menu_book_rounded,
    ),
    AshtapradhanMember(
      designation: 'सरसेनापती',
      englishDesignation: 'Commander-in-Chief',
      historicPerson: 'हंबीरराव मोहिते',
      portfolio: 'स्वराज्याच्या पायदळ व घोडदळाचे सरसेनापतीपद आणि सैनिकी मोहिमांचे नेतृत्व.',
      icon: Icons.military_tech_rounded,
    ),
    AshtapradhanMember(
      designation: 'सुमंत (डबीर)',
      englishDesignation: 'Foreign Minister',
      historicPerson: 'रामचंद्र त्रिंबक डबीर',
      portfolio: 'परकीय सत्तांशी पत्रव्यवहार, गुप्तहेर यंत्रणा व आंतरराज्यीय राजनैतिक संबंध.',
      icon: Icons.language_rounded,
    ),
    AshtapradhanMember(
      designation: 'न्यायाधीश',
      englishDesignation: 'Chief Justice',
      historicPerson: 'निराजी रावजी',
      portfolio: 'स्वराज्यातील दिवाणी व फौजदारी खटल्यांचा निवाडा आणि न्यायदान व्यवस्था.',
      icon: Icons.gavel_rounded,
    ),
    AshtapradhanMember(
      designation: 'पंडितराव',
      englishDesignation: 'Minister of Religion & Charity',
      historicPerson: 'रघुनाथ पंडित',
      portfolio: 'धार्मिक कार्ये, विद्वत सन्मान, दाने व सामाजिक आचारसंहितेचे नियमन.',
      icon: Icons.auto_stories_rounded,
    ),
  ];
}

/// Data model for Fort Architecture Classification
class FortArchitecture {
  final String categoryName;
  final String englishName;
  final String iconEmoji;
  final String description;
  final String keyFeatures;
  final List<String> famousForts;

  const FortArchitecture({
    required this.categoryName,
    required this.englishName,
    required this.iconEmoji,
    required this.description,
    required this.keyFeatures,
    required this.famousForts,
  });

  static const List<FortArchitecture> types = [
    FortArchitecture(
      categoryName: 'गिरीदुर्ग',
      englishName: 'Hill Forts',
      iconEmoji: '⛰️',
      description: 'सह्याद्रीच्या उत्तुंग कड्यांवर वसलेले अभेद्य किल्ले. ताशीव कडे, बालेकिल्ला व दुहेरी तटबंदी ही प्रमुख ओळख.',
      keyFeatures: 'गोमुखी प्रवेशद्वार • माच्या • नैसर्गिक कडे',
      famousForts: ['राजगड', 'रायगड', 'सिंहगड', 'तोरणा', 'प्रतापगड'],
    ),
    FortArchitecture(
      categoryName: 'जलदुर्ग',
      englishName: 'Sea Forts',
      iconEmoji: '🌊',
      description: 'अरबी समुद्रातील खडकांवर लाटांचा मारा सहन करत उभे असलेले अभेद्य सागरी दुर्ग.',
      keyFeatures: 'शिशाचा पाया • पाण्याखालून मार्ग • बुलंद बुरुज',
      famousForts: ['सिंधुदुर्ग', 'विजयदुर्ग', 'सुवर्णदुर्ग', 'पद्मदुर्ग'],
    ),
    FortArchitecture(
      categoryName: 'भुईकोट',
      englishName: 'Land Forts',
      iconEmoji: '🏰',
      description: 'सपाट मैदानी प्रदेशातील मोक्याच्या व्यापारी मार्गांवर व लष्करी छावण्यांवर नियंत्रण ठेवणारे दुर्ग.',
      keyFeatures: 'खंदक (खोल पाणी) • दुहेरी कोट • तोफांचे बुरुज',
      famousForts: ['चाकण', 'बहादूरगड', 'सोलापूर', 'कंधार'],
    ),
  ];
}

/// Data model for Historian Insight
class HistorianInsight {
  final String name;
  final String title;
  final String badge;
  final String quote;
  final String takeaway;

  const HistorianInsight({
    required this.name,
    required this.title,
    required this.badge,
    required this.quote,
    required this.takeaway,
  });

  static const List<HistorianInsight> insights = [
    HistorianInsight(
      name: 'शिवशाहीर बाबासाहेब पुरंदरे',
      title: 'पद्मविभूषण इतिहासकार व शिवचरित्रकार',
      badge: 'जाणता राजा',
      quote: 'शिवछत्रपतींचे राज्य हे कोणत्याही धर्माविरुद्ध नव्हते, तर ते जुलूम व अन्यायाविरुद्ध पुकारलेले बंड होते. शिवरायांचे राज्य हे रयतेचे स्वराज्य होते!',
      takeaway: 'शिवशाही म्हणजे केवळ साम्राज्य नव्हे, तर रयतेचे कल्याण व सर्वोच्च नैतिक सुशासन.',
    ),
    HistorianInsight(
      name: 'इतिहास संशोधक वा. सी. बेंद्रे',
      title: 'छत्रपती संभाजी महाराज समाधी शोधक व संशोधक',
      badge: 'अस्सल पुराभिलेखागार',
      quote: 'संभाजी महाराजांनी ९ वर्षे एकाही पराभवाशिवाय मुघल सेनेशी लढा दिला. त्यांचे जीवन हे राष्ट्रनिष्ठा व बलिदानाचे मूर्तिमंत प्रतीक आहे.',
      takeaway: 'अस्सल मोडी कागदपत्रांच्या आधारे इतिहासाचे निष्पक्ष पुनर्मूल्यांकन.',
    ),
    HistorianInsight(
      name: 'सेतु माधवराव पगडी',
      title: 'ज्येष्ठ विचारवंत व राष्ट्रीय इतिहासकार',
      badge: 'राष्ट्रीय संदर्भ',
      quote: 'शिवाजी महाराज हे केवळ महाराष्ट्राचेच नव्हे तर संपूर्ण आशिया खंडातील महान राष्ट्रनिर्माते व मुत्सद्दी होते.',
      takeaway: 'मराठा साम्राज्याचा प्रभाव दिल्ली ते तंजावरपर्यंत अखंड राहिला.',
    ),
  ];
}

/// Data model for Community Services Category
class HomeServiceCategory {
  final String id;
  final String titleMr;
  final String subtitleMr;
  final String iconEmoji;
  final String route;
  final Color themeColor;

  const HomeServiceCategory({
    required this.id,
    required this.titleMr,
    required this.subtitleMr,
    required this.iconEmoji,
    required this.route,
    required this.themeColor,
  });

  static const List<HomeServiceCategory> categories = [
    HomeServiceCategory(
      id: 'it',
      titleMr: 'आयटी व सॉफ्टवेअर',
      subtitleMr: 'वेबसाईट, ॲप्स, क्लाउड व डिजिटल मार्केटिंग',
      iconEmoji: '💻',
      route: '/business',
      themeColor: Color(0xFFE84C10),
    ),
    HomeServiceCategory(
      id: 'legal',
      titleMr: 'कायदेशीर सल्ला व CA',
      subtitleMr: 'वकिली, GST, कंपनी ऑडिट व कर सल्ला',
      iconEmoji: '⚖️',
      route: '/business',
      themeColor: Color(0xFFD97706),
    ),
    HomeServiceCategory(
      id: 'agri',
      titleMr: 'ॲग्री-टेक व शेती',
      subtitleMr: 'सेंद्रिय उत्पादने, थेट शेतकरी बाजारपेठ व तंत्रज्ञान',
      iconEmoji: '🌱',
      route: '/business',
      themeColor: Color(0xFF16A34A),
    ),
    HomeServiceCategory(
      id: 'construction',
      titleMr: 'बांधकाम व वास्तुरचना',
      subtitleMr: 'आर्किटेक्ट, सिव्हिल इंजिनिअर व मटेरियल',
      iconEmoji: '🏗️',
      route: '/business',
      themeColor: Color(0xFF9E360B),
    ),
  ];
}

/// Data model for Leaders of the Great Maratha Resurgence (पानिपतनंतरचे महापुनरुत्थान)
class ResurgenceLeader {
  final String title;
  final String roleBadge;
  final String summary;
  final List<String> tags;
  final IconData icon;

  const ResurgenceLeader({
    required this.title,
    required this.roleBadge,
    required this.summary,
    required this.tags,
    required this.icon,
  });

  static const List<ResurgenceLeader> leaders = [
    ResurgenceLeader(
      title: 'श्रीमंत महादजी शिंदे (पाटीलबाबा)',
      roleBadge: 'वकील-ए-मुतलक',
      summary: 'पानिपतच्या युद्धातून फिनिक्स झेप. १७७१ मध्ये दिल्ली जिंकून मुघल बादशहाला मांडलिक केले व आधुनिक तोफखाना-सज्ज कवायती सेना उभारली.',
      tags: ['दिल्लीचे तख्त नियंत्रक', 'आधुनिक तोफखाना', 'वडगावचा विजय (१७७९)'],
      icon: Icons.shield_rounded,
    ),
    ResurgenceLeader(
      title: 'मुत्सद्दी नाना फडणवीस (१७४२–१८००)',
      roleBadge: 'सर्वोच्च मुत्सद्दी',
      summary: 'युरोपीय इतिहासकारांनी "मराठ्यांचे मॅकियाव्हेली" संबोधलेले बुद्धिवंत राजकारणी. बारभाई कारस्थान रचून स्वराज्याची धुरा सांभाळली व सालबाईचा तह घडवला.',
      tags: ['बारभाई कारस्थान', 'सालबाईचा ऐतिहासिक तह', 'मेणवलीचे दप्तर'],
      icon: Icons.menu_book_rounded,
    ),
    ResurgenceLeader(
      title: 'पुण्यश्लोक अहिल्याबाई होळकर',
      roleBadge: 'लोकमाता व तत्त्वज्ञ राणी',
      summary: 'माळवा प्रांताची आदर्श राज्यकर्ती. महेश्वर साड्यांच्या वस्त्रोद्योगाची स्थापना, शेतकऱ्यांना करसवलती आणि काशी विश्वनाथ, सोमनाथ ते रामेश्वरमपर्यंत मंदिरांचा जीर्णोद्धार केला.',
      tags: ['काशी विश्वनाथ जीर्णोद्धार', 'महेश्‍वर वस्त्रोद्योग', 'न्यायप्रिय प्रशासन'],
      icon: Icons.temple_hindu_rounded,
    ),
  ];
}

/// Data model for Maratha Empire Chronological Timeline (1630 – 1818 Timeline)
class EmpireTimelineEvent {
  final String year;
  final String title;
  final String significance;
  final IconData icon;

  const EmpireTimelineEvent({
    required this.year,
    required this.title,
    required this.significance,
    required this.icon,
  });

  static const List<EmpireTimelineEvent> events = [
    EmpireTimelineEvent(
      year: '१६३०',
      title: 'शिवनेरी गडावर छत्रपती शिवरायांचा जन्म',
      significance: 'माता जिजाऊ व शहाजीराजे यांच्या प्रेरणेने हिंदवी स्वराज्याची बीजे रोवली गेली.',
      icon: Icons.child_care_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६४५',
      title: 'रायरेश्वरावर शपथ व तोरणा विजय',
      significance: 'अवघ्या १५ व्या वर्षी मावळ्यांना एकत्र करून स्वराज्याची अधिकृत घोषणा.',
      icon: Icons.flag_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६५९',
      title: 'प्रतापगड युद्ध — अफझलखानाचा वध',
      significance: 'विजापूरच्या बलाढ्य फौजेचा धुव्वा; वाघनखांनी अफझलखानाचा कोथळा बाहेर काढला.',
      icon: Icons.military_tech_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६६६',
      title: 'आग्रा भेट व ऐतिहासिक सुटका',
      significance: 'औरंगजेबाच्या कपटी कैदेतून सुटका; जागतिक गुप्तहेर शास्त्रातील चमत्कार.',
      icon: Icons.lock_open_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६७४',
      title: 'दुर्गराज रायगडावर सुवर्ण राज्याभिषेक',
      significance: 'हिंदवी स्वराज्य सार्वभौम झाले, शिवराज्याभिषेक शक व स्वतःचे शिवराई चलन सुरू.',
      icon: Icons.workspace_premium_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६८०–८९',
      title: 'छत्रपती संभाजी महाराज — १२८ लढायांचे अपराजित पर्व',
      significance: 'औरंगजेब ५ लाख सेनेसह दक्षिणेत उतरला; शंभूराजांनी ९ वर्षे एकही किल्ला जिंकू दिला नाही.',
      icon: Icons.shield_rounded,
    ),
    EmpireTimelineEvent(
      year: '१६८९–१७०७',
      title: '२७ वर्षांचे स्वातंत्र्ययुद्ध — महाराणी ताराबाई व संताजी-धनाजी',
      significance: 'मराठ्यांनी मुघल सेनेला सळो की पळो केले; शेवटी औरंगजेब महाराष्ट्रात गाडला गेला.',
      icon: Icons.history_edu_rounded,
    ),
    EmpireTimelineEvent(
      year: '१७२०–४०',
      title: 'श्रीमंत बाजीराव पेशवे — ४१ लढाया, शून्य पराभव',
      significance: 'पालखेड, माळवा, बुंदेलखंड जिंकून साम्राज्य थेट अटकेपार लाहोरपर्यंत पोहोचवले.',
      icon: Icons.sports_kabaddi_rounded,
    ),
  ];
}

/// Data model for Great Warriors & Historical Biographies (साम्राज्याचे महायोद्धे)
class GreatWarriorBio {
  final String id;
  final String titleMr;
  final String subtitleMr;
  final String descMr;
  final String imagePath;
  final String route;

  const GreatWarriorBio({
    required this.id,
    required this.titleMr,
    required this.subtitleMr,
    required this.descMr,
    required this.imagePath,
    required this.route,
  });

  static const List<GreatWarriorBio> warriors = [
    GreatWarriorBio(
      id: 'shivaji',
      titleMr: 'छत्रपती शिवाजी महाराज',
      subtitleMr: 'हिंदवी स्वराज्य संस्थापक',
      descMr: 'रयतेचे राजे, आरमार पितामह, गनिमी काव्याचे जनक व अष्टप्रधान मंडळाचे शिल्पकार.',
      imagePath: 'assets/images/warrior_shivaji.webp',
      route: '/heritage',
    ),
    GreatWarriorBio(
      id: 'sambhaji',
      titleMr: 'छत्रपती संभाजी महाराज',
      subtitleMr: 'अपराजित धर्मवीर',
      descMr: '१२८ लढायांमध्ये अजिंक्य, बुधभूषणम् संस्कृत ग्रंथकार व तुळापूरचे सर्वोच्च बलिदान.',
      imagePath: 'assets/images/warrior_sambhaji.webp',
      route: '/heritage',
    ),
    GreatWarriorBio(
      id: 'bajirao',
      titleMr: 'श्रीमंत बाजीराव पेशवे',
      subtitleMr: 'अपराजित सेनापती',
      descMr: '४१ लढाया, शून्य पराभव — पालखेड मोहीम, गनिमी घोडदौड व अटकेपार साम्राज्य विस्तार.',
      imagePath: 'assets/images/warrior_bajirao.webp',
      route: '/heritage',
    ),
  ];
}
