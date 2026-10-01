import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:sentry_flutter/sentry_flutter.dart';

import '../config/api_config.dart';
import '../diagnostics/error_reporter.dart';
import 'route_state.dart';
import '../../features/community/screens/post_detail_screen.dart';
import '../../features/auth/auth_controller.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/business/data/builders_data.dart';
import '../../features/business/data/manufacturers_data.dart';
import '../../features/business/screens/business_directory_screen.dart';
import '../../features/business/screens/business_hub_screen.dart';
import '../../features/business/screens/business_sangam_screen.dart';
import '../../features/business/screens/maratha_dairy_screen.dart';
import '../../features/business/screens/simple_directory_screen.dart';
import '../../features/about/screens/about_organisation_screen.dart';
import '../../features/about/screens/community_guidelines_screen.dart';
import '../../features/culture/screens/agri_koli_screen.dart';
import '../../features/culture/screens/books_screen.dart';
import '../../features/culture/screens/culture_hub_screen.dart';
import '../../features/culture/screens/dialects_screen.dart';
import '../../features/culture/screens/films_screen.dart';
import '../../features/culture/screens/food_culture_screen.dart';
import '../../features/culture/screens/gramdevat_jatra_screen.dart';
import '../../features/culture/screens/heritage_places_screen.dart';
import '../../features/culture/screens/shivkal_festivals_screen.dart';
import '../../features/culture/screens/symbols_screen.dart';
import '../../features/culture/screens/temples_screen.dart';
import '../../features/guest/guest_preview_screen.dart';
import '../../features/history/screens/balidan_maas_screen.dart';
import '../../features/history/screens/battles_screen.dart';
import '../../features/history/screens/dnyankosh_screen.dart';
import '../../features/history/screens/granthalaya_screen.dart';
import '../../features/history/screens/heritage_trails_screen.dart';
import '../../features/history/screens/historical_dates_screen.dart';
import '../../features/history/screens/history_hub_screen.dart';
import '../../features/history/screens/history_quiz_screen.dart';
import '../../features/history/screens/knowledge_graph_screen.dart';
import '../../features/history/screens/maratha_navy_screen.dart';
import '../../features/history/screens/movements_screen.dart';
import '../../features/history/screens/swarajya_admin_screen.dart';
import '../../features/history/screens/warriors_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/community/screens/community_screen.dart';
import '../../features/profile/screens/about_app_screen.dart';
import '../../features/profile/screens/help_support_screen.dart';
import '../../features/profile/screens/my_events_screen.dart';
import '../../features/profile/screens/notifications_screen.dart';
import '../../features/profile/screens/personal_info_screen.dart';
import '../../features/profile/screens/saved_items_screen.dart';
import '../../features/profile/screens/security_privacy_screen.dart';
import '../../features/network/screens/maharashtra_network_screen.dart';
import '../../screens/fort_detail_screen.dart';
import '../../screens/heritage_list_screen.dart';
import '../../screens/home_screen.dart';
import '../../screens/profile_screen.dart';
import '../../shared/widgets/nothing_listed_screen.dart';
import '../../screens/search_screen.dart';
import '../../screens/warrior_detail_screen.dart';

const _publicPaths = {'/login', '/register', '/forgot-password', '/guest'};

/// Riverpod provider for the application [GoRouter], built from the same
/// app-wide [AuthController] instance the auth screens use via `AuthScope`
/// (see [authControllerProvider]) — so the router's redirect logic and the
/// login/register/logout flows always agree on the current session state.
///
/// The controller is READ, not watched: it is a ChangeNotifier, so watching it
/// would rebuild this provider — and create a brand-new router that starts at
/// `/splash` again — on every auth change (busy, failed login, logged in).
/// The router already follows auth changes through `refreshListenable`.
final routerProvider = Provider<GoRouter>((ref) {
  final authController = ref.read(authControllerProvider);
  return buildAppRouter(authController);
});

/// Builder for GoRouter driven by a single [AuthController].
GoRouter buildAppRouter(AuthController authController) {
  return buildAppRouterWithAuth(
    refreshListenable: authController,
    getStatus: () => authController.state.status,
  );
}

/// Unified builder for GoRouter with flexible auth listenable and status supplier.
GoRouter buildAppRouterWithAuth({
  required Listenable refreshListenable,
  required AuthStatus Function() getStatus,
}) {
  return GoRouter(
    initialLocation: '/splash',
    // Screen names in crash reports (which screen the member was on).
    observers: [if (crashReportingEnabled) SentryNavigatorObserver()],
    refreshListenable: refreshListenable,
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/guest',
        builder: (context, state) => const GuestPreviewScreen(),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/community',
        builder: (context, state) => const CommunityScreen(),
      ),
      GoRoute(
        path: '/business',
        builder: (context, state) => const BusinessHubScreen(),
      ),
      GoRoute(
        path: '/business/directory',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? const BusinessDirectoryScreen()
                    : const NothingListedScreen(
                      title: 'व्यवसाय निर्देशिका',
                      icon: Icons.storefront_rounded,
                      message:
                          'समाजबांधवांचे व्यवसाय येथे दिसतील. तुमचा व्यवसाय '
                          'जोडण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'व्यवसाय नोंदणी / Business listing',
                    ),
      ),
      GoRoute(
        path: '/business/sangam',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? const BusinessSangamScreen()
                    : const NothingListedScreen(
                      title: 'व्यवसाय संगम',
                      icon: Icons.handshake_rounded,
                      message:
                          'स्थानिक व्यवसाय मंडळे (Chapters) सुरू झाल्यावर येथे '
                          'दिसतील. तुमच्या शहरात मंडळ सुरू करण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'व्यवसाय संगम / Business chapter',
                    ),
      ),
      GoRoute(
        path: '/business/dairy',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? const MarathaDairyScreen()
                    : const NothingListedScreen(
                      title: 'दूध व संकलन केंद्र',
                      icon: Icons.water_drop_rounded,
                      message:
                          'समाजातील दुग्धव्यवसाय व संकलन केंद्रे येथे दिसतील. '
                          'तुमचे केंद्र जोडण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'दुग्धव्यवसाय नोंदणी / Dairy listing',
                    ),
      ),
      GoRoute(
        path: '/business/builders',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? SimpleDirectoryScreen(config: buildersDirectoryConfig)
                    : const NothingListedScreen(
                      title: 'बिल्डर्स व डेव्हलपर्स',
                      icon: Icons.apartment_rounded,
                      message:
                          'समाजातील बांधकाम व्यावसायिक येथे दिसतील. तुमची संस्था '
                          'जोडण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'बिल्डर नोंदणी / Builder listing',
                    ),
      ),
      GoRoute(
        path: '/business/manufacturers',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? SimpleDirectoryScreen(
                      config: manufacturersDirectoryConfig,
                    )
                    : const NothingListedScreen(
                      title: 'मराठा मॅन्युफॅक्चरर्स',
                      icon: Icons.precision_manufacturing_rounded,
                      message:
                          'समाजातील उत्पादक व उद्योग येथे दिसतील. तुमचा उद्योग '
                          'जोडण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'उत्पादक नोंदणी / Manufacturer listing',
                    ),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/profile/personal-info',
        builder: (context, state) => const PersonalInfoScreen(),
      ),
      GoRoute(
        path: '/profile/security',
        builder: (context, state) => const SecurityPrivacyScreen(),
      ),
      GoRoute(
        path: '/profile/events',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? const MyEventsScreen()
                    : const NothingListedScreen(
                      title: 'माझे कार्यक्रम',
                      icon: Icons.event_available_rounded,
                      message:
                          'तुम्ही नोंदणी केलेले कार्यक्रम येथे दिसतील. सध्या '
                          'कोणताही कार्यक्रम जाहीर झालेला नाही.',
                    ),
      ),
      GoRoute(
        path: '/profile/saved',
        builder: (context, state) => const SavedItemsScreen(),
      ),
      GoRoute(
        path: '/profile/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/profile/help',
        builder: (context, state) => const HelpSupportScreen(),
      ),
      GoRoute(
        path: '/profile/about',
        builder: (context, state) => const AboutAppScreen(),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const HistoryHubScreen(),
      ),
      GoRoute(
        path: '/history/battles',
        builder: (context, state) => const BattlesScreen(),
      ),
      GoRoute(
        path: '/history/warriors',
        builder: (context, state) => const WarriorsScreen(),
      ),
      GoRoute(
        path: '/history/navy',
        builder: (context, state) => const MarathaNavyScreen(),
      ),
      GoRoute(
        path: '/history/balidan-maas',
        builder: (context, state) => const BalidanMaasScreen(),
      ),
      GoRoute(
        path: '/history/dates',
        builder: (context, state) => const HistoricalDatesScreen(),
      ),
      GoRoute(
        path: '/history/dnyankosh',
        builder: (context, state) => const DnyankoshScreen(),
      ),
      GoRoute(
        path: '/history/granthalaya',
        builder: (context, state) => const GranthalayaScreen(),
      ),
      GoRoute(
        path: '/history/swarajya-administration',
        builder: (context, state) => const SwarajyaAdminScreen(),
      ),
      GoRoute(
        path: '/history/movements',
        builder: (context, state) => const MovementsScreen(),
      ),
      GoRoute(
        path: '/history/knowledge-graph',
        builder: (context, state) => const KnowledgeGraphScreen(),
      ),
      GoRoute(
        path: '/history/trails',
        builder: (context, state) => const HeritageTrailsScreen(),
      ),
      GoRoute(
        path: '/history/quiz',
        builder: (context, state) => const HistoryQuizScreen(),
      ),
      GoRoute(
        path: '/about',
        builder: (context, state) => const AboutOrganisationScreen(),
      ),
      GoRoute(
        path: '/guidelines',
        builder: (context, state) => const CommunityGuidelinesScreen(),
      ),
      GoRoute(
        path: '/culture',
        builder: (context, state) => const CultureHubScreen(),
      ),
      GoRoute(
        path: '/culture/shivkal-festivals',
        builder: (context, state) => const ShivkalFestivalsScreen(),
      ),
      GoRoute(
        path: '/culture/agri-koli',
        builder: (context, state) => const AgriKoliScreen(),
      ),
      GoRoute(
        path: '/culture/food',
        builder: (context, state) => const FoodCultureScreen(),
      ),
      GoRoute(
        path: '/culture/dialects',
        builder: (context, state) => const DialectsScreen(),
      ),
      GoRoute(
        path: '/culture/gramdevat',
        builder: (context, state) => const GramdevatJatraScreen(),
      ),
      GoRoute(
        path: '/culture/heritage-places',
        builder: (context, state) => const HeritagePlacesScreen(),
      ),
      GoRoute(
        path: '/culture/temples',
        builder: (context, state) => const TemplesScreen(),
      ),
      GoRoute(
        path: '/culture/symbols',
        builder: (context, state) => const SymbolsScreen(),
      ),
      GoRoute(
        path: '/culture/books',
        builder: (context, state) => const BooksScreen(),
      ),
      GoRoute(
        path: '/culture/films',
        builder: (context, state) => const FilmsScreen(),
      ),
      GoRoute(
        path: '/heritage',
        builder: (context, state) => const HeritageListScreen(),
      ),
      GoRoute(
        path: '/fort/:id',
        builder: (context, state) {
          final fortId = state.pathParameters['id'] ?? 'rajgad';
          return FortDetailScreen(fortId: fortId);
        },
      ),
      GoRoute(
        path: '/fort-detail',
        builder: (context, state) => const FortDetailScreen(fortId: 'rajgad'),
      ),
      GoRoute(
        path: '/warrior/:id',
        builder: (context, state) {
          final warriorId = state.pathParameters['id'] ?? 'shivaji';
          return WarriorDetailScreen(warriorId: warriorId);
        },
      ),
      GoRoute(
        path: '/post/:id',
        builder:
            (context, state) =>
                PostDetailScreen(postId: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) {
          final query = state.uri.queryParameters['q'] ?? '';
          return SearchScreen(initialQuery: query);
        },
      ),
      GoRoute(
        path: '/network',
        builder: (context, state) {
          final sectionStr = state.uri.queryParameters['section'];
          final section = int.tryParse(sectionStr ?? '') ?? 0;
          return MaharashtraNetworkScreen(initialSectionIndex: section);
        },
      ),
    ],
    redirect: (context, state) {
      final location = state.matchedLocation;
      final status = getStatus();

      // Splash is always allowed — it handles its own navigation after 3 s.
      if (location == '/splash') return null;

      // Terms & guidelines must be readable before registering and after.
      if (location == '/guidelines') return null;

      // Public auth pages are always accessible when unauthenticated.
      if (_publicPaths.contains(location)) {
        // Already logged in → bounce to home, unless a member who has just
        // signed up is still reading their success page.
        if (status == AuthStatus.authenticated &&
            !registrationSuccessOnScreen) {
          return '/home';
        }
        return null;
      }

      // Protected pages: /home, /profile, /heritage, /fort/*, /warrior/*
      // Unknown status means session restore is still in flight — allow
      // through; the splash timer guards the cold-launch path.
      if (status == AuthStatus.unauthenticated) {
        // A shared-post link opened while signed out: log in first, then
        // continue to that post.
        if (location.startsWith('/post/')) rememberDeepLink(location);
        return '/login';
      }

      return null;
    },
  );
}
