import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/business/screens/business_hub_screen.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';

void main() {
  Widget createTestWidget() {
    return const ProviderScope(
      child: MaterialApp(home: BusinessHubScreen()),
    );
  }

  testWidgets('BusinessHubScreen renders header, title, and tagline', (
    tester,
  ) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('व्यवसाय'), findsWidgets);
    expect(
      find.text('आपल्या समाजाचा, आपल्या उद्योगाचा अभिमान'),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
  });

  testWidgets('BusinessHubScreen renders search bar and filter button', (
    tester,
  ) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('व्यवसाय, सेवा, शहर किंवा कीवर्ड शोधा...'), findsOneWidget);
    expect(find.text('फिल्टर'), findsOneWidget);
    expect(find.byIcon(Icons.search_rounded), findsOneWidget);
    expect(find.byIcon(Icons.tune_rounded), findsOneWidget);
  });

  testWidgets(
    'BusinessHubScreen renders enabled production tiles and hides placeholder tiles',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('संपर्क आणि व्यवसाय संधी'), findsOneWidget);

      // Enabled items:
      expect(find.text('सर्व मराठा व्यवसाय निर्देशिका'), findsOneWidget);
      expect(find.text('शोधा आणि संपर्क साधा'), findsOneWidget);

      expect(find.text('रेफरल व व्यवसाय देवाणघेवाण'), findsOneWidget);
      expect(find.text('लीड द्या आणि प्रगती पहा'), findsOneWidget);

      expect(find.text('१-टू-१ व्यवसाय बैठका'), findsOneWidget);
      expect(find.text('सदस्यांना भेटण्याची वेळ ठरवा'), findsOneWidget);

      // Hidden placeholders / made-up sheets:
      expect(find.text('व्यवसाय संगम व मंडळे'), findsNothing);
      expect(find.text('B2B संधी व व्यवसाय डील्स'), findsNothing);
      expect(find.text('मराठा बँक व वित्तीय संस्था'), findsNothing);
    },
  );

  testWidgets(
    'BusinessHubScreen renders Card 2 with real backend dairy tile and hides placeholders',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Scroll down to see Card 2
      await tester.drag(find.byType(SingleChildScrollView), const Offset(0, -300));
      await tester.pumpAndSettle();

      expect(find.text('उद्योग आणि वित्तीय संस्था'), findsOneWidget);

      // Dairy is enabled
      expect(find.text('मराठा दूध व कृषी संकलन केंद्र'), findsOneWidget);
      expect(find.text('शेतकरी आणि दुग्ध उत्पादने'), findsOneWidget);

      // Placeholders / Builders hidden
      expect(find.text('मराठा बिल्डर्स व डेव्हलपर्स'), findsNothing);
      expect(find.text('मराठा उत्पादक व उद्योग'), findsNothing);
    },
  );

  testWidgets(
    'BusinessHubScreen keeps CustomBottomNavBar with active व्यवसाय tab',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      final navBar = tester.widget<CustomBottomNavBar>(
        find.byType(CustomBottomNavBar),
      );
      expect(navBar.currentIndex, 2);
      expect(find.text('|| जय शिवराय ||'), findsOneWidget);
    },
  );
}
