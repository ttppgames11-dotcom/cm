import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'helpers/local_auth_repository.dart';
import 'package:app/screens/home_screen.dart';
import 'package:app/widgets/home/home_header.dart';
import 'package:app/widgets/home/hero_banner.dart';
import 'package:app/widgets/home/member_id_card.dart';
import 'package:app/widgets/home/quick_actions_grid.dart';
import 'package:app/widgets/home/upcoming_event_card.dart';
import 'package:app/widgets/home/heritage_scroll_section.dart';
import 'package:app/widgets/home/community_activity_card.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';
import 'package:app/widgets/home/war_cry_banner.dart';
import 'package:app/widgets/home/empire_stats_strip.dart';
import 'package:app/widgets/home/ashtapradhan_section.dart';
import 'package:app/widgets/home/fort_architecture_section.dart';
import 'package:app/widgets/home/governance_decree_card.dart';
import 'package:app/widgets/home/maratha_navy_card.dart';
import 'package:app/widgets/home/historians_insights_section.dart';
import 'package:app/widgets/home/community_services_section.dart';
import 'package:app/widgets/home/website_home_extras.dart';

/// Home widgets show the signed-in member's own avatar, so they need auth.
Widget _withAuth(Widget child) {
  final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
  return ProviderScope(
    overrides: [authControllerProvider.overrideWith((ref) => auth)],
    child: MaterialApp(home: Scaffold(body: child)),
  );
}

void main() {
  testWidgets('HomeHeader renders wordmark, tagline and action icons', (
    tester,
  ) async {
    await tester.pumpWidget(
      _withAuth(const HomeHeader()),
    );

    expect(find.byType(HomeHeader), findsOneWidget);
    expect(find.textContaining('Connect', findRichText: true), findsWidgets);
    expect(find.textContaining('मराठा', findRichText: true), findsWidgets);
    expect(find.text('आधुनिक युगातील आधुनिक संघटन'), findsOneWidget);
    expect(find.byIcon(Icons.search_rounded), findsOneWidget);
    expect(find.byIcon(Icons.notifications_none_rounded), findsOneWidget);
  });

  testWidgets('HeroBanner renders Marathi quote, attribution and categories', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: HeroBanner())),
    );

    expect(find.byType(HeroBanner), findsOneWidget);
    expect(find.text('हे राज्य व्हावे, हे तो श्रींची इच्छा!'), findsOneWidget);
    expect(find.text('— छत्रपती शिवाजी महाराज'), findsOneWidget);
    expect(find.text('स्वराज्य'), findsOneWidget);
    expect(find.text('संस्कार'), findsOneWidget);
    expect(find.text('संस्कृती'), findsOneWidget);
    expect(find.text('समृद्धी'), findsOneWidget);
  });

  testWidgets('MemberIdCard renders name, tier, QR code and ID', (
    tester,
  ) async {
    await tester.pumpWidget(
      _withAuth(const MemberIdCard()),
    );

    expect(find.byType(MemberIdCard), findsOneWidget);
    expect(find.text('अभयराजे गोंड'), findsOneWidget);
    expect(find.text('Proud Member of Connect मराठा'), findsOneWidget);
    expect(find.text('सदस्य · Member'), findsOneWidget);
    expect(find.byType(QrImageView), findsOneWidget);
    expect(find.text('CM-2026-9482'), findsOneWidget);
    expect(
      find.text('“ || निश्चयाचा महामेरू, बहुत जनांसी आधारू || ”'),
      findsOneWidget,
    );
  });

  testWidgets(
    'QuickActionsGrid renders all 5 action cards including Maharashtra Network',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: QuickActionsGrid())),
      );

      expect(find.byType(QuickActionsGrid), findsOneWidget);
      expect(find.byType(QuickActionCard), findsNWidgets(5));
      expect(find.text('इतिहास'), findsOneWidget);
      expect(find.text('व्यवसाय'), findsOneWidget);
      expect(find.text('समुदाय'), findsOneWidget);
      expect(find.text('सेवा व कार्य'), findsOneWidget);
      expect(find.text('महाराष्ट्र नेटवर्क'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_forward_rounded), findsNWidgets(5));
    },
  );

  testWidgets(
    'UpcomingEventCard renders date badge, title, info rows and button',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: UpcomingEventCard())),
      );

      expect(find.byType(UpcomingEventCard), findsOneWidget);
      expect(find.text('२५'), findsOneWidget);
      expect(find.text('ऑक्टोबर'), findsOneWidget);
      expect(find.text('राजगड दुर्ग मोहीम व महाअधिवेशन'), findsOneWidget);
      expect(find.text('नोंदणी करा'), findsOneWidget);
      expect(find.byIcon(Icons.location_on_rounded), findsOneWidget);
      expect(find.byIcon(Icons.access_time_filled_rounded), findsOneWidget);
      expect(find.byIcon(Icons.groups_rounded), findsOneWidget);
    },
  );

  testWidgets(
    'HeritageScrollSection renders horizontal items with वाचा अधिक text link',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: HeritageScrollSection())),
      );

      expect(find.byType(HeritageScrollSection), findsOneWidget);
      expect(find.text('Explore Maratha Heritage'), findsOneWidget);
      expect(find.text('राजगड किल्ला'), findsOneWidget);
      expect(find.text('सिंहगड किल्ला'), findsOneWidget);
      expect(find.text('वाचा अधिक →'), findsWidgets);
    },
  );

  testWidgets(
    'CommunityActivityCard renders author, timestamp, post text and stats',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: CommunityActivityCard())),
      );

      expect(find.byType(CommunityActivityCard), findsOneWidget);
      expect(find.text('तानाजी सावंत'), findsOneWidget);
      expect(find.text('2 तासांपूर्वी'), findsOneWidget);
      expect(find.byIcon(Icons.favorite_rounded), findsOneWidget);
      expect(find.byIcon(Icons.chat_bubble_outline_rounded), findsOneWidget);
    },
  );

  testWidgets(
    'CustomBottomNavBar renders 5 items, compass icon and footer tagline, with no centre button',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(bottomNavigationBar: CustomBottomNavBar()),
        ),
      );

      expect(find.byType(CustomBottomNavBar), findsOneWidget);
      expect(find.text('होम'), findsOneWidget);
      expect(find.text('समुदाय'), findsOneWidget);
      expect(find.text('व्यवसाय'), findsOneWidget);
      expect(find.text('शोध'), findsOneWidget);
      expect(find.text('प्रोफाईल'), findsOneWidget);
      expect(find.byIcon(Icons.explore_outlined), findsOneWidget);
      expect(find.byIcon(Icons.fort_rounded), findsNothing);
      expect(find.text('|| जय शिवराय ||'), findsOneWidget);
    },
  );

  testWidgets('Full HomeScreen renders and scrolls without overflow errors', (
    tester,
  ) async {
    // Set typical phone screen dimensions
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.75;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith(
            (ref) => AuthController(LocalAuthRepository(AuthLocalDataSource())),
          ),
        ],
        child: const MaterialApp(home: HomeScreen()),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(HomeScreen), findsOneWidget);
    expect(find.byType(HomeHeader), findsOneWidget);
    expect(find.byType(HeroBanner), findsOneWidget);
    expect(find.byType(WarCryBanner), findsOneWidget);
    expect(find.byType(EmpireStatsStrip), findsOneWidget);
    expect(find.byType(MemberIdCard), findsOneWidget);
    expect(find.byType(QuickActionsGrid), findsOneWidget);
    expect(find.byType(AshtapradhanSection), findsOneWidget);
    expect(find.byType(FortArchitectureSection), findsOneWidget);
    expect(find.byType(CustomBottomNavBar), findsOneWidget);
    expect(find.text('|| जय शिवराय ||'), findsOneWidget);

    // Test scrolling down to reach Heritage, Navy, Decrees, Historians, Services and Community Activity sections
    await tester.drag(
      find.byType(SingleChildScrollView).first,
      const Offset(0, -900),
    );
    await tester.pumpAndSettle();

    // Sections ported from the website home page.
    expect(find.byType(FourPillarsSection), findsOneWidget);
    expect(find.byType(PortraitStrip), findsOneWidget);
    expect(find.byType(RajmudraSection), findsOneWidget);
    expect(find.byType(BhagwaFlagCard), findsOneWidget);
    expect(find.byType(MarathaEmpireSection), findsOneWidget);
    // The made-up sample event is no longer shown.
    expect(find.byType(UpcomingEventCard), findsNothing);
    expect(find.byType(HeritageScrollSection), findsOneWidget);
    expect(find.byType(GovernanceDecreeCard), findsOneWidget);
    expect(find.byType(MarathaNavyCard), findsOneWidget);

    await tester.drag(
      find.byType(SingleChildScrollView).first,
      const Offset(0, -900),
    );
    await tester.pumpAndSettle();

    expect(find.byType(HistoriansInsightsSection), findsOneWidget);
    expect(find.byType(CommunityServicesSection), findsOneWidget);
    expect(find.byType(PortalDirectory), findsOneWidget);
    expect(find.byType(JoinCommunityCard), findsOneWidget);
    // The sample post attributed to a made-up member is no longer shown.
    expect(find.byType(CommunityActivityCard), findsNothing);
  });
}
