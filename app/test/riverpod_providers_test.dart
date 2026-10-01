import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/providers/current_user_provider.dart';
import 'helpers/local_auth_repository.dart';
import 'package:app/features/heritage/providers/heritage_provider.dart';
import 'package:app/features/home/providers/business_provider.dart';
import 'package:app/features/home/providers/community_provider.dart';
import 'package:app/features/home/providers/events_provider.dart';
import 'package:app/features/home/providers/home_provider.dart';
import 'package:app/features/profile/providers/profile_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  // Every container needs [authControllerProvider] overridden — mirroring
  // how `main.dart` wires the real app — since providers like
  // `currentUserProvider` read through it. Tests that care about auth state
  // pass their own controller; others get a fresh, unused one.
  ProviderContainer testContainer([AuthController? controller]) {
    final container = ProviderContainer(
      overrides: [
        authControllerProvider.overrideWith(
          (ref) =>
              controller ??
              AuthController(LocalAuthRepository(AuthLocalDataSource())),
        ),
      ],
    );
    addTearDown(container.dispose);
    return container;
  }

  group('Riverpod Auth Providers', () {
    test(
      'initial auth state starts unknown/loading and restores session',
      () async {
        final controller = AuthController(
          LocalAuthRepository(AuthLocalDataSource()),
        );
        final container = testContainer(controller);

        expect(controller.state.status, AuthStatus.unknown);

        await controller.restoreSession();
        expect(controller.state.status, AuthStatus.unauthenticated);
        expect(container.read(currentUserProvider), isNull);
      },
    );

    test(
      'loginWithDemoAccount authenticates and updates currentUserProvider',
      () async {
        final controller = AuthController(
          LocalAuthRepository(AuthLocalDataSource()),
        );
        final container = testContainer(controller);

        final success = await controller.loginWithDemoAccount();
        expect(success, isTrue);
        expect(controller.state.isAuthenticated, isTrue);
        expect(controller.state.profile, isNotNull);

        final currentUser = container.read(currentUserProvider);
        expect(currentUser, isNotNull);
        expect(currentUser!.name, 'संजय शिवाजी पाटील');
      },
    );

    test('logout clears auth and reset currentUserProvider to null', () async {
      final controller = AuthController(
        LocalAuthRepository(AuthLocalDataSource()),
      );
      final container = testContainer(controller);

      await controller.loginWithDemoAccount();
      expect(container.read(currentUserProvider), isNotNull);

      await controller.logout();
      expect(controller.state.status, AuthStatus.unauthenticated);
      expect(container.read(currentUserProvider), isNull);
    });
  });

  group('Riverpod Home & Feature Providers', () {
    test('homeProvider loads complete dashboard state', () async {
      final container = testContainer();

      final dashboard = await container.read(homeProvider.future);
      expect(dashboard.heroBanner.quote, contains('हे राज्य व्हावे'));
      expect(dashboard.quickActions.length, greaterThanOrEqualTo(4));
      expect(dashboard.upcomingEvent.id, 'event-rajgad-2026');
      expect(dashboard.heritageHighlights.isNotEmpty, isTrue);
      expect(dashboard.communityActivity.id, 'post-1');
    });

    test('eventsProvider returns list of events', () async {
      final container = testContainer();

      final events = await container.read(eventsProvider.future);
      expect(events.length, greaterThanOrEqualTo(2));
    });

    test('communityProvider returns list of community posts', () async {
      final container = testContainer();

      final posts = await container.read(communityProvider.future);
      expect(posts.isNotEmpty, isTrue);
    });

    test('businessProvider returns list of businesses', () {
      final container = testContainer();

      final businesses = container.read(businessProvider);
      expect(businesses.length, 3);
      expect(businesses.first.name, 'स्वराज्य ॲग्रो प्रॉडक्ट्स');
    });

    test(
      'profileProvider returns profile data with defaults or authenticated user',
      () {
        final container = testContainer();

        // Signed out: no placeholder identity, stats start at zero.
        final profileData = container.read(profileProvider);
        expect(profileData.user.name, isEmpty);
        expect(profileData.email, isEmpty);
        expect(profileData.fortsVisited, 0);
        expect(profileData.communityRank, 0);
        expect(profileData.contributionScore, 0);
      },
    );

    test('heritageProvider returns both forts and warriors', () async {
      final container = testContainer();

      final heritage = await container.read(heritageProvider.future);
      expect(heritage.forts.isNotEmpty, isTrue);
      expect(heritage.warriors.isNotEmpty, isTrue);

      final rajgad = await container.read(fortDetailProvider('rajgad').future);
      expect(rajgad, isNotNull);
      expect(rajgad!.name, contains('राजगड'));

      final shivaji = await container.read(
        warriorDetailProvider('shivaji').future,
      );
      expect(shivaji, isNotNull);
      expect(shivaji!.name, contains('शिवाजी महाराज'));
    });
  });
}
