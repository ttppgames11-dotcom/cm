import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/models/user_role.dart';
import 'package:app/features/auth/repositories/auth_repository.dart';
import 'helpers/local_auth_repository.dart';
import 'package:app/features/auth/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Repository double whose login fails with a chosen backend error code.
class _FailingLoginRepository extends LocalAuthRepository {
  _FailingLoginRepository(super.local, this.code, this.message);
  final String code;
  final String message;

  @override
  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async => throw AuthException(message, code: code);
}

Widget createTestApp({AuthRepository? repository}) {
  final authController = AuthController(
    repository ?? LocalAuthRepository(AuthLocalDataSource()),
  );
  return ProviderScope(
    overrides: [authControllerProvider.overrideWith((ref) => authController)],
    child: AuthScope(
      controller: authController,
      child: const MaterialApp(home: LoginScreen()),
    ),
  );
}

void main() {
  testWidgets(
    'LoginScreen renders all header, branding, card elements and fields matching redesign',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      // 1. Verify Centered Hero Header
      expect(find.text('" स्वराज्य हेच आमची ओळख "'), findsOneWidget);
      expect(find.text('आधुनिक युगातील आधुनिक संघटन'), findsOneWidget);

      // 2. Verify Main Login Card Headline & Subtitle
      expect(find.text('आपल्या खात्यात '), findsOneWidget);
      expect(find.text('प्रवेश करा'), findsOneWidget);
      expect(find.text('समाजाचे अधिकृत डिजिटल व्यासपीठ'), findsOneWidget);

      // 3. Verify Field Labels (role dropdown removed in redesign)
      expect(find.text('मोबाईल, ईमेल किंवा सदस्य ID'), findsOneWidget);
      expect(find.text('पासवर्ड'), findsOneWidget);
      // No demo/fake-login affordances in production
      expect(find.text('DEMO'), findsNothing);
      expect(find.textContaining('OTP'), findsNothing);
      // Role dropdown is intentionally removed
      expect(find.text('प्रवेश प्रकार (Role)'), findsNothing);
      // Remember Me is intentionally removed
      expect(find.text('मला आठवणीत ठेवा'), findsNothing);

      // 4. Verify Action Buttons
      expect(find.text('पासवर्ड विसरलात?'), findsOneWidget);
      expect(find.text('लॉगिन करा'), findsOneWidget);
      // One "or" divider inside the card; the second one belongs to the
      // Google button, which is hidden in builds without a Google client ID.
      expect(find.text('किंवा'), findsOneWidget);
      expect(find.textContaining('Google'), findsNothing);

      // 5. Verify Registration Callout Box
      expect(find.text('नवीन सदस्य आहात?'), findsOneWidget);
      expect(find.text('नोंदणी करा'), findsOneWidget);

      // 6. Verify Guest Preview button
      expect(find.text('पाहुणे म्हणून पाहा'), findsOneWidget);
      expect(find.text('Guest Preview — नोंदणीशिवाय'), findsOneWidget);
    },
  );

  testWidgets('LoginScreen password visibility toggle works', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createTestApp());
    await tester.pumpAndSettle();

    // Initially showing visibility_outlined (eye open = can see hint to toggle)
    final visibilityBtn = find.byIcon(Icons.visibility_outlined);
    expect(visibilityBtn, findsOneWidget);

    await tester.tap(visibilityBtn);
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
  });

  testWidgets('LoginScreen shows inline errors on empty submit', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createTestApp());
    await tester.pumpAndSettle();

    // Tap login with empty fields
    await tester.tap(find.text('लॉगिन करा'));
    await tester.pumpAndSettle();

    // Inline errors should appear
    expect(find.text('कृपया मोबाईल, ईमेल किंवा सदस्य ID टाका'), findsOneWidget);
    expect(find.text('कृपया पासवर्ड टाका'), findsOneWidget);
  });

  testWidgets('LoginScreen shows the register popup when the user is not in the database', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(
        repository: _FailingLoginRepository(
          AuthLocalDataSource(),
          'USER_NOT_FOUND',
          'वापरकर्त्याची माहिती आढळली नाही. कृपया नोंदणी करा.',
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).at(0), 'nobody@example.com');
    await tester.enterText(find.byType(TextFormField).at(1), 'whatever123');
    await tester.tap(find.text('लॉगिन करा'));
    await tester.pumpAndSettle();

    expect(find.text('वापरकर्ता आढळला नाही'), findsOneWidget);
    expect(find.textContaining('No account found'), findsOneWidget);
    expect(find.text('नोंदणी करा →'), findsOneWidget);
  });

  testWidgets('LoginScreen shows an inline error (no popup) for a wrong password', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(
        repository: _FailingLoginRepository(
          AuthLocalDataSource(),
          'INVALID_PASSWORD',
          'अवैध संकेतशब्द (Incorrect password).',
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextFormField).at(0), 'M1001');
    await tester.enterText(find.byType(TextFormField).at(1), 'wrong-pass');
    await tester.tap(find.text('लॉगिन करा'));
    await tester.pumpAndSettle();

    expect(find.text('अवैध संकेतशब्द (Incorrect password).'), findsOneWidget);
    expect(find.text('वापरकर्ता आढळला नाही'), findsNothing);
  });
}
