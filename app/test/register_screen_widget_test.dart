import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/providers/location_provider.dart';
import 'package:app/features/auth/screens/register_screen.dart';
import 'helpers/local_auth_repository.dart';
import 'helpers/test_location_repository.dart';

Widget createTestRegisterApp() {
  SharedPreferences.setMockInitialValues({});
  final authController = AuthController(
    LocalAuthRepository(AuthLocalDataSource()),
  );
  return ProviderScope(
    overrides: [
      authControllerProvider.overrideWith((ref) => authController),
      locationRepositoryProvider.overrideWithValue(TestLocationRepository()),
    ],
    child: AuthScope(
      controller: authController,
      child: const MaterialApp(home: RegisterScreen()),
    ),
  );
}

void main() {
  testWidgets(
    'RegisterScreen: profile form with 5-level location hierarchy and finish',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(createTestRegisterApp());
      await tester.pumpAndSettle();

      // Verify Step 0 Basic Screen
      expect(find.text('नोंदणी करा / Create Account'), findsOneWidget);
      expect(
        find.byType(TextField),
        findsNWidgets(4),
      ); // Name, Mobile, Email, Password

      // Fill Step 0 fields
      await tester.enterText(find.byType(TextField).at(0), 'छत्रपती विचार मंच');
      await tester.enterText(find.byType(TextField).at(1), '9876543210');
      await tester.enterText(
        find.byType(TextField).at(2),
        'shivaji@maratha.org',
      );
      await tester.enterText(find.byType(TextField).at(3), 'swarajya123');

      // Agree to guidelines
      await tester.tap(find.byType(CheckboxListTile));
      await tester.pumpAndSettle();

      // Proceed to Step 1 (Profile Form)
      await tester.tap(find.text('पुढे → / Next'));
      await tester.pumpAndSettle();

      // Verify Step 1 Header
      expect(find.text('प्रोफाईल माहिती / Profile Form'), findsOneWidget);

      // 1. Country Dropdown
      expect(find.textContaining('१.', findRichText: true), findsOneWidget);
      expect(find.textContaining('देश', findRichText: true), findsWidgets);
      expect(find.textContaining('Country', findRichText: true), findsWidgets);

      // 2. State Dropdown
      expect(find.textContaining('२.', findRichText: true), findsOneWidget);
      expect(find.textContaining('राज्य', findRichText: true), findsWidgets);
      expect(find.textContaining('State', findRichText: true), findsWidgets);

      // 3. District Dropdown
      expect(find.textContaining('३.', findRichText: true), findsOneWidget);
      expect(find.textContaining('जिल्हा', findRichText: true), findsWidgets);
      expect(find.textContaining('District', findRichText: true), findsWidgets);

      // 4. Taluka Dropdown
      expect(find.textContaining('४.', findRichText: true), findsOneWidget);
      expect(find.textContaining('तालुका', findRichText: true), findsWidgets);
      expect(find.textContaining('Taluka', findRichText: true), findsWidgets);

      // 5. Village Dropdown
      expect(find.textContaining('५.', findRichText: true), findsOneWidget);
      expect(find.textContaining('गाव', findRichText: true), findsWidgets);
      expect(find.textContaining('Village', findRichText: true), findsWidgets);

      // 6. Role Dropdown
      expect(find.textContaining('६.', findRichText: true), findsOneWidget);
      expect(find.textContaining('भूमिका', findRichText: true), findsWidgets);
      expect(find.textContaining('Role', findRichText: true), findsWidgets);
      expect(find.text('सदस्य (General Member)'), findsOneWidget);

      // 7. Skills Input
      expect(find.textContaining('७.', findRichText: true), findsOneWidget);
      expect(find.textContaining('कौशल्ये', findRichText: true), findsWidgets);
      expect(find.textContaining('Skills', findRichText: true), findsWidgets);

      // 8. Education Dropdown
      expect(find.textContaining('८.', findRichText: true), findsOneWidget);
      expect(find.textContaining('शिक्षण', findRichText: true), findsWidgets);
      expect(
        find.textContaining('Education', findRichText: true),
        findsWidgets,
      );

      // 9. Interest Dropdown
      expect(find.textContaining('९.', findRichText: true), findsOneWidget);
      expect(find.textContaining('स्वारस्य', findRichText: true), findsWidgets);
      expect(find.textContaining('Interest', findRichText: true), findsWidgets);

      // 10. About Me Input
      expect(find.textContaining('१०.', findRichText: true), findsOneWidget);
      expect(
        find.textContaining('माझ्याबद्दल', findRichText: true),
        findsWidgets,
      );
      expect(find.textContaining('About Me', findRichText: true), findsWidgets);

      // Own profile photo
      expect(find.text('तुमचा फोटो जोडा / Add your photo'), findsOneWidget);
      expect(find.text('छ'), findsOneWidget);

      // Initial state: no default selections
      expect(find.text('देश निवडा / Select Country'), findsOneWidget);

      // 1. Select Country: India
      await tester.tap(find.text('देश निवडा / Select Country'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('India / भारत').last);
      await tester.pumpAndSettle();

      // 2. Select State: Maharashtra
      await tester.tap(find.text('राज्य निवडा / Select State'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Maharashtra / महाराष्ट्र').last);
      await tester.pumpAndSettle();

      // 3. Select District: Pune
      await tester.tap(find.text('जिल्हा निवडा / Select District'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Pune / पुणे').last);
      await tester.pumpAndSettle();

      // 4. Select Taluka: Haveli
      await tester.tap(find.text('तालुका निवडा / Select Taluka'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Haveli / हवेली').last);
      await tester.pumpAndSettle();

      // 5. Select Village: Manjari
      await tester.tap(find.text('गाव निवडा / Select Village'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Manjari / मांजरी').last);
      await tester.pumpAndSettle();

      // Verify navigation buttons
      expect(find.text('← मागे / Back'), findsOneWidget);
      expect(find.text('नोंदणी पूर्ण करा / Finish'), findsOneWidget);

      await tester.ensureVisible(find.text('नोंदणी पूर्ण करा / Finish'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('नोंदणी पूर्ण करा / Finish'));
      await tester.pumpAndSettle();

      expect(find.text('सदस्यत्व निवडा / Choose Membership'), findsNothing);
      expect(find.textContaining('Silver'), findsNothing);
      expect(
        find.text('अभिनंदन! तुमची नोंदणी पूर्ण झाली\nRegistration Completed!'),
        findsOneWidget,
      );
    },
  );

  testWidgets('RegisterScreen rejects a password shorter than 8 characters', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(createTestRegisterApp());
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).at(0), 'Test User');
    await tester.enterText(find.byType(TextField).at(1), '9876543210');
    await tester.enterText(find.byType(TextField).at(3), 'short1');
    await tester.tap(find.byType(CheckboxListTile));
    await tester.pumpAndSettle();
    await tester.tap(find.text('पुढे → / Next'));
    await tester.pumpAndSettle();

    expect(find.text('पासवर्ड किमान ८ अक्षरांचा असावा.'), findsOneWidget);
    expect(find.text('प्रोफाईल माहिती / Profile Form'), findsNothing);
  });

  testWidgets(
    'after Android closes the app during photo picking, registration comes back filled in',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      // Keystore-backed storage holds the draft password.
      const secure = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        secure,
        (call) async => call.method == 'read' ? 'swarajya123' : null,
      );
      addTearDown(
        () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
          secure,
          null,
        ),
      );

      final app = createTestRegisterApp();
      // The draft saved just before the gallery opened.
      SharedPreferences.setMockInitialValues({
        'cm_registration_draft': jsonEncode({
          'name': 'सुरेश पाटील',
          'mobile': '9876543210',
          'email': 'suresh@example.test',
          'agreed': true,
          'about': 'दुर्गप्रेमी',
          'savedAt': DateTime.now().toIso8601String(),
        }),
      });

      await tester.pumpWidget(app);
      await tester.pumpAndSettle();

      // Straight back to the profile step, with the member's initial.
      expect(find.text('प्रोफाईल माहिती / Profile Form'), findsOneWidget);
      expect(find.text('सु'), findsOneWidget);
      expect(find.text('दुर्गप्रेमी'), findsOneWidget);
      expect(
        find.text('तुमची भरलेली माहिती परत आणली आहे. नोंदणी पूर्ण करा.'),
        findsOneWidget,
      );

      // The draft is used once, then deleted.
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.containsKey('cm_registration_draft'), isFalse);
    },
  );
}
