import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/core/share/copy_share.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/business/referrals/domain/models/referral.dart';
import 'package:app/features/business/referrals/domain/models/referral_stats.dart';
import 'package:app/features/business/referrals/domain/models/referral_status.dart';
import 'package:app/features/business/referrals/presentation/screens/create_referral_screen.dart';
import 'package:app/features/business/referrals/presentation/widgets/referral_item_card.dart';
import 'package:app/features/business/referrals/presentation/widgets/referral_step_indicator.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';

import 'helpers/local_auth_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  group('Referral Status Helper & Urgency Tests', () {
    test('classifyReferralStatus classifies various raw strings correctly', () {
      // Closed: contains "क्लोज", "closed", "won", or "success"
      expect(classifyReferralStatus('यशस्वी क्लोज (Success)'), ReferralStatusClass.closed);
      expect(classifyReferralStatus('Closed Won'), ReferralStatusClass.closed);
      expect(classifyReferralStatus('WON'), ReferralStatusClass.closed);
      expect(classifyReferralStatus('क्लोज'), ReferralStatusClass.closed);
      expect(classifyReferralStatus('Payment success'), ReferralStatusClass.closed);

      // Contacted: contains "संपर्क", "contact", or "proposal"
      expect(classifyReferralStatus('संपर्क साधला (Contacted)'), ReferralStatusClass.contacted);
      expect(classifyReferralStatus('Proposal Sent'), ReferralStatusClass.contacted);
      expect(classifyReferralStatus('Contacted client'), ReferralStatusClass.contacted);
      expect(classifyReferralStatus('संपर्क'), ReferralStatusClass.contacted);

      // New: everything else
      expect(classifyReferralStatus('नवीन (New)'), ReferralStatusClass.newStatus);
      expect(classifyReferralStatus('Just Created'), ReferralStatusClass.newStatus);
      expect(classifyReferralStatus('Random text'), ReferralStatusClass.newStatus);
      expect(classifyReferralStatus(''), ReferralStatusClass.newStatus);
      expect(classifyReferralStatus(null), ReferralStatusClass.newStatus);
    });

    test('getStatusApiValue produces exact expected strings for backend update', () {
      expect(getStatusApiValue(ReferralStatusClass.newStatus), 'नवीन (New)');
      expect(getStatusApiValue(ReferralStatusClass.contacted), 'संपर्क साधला (Contacted)');
      expect(getStatusApiValue(ReferralStatusClass.closed), 'यशस्वी क्लोज (Closed Won)');
    });

    test('parseReferralUrgency and getUrgencyApiValue work as specified', () {
      expect(parseReferralUrgency('कमी (Low)'), ReferralUrgency.low);
      expect(parseReferralUrgency('LOW'), ReferralUrgency.low);
      expect(parseReferralUrgency('मध्यम (Medium)'), ReferralUrgency.medium);
      expect(parseReferralUrgency('जास्त (High)'), ReferralUrgency.high);
      expect(parseReferralUrgency('Urgent'), ReferralUrgency.high);

      // Missing or unknown defaults to medium
      expect(parseReferralUrgency(null), ReferralUrgency.medium);
      expect(parseReferralUrgency(''), ReferralUrgency.medium);
      expect(parseReferralUrgency('unknown'), ReferralUrgency.medium);

      expect(getUrgencyApiValue(ReferralUrgency.low), 'कमी (Low)');
      expect(getUrgencyApiValue(ReferralUrgency.medium), 'मध्यम (Medium)');
      expect(getUrgencyApiValue(ReferralUrgency.high), 'जास्त (High)');
    });
  });

  group('Phone Validation & Masking Tests', () {
    test('isValidIndianPhone accepts valid 10-digit mobiles starting with 6-9 and optional prefixes', () {
      expect(isValidIndianPhone('9822012345'), isTrue);
      expect(isValidIndianPhone('8888888888'), isTrue);
      expect(isValidIndianPhone('7000000000'), isTrue);
      expect(isValidIndianPhone('6123456789'), isTrue);

      // With prefixes
      expect(isValidIndianPhone('+919822012345'), isTrue);
      expect(isValidIndianPhone('+91 98220 12345'), isTrue);
      expect(isValidIndianPhone('919822012345'), isTrue);
      expect(isValidIndianPhone('09822012345'), isTrue);

      // Invalid: starts with 1-5
      expect(isValidIndianPhone('5123456789'), isFalse);
      expect(isValidIndianPhone('1234567890'), isFalse);

      // Invalid: wrong length
      expect(isValidIndianPhone('982201234'), isFalse); // 9 digits
      expect(isValidIndianPhone('98220123456'), isFalse); // 11 digits without prefix

      // Invalid: empty/null
      expect(isValidIndianPhone(''), isFalse);
      expect(isValidIndianPhone(null), isFalse);
    });

    test('maskPhoneNumber masks client phone numbers securely for list views', () {
      expect(maskPhoneNumber('9822012345'), '98XXXXXX45');
      expect(maskPhoneNumber('+919822012345'), '+91 98XXXXXX45');
      expect(maskPhoneNumber(''), '');
      expect(maskPhoneNumber(null), '');
    });
  });

  group('Referral Stats Calculation & Indian Number Formatting Tests', () {
    final myId = 'user_100';
    final otherId = 'user_200';

    final referrals = [
      // Given & closed
      Referral(
        id: '1',
        title: 'Lead 1',
        clientName: 'Client 1',
        clientPhone: '9822012345',
        giverId: myId,
        recipientId: otherId,
        status: 'Won',
        value: 50000,
      ),
      // Given & contacted
      Referral(
        id: '2',
        title: 'Lead 2',
        clientName: 'Client 2',
        clientPhone: '9822012346',
        giverId: myId,
        recipientId: otherId,
        status: 'Proposal',
        value: 20000,
      ),
      // Received & closed
      Referral(
        id: '3',
        title: 'Lead 3',
        clientName: 'Client 3',
        clientPhone: '9822012347',
        giverId: otherId,
        recipientId: myId,
        status: 'यशस्वी क्लोज',
        value: 150000,
      ),
      // Received & new
      Referral(
        id: '4',
        title: 'Lead 4',
        clientName: 'Client 4',
        clientPhone: '9822012348',
        giverId: otherId,
        recipientId: myId,
        status: 'नवीन',
        value: 10000,
      ),
    ];

    test('ReferralStats computes accurate counts and sums closed values', () {
      final stats = ReferralStats.compute(
        referrals: referrals,
        currentUserId: myId,
      );

      expect(stats.givenCount, 2);
      expect(stats.receivedCount, 2);
      expect(stats.closedCount, 2);
      expect(stats.totalClosedValue, 200000.0); // 50000 + 150000
    });

    test('formatIndianCurrency formats numbers with Indian grouping and lakh/crore', () {
      expect(formatIndianCurrency(0), '₹०');
      expect(formatIndianCurrency(5000), '₹5,000');
      expect(formatIndianCurrency(45500), '₹45,500');
      expect(formatIndianCurrency(100000), '₹1 लाख');
      expect(formatIndianCurrency(250000), '₹2.5 लाख');
      expect(formatIndianCurrency(10000000), '₹1 कोटी');
      expect(formatIndianCurrency(24000000), '₹2.4 कोटी');
    });
  });

  group('Widget Tests for Referrals Feature', () {
    late AuthController authController;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      authController = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await authController.loginWithDemoAccount();
    });

    testWidgets('ReferralItemCard masks phone and displays title, status, urgency', (tester) async {
      final referral = Referral(
        id: 'ref_1',
        title: 'कन्स्ट्रक्शन सिमेंट पुरवठा',
        category: 'बांधकाम',
        giverId: 'user_100',
        giverName: 'अमोल पाटील',
        recipientId: 'user_200',
        recipientName: 'सचिन जगताप',
        clientName: 'रोहित सावंत',
        clientPhone: '9822012345',
        status: 'नवीन (New)',
        urgency: 'जास्त (High)',
        value: 45000,
        createdAt: DateTime(2026, 10, 9),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ReferralItemCard(
              referral: referral,
              isGivenTab: true,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('कन्स्ट्रक्शन सिमेंट पुरवठा'), findsOneWidget);
      expect(find.text('रोहित सावंत'), findsOneWidget);
      expect(find.text('नवीन'), findsOneWidget);
      expect(find.text('महत्त्व: जास्त'), findsOneWidget);
      // Client phone must be masked
      expect(find.text('98XXXXXX45'), findsOneWidget);
      expect(find.text('9822012345'), findsNothing);
    });

    testWidgets('ReferralStepIndicator shows 3 steps with date on first step only', (tester) async {
      final createdDate = DateTime(2026, 10, 9);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ReferralStepIndicator(
              statusClass: ReferralStatusClass.contacted,
              createdAt: createdDate,
            ),
          ),
        ),
      );

      expect(find.text('नवीन नोंद'), findsOneWidget);
      expect(find.text('संपर्क साधला'), findsOneWidget);
      expect(find.text('यशस्वी क्लोज'), findsOneWidget);
      expect(find.text('9 ऑक्टो 2026'), findsOneWidget);
    });

    testWidgets('CreateReferralScreen submit button is disabled until consent is checked', (tester) async {
      tester.view.physicalSize = const Size(800, 1600);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => authController),
          ],
          child: const MaterialApp(
            home: CreateReferralScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final submitFinder = find.widgetWithText(ElevatedButton, 'संदर्भ पाठवा');
      expect(submitFinder, findsOneWidget);

      ElevatedButton submitBtn = tester.widget(submitFinder);
      expect(submitBtn.onPressed, isNull, reason: 'Submit must be disabled before consent');

      // Drag to reveal consent checkbox and tap it
      final checkboxFinder = find.byType(Checkbox);
      await tester.drag(find.byType(SingleChildScrollView), const Offset(0, -600));
      await tester.pumpAndSettle();
      await tester.tap(checkboxFinder);
      await tester.pumpAndSettle();

      submitBtn = tester.widget(submitFinder);
      expect(submitBtn.onPressed, isNotNull, reason: 'Submit must be enabled after consent');
    });

    test('referralShareText generates message with Play Store link and reference ID', () {
      final message = referralShareText('REF-96K-5578');
      expect(message, contains('https://play.google.com/store/apps/details?id=com.connetcm.app'));
      expect(message, contains('REF-96K-5578'));
      expect(message, contains('Connect मराठा'));
    });
  });
}

