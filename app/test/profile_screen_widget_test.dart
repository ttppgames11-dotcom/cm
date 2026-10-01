import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'helpers/local_auth_repository.dart';
import 'package:app/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

Widget createTestApp(AuthController authController) {
  return ProviderScope(
    overrides: [authControllerProvider.overrideWith((ref) => authController)],
    child: AuthScope(
      controller: authController,
      child: const MaterialApp(home: ProfileScreen()),
    ),
  );
}

void main() {
  testWidgets(
    'ProfileScreen renders header, user details, stats, and menu options matching mockup',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      SharedPreferences.setMockInitialValues({});
      final authController = AuthController(
        LocalAuthRepository(AuthLocalDataSource()),
      );
      await tester.runAsync(authController.loginWithDemoAccount);

      await tester.pumpWidget(createTestApp(authController));
      await tester.pumpAndSettle();

      // 1. Verify Top Header & Back Button
      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
      expect(find.text('माझे प्रोफाइल'), findsOneWidget);
      expect(find.text('Connect मराठा परिवाराचा एक भाग'), findsOneWidget);
      expect(find.text('" स्वराज्य\nहेच आमची\nओळख "'), findsOneWidget);

      // 2. Verify the signed-in member's own details
      expect(find.text('संजय शिवाजी पाटील'), findsOneWidget);
      expect(find.text('सदस्य (General Member)'), findsOneWidget);
      expect(find.text('Member ID : CM12345678'), findsOneWidget);
      expect(find.text('9876543210'), findsOneWidget);
      expect(find.text('पुणे'), findsOneWidget);
      expect(find.text('प्रोफाईल संपादित करा'), findsOneWidget);
      // Nobody else's contact details are ever shown as a placeholder.
      expect(find.textContaining('abhaygond'), findsNothing);

      // 3. No stats strip: nothing counts visits or events yet, so the app
      // must not show a row of zeros as if it were the member's activity.
      expect(find.text('0'), findsNothing);
      expect(find.textContaining('भेट दिली'), findsNothing);

      // 4. Verify 8 Menu Items
      expect(find.text('वैयक्तिक माहिती'), findsOneWidget);
      expect(find.text('सुरक्षा आणि गोपनीयता'), findsOneWidget);
      expect(find.text('माझे समुदाय'), findsOneWidget);
      expect(find.text('माझे कार्यक्रम'), findsOneWidget);
      expect(find.text('जतन केलेले'), findsOneWidget);
      expect(find.text('सूचना'), findsOneWidget);
      expect(find.text('मदत आणि समर्थन'), findsOneWidget);
      expect(find.text('अ‍ॅप विषयी'), findsOneWidget);

      // 5. Verify Logout Button
      expect(find.text('लॉगआउट करा'), findsOneWidget);
    },
  );

  testWidgets('Tapping back button triggers onBack callback', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    bool backPressed = false;
    final authController = AuthController(
      LocalAuthRepository(AuthLocalDataSource()),
    );
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith((ref) => authController),
        ],
        child: AuthScope(
          controller: authController,
          child: MaterialApp(
            home: ProfileScreen(onBack: () => backPressed = true),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final backBtn = find.byIcon(Icons.arrow_back_rounded);
    expect(backBtn, findsOneWidget);
    await tester.tap(backBtn);
    await tester.pumpAndSettle();

    expect(backPressed, isTrue);
  });

  testWidgets('Tapping logout button opens confirmation dialog', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(AuthController(LocalAuthRepository(AuthLocalDataSource()))),
    );
    await tester.pumpAndSettle();

    final logoutBtn = find.text('लॉगआउट करा');
    await tester.ensureVisible(logoutBtn);
    await tester.pumpAndSettle();
    await tester.tap(logoutBtn);
    await tester.pumpAndSettle();

    expect(find.text('लॉगआउट करू इच्छिता?'), findsOneWidget);
    expect(
      find.text('तुम्ही नक्की आपल्या खात्यामधून बाहेर पडू इच्छिता का?'),
      findsOneWidget,
    );
    expect(find.text('रद्द करा'), findsOneWidget);
  });
}
