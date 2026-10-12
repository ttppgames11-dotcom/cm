import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/business/models/business_models.dart';
import 'package:app/features/business/repositories/business_repository.dart';
import 'package:app/features/business/screens/add_business_screen.dart';
import 'package:app/features/business/screens/business_detail_screen.dart';

import 'helpers/local_auth_repository.dart';

class MockBusinessRepository extends BusinessRepository {
  MockBusinessRepository() : super(ApiClient(SecureTokenStore()));

  Business? mockBusiness;
  bool throwNotFound = false;

  @override
  Future<Business> fetchBusiness(String id) async {
    if (throwNotFound) {
      throw ApiException(
        'व्यवसाय आढळला नाही. हा व्यवसाय काढून टाकला असावा.',
        statusCode: 404,
        code: 'BUSINESS_NOT_FOUND',
      );
    }
    if (mockBusiness != null) return mockBusiness!;
    return Business(
      id: id,
      name: 'स्वराज्य उद्योग समूह',
      ownerName: 'अजित घोरपडे',
      category: BusinessCategory.it,
      city: 'पुणे',
      district: 'पुणे',
      phone: '9876543210',
      whatsapp: '9876543210',
      gstNumber: '27ABCDE1234F1Z5',
      udyamNo: 'UDYAM-MH-01-0012345',
      verified: true,
      rating: 4.9,
      reviewsCount: 15,
      services: const ['वेबसाइट', 'मोबाईल अ‍ॅप'],
      offer: '१०% विशेष सवलत',
    );
  }

  @override
  Future<Business> createBusiness(Map<String, dynamic> data) async {
    return Business.fromJson({
      'id': 'biz-new-1',
      ...data,
    });
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('AddBusinessScreen Form Validation Tests', () {
    testWidgets('Validates business name minimum length of 2 characters', (tester) async {
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await auth.loginWithDemoAccount();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => auth),
            businessRepositoryProvider.overrideWithValue(MockBusinessRepository()),
          ],
          child: const MaterialApp(
            home: AddBusinessScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Enter 1 character for name
      final nameField = find.byType(TextFormField).at(0);
      await tester.enterText(nameField, 'A');

      // Enter valid phone so only name fails
      final phoneField = find.byType(TextFormField).at(2);
      await tester.enterText(phoneField, '9876543210');

      // Tap submit button
      final submitBtn = find.text('व्यवसाय नोंदणी सबमिट करा');
      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.text('व्यवसायाचे नाव किमान २ अक्षरे असणे आवश्यक आहे.'), findsOneWidget);
    });

    testWidgets('Validates Indian phone number requirements (10 digits starting 6-9)', (tester) async {
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await auth.loginWithDemoAccount();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => auth),
            businessRepositoryProvider.overrideWithValue(MockBusinessRepository()),
          ],
          child: const MaterialApp(
            home: AddBusinessScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Enter valid name
      final nameField = find.byType(TextFormField).at(0);
      await tester.enterText(nameField, 'शिवनेरी एंटरप्रायझेस');

      // Enter invalid phone numbers:
      // Case 1: starting with 5 (not 6-9)
      final phoneField = find.byType(TextFormField).at(2);
      await tester.enterText(phoneField, '5876543210');

      final submitBtn = find.text('व्यवसाय नोंदणी सबमिट करा');
      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.text('कृपया वैध भारतीय १० अंकी मोबाईल नंबर टाका (६ ते ९ ने सुरू होणारा).'), findsOneWidget);

      // Case 2: less than 10 digits
      await tester.enterText(phoneField, '98765');
      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.text('कृपया वैध भारतीय १० अंकी मोबाईल नंबर टाका (६ ते ९ ने सुरू होणारा).'), findsOneWidget);

      // Case 3: valid Indian number with +91 prefix
      await tester.enterText(phoneField, '+919876543210');
      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.text('कृपया वैध भारतीय १० अंकी मोबाईल नंबर टाका (६ ते ९ ने सुरू होणारा).'), findsNothing);
    });
  });

  group('BusinessDetailScreen GST / Udyam Visibility Tests', () {
    testWidgets('Hides GST and Udyam behind locked row when logged out', (tester) async {
      // Unauthenticated state
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));

      final mockRepo = MockBusinessRepository();
      mockRepo.mockBusiness = const Business(
        id: 'biz-test-1',
        name: 'पाटील इंजिनिअरिंग',
        ownerName: 'सचिन पाटील',
        category: BusinessCategory.manufacturing,
        city: 'कोल्हापूर',
        district: 'कोल्हापूर',
        phone: '9822001122',
        gstNumber: '27AAAAA0000A1Z5',
        udyamNo: 'UDYAM-MH-02-0099999',
        verified: false,
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => auth),
            businessRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(
            home: BusinessDetailScreen(businessId: 'biz-test-1'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verified badge should NOT appear because verified == false
      expect(find.text('सत्यापित'), findsNothing);

      // Bookmark button should be hidden
      expect(find.byIcon(Icons.bookmark_rounded), findsNothing);
      expect(find.byIcon(Icons.bookmark_border_rounded), findsNothing);

      // Scroll down to GST / Udyam section
      await tester.drag(find.byType(CustomScrollView), const Offset(0, -400));
      await tester.pumpAndSettle();

      // When logged out: locked message and login button MUST be shown
      expect(find.text('GST आणि उद्यम नोंदणी तपशील पाहण्यासाठी लॉगिन करा.'), findsOneWidget);
      expect(find.text('लॉगिन करा'), findsOneWidget);
      expect(find.byIcon(Icons.lock_rounded), findsOneWidget);

      // Actual numbers MUST NOT be revealed
      expect(find.text('27AAAAA0000A1Z5'), findsNothing);
      expect(find.text('UDYAM-MH-02-0099999'), findsNothing);
    });

    testWidgets('Shows GST and Udyam numbers when member is logged in', (tester) async {
      // Authenticated state
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await auth.loginWithDemoAccount();

      final mockRepo = MockBusinessRepository();
      mockRepo.mockBusiness = const Business(
        id: 'biz-test-2',
        name: 'पाटील इंजिनिअरिंग',
        ownerName: 'सचिन पाटील',
        category: BusinessCategory.manufacturing,
        city: 'कोल्हापूर',
        district: 'कोल्हापूर',
        phone: '9822001122',
        gstNumber: '27AAAAA0000A1Z5',
        udyamNo: 'UDYAM-MH-02-0099999',
        verified: true, // verified is true
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => auth),
            businessRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(
            home: BusinessDetailScreen(businessId: 'biz-test-2'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verified badge should be shown because verified == true
      expect(find.text('सत्यापित'), findsOneWidget);

      // Scroll down to GST / Udyam section
      await tester.drag(find.byType(CustomScrollView), const Offset(0, -400));
      await tester.pumpAndSettle();

      // Locked message must NOT be shown
      expect(find.text('GST आणि उद्यम नोंदणी तपशील पाहण्यासाठी लॉगिन करा.'), findsNothing);

      // Real numbers MUST be displayed
      expect(find.text('27AAAAA0000A1Z5'), findsOneWidget);
      expect(find.text('UDYAM-MH-02-0099999'), findsOneWidget);
    });

    testWidgets('Handles BUSINESS_NOT_FOUND state gracefully', (tester) async {
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      final mockRepo = MockBusinessRepository()..throwNotFound = true;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => auth),
            businessRepositoryProvider.overrideWithValue(mockRepo),
          ],
          child: const MaterialApp(
            home: BusinessDetailScreen(businessId: 'unknown-id'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('व्यवसाय आढळला नाही'), findsOneWidget);
      expect(find.text('हा व्यवसाय काढून टाकला असावा किंवा लिंक अवैध आहे.'), findsOneWidget);
      expect(find.text('परत जा'), findsOneWidget);
    });
  });
}
