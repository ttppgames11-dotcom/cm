import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/screens/search_screen.dart';

void main() {
  testWidgets('SearchScreen renders search input and category filter chips', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SearchScreen(),
      ),
    );
    await tester.pumpAndSettle();

    // Verify search bar presence
    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('किल्ले, वीर, व्यवसाय, समुदाय शोधा...'), findsOneWidget);

    // Verify category chips
    expect(find.text('सर्व'), findsOneWidget);
    expect(find.text('किल्ले'), findsOneWidget);
    expect(find.text('वीर योद्धे'), findsOneWidget);
    expect(find.text('व्यवसाय'), findsOneWidget);
    expect(find.text('समुदाय'), findsOneWidget);

    // Verify default results appear (e.g. Rajgad)
    expect(find.textContaining('राजगड'), findsWidgets);
  });

  testWidgets('SearchScreen filters results dynamically by typing text', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SearchScreen(),
      ),
    );
    await tester.pumpAndSettle();

    // Enter query "शिवनेरी"
    await tester.enterText(find.byType(TextField), 'शिवनेरी');
    await tester.pumpAndSettle();

    expect(find.textContaining('शिवनेरी'), findsWidgets);
    expect(find.text('राजगड किल्ला'), findsNothing);

    // Clear search
    expect(find.byIcon(Icons.close_rounded), findsOneWidget);
    await tester.tap(find.byIcon(Icons.close_rounded));
    await tester.pumpAndSettle();

    // Check reset
    expect(find.textContaining('राजगड'), findsWidgets);
  });

  testWidgets('SearchScreen category chip filtering works', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SearchScreen(),
      ),
    );
    await tester.pumpAndSettle();

    // Tap on "वीर योद्धे" category
    await tester.tap(find.text('वीर योद्धे'));
    await tester.pumpAndSettle();

    // Should show warriors like Shivaji Maharaj and not Fort cards
    expect(find.text('छत्रपती शिवाजी महाराज'), findsOneWidget);
    expect(find.text('राजगड किल्ला'), findsNothing);
  });
}
