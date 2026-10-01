import 'package:flutter/material.dart';

/// Data model for Member ID Card
class MemberCardData {
  final String name;
  final String subtitle;
  final String tier;
  final String quote;
  final String memberId;
  final String avatarAsset;

  const MemberCardData({
    required this.name,
    this.subtitle = 'Proud Member of Connect मराठा',
    this.tier = 'सदस्य · Member',
    this.quote = '|| निश्चयाचा महामेरू, बहुत जनांसी आधारू ||',
    required this.memberId,
    this.avatarAsset = 'assets/avatars/user_profile.webp',
  });

  static const defaultMember = MemberCardData(
    name: 'अभयराजे गोंड',
    subtitle: 'Proud Member of Connect मराठा',
    tier: 'सदस्य · Member',
    quote: '|| निश्चयाचा महामेरू, बहुत जनांसी आधारू ||',
    memberId: 'CM-2026-9482',
    avatarAsset: 'assets/avatars/user_profile.webp',
  );
}

/// Data model for Hero Banner
class HeroBannerData {
  final String imageAsset;
  final List<String> images;
  final String quote;
  final String attribution;
  final List<String> categories;

  const HeroBannerData({
    this.imageAsset = 'assets/images/hero_banner.webp',
    this.images = const [
      'assets/images/hero_banner.webp',
      'assets/images/heritage_rajgad.webp',
      'assets/images/heritage_sinhgad.webp',
      'assets/images/heritage_hero.webp',
    ],
    this.quote = 'हे राज्य व्हावे, हे तो श्रींची इच्छा!',
    this.attribution = 'छत्रपती शिवाजी महाराज',
    this.categories = const ['स्वराज्य', 'संस्कार', 'संस्कृती', 'समृद्धी'],
  });

  static const defaultBanner = HeroBannerData();
}

/// Data model for Quick Actions
class QuickActionData {
  final String id;
  final String titleMr;
  final String subtitleEn;
  final IconData icon;
  final Color overlayColor;
  final String? backgroundImage;
  final VoidCallback? onTap;

  const QuickActionData({
    required this.id,
    required this.titleMr,
    required this.subtitleEn,
    required this.icon,
    required this.overlayColor,
    this.backgroundImage,
    this.onTap,
  });

  static List<QuickActionData> get defaultActions => [
    const QuickActionData(
      id: 'heritage',
      titleMr: 'इतिहास',
      subtitleEn: 'History',
      icon: Icons.castle_rounded,
      overlayColor: Color(0xFFE8631A), // Saffron / Orange
      backgroundImage: 'assets/images/heritage_rajgad.webp',
    ),
    const QuickActionData(
      id: 'business',
      titleMr: 'व्यवसाय',
      subtitleEn: 'Business',
      icon: Icons.storefront_rounded,
      overlayColor: Color(0xFF8B1E1E), // Maroon / Red
      backgroundImage: 'assets/images/hero_banner.webp',
    ),
    const QuickActionData(
      id: 'community',
      titleMr: 'समुदाय',
      subtitleEn: 'Community',
      icon: Icons.groups_rounded,
      overlayColor: Color(0xFF1E4B8B), // Blue
      backgroundImage: 'assets/images/post_rajgad_trek.webp',
    ),
    const QuickActionData(
      id: 'services',
      titleMr: 'सेवा व कार्य',
      subtitleEn: 'Services',
      icon: Icons.handshake_rounded,
      overlayColor: Color(0xFF1E7044), // Green
      backgroundImage: 'assets/images/event_rajgad.webp',
    ),
    const QuickActionData(
      id: 'network',
      titleMr: 'महाराष्ट्र नेटवर्क',
      subtitleEn: 'MH Network',
      icon: Icons.hub_rounded,
      overlayColor: Color(0xFFD97706), // Amber
      backgroundImage: 'assets/images/heritage_sinhgad.webp',
    ),
  ];
}

/// Data model for Upcoming Event
class UpcomingEventData {
  final String id;
  final String dateDay;
  final String dateMonth;
  final String imageAsset;
  final String titleMr;
  final String descriptionMr;
  final String location;
  final String time;
  final String attendeesCount;
  final String ctaText;
  final VoidCallback? onRegister;

  const UpcomingEventData({
    required this.id,
    required this.dateDay,
    required this.dateMonth,
    required this.imageAsset,
    required this.titleMr,
    required this.descriptionMr,
    required this.location,
    required this.time,
    required this.attendeesCount,
    this.ctaText = 'नोंदणी करा',
    this.onRegister,
  });

  static const defaultEvent = UpcomingEventData(
    id: 'event-rajgad-2026',
    dateDay: '२५',
    dateMonth: 'ऑक्टोबर',
    imageAsset: 'assets/images/event_rajgad.webp',
    titleMr: 'राजगड दुर्ग मोहीम व महाअधिवेशन',
    descriptionMr:
        'छत्रपती शिवाजी महाराजांच्या राजधानीवर भव्य अभ्यास दौरा, इतिहास परिसंवाद आणि युवा संवाद.',
    location: 'राजगड किल्ला, पुणे / Rajgad Fort',
    time: 'सकाळी ०८:३० वा. / 08:30 AM',
    attendeesCount: '३५०+ सदस्य उपस्थित / Attending',
    ctaText: 'नोंदणी करा',
  );
}

/// Data model for Heritage card
class HeritageData {
  final String id;
  final String titleMr;
  final String subtitleMr;
  final String imageAsset;
  final VoidCallback? onTap;

  const HeritageData({
    required this.id,
    required this.titleMr,
    required this.subtitleMr,
    required this.imageAsset,
    this.onTap,
  });

  static List<HeritageData> get defaultList => const [
    HeritageData(
      id: 'rajgad',
      titleMr: 'राजगड किल्ला',
      subtitleMr: 'हिंदवी स्वराज्याची पहिली राजधानी',
      imageAsset: 'assets/images/heritage_rajgad.webp',
    ),
    HeritageData(
      id: 'sinhgad',
      titleMr: 'सिंहगड किल्ला',
      subtitleMr: 'नरवीर तानाजी मालुसरे यांचे पराक्रमस्थळ',
      imageAsset: 'assets/images/heritage_sinhgad.webp',
    ),
    HeritageData(
      id: 'pratapgad',
      titleMr: 'प्रतापगड पराक्रम',
      subtitleMr: 'अफजलखान वधाचा ऐतिहासिक रणसंग्राम',
      imageAsset: 'assets/images/hero_banner.webp',
    ),
    HeritageData(
      id: 'maratha_navy',
      titleMr: 'मराठा आरमार व जलदुर्ग',
      subtitleMr: 'सिंधुदुर्ग, विजयदुर्ग आणि कान्होजी आंग्रे',
      imageAsset: 'assets/images/splash_background.webp',
    ),
  ];
}

/// Data model for Community Activity post
class CommunityActivityData {
  final String id;
  final String authorName;
  final String authorAvatar;
  final String timeAgo;
  final String postText;
  final String? attachedImage;
  final int likesCount;
  final int commentsCount;
  final VoidCallback? onMore;
  final VoidCallback? onTap;

  const CommunityActivityData({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.timeAgo,
    required this.postText,
    this.attachedImage,
    this.likesCount = 142,
    this.commentsCount = 28,
    this.onMore,
    this.onTap,
  });

  static const defaultPost = CommunityActivityData(
    id: 'post-1',
    authorName: 'तानाजी सावंत',
    authorAvatar: 'assets/avatars/user_profile.webp',
    timeAgo: '2 तासांपूर्वी',
    postText:
        'आज राजगड संवर्धन मोहिमेत सहभाग घेतला. सह्याद्रीच्या कुशीत पूर्वजांचा पराक्रम अनुभवण्याचा हा क्षण अविस्मरणीय होता!',
    attachedImage: 'assets/images/post_rajgad_trek.webp',
    likesCount: 184,
    commentsCount: 32,
  );
}

/// Data model for Maratha Fort
class Fort {
  final String id;
  final String name;
  final String district;
  final String subtitle;
  final String imagePath;
  final bool isFavorite;

  const Fort({
    required this.id,
    required this.name,
    required this.district,
    required this.subtitle,
    required this.imagePath,
    this.isFavorite = false,
  });

  Fort copyWith({
    String? id,
    String? name,
    String? district,
    String? subtitle,
    String? imagePath,
    bool? isFavorite,
  }) {
    return Fort(
      id: id ?? this.id,
      name: name ?? this.name,
      district: district ?? this.district,
      subtitle: subtitle ?? this.subtitle,
      imagePath: imagePath ?? this.imagePath,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }

  static const List<Fort> defaultForts = [
    Fort(
      id: 'rajgad',
      name: 'राजगड किल्ला',
      district: 'पुणे',
      subtitle: 'स्वराज्याची पहिली राजधानी',
      imagePath: 'assets/images/heritage_rajgad.webp',
    ),
    Fort(
      id: 'pratapgad',
      name: 'प्रतापगड किल्ला',
      district: 'सातारा',
      subtitle: 'अफझलखान वधाचा साक्षीदार',
      imagePath: 'assets/images/event_rajgad.webp',
    ),
    Fort(
      id: 'sinhgad',
      name: 'सिंहगड किल्ला',
      district: 'पुणे',
      subtitle: 'तानाजी मालुसरे यांचा पराक्रम',
      imagePath: 'assets/images/heritage_sinhgad.webp',
    ),
    Fort(
      id: 'shivneri',
      name: 'शिवनेरी किल्ला',
      district: 'जुन्नर',
      subtitle: 'छत्रपती शिवरायांचे जन्मस्थान',
      imagePath: 'assets/images/heritage_hero.webp',
    ),
    Fort(
      id: 'raigad',
      name: 'रायगड किल्ला',
      district: 'रायगड',
      subtitle: 'शिवछत्रपतींचे राजधानी दुर्ग',
      imagePath: 'assets/images/hero_banner.webp',
    ),
    Fort(
      id: 'torna',
      name: 'तोरणा किल्ला',
      district: 'पुणे',
      subtitle: 'स्वराज्याचे तोरण बांधणारा पहिला किल्ला',
      imagePath: 'assets/images/post_rajgad_trek.webp',
    ),
  ];
}

/// Data model for Maratha Warrior
class Warrior {
  final String id;
  final String name;
  final String roleTag;
  final String era;
  final String imagePath;
  final bool isFavorite;

  const Warrior({
    required this.id,
    required this.name,
    required this.roleTag,
    required this.era,
    required this.imagePath,
    this.isFavorite = false,
  });

  Warrior copyWith({
    String? id,
    String? name,
    String? roleTag,
    String? era,
    String? imagePath,
    bool? isFavorite,
  }) {
    return Warrior(
      id: id ?? this.id,
      name: name ?? this.name,
      roleTag: roleTag ?? this.roleTag,
      era: era ?? this.era,
      imagePath: imagePath ?? this.imagePath,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }

  static const List<Warrior> defaultWarriors = [
    Warrior(
      id: 'shivaji',
      name: 'छत्रपती शिवाजी महाराज',
      roleTag: 'मराठा साम्राज्याचे संस्थापक',
      era: 'इ.स. १६३० – १६८०',
      imagePath: 'assets/images/warrior_shivaji.webp',
    ),
    Warrior(
      id: 'sambhaji',
      name: 'छत्रपती संभाजी महाराज',
      roleTag: 'द्वितीय छत्रपती व धर्मवीर',
      era: 'इ.स. १६५७ – १६८९',
      imagePath: 'assets/images/warrior_sambhaji.webp',
    ),
    Warrior(
      id: 'tarabai',
      name: 'राणी ताराबाई',
      roleTag: 'स्वराज्य संरक्षिका व विरांगना',
      era: 'इ.स. १६७५ – १७६१',
      imagePath: 'assets/images/warrior_tarabai.webp',
    ),
    Warrior(
      id: 'bajirao',
      name: 'बाजीराव पेशवा',
      roleTag: 'अपराजित मराठा सेनापती',
      era: 'इ.स. १७०० – १७४०',
      imagePath: 'assets/images/warrior_bajirao.webp',
    ),
    Warrior(
      id: 'tanaji',
      name: 'तानाजी मालुसरे',
      roleTag: 'सिंहगडाचे वीर नरवीर',
      era: 'इ.स. १६०० – १६७०',
      imagePath: 'assets/images/warrior_tanaji.webp',
    ),
    Warrior(
      id: 'hambirrao',
      name: 'हंबीरराव मोहिते',
      roleTag: 'मराठा सैन्याचे सरसेनापती',
      era: 'इ.स. १६३० – १६८७',
      imagePath: 'assets/images/warrior_hambirrao.webp',
    ),
  ];
}
