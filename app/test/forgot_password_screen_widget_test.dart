import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/screens/forgot_password_screen.dart';

import 'helpers/local_auth_repository.dart';

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  Widget buildSubject(AuthController controller) {
    return MaterialApp(
      home: AuthScope(
        controller: controller,
        child: const ForgotPasswordScreen(),
      ),
    );
  }

  group('ForgotPasswordScreen Widget Tests', () {
    late LocalAuthRepository mockRepo;
    late AuthController authController;

    setUp(() {
      mockRepo = LocalAuthRepository(AuthLocalDataSource());
      authController = AuthController(mockRepo);
    });

    testWidgets('Renders step 1: Email input and action button', (tester) async {
      await tester.pumpWidget(buildSubject(authController));
      await tester.pumpAndSettle();

      expect(find.text('🔐 पासवर्ड रीसेट करा'), findsOneWidget);
      expect(find.text('नोंदणीकृत ईमेल प्रविष्ट करा'), findsOneWidget);
      expect(find.text('सुरक्षा OTP पाठवा'), findsOneWidget);
      expect(find.byType(TextFormField), findsOneWidget);
    });

    testWidgets('Shows error when empty email is submitted', (tester) async {
      await tester.pumpWidget(buildSubject(authController));
      await tester.pumpAndSettle();

      await tester.tap(find.text('सुरक्षा OTP पाठवा'));
      await tester.pumpAndSettle();

      expect(find.text('कृपया आपला नोंदणीकृत ईमेल पत्ता टाका.'), findsOneWidget);
    });

    testWidgets('Shows error when invalid email format is entered', (tester) async {
      await tester.pumpWidget(buildSubject(authController));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField), 'invalid-email');
      await tester.tap(find.text('सुरक्षा OTP पाठवा'));
      await tester.pumpAndSettle();

      expect(find.text('कृपया वैध ईमेल पत्ता प्रविष्ट करा.'), findsOneWidget);
    });

    testWidgets('Completes full 3-step flow: Email -> OTP -> New Password -> Success', (tester) async {
      await tester.pumpWidget(buildSubject(authController));
      await tester.pumpAndSettle();

      // Step 1: Submit valid email
      await tester.enterText(find.byType(TextFormField), 'amol.jadhav@example.com');
      await tester.tap(find.text('सुरक्षा OTP पाठवा'));
      await tester.pumpAndSettle();

      // Should now be on Step 2 (Verify OTP)
      expect(find.text('सुरक्षा OTP सत्यापित करा'), findsOneWidget);
      expect(find.text('वापरकर्ता सत्यापित करा'), findsOneWidget);

      // Step 2: Enter 6-digit OTP
      await tester.enterText(find.byType(TextFormField), '123456');
      await tester.tap(find.text('वापरकर्ता सत्यापित करा'));
      await tester.pumpAndSettle();

      // Should now be on Step 3 (Set New Password)
      expect(find.text('नवीन पासवर्ड सेट करा'), findsOneWidget);
      expect(find.text('पासवर्ड जतन करा'), findsOneWidget);

      // Step 3: Enter new passwords
      final fields = find.byType(TextFormField);
      expect(fields, findsNWidgets(2));

      await tester.enterText(fields.first, 'newpassword123');
      await tester.enterText(fields.last, 'newpassword123');
      await tester.tap(find.text('पासवर्ड जतन करा'));
      await tester.pumpAndSettle();

      // Should now be on Step 4 (Success)
      expect(find.text('पासवर्ड यशस्वीरीत्या बदलला!'), findsOneWidget);
      expect(find.text('लॉगिन पृष्ठावर जा'), findsOneWidget);
    });
  });
}
