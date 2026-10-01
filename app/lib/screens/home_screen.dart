import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/home_theme.dart';
import '../features/home/providers/home_provider.dart';
import '../widgets/home/custom_bottom_nav_bar.dart';
import '../widgets/home/heritage_scroll_section.dart';
import '../widgets/home/hero_banner.dart';
import '../widgets/home/home_header.dart';
import '../widgets/home/home_models.dart';
import '../widgets/home/member_id_card.dart';
import '../widgets/home/quick_actions_grid.dart';
import '../widgets/home/war_cry_banner.dart';
import '../widgets/home/empire_stats_strip.dart';
import '../widgets/home/ashtapradhan_section.dart';
import '../widgets/home/fort_architecture_section.dart';
import '../widgets/home/governance_decree_card.dart';
import '../widgets/home/maratha_navy_card.dart';
import '../widgets/home/historians_insights_section.dart';
import '../widgets/home/community_services_section.dart';
import '../widgets/home/today_in_history_banner.dart';
import '../widgets/home/maratha_resurgence_section.dart';
import '../widgets/home/empire_timeline_section.dart';
import '../widgets/home/great_warriors_section.dart';
import '../widgets/home/website_home_extras.dart';

/// The primary Home Screen for Connect Maratha (Light Theme).
/// Assembles all 8 section widgets top to bottom in a SingleChildScrollView,
/// with the fixed CustomBottomNavBar and "|| जय शिवराय ||" tagline in the Scaffold.
class HomeScreen extends ConsumerStatefulWidget {
  final MemberCardData? memberData;
  final HeroBannerData? heroData;
  final List<QuickActionData>? quickActions;
  final UpcomingEventData? upcomingEvent;
  final List<HeritageData>? heritageList;
  final CommunityActivityData? communityActivity;

  const HomeScreen({
    super.key,
    this.memberData,
    this.heroData,
    this.quickActions,
    this.upcomingEvent,
    this.heritageList,
    this.communityActivity,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _directoryKey = GlobalKey();

  void _scrollToDirectory() {
    final target = _directoryKey.currentContext;
    if (target != null) {
      Scrollable.ensureVisible(
        target,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeStateAsync = ref.watch(homeProvider);
    final homeState = homeStateAsync.valueOrNull;

    final member =
        widget.memberData ??
        homeState?.memberData ??
        MemberCardData.defaultMember;
    final hero =
        widget.heroData ??
        homeState?.heroBanner ??
        HeroBannerData.defaultBanner;
    final rawActions =
        widget.quickActions ??
        homeState?.quickActions ??
        QuickActionData.defaultActions;
    final actions = [
      for (final action in rawActions)
        action.onTap != null
            ? action
            : QuickActionData(
              id: action.id,
              titleMr: action.titleMr,
              subtitleEn: action.subtitleEn,
              icon: action.icon,
              overlayColor: action.overlayColor,
              backgroundImage: action.backgroundImage,
              onTap: switch (action.id) {
                'heritage' => () => context.push('/history'),
                'community' => () => context.push('/community'),
                'business' => () => context.push('/business'),
                'network' => () => context.push('/network'),
                'services' => () => context.push('/business'),
                _ => null,
              },
            ),
    ];
    final today = todayInHistory(DateTime.now());
    final heritage =
        widget.heritageList ??
        homeState?.heritageHighlights ??
        HeritageData.defaultList;
    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. HomeHeader
              HomeHeader(
                onSearch: () => context.push('/search'),
                onNotifications: () => context.push('/profile/notifications'),
                onProfile: () => context.push('/profile'),
              ),

              const SizedBox(height: 4),

              // 2. HeroBanner (4-slide carousel)
              HeroBanner(
                data: hero,
                onTap: () => context.push('/warrior/shivaji'),
              ),

              const SizedBox(height: 6),

              // 3. Majestic War Cry Banner (|| जय भवानी, जय शिवाजी ||)
              const WarCryBanner(),

              // 4. Today in History — the event on today's date, else the
              // next one coming up (the website shows one fixed date).
              TodayInHistoryBanner(
                dateTitle: today.date,
                description:
                    today.isToday
                        ? '${today.title} — ${today.description}'
                        : 'आगामी दिनविशेष: ${today.title} — ${today.description}',
                onTap: () => context.push('/history/dates'),
              ),

              const SizedBox(height: 6),

              // 5. Empire Statistics Strip (३.९ दशलक्ष चौ.किमी, अटकेपार, ४१ लढाया, ३५०+ किल्ले)
              EmpireStatsStrip(onTap: () => context.push('/heritage')),

              const SizedBox(height: 8),

              // 5. MemberIdCard (Digital identity with QR)
              MemberIdCard(
                member: member,
                onTap: () => context.push('/profile'),
              ),

              const SizedBox(height: 12),

              // 6. QuickActionsGrid (इतिहास, व्यवसाय, समुदाय, सेवा व कार्य, महाराष्ट्र नेटवर्क)
              QuickActionsGrid(actions: actions, onSeeAll: _scrollToDirectory),

              const SizedBox(height: 14),

              // Website home sections: 4 pillars + spotlights, portraits,
              // Rajmudra, Bhagwa flag, the Great Maratha Empire.
              const FourPillarsSection(),
              const SizedBox(height: 14),
              const PortraitStrip(),
              const SizedBox(height: 16),
              const RajmudraSection(),
              const SizedBox(height: 16),
              const BhagwaFlagCard(),
              const SizedBox(height: 14),
              const MarathaEmpireSection(),

              const SizedBox(height: 14),

              // 7. AshtapradhanSection (छत्रपती शिवाजी महाराजांचे अष्टप्रधान मंडळ)
              AshtapradhanSection(
                onSeeAll:
                    () => context.push('/history/swarajya-administration'),
              ),

              const SizedBox(height: 14),

              // 8. FortArchitectureSection (गिरीदुर्ग, जलदुर्ग, भुईकोट स्थापत्यशास्त्र)
              FortArchitectureSection(
                onExploreForts: (type) => context.push('/heritage'),
              ),

              const SizedBox(height: 14),

              // The upcoming-event card is hidden until events come from the
              // server (Phase 2): its sample event and "registered!" message
              // were made up.

              // 10. HeritageScrollSection (गड-किल्ले दर्शन)
              HeritageScrollSection(
                items: heritage,
                onSeeAll: () => context.push('/heritage'),
                onItemTap: (item) {
                  context.push('/fort/${item.id}');
                },
              ),

              const SizedBox(height: 14),

              // 11. GovernanceDecreeCard (शिवकालीन सुशासन व पर्यावरण आज्ञापत्र)
              const GovernanceDecreeCard(),

              const SizedBox(height: 14),

              // 12. MarathaNavyCard (मराठा आरमार व सागरी सार्वभौमत्व)
              MarathaNavyCard(onTap: () => context.push('/heritage')),

              const SizedBox(height: 14),

              // 13. MarathaResurgenceSection (पानिपतनंतरचे महापुनरुत्थान व महादजी युग — E:\cm-web\cm)
              MarathaResurgenceSection(
                onSeeAll: () => context.push('/heritage'),
              ),

              const SizedBox(height: 14),

              // 14. GreatWarriorsSection (साम्राज्याचे महायोद्धे व चरित्र ग्रंथ — E:\cm-web\cm)
              GreatWarriorsSection(
                onWarriorTap: (warrior) => context.push(warrior.route),
                onSeeAll: () => context.push('/heritage'),
              ),

              const SizedBox(height: 14),

              // 15. HistoriansInsightsSection (इतिहास संशोधकांचे विचारमंथन व अभ्यास)
              HistoriansInsightsSection(
                onSeeAll: () => context.push('/heritage'),
              ),

              const SizedBox(height: 14),

              // 16. EmpireTimelineSection (मराठा साम्राज्य महत्त्वाचे कालखंड १६३० – १८१८ — E:\cm-web\cm)
              EmpireTimelineSection(onSeeAll: () => context.push('/heritage')),

              const SizedBox(height: 14),

              // 17. CommunityServicesSection (विश्वासू सेवा व उद्योग निर्देशिका)
              CommunityServicesSection(
                onCategoryTap: (cat) => context.push(cat.route),
                onSeeAll: () => context.push('/business'),
              ),

              const SizedBox(height: 14),

              // All portals directory (website "Classified Ecosystem Directory").
              PortalDirectory(key: _directoryKey),

              const SizedBox(height: 14),

              // Replaces the old sample post, which was attributed to a
              // made-up member.
              const JoinCommunityCard(),

              // Bottom Padding so scrolling content is clear of bottom navigation
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),

      // 8. CustomBottomNavBar + 9. Footer Tagline
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: 0, // "होम"
        onTap: (index) {
          // Home stays the highlighted tab: the other tabs open as their own
          // screens on top of it.
          if (index == 1) {
            context.push('/community');
          } else if (index == 2) {
            context.push('/business');
          } else if (index == 3) {
            context.push('/search');
          } else if (index == 4) {
            context.push('/profile');
          }
        },
      ),
    );
  }
}
