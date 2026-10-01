// The auth flows through the REAL app router (routerProvider + MainApp), the
// way a Play Store install runs them. The screen-level tests open
// LoginScreen / RegisterScreen directly and so cannot see router problems —
// that is how "every login sends the app back to the loading screen" (Play
// rejection: Broken functionality, 29 Sep 2026) went unnoticed.
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/models/user_role.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/repositories/auth_repository.dart';
import 'package:app/features/auth/screens/login_screen.dart';
import 'package:app/features/auth/screens/register_screen.dart';
import 'package:app/features/community/providers/community_provider.dart';
import 'package:app/features/community/repositories/demo_community_repository.dart';
import 'package:app/features/splash/splash_screen.dart';
import 'package:app/main.dart';
import 'package:app/screens/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

class _UnknownUserRepository extends LocalAuthRepository {
  _UnknownUserRepository(super.local);

  @override
  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async =>
      throw AuthException(
        'वापरकर्त्याची माहिती आढळली नाही. कृपया नोंदणी करा.',
        code: 'USER_NOT_FOUND',
      );
}

/// Starts the whole app and waits for the splash to hand over to /login.
Future<void> _launch(WidgetTester tester, AuthRepository repository) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});

  final auth = AuthController(repository);
  auth.restoreSession();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(repository),
        authControllerProvider.overrideWith((ref) => auth),
        communityRepositoryProvider.overrideWithValue(
          DemoCommunityRepository(ApiClient(SecureTokenStore())),
        ),
      ],
      child: MainApp(authController: auth),
    ),
  );
  expect(find.byType(SplashScreen), findsOneWidget);
  await tester.pump(const Duration(seconds: 4));
  await tester.pumpAndSettle();
  expect(find.byType(LoginScreen), findsOneWidget);
  expect(find.byType(SplashScreen), findsNothing);
}

Future<void> _submitLogin(WidgetTester tester) async {
  await tester.enterText(find.byType(TextFormField).at(0), 'nobody@example.com');
  await tester.enterText(find.byType(TextFormField).at(1), 'whatever123');
  await tester.ensureVisible(find.text('लॉगिन करा'));
  await tester.tap(find.text('लॉगिन करा'));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 500));
}

void main() {
  testWidgets(
    'a failed login stays on the login screen and shows why (no loading loop)',
    (tester) async {
      await _launch(tester, _UnknownUserRepository(AuthLocalDataSource()));
      await _submitLogin(tester);

      // Never back to the loading screen...
      expect(find.byType(SplashScreen), findsNothing);
      // ...the member stays on login, with what they typed and a clear reason.
      expect(find.byType(LoginScreen), findsOneWidget);
      expect(find.text('nobody@example.com'), findsOneWidget);
      expect(find.text('वापरकर्ता आढळला नाही'), findsOneWidget);
      expect(find.textContaining('No account found'), findsOneWidget);
    },
  );

  testWidgets('a successful login goes straight to Home (no second splash)', (
    tester,
  ) async {
    await _launch(tester, LocalAuthRepository(AuthLocalDataSource()));
    await _submitLogin(tester);

    expect(find.byType(SplashScreen), findsNothing);
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(HomeScreen), findsOneWidget);
    expect(find.byType(SplashScreen), findsNothing);
    // Let Home's carousel / animation timers finish so the test ends cleanly.
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(seconds: 10));
  });

  testWidgets(
    'registration ends on its own success page with the member ID',
    (tester) async {
      await _launch(tester, LocalAuthRepository(AuthLocalDataSource()));
      await tester.ensureVisible(find.text('नोंदणी करा'));
      await tester.tap(find.text('नोंदणी करा'));
      await tester.pumpAndSettle();
      expect(find.byType(RegisterScreen), findsOneWidget);

      await tester.enterText(find.byType(TextField).at(0), 'सुरेश पाटील');
      await tester.enterText(find.byType(TextField).at(1), '9876543210');
      await tester.enterText(find.byType(TextField).at(3), 'swarajya123');
      await tester.tap(find.byType(CheckboxListTile));
      await tester.pumpAndSettle();
      await tester.tap(find.text('पुढे → / Next'));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('नोंदणी पूर्ण करा / Finish'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('नोंदणी पूर्ण करा / Finish'));
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));

      expect(find.byType(SplashScreen), findsNothing);
      expect(find.byType(RegisterScreen), findsOneWidget);
      expect(find.textContaining('Registration Completed!'), findsOneWidget);
      expect(find.textContaining('Member ID: CM'), findsOneWidget);

      // ...and its button opens Home.
      await tester.ensureVisible(find.textContaining('Go to Dashboard'));
      await tester.tap(find.textContaining('Go to Dashboard'));
      await tester.pump();
      await tester.pump(const Duration(seconds: 1));
      expect(find.byType(HomeScreen), findsOneWidget);
      expect(find.byType(SplashScreen), findsNothing);
      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(seconds: 10));
    },
  );
}
