import '../../auth/models/user_profile.dart';
import '../../auth/models/user_role.dart';
import '../../../widgets/home/home_models.dart';

/// Local data source for Home & Dashboard screen data.
/// Can be replaced with an ApiDataSource (REST / Spring Boot) later.
class LocalHomeDataSource {
  HeroBannerData getHeroBanner() {
    return HeroBannerData.defaultBanner;
  }

  List<QuickActionData> getQuickActions() {
    return QuickActionData.defaultActions;
  }

  UpcomingEventData getUpcomingEvent() {
    return UpcomingEventData.defaultEvent;
  }

  List<UpcomingEventData> getAllUpcomingEvents() {
    return [
      UpcomingEventData.defaultEvent,
      const UpcomingEventData(
        id: 'event-shivneri-2026',
        dateDay: '१९',
        dateMonth: 'फेब्रुवारी',
        imageAsset: 'assets/images/hero_banner.webp',
        titleMr: 'शिवजन्मोत्सव सोहळा - शिवनेरी',
        descriptionMr:
            'किल्ले शिवनेरीवर भव्य शिवजन्मोत्सव सोहळा, पालखी मिरवणूक व ऐतिहासिक व्याख्यान.',
        location: 'किल्ले शिवनेरी, जुन्नर / Junnar',
        time: 'सकाळी ०६:०० वा. / 06:00 AM',
        attendeesCount: '१,०००+ शिवभक्त / Attending',
      ),
    ];
  }

  List<HeritageData> getHeritageHighlights() {
    return HeritageData.defaultList;
  }

  CommunityActivityData getCommunityActivity() {
    return CommunityActivityData.defaultPost;
  }

  List<CommunityActivityData> getCommunityActivities() {
    return [
      CommunityActivityData.defaultPost,
      const CommunityActivityData(
        id: 'post-2',
        authorName: 'राजेंद्र भोसले',
        authorAvatar: 'assets/avatars/user_profile.webp',
        timeAgo: '५ तासांपूर्वी',
        postText:
            'मराठा उद्योजक परिषदेत आज १०० हून अधिक युवा व्यावसायिकांनी सहभाग घेतला. स्वराज्य उद्योजकतेचा संकल्प!',
        likesCount: 95,
        commentsCount: 14,
      ),
    ];
  }

  MemberCardData getMemberCardData(UserProfile? profile) {
    if (profile == null) {
      return MemberCardData.defaultMember;
    }
    final tierLabel = switch (profile.tier.toLowerCase()) {
      'gold' => 'Gold Member',
      'platinum' => 'Platinum Member',
      _ => 'सदस्य · Member',
    };

    final subtitle = switch (profile.role) {
      UserRole.business => 'Connect मराठा उद्योजक (Business)',
      UserRole.provider => 'Connect मराठा सेवा प्रदाता (Provider)',
      UserRole.karyakarta => 'Connect मराठा समन्वयक (Coordinator)',
      UserRole.member => 'Proud Member of Connect मराठा',
    };

    return MemberCardData(
      name: profile.name,
      subtitle: subtitle,
      tier: tierLabel,
      memberId: profile.id,
      quote: '|| निश्चयाचा महामेरू, बहुत जनांसी आधारू ||',
      avatarAsset: 'assets/avatars/user_profile.webp',
    );
  }
}
