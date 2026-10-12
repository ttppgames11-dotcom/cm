import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/features/business/screens/business_directory_screen.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';

void main() {
  Widget createTestWidget() {
    return const ProviderScope(
      child: MaterialApp(home: BusinessDirectoryScreen()),
    );
  }

  testWidgets(
    'BusinessDirectoryScreen renders hero header, title, and tagline',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Business'), findsOneWidget);
      expect(
        find.text('आपल्या समाजाचा, आपल्या उद्योगाचा अभिमान'),
        findsOneWidget,
      );
      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    },
  );

  testWidgets('BusinessDirectoryScreen renders search bar and filter button', (
    tester,
  ) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    expect(find.text('व्यवसाय, दुकान किंवा सेवा शोधा...'), findsOneWidget);
    expect(find.text('फिल्टर'), findsOneWidget);
    expect(find.byIcon(Icons.search_rounded), findsOneWidget);
    expect(find.byIcon(Icons.tune_rounded), findsOneWidget);
  });

  testWidgets(
    'BusinessDirectoryScreen renders category chips matching reference UI',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('सर्व'), findsOneWidget);
      expect(find.text('हॉटेल्स'), findsWidgets);
      expect(find.text('खरेदी'), findsWidgets);
      expect(find.text('रिअल इस्टेट'), findsWidgets);
      expect(find.text('आरोग्य सेवा'), findsWidgets);
      expect(find.text('IT सेवा'), findsWidgets);
      expect(find.text('इतर'), findsOneWidget);
    },
  );

  testWidgets(
    'BusinessDirectoryScreen renders statistics strip & add business button',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('320+'), findsOneWidget);
      expect(find.text('समाजातील व्यवसाय'), findsWidgets);
      expect(find.text('25+'), findsOneWidget);
      expect(find.text('शहरे'), findsOneWidget);
      expect(find.text('10K+'), findsOneWidget);
      expect(find.text('ग्राहक जोडले'), findsOneWidget);
      expect(find.text('आपला व्यवसाय\nजोडा'), findsOneWidget);
    },
  );

  testWidgets(
    'BusinessDirectoryScreen renders the reference businesses from image',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // 1. शिवसाई फॅमिली रेस्टॉरंट
      expect(find.text('शिवसाई फॅमिली रेस्टॉरंट'), findsOneWidget);
      expect(find.text('प्रो. अमोल पाटील'), findsOneWidget);
      expect(find.text('4.5 (128)'), findsOneWidget);

      // Scroll down to see subsequent cards
      await tester.drag(find.byType(CustomScrollView), const Offset(0, -300));
      await tester.pumpAndSettle();

      // 2. TechMaratha Solutions
      expect(find.text('TechMaratha Solutions'), findsOneWidget);
      expect(find.text('प्रो. रोहित जगताप'), findsOneWidget);

      // Scroll down more
      await tester.drag(find.byType(CustomScrollView), const Offset(0, -300));
      await tester.pumpAndSettle();

      // 3. पाटील कन्स्ट्रक्शन
      expect(find.text('पाटील कन्स्ट्रक्शन'), findsOneWidget);

      // 4. शिवम मल्टीस्पेशालिटी क्लिनिक
      expect(find.text('शिवम मल्टीस्पेशालिटी क्लिनिक'), findsOneWidget);
    },
  );

  testWidgets('BusinessDirectoryScreen filters by category on chip tap', (
    tester,
  ) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    // Tap on हॉटेल्स category chip
    final hotelChip = find.widgetWithText(InkWell, 'हॉटेल्स').first;
    await tester.tap(hotelChip);
    await tester.pumpAndSettle();

    expect(find.text('शिवसाई फॅमिली रेस्टॉरंट'), findsOneWidget);
    expect(find.text('TechMaratha Solutions'), findsNothing);
  });

  testWidgets('BusinessDirectoryScreen filters by search query', (
    tester,
  ) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pumpAndSettle();

    final searchField = find.byType(TextField).first;
    await tester.enterText(searchField, 'क्लिनिक');
    await tester.pumpAndSettle();

    expect(find.text('शिवम मल्टीस्पेशालिटी क्लिनिक'), findsOneWidget);
    expect(find.text('TechMaratha Solutions'), findsNothing);
  });

  testWidgets(
    'BusinessDirectoryScreen keeps native CustomBottomNavBar with active व्यवसाय tab',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      final navBar = tester.widget<CustomBottomNavBar>(
        find.byType(CustomBottomNavBar),
      );
      expect(navBar.currentIndex, 2);
      expect(find.text('व्यवसाय'), findsOneWidget);
      expect(find.text('|| जय शिवराय ||'), findsOneWidget);
    },
  );

  testWidgets(
    'BusinessDirectoryScreen opens details sheet on tapping तपशील पहा',
    (tester) async {
      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      final detailsBtn = find.text('तपशील पहा').first;
      await tester.tap(detailsBtn);
      await tester.pumpAndSettle();

      expect(find.text('सत्यापित व्यवसाय'), findsOneWidget);
      expect(find.text('व्यवसायाबद्दल माहिती:'), findsOneWidget);
      expect(find.text('प्रमुख सेवा व उत्पादने:'), findsOneWidget);
    },
  );
}
