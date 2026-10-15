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
import '../../features/business/data/manufacturers_data.dart';
import '../../features/business/models/business_models.dart';
import '../../features/business/screens/add_business_screen.dart';
import '../../features/business/screens/business_detail_screen.dart';
import '../../features/business/screens/business_directory_screen.dart';
import '../../features/business/screens/business_hub_screen.dart';
import '../../features/business/screens/business_sangam_screen.dart';
import '../../features/business/dairy/presentation/screens/dairy_screen.dart';
import '../../features/business/screens/simple_directory_screen.dart';
import '../../features/business/referrals/domain/models/referral.dart';
import '../../features/business/referrals/presentation/screens/create_referral_screen.dart';
import '../../features/business/referrals/presentation/screens/referral_detail_screen.dart';
import '../../features/business/referrals/presentation/screens/referral_tracker_screen.dart';
import '../../features/business/meetings/presentation/screens/meetings_list_screen.dart';
import '../../features/business/meetings/presentation/screens/request_meeting_screen.dart';
import '../../features/business/builders/presentation/screens/builders_list_screen.dart';
import '../../features/business/builders/presentation/screens/builder_detail_screen.dart';
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
import '../../features/community/screens/samaj_sadasya_screen.dart';
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

const _publicPaths = {'/login', '/register', '/forgot-password'};

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
        builder: (context, state) {
          final refCode = state.uri.queryParameters['ref'] ??
              state.uri.queryParameters['reference_id'] ??
              state.uri.queryParameters['code'] ??
              state.extra as String?;
          return RegisterScreen(initialReferralCode: refCode);
        },
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/community',
        builder: (context, state) => const SamajSadasyaScreen(),
      ),
      GoRoute(
        path: '/community/feed',
        builder: (context, state) => const CommunityScreen(),
      ),
      GoRoute(
        path: '/members',
        builder: (context, state) => const SamajSadasyaScreen(),
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
                          'नोंदवण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'व्यवसाय नोंदणी / Business listing',
                      bottomNavIndex: 2,
                    ),
      ),
      GoRoute(
        path: '/business/hub',
        builder: (context, state) => const BusinessHubScreen(),
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
                      bottomNavIndex: 2,
                    ),
      ),
      GoRoute(
        path: '/business/dairy',
        builder: (context, state) => const DairyScreen(),
      ),
      GoRoute(
        path: '/business/builders',
        builder:
            (context, state) =>
                ApiConfig.demoMode
                    ? const BuildersListScreen()
                    : const NothingListedScreen(
                      title: 'मराठा बिल्डर्स व डेव्हलपर्स',
                      icon: Icons.apartment_rounded,
                      message:
                          'समाजातील अधिकृत बांधकाम व्यावसायिक व प्रकल्प येथे दिसतील. '
                          'तुमचा प्रकल्प नोंदवण्यासाठी आम्हाला लिहा.',
                      contactSubject: 'बिल्डर प्रकल्प नोंदणी / Builder listing',
                      bottomNavIndex: 2,
                    ),
      ),
      GoRoute(
        path: '/business/builders/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ApiConfig.demoMode
              ? BuilderDetailScreen(builderId: id)
              : const NothingListedScreen(
                title: 'मराठा बिल्डर्स व डेव्हलपर्स',
                icon: Icons.apartment_rounded,
                message:
                    'समाजातील अधिकृत बांधकाम व्यावसायिक व प्रकल्प येथे दिसतील.',
                contactSubject: 'बिल्डर प्रकल्प नोंदणी / Builder listing',
              );
        },
      ),
      GoRoute(
        path: '/business/add',
        builder: (context, state) => AddBusinessScreen(
          initialBusiness: state.extra as Business?,
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
                      bottomNavIndex: 2,
                    ),
      ),
      GoRoute(
        path: '/business/referrals',
        builder: (context, state) => const ReferralTrackerScreen(),
      ),
      GoRoute(
        path: '/business/referrals/new',
        builder: (context, state) => const CreateReferralScreen(),
      ),
      GoRoute(
        path: '/business/referrals/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          final referral = state.extra as Referral?;
          return ReferralDetailScreen(
            referralId: id,
            initialReferral: referral,
          );
        },
      ),
      GoRoute(
        path: '/business/meetings',
        builder: (context, state) => const MeetingsListScreen(),
      ),
      GoRoute(
        path: '/business/meetings/new',
        builder: (context, state) => const RequestMeetingScreen(),
      ),
      GoRoute(
        path: '/business/:id',
        builder: (context, state) => BusinessDetailScreen(
          businessId: state.pathParameters['id']!,
          initialBusiness: state.extra as Business?,
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
                      bottomNavIndex: 4,
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
        path: '/post',
        builder: (context, state) {
          final id = state.uri.queryParameters['id'] ?? '';
          return PostDetailScreen(postId: id);
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
          return SearchScreen(initialQuery: query, showBottomNav: true);
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

      // Splash screen handles its own transition based on AuthStatus:
      if (location == '/splash') return null;

      // Terms & guidelines must be readable before registering and after.
      if (location == '/guidelines') return null;

      // Builders directory and details are public:
      if (location.startsWith('/business/builders')) return null;

      // Dairy directory and tabs are public:
      if (location.startsWith('/business/dairy')) return null;

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

      // Protected pages: /home, /profile, /heritage, /fort/*, /warrior/*, /business/referrals/*
      if (status == AuthStatus.unauthenticated || status == AuthStatus.error) {
        // A shared-post or referral link opened while signed out: log in first, then
        // continue to that route.
        if (location.startsWith('/post/') ||
            location.startsWith('/business/referrals') ||
            location.startsWith('/business/meetings')) {
          rememberDeepLink(state.uri.toString());
        }
        return '/login';
      }

      return null;
    },
  );
}
