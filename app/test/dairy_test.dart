import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'helpers/local_auth_repository.dart';
import 'package:app/features/business/dairy/domain/models/dairy_item.dart';
import 'package:app/features/business/dairy/domain/models/dairy_product.dart';
import 'package:app/features/business/dairy/domain/models/farmer_registration.dart';
import 'package:app/features/business/dairy/domain/models/dairy_enquiry.dart';
import 'package:app/features/business/dairy/domain/utils/dairy_utils.dart';
import 'package:app/features/business/dairy/presentation/widgets/farmer_registration_sheet.dart';

void main() {
  group('DairyUtils - Indian Phone Validation & Normalization', () {
    test('validates 10-digit Indian mobile numbers starting with 6-9', () {
      expect(DairyUtils.isValidIndianPhone('9822012345'), isTrue);
      expect(DairyUtils.isValidIndianPhone('8765432109'), isTrue);
      expect(DairyUtils.isValidIndianPhone('7000000000'), isTrue);
      expect(DairyUtils.isValidIndianPhone('6123456789'), isTrue);
    });

    test('validates mobile numbers with prefixes (+91, 91, 0) and formatting', () {
      expect(DairyUtils.isValidIndianPhone('+919822012345'), isTrue);
      expect(DairyUtils.isValidIndianPhone('+91 98220 12345'), isTrue);
      expect(DairyUtils.isValidIndianPhone('919822012345'), isTrue);
      expect(DairyUtils.isValidIndianPhone('09822012345'), isTrue);
      expect(DairyUtils.isValidIndianPhone('+91-88888-12345'), isTrue);
    });

    test('rejects invalid numbers', () {
      expect(DairyUtils.isValidIndianPhone('5822012345'), isFalse); // starts with 5
      expect(DairyUtils.isValidIndianPhone('1234567890'), isFalse); // starts with 1
      expect(DairyUtils.isValidIndianPhone('982201234'), isFalse);  // 9 digits
      expect(DairyUtils.isValidIndianPhone('98220123456'), isFalse); // 11 digits without 0
      expect(DairyUtils.isValidIndianPhone(''), isFalse);
      expect(DairyUtils.isValidIndianPhone(null), isFalse);
      expect(DairyUtils.isValidIndianPhone('abcdefghij'), isFalse);
    });

    test('normalizes Indian phone number into clean 10-digit string', () {
      expect(DairyUtils.normalizeIndianPhone('+91 98220 12345'), '9822012345');
      expect(DairyUtils.normalizeIndianPhone('09822012345'), '9822012345');
      expect(DairyUtils.normalizeIndianPhone('91-98220-12345'), '9822012345');
      expect(DairyUtils.normalizeIndianPhone('9822012345'), '9822012345');
      expect(DairyUtils.normalizeIndianPhone('12345'), isNull);
    });

    test('masks phone number without exposing private details', () {
      final masked = DairyUtils.maskPhone('+91 9822012345');
      expect(masked, '98****2345');
      expect(masked.contains('9822012345'), isFalse);
      expect(DairyUtils.maskPhone(''), '');
    });
  });

  group('DairyItem - Normalizer for Collection Centres', () {
    test('parses complete centre record correctly', () {
      final json = {
        'id': 'centre-001',
        'kind': 'centre',
        'dairyName': 'शिवाजी दूध उत्पादक संस्था',
        'village': 'चाकण',
        'taluka': 'खेड',
        'district': 'पुणे',
        'morningTiming': 'सकाळी ६:०० ते ८:३०',
        'eveningTiming': 'संध्या. ६:०० ते ८:००',
        'registeredFarmers': 145,
        'centerHead': 'बाळासाहेब शिंदे',
        'facilities': ['स्वयंचलित फॅट चाचणी', 'थेट बँक जमा', 'पशुखाद्य सवलत'],
        'milkRateCow': '₹३८/लिटर',
        'milkRateBuffalo': '₹५६/लिटर',
        'contact': '9822123456',
        'dailyCollection': '१,८०० लिटर',
        'verified': true,
      };

      final item = DairyItem.fromJson(json);
      expect(item.id, 'centre-001');
      expect(item.isCentre, isTrue);
      expect(item.isBrand, isFalse);
      expect(item.displayName, 'शिवाजी दूध उत्पादक संस्था');
      expect(item.village, 'चाकण');
      expect(item.taluka, 'खेड');
      expect(item.district, 'पुणे');
      expect(item.formattedLocation, 'चाकण, ता. खेड, जि. पुणे');
      expect(item.morningTiming, 'सकाळी ६:०० ते ८:३०');
      expect(item.eveningTiming, 'संध्या. ६:०० ते ८:००');
      expect(item.formattedTimings, 'सकाळ: सकाळी ६:०० ते ८:३० • संध्याकाळ: संध्या. ६:०० ते ८:००');
      expect(item.registeredFarmers, 145);
      expect(item.centerHead, 'बाळासाहेब शिंदे');
      expect(item.facilities, contains('स्वयंचलित फॅट चाचणी'));
      expect(item.facilities.length, 3);
      expect(item.milkRateCow, '₹३८/लिटर');
      expect(item.milkRateBuffalo, '₹५६/लिटर');
      expect(item.primaryPhone, '9822123456');
      expect(item.dailyCollection, '१,८०० लिटर');
      expect(item.verified, isTrue);
    });

    test('supports alternative keys: centerName, name, phone, mobile', () {
      final json = {
        'id': 42,
        'centerName': 'वारणा संकलन केंद्र',
        'phone': '9876543210',
        'district': 'कोल्हापूर',
      };

      final item = DairyItem.fromJson(json);
      expect(item.id, '42'); // ID converted to string
      expect(item.displayName, 'वारणा संकलन केंद्र');
      expect(item.primaryPhone, '9876543210');
      expect(item.district, 'कोल्हापूर');
      expect(item.formattedLocation, 'जि. कोल्हापूर');
    });

    test('parses comma-separated facilities string into list', () {
      final json = {
        'id': 'centre-csv',
        'name': 'कृष्णा डेअरी',
        'facilities': 'फॅट चाचणी, पशुखाद्य, डॉक्टर भेट',
      };

      final item = DairyItem.fromJson(json);
      expect(item.facilities, ['फॅट चाचणी', 'पशुखाद्य', 'डॉक्टर भेट']);
    });

    test('parses string registeredFarmers defensively', () {
      final json = {
        'id': 'centre-farmers',
        'registeredFarmers': '२५० शेतकरी (250)',
      };

      final item = DairyItem.fromJson(json);
      expect(item.registeredFarmers, 250);
    });

    test('handles missing fields gracefully without crash', () {
      final json = {
        'id': 'centre-sparse',
      };

      final item = DairyItem.fromJson(json);
      expect(item.id, 'centre-sparse');
      expect(item.isCentre, isTrue);
      expect(item.dairyName, isNull);
      expect(item.village, isNull);
      expect(item.taluka, isNull);
      expect(item.district, isNull);
      expect(item.formattedLocation, '');
      expect(item.formattedTimings, isNull);
      expect(item.facilities, isEmpty);
      expect(item.registeredFarmers, isNull);
      expect(item.primaryPhone, isNull);
    });
  });

  group('DairyItem - Normalizer for Brands', () {
    test('parses brand record by kind: "brand"', () {
      final json = {
        'id': 'brand-01',
        'kind': 'brand',
        'brandName': 'गोकुळ (कोल्हापूर जिल्हा दूध संघ)',
        'type': 'सहकारी दूध संघ',
        'dailyProcurement': '१४+ लाख लिटर / दिवस',
        'headquarters': 'ताराबाई पार्क, कोल्हापूर',
        'products': 'दूध, तूप, ताक, श्रीखंड, पेढा',
        'phone': '0231-2601234',
        'website': 'https://gokulmilk.coop',
      };

      final item = DairyItem.fromJson(json);
      expect(item.id, 'brand-01');
      expect(item.isBrand, isTrue);
      expect(item.isCentre, isFalse);
      expect(item.displayName, 'गोकुळ (कोल्हापूर जिल्हा दूध संघ)');
      expect(item.type, 'सहकारी दूध संघ');
      expect(item.dailyProcurement, '१४+ लाख लिटर / दिवस');
      expect(item.headquarters, 'ताराबाई पार्क, कोल्हापूर');
      expect(item.formattedLocation, 'ताराबाई पार्क, कोल्हापूर');
      expect(item.products, 'दूध, तूप, ताक, श्रीखंड, पेढा');
      expect(item.primaryPhone, '0231-2601234');
      expect(item.website, 'https://gokulmilk.coop');
    });

    test('infers brand when kind is missing but brandName is present', () {
      final json = {
        'id': 'brand-02',
        'brandName': 'वारणा दूध',
        'type': 'सहकारी',
        'dailyProcurement': '८ लाख लिटर',
      };

      final item = DairyItem.fromJson(json);
      expect(item.isBrand, isTrue);
      expect(item.displayName, 'वारणा दूध');
    });
  });

  group('FarmerRegistration - Model & Serialization', () {
    test('creates FarmerRegistration and serializes to JSON for POST /dairy/:id/registrations', () {
      const reg = FarmerRegistration(
        centreId: 'centre-001',
        farmerName: 'रमेश सखाराम जाधव',
        phone: '9822112233',
        village: 'खेड शिवापूर',
        cattleCount: 6,
        milkType: 'cow',
        expectedDailyLitres: 45.5,
      );

      final json = reg.toJson();
      expect(json['farmerName'], 'रमेश सखाराम जाधव');
      expect(json['phone'], '9822112233');
      expect(json['village'], 'खेड शिवापूर');
      expect(json['cattleCount'], 6);
      expect(json['milkType'], 'cow');
      expect(json['expectedDailyLitres'], 45.5);
    });

    test('parses FarmerRegistration from JSON response', () {
      final json = {
        'id': 'reg-99',
        'dairyId': 'centre-001',
        'farmerName': 'रमेश सखाराम जाधव',
        'phone': '9822112233',
        'village': 'खेड शिवापूर',
        'cattleCount': '6',
        'milkType': 'both',
        'expectedDailyLitres': '45',
        'status': 'submitted',
        'createdAt': '2026-10-10T06:00:00.000Z',
      };

      final reg = FarmerRegistration.fromJson(json);
      expect(reg.id, 'reg-99');
      expect(reg.centreId, 'centre-001');
      expect(reg.farmerName, 'रमेश सखाराम जाधव');
      expect(reg.cattleCount, 6);
      expect(reg.milkType, 'both');
      expect(reg.expectedDailyLitres, 45.0);
      expect(reg.status, 'submitted');
    });
  });

  group('DairyProductItem & DairyEnquiry - Models', () {
    test('parses DairyProductItem from JSON', () {
      final json = {
        'id': 'prod-001',
        'name': 'ताजे गायीचे दूध (पाश्चराईज्ड)',
        'category': 'दूध',
        'packSize': '५०० मिली / १ लिटर',
        'price': 32.0,
        'description': 'उत्कृष्ट दर्जाचे शुद्ध दूध',
        'available': true,
      };

      final prod = DairyProductItem.fromJson(json);
      expect(prod.id, 'prod-001');
      expect(prod.name, 'ताजे गायीचे दूध (पाश्चराईज्ड)');
      expect(prod.category, 'दूध');
      expect(prod.packSize, '५०० मिली / १ लिटर');
      expect(prod.price, 32.0);
      expect(prod.available, isTrue);
    });

    test('creates and serializes DairyEnquiry for POST /dairy/products/:id/enquiries', () {
      const enquiry = DairyEnquiry(
        productId: 'prod-001',
        name: 'सुनील पवार',
        phone: '9865432100',
        quantity: '१० लिटर दररोज',
        deliveryCity: 'पुणे',
        message: 'सकाळी ७ वाजेपर्यंत वितरण शक्य आहे का?',
      );

      final json = enquiry.toJson();
      expect(json['name'], 'सुनील पवार');
      expect(json['phone'], '9865432100');
      expect(json['quantity'], '१० लिटर दररोज');
      expect(json['deliveryCity'], 'पुणे');
      expect(json['message'], 'सकाळी ७ वाजेपर्यंत वितरण शक्य आहे का?');
    });

    test('DairyUtils category info mapping', () {
      expect(DairyUtils.getCategoryInfo('दूध').emoji, '🥛');
      expect(DairyUtils.getCategoryInfo('दही').emoji, '🥣');
      expect(DairyUtils.getCategoryInfo('पनीर').emoji, '🧀');
      expect(DairyUtils.getCategoryInfo('तूप').emoji, '🧈');
      expect(DairyUtils.getCategoryInfo('ताक').emoji, '🥤');
      expect(DairyUtils.getCategoryInfo('श्रीखंड').emoji, '🍯');
    });
  });

  group('FarmerRegistrationSheet - Form Validation Widget Tests', () {
    const testCentre = DairyItem(
      id: 'centre-999',
      kind: DairyKind.centre,
      dairyName: 'सह्याद्री दूध संकलन केंद्र',
      village: 'शिरवळ',
      taluka: 'खंडाळा',
      district: 'सातारा',
      morningTiming: '६:०० ते ८:००',
      eveningTiming: '६:०० ते ८:००',
    );

    testWidgets('renders all registration form fields and logged-out banner for guests', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: FarmerRegistrationSheet(centre: testCentre),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('शेतकरी दूध नोंदणी अर्ज'), findsOneWidget);
      expect(find.text('सह्याद्री दूध संकलन केंद्र'), findsOneWidget);
      expect(find.text('शेतकरी नोंदणी करण्यासाठी लॉगिन आवश्यक आहे.'), findsOneWidget);
      expect(find.text('शेतकऱ्याचे संपूर्ण नाव *'), findsOneWidget);
      expect(find.text('मोबाईल नंबर *'), findsOneWidget);
      expect(find.text('गाव / पत्ता'), findsOneWidget);
      expect(find.text('दूध प्रकार *'), findsOneWidget);
      expect(find.text('🐄 गाय'), findsOneWidget);
      expect(find.text('🐃 म्हैस'), findsOneWidget);
      expect(find.text('🥛 दोन्ही'), findsOneWidget);
      expect(find.text('लॉगिन करा आणि नोंदणी करा'), findsOneWidget);
    });

    testWidgets('shows validation errors when authenticated member clears required fields', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final authController = AuthController(
        LocalAuthRepository(AuthLocalDataSource()),
      );
      await tester.runAsync(authController.loginWithDemoAccount);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => authController),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: FarmerRegistrationSheet(centre: testCentre),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Submit button for logged in user shows 'नोंदणी सादर करा'
      final submitButton = find.text('नोंदणी सादर करा');
      expect(submitButton, findsOneWidget);

      // Clear the prefilled name field
      final nameField = find.widgetWithText(TextFormField, 'संजय शिवाजी पाटील');
      expect(nameField, findsOneWidget);
      await tester.enterText(nameField, '');

      // Tap submit button without phone and empty name
      await tester.ensureVisible(submitButton);
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      // Verify validation error messages are displayed
      expect(find.text('कृपया तुमचे नाव प्रविष्ट करा'), findsOneWidget);
      expect(find.text('कृपया मोबाईल नंबर प्रविष्ट करा'), findsOneWidget);
    });

    testWidgets('shows validation error when invalid phone number is entered by authenticated member', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final authController = AuthController(
        LocalAuthRepository(AuthLocalDataSource()),
      );
      await tester.runAsync(authController.loginWithDemoAccount);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => authController),
          ],
          child: const MaterialApp(
            home: Scaffold(
              body: FarmerRegistrationSheet(centre: testCentre),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Enter invalid phone
      final phoneField = find.widgetWithText(TextFormField, '१० अंकी मोबाईल नंबर');
      await tester.enterText(phoneField, '12345');

      // Tap submit
      final submitButton = find.text('नोंदणी सादर करा');
      await tester.ensureVisible(submitButton);
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      // Verify invalid phone error
      expect(find.text('कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा'), findsOneWidget);
    });
  });
}

