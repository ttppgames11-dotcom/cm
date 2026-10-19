import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/community/providers/community_provider.dart';
import 'package:app/features/community/repositories/demo_community_repository.dart';
import 'package:app/features/community/screens/samaj_sadasya_screen.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';
import 'helpers/local_auth_repository.dart';

void main() {
  Widget createTestWidget() {
    final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
    return ProviderScope(
      overrides: [
        authControllerProvider.overrideWith((ref) => auth),
        communityRepositoryProvider.overrideWithValue(
          DemoCommunityRepository(ApiClient(SecureTokenStore())),
        ),
      ],
      child: const MaterialApp(
        home: SamajSadasyaScreen(),
      ),
    );
  }

  testWidgets('SamajSadasyaScreen renders header, title, and subtitle', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('समाज सदस्य'), findsWidgets);
    expect(find.text('आपले लोक, आपला समाज'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    expect(find.byIcon(Icons.flag_rounded), findsOneWidget);
  });

  testWidgets('SamajSadasyaScreen renders search bar and filter chips', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('नाव, शहर, व्यवसाय किंवा कौशल्य शोधा...'), findsOneWidget);
    expect(find.text('सर्व सदस्य'), findsOneWidget);
    expect(find.text('माझे शहर'), findsOneWidget);
    expect(find.text('व्यवसायानुसार'), findsOneWidget);
    expect(find.text('कौशल्यानुसार'), findsOneWidget);
    expect(find.text('अधिक फिल्टर'), findsOneWidget);
  });

  testWidgets('SamajSadasyaScreen renders 3-stats strip correctly', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('शहरे / गाव'), findsOneWidget);
    expect(find.text('व्यवसाय क्षेत्रे'), findsOneWidget);
    expect(find.text('समाज सदस्य'), findsWidgets);
  });

  testWidgets('SamajSadasyaScreen renders real community members with ID badges and profile button', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('अमित शिंदे'), findsOneWidget);
    expect(find.text('राजेंद्र भोसले'), findsOneWidget);
    expect(find.text('प्रिया देशमुख'), findsOneWidget);
    expect(find.text('प्रोफाइल पहा'), findsWidgets);
  });

  testWidgets('SamajSadasyaScreen filters members via search input in real time', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final searchField = find.byType(TextField);
    await tester.enterText(searchField, 'राजेंद्र');
    await tester.pumpAndSettle();

    expect(find.text('राजेंद्र भोसले'), findsOneWidget);
    expect(find.text('अमित शिंदे'), findsNothing);
  });

  testWidgets('SamajSadasyaScreen opens profile bottom sheet on tap', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final profileBtn = find.text('प्रोफाइल पहा').first;
    await tester.tap(profileBtn);
    await tester.pumpAndSettle();

    // Bottom sheet details
    expect(find.text('सत्यापित · Verified'), findsOneWidget);
    expect(find.text('जोडले जा (Connect)'), findsOneWidget);
    expect(find.text('मेसेज पाठवा'), findsOneWidget);
  });

  testWidgets('SamajSadasyaScreen keeps native CustomBottomNavBar with active समुदाय tab', (tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final navBar = tester.widget<CustomBottomNavBar>(find.byType(CustomBottomNavBar));
    expect(navBar.currentIndex, 1);
    expect(find.text('समुदाय'), findsOneWidget);
    expect(find.text('|| जय शिवराय ||'), findsOneWidget);
  });
}
