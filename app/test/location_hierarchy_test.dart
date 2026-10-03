import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/providers/location_provider.dart';
import 'package:app/features/auth/repositories/location_repository.dart';
import 'package:app/features/auth/screens/register_screen.dart';
import 'helpers/local_auth_repository.dart';
import 'helpers/test_location_repository.dart';

Widget createTestAppWithLocationRepo(LocationRepository repo) {
  SharedPreferences.setMockInitialValues({});
  final authController = AuthController(
    LocalAuthRepository(AuthLocalDataSource()),
  );
  return ProviderScope(
    overrides: [
      authControllerProvider.overrideWith((ref) => authController),
      locationRepositoryProvider.overrideWithValue(repo),
    ],
    child: AuthScope(
      controller: authController,
      child: const MaterialApp(home: RegisterScreen()),
    ),
  );
}

Future<void> _fillStep0AndProceed(WidgetTester tester) async {
  await tester.enterText(find.byType(TextField).at(0), 'आदित्य पाटील');
  await tester.enterText(find.byType(TextField).at(1), '9876543210');
  await tester.enterText(find.byType(TextField).at(2), 'aditya@example.com');
  await tester.enterText(find.byType(TextField).at(3), 'swarajya123');
  await tester.tap(find.byType(CheckboxListTile));
  await tester.pumpAndSettle();
  await tester.tap(find.text('पुढे → / Next'));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('Initial state: no preselected location values and subordinate dropdowns are disabled', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final repo = TestLocationRepository();
    await tester.pumpWidget(createTestAppWithLocationRepo(repo));
    await tester.pumpAndSettle();

    await _fillStep0AndProceed(tester);

    // Verify initial hints
    expect(find.text('देश निवडा / Select Country'), findsOneWidget);
    expect(find.text('आधी देश निवडा / Select Country first'), findsOneWidget);
    expect(find.text('आधी राज्य निवडा / Select State first'), findsOneWidget);
    expect(find.text('आधी जिल्हा निवडा / Select District first'), findsOneWidget);
    expect(find.text('आधी तालुका निवडा / Select Taluka first'), findsOneWidget);
  });

  testWidgets('Selecting Country enables State, and changing Country resets dependent dropdowns', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final repo = TestLocationRepository();
    await tester.pumpWidget(createTestAppWithLocationRepo(repo));
    await tester.pumpAndSettle();
    await _fillStep0AndProceed(tester);

    // Select Country: India
    await tester.tap(find.text('देश निवडा / Select Country'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('India / भारत').last);
    await tester.pumpAndSettle();

    // Now State dropdown is enabled with its hint
    expect(find.text('राज्य निवडा / Select State'), findsOneWidget);

    // Select State: Maharashtra
    await tester.tap(find.text('राज्य निवडा / Select State'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Maharashtra / महाराष्ट्र').last);
    await tester.pumpAndSettle();

    // District dropdown is now enabled
    expect(find.text('जिल्हा निवडा / Select District'), findsOneWidget);

    // Select District: Pune
    await tester.tap(find.text('जिल्हा निवडा / Select District'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Pune / पुणे').last);
    await tester.pumpAndSettle();

    // Taluka dropdown is now enabled
    final talukaHint = find.text('तालुका निवडा / Select Taluka');
    await tester.ensureVisible(talukaHint);
    await tester.pumpAndSettle();
    await tester.tap(talukaHint);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Haveli / हवेली').last);
    await tester.pumpAndSettle();

    // Village dropdown is now enabled
    final villageHint = find.text('गाव निवडा / Select Village');
    await tester.ensureVisible(villageHint);
    await tester.pumpAndSettle();
    await tester.tap(villageHint);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Manjari / मांजरी').last);
    await tester.pumpAndSettle();

    // Now change District from Pune to Satara
    final districtField = find.text('Pune / पुणे');
    await tester.ensureVisible(districtField);
    await tester.pumpAndSettle();
    await tester.tap(districtField);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Satara / सातारा').last);
    await tester.pumpAndSettle();

    // Taluka and Village should be reset!
    expect(find.text('तालुका निवडा / Select Taluka'), findsOneWidget);
    expect(find.text('आधी तालुका निवडा / Select Taluka first'), findsOneWidget);
    expect(find.text('Manjari / मांजरी'), findsNothing);
  });

  testWidgets('Validation prevents submission if location is incomplete', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final repo = TestLocationRepository();
    await tester.pumpWidget(createTestAppWithLocationRepo(repo));
    await tester.pumpAndSettle();
    await _fillStep0AndProceed(tester);

    // Try submitting without choosing Country
    await tester.ensureVisible(find.text('नोंदणी पूर्ण करा / Finish'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('नोंदणी पूर्ण करा / Finish'));
    await tester.pumpAndSettle();

    expect(find.text('कृपया देश निवडा / Please select Country.'), findsOneWidget);
  });

  testWidgets('Error state shows retry button and retry reloads data', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final repo = TestLocationRepository(shouldFail: true);
    await tester.pumpWidget(createTestAppWithLocationRepo(repo));
    await tester.pumpAndSettle();
    await _fillStep0AndProceed(tester);

    // Countries failed to load
    expect(find.text('देश लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'), findsOneWidget);
    expect(find.text('पुन्हा प्रयत्न करा / Retry'), findsOneWidget);

    // Fix repository error and tap Retry
    repo.shouldFail = false;
    await tester.tap(find.text('पुन्हा प्रयत्न करा / Retry'));
    await tester.pumpAndSettle();

    // Country dropdown is now populated and ready
    expect(find.text('देश लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'), findsNothing);
    expect(find.text('देश निवडा / Select Country'), findsOneWidget);
  });
}
