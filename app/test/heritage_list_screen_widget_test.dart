import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/core/favorites/favorites_store.dart';
import 'package:app/screens/heritage_list_screen.dart';
import 'package:app/widgets/home/custom_bottom_nav_bar.dart';

void main() {
  // Hearts are saved favourites now (kept on the phone).
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FavoritesStore.instance.resetForTest();
  });

  testWidgets(
    'HeritageHeroHeader renders title, quote, attribution and action buttons',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: HeritageHeroHeader(height: 380)),
        ),
      );

      expect(find.text('Maratha'), findsOneWidget);
      expect(find.text('Heritage'), findsOneWidget);
      expect(find.text('स्वराज्याची अमर परंपरा'), findsOneWidget);
      expect(
        find.text('“ हे राज्य व्हावे, हे तो श्रींची इच्छा! ”'),
        findsOneWidget,
      );
      expect(find.text('— छत्रपती शिवाजी महाराज'), findsOneWidget);
      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
      expect(find.byIcon(Icons.search_rounded), findsOneWidget);
      expect(find.text('राजगड किल्ला'), findsOneWidget);
      expect(find.text('पुणे / Rajgad Fort'), findsOneWidget);
    },
  );

  testWidgets('CategoryTabBar renders 4 categories and toggles selection', (
    tester,
  ) async {
    int selected = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (context, setState) {
              return CategoryTabBar(
                categories: const [
                  {
                    'titleMr': 'किल्ले',
                    'subtitleEn': 'Forts',
                    'icon': Icons.castle_rounded,
                  },
                  {
                    'titleMr': 'वीर',
                    'subtitleEn': 'Warriors',
                    'icon': Icons.shield_rounded,
                  },
                  {
                    'titleMr': 'इतिहास',
                    'subtitleEn': 'History',
                    'icon': Icons.menu_book_rounded,
                  },
                  {
                    'titleMr': 'संस्कृती',
                    'subtitleEn': 'Culture',
                    'icon': Icons.account_balance_rounded,
                  },
                ],
                selectedIndex: selected,
                onSelect: (index) => setState(() => selected = index),
              );
            },
          ),
        ),
      ),
    );

    expect(find.text('किल्ले'), findsOneWidget);
    expect(find.text('वीर'), findsOneWidget);
    expect(find.text('इतिहास'), findsOneWidget);
    expect(find.text('संस्कृती'), findsOneWidget);

    // Tap on 'वीर' (Warriors) tab
    await tester.tap(find.text('वीर'));
    await tester.pumpAndSettle();

    expect(selected, equals(1));
  });

  testWidgets('FeaturedBanner renders title, subtitle and CTA button', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: FeaturedBanner())),
    );

    expect(find.text('छत्रपती शिवाजी महाराज'), findsOneWidget);
    expect(find.text('एक प्रेरणास्थान'), findsOneWidget);
    expect(find.text('माहिती पहा'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_forward_rounded), findsOneWidget);
  });

  testWidgets(
    'Full HeritageListScreen renders all sections, 6 forts, and scrolls cleanly',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.75;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(const MaterialApp(home: HeritageListScreen()));
      await tester.pumpAndSettle();

      // Check Header & Category Tab Bar
      expect(find.byType(HeritageHeroHeader), findsOneWidget);
      expect(find.byType(CategoryTabBar), findsOneWidget);

      // Check Section Header & Sort button
      expect(find.text('महाराष्ट्रातील किल्ले'), findsOneWidget);
      expect(
        find.text('स्वराज्याचे साक्षीदार, शौर्याची प्रतिके'),
        findsOneWidget,
      );
      expect(find.text('लोकप्रियतेनुसार ▾'), findsOneWidget);

      // Check FortCards
      expect(find.byType(FortCard), findsNWidgets(6));
      expect(find.text('राजगड किल्ला'), findsWidgets);
      expect(find.text('प्रतापगड किल्ला'), findsOneWidget);
      expect(find.text('सिंहगड किल्ला'), findsOneWidget);
      expect(find.text('शिवनेरी किल्ला'), findsOneWidget);
      expect(find.text('रायगड किल्ला'), findsOneWidget);
      expect(find.text('तोरणा किल्ला'), findsOneWidget);

      // Check Bottom Nav Bar
      expect(find.byType(CustomBottomNavBar), findsOneWidget);

      // Tap favorite heart on the first visible card
      final firstHeart = find.byIcon(Icons.favorite_border_rounded).first;
      await tester.tap(firstHeart);
      await tester.pump();

      // Verify it turned into favorite_rounded
      expect(find.byIcon(Icons.favorite_rounded), findsWidgets);

      // Scroll down to view the FeaturedBanner
      await tester.drag(
        find.byType(SingleChildScrollView),
        const Offset(0, -600),
      );
      await tester.pumpAndSettle();

      expect(find.byType(FeaturedBanner), findsOneWidget);
    },
  );

  testWidgets(
    'Switching to Warriors tab renders warriors header, 6 warrior cards, and Tanaji banner',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.75;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(const MaterialApp(home: HeritageListScreen()));
      await tester.pumpAndSettle();

      // Tap on the 'वीर' (Warriors) tab
      await tester.tap(find.text('वीर'));
      await tester.pumpAndSettle();

      // Verify section header swapped
      expect(find.text('महाराष्ट्रातील वीर योद्धे'), findsOneWidget);
      expect(find.text('पराक्रमाची गाथा, शौर्याचा वारसा'), findsOneWidget);

      // Verify 6 WarriorCards rendered
      expect(find.byType(WarriorCard), findsNWidgets(6));
      expect(find.text('छत्रपती शिवाजी महाराज'), findsWidgets);
      expect(find.text('छत्रपती संभाजी महाराज'), findsOneWidget);
      expect(find.text('राणी ताराबाई'), findsOneWidget);
      expect(find.text('बाजीराव पेशवा'), findsOneWidget);
      expect(find.text('तानाजी मालुसरे'), findsOneWidget);
      expect(find.text('हंबीरराव मोहिते'), findsOneWidget);

      // Verify role tags and era
      expect(find.text('मराठा साम्राज्याचे संस्थापक'), findsOneWidget);
      expect(find.text('इ.स. १६३० – १६८०'), findsOneWidget);

      // Toggle favorite on warrior card
      final firstHeart = find.byIcon(Icons.favorite_border_rounded).first;
      await tester.tap(firstHeart);
      await tester.pump();
      expect(find.byIcon(Icons.favorite_rounded), findsWidgets);

      // Scroll down to check the updated FeaturedBanner
      await tester.drag(
        find.byType(SingleChildScrollView),
        const Offset(0, -600),
      );
      await tester.pumpAndSettle();

      expect(find.text('नरवीर तानाजी मालुसरे'), findsOneWidget);
      expect(find.text('सिंहगडाचे अमर सेनानी'), findsOneWidget);
      expect(find.text('चरित्र पहा'), findsOneWidget);
    },
  );
}
