import 'package:app/screens/warrior_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget createTestApp(Widget child) {
  return MaterialApp(home: child);
}

void main() {
  testWidgets(
    'WarriorDetailScreen renders Shivaji Maharaj details, quote, and specs',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        createTestApp(const WarriorDetailScreen(warriorId: 'shivaji')),
      );
      await tester.pumpAndSettle();

      // Verify Name, Tag, Era
      expect(find.text('छत्रपती शिवाजी महाराज'), findsOneWidget);
      expect(find.text('मराठा साम्राज्याचे संस्थापक'), findsOneWidget);
      expect(find.text('इ.स. १६३० – १६८०'), findsOneWidget);

      // Verify Quote
      expect(
        find.text('हे राज्य व्हावे, हे तो श्रींची इच्छा!'),
        findsOneWidget,
      );

      // Verify Specs
      expect(find.text('महत्वाचे ऐतिहासिक तपशील'), findsOneWidget);
      expect(find.text('जन्म'), findsOneWidget);
      expect(find.text('१९ फेब्रुवारी १६३०, किल्ले शिवनेरी'), findsOneWidget);
      expect(find.text('किल्ले रायगड, महाड'), findsOneWidget);
    },
  );

  testWidgets(
    'WarriorDetailScreen renders Sambhaji Maharaj with battles and quote',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        createTestApp(const WarriorDetailScreen(warriorId: 'sambhaji')),
      );
      await tester.pumpAndSettle();

      expect(find.text('छत्रपती संभाजी महाराज'), findsOneWidget);
      expect(find.text('द्वितीय छत्रपती व धर्मवीर'), findsOneWidget);
      expect(
        find.text(
          'मरण आले तरी चालेल, पण स्वधर्म आणि स्वराज्य कधी सोडणार नाही!',
        ),
        findsOneWidget,
      );
      expect(find.text('वडू बुद्रुक, भीमा नदी काठ'), findsOneWidget);
    },
  );

  testWidgets('WarriorDetailScreen renders Tarabai details and biography', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(const WarriorDetailScreen(warriorId: 'tarabai')),
    );
    await tester.pumpAndSettle();

    expect(find.text('राणी ताराबाई'), findsOneWidget);
    expect(find.text('स्वराज्य संरक्षिका व विरांगना'), findsOneWidget);
    expect(find.text('कोल्हापूर, पंचगंगा नदी काठ'), findsOneWidget);
  });

  testWidgets('WarriorDetailScreen renders Bajirao Peshwa and quote', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(const WarriorDetailScreen(warriorId: 'bajirao')),
    );
    await tester.pumpAndSettle();

    expect(find.text('बाजीराव पेशवा'), findsOneWidget);
    expect(
      find.text('हल्ला शत्रूच्या मुळावर करा, फांद्या आपोआप गळून पडतील!'),
      findsOneWidget,
    );
    expect(find.text('रावेरखेडी, नर्मदा नदी काठ, मध्य प्रदेश'), findsOneWidget);
  });

  testWidgets('WarriorDetailScreen renders Tanaji Malusare details', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(const WarriorDetailScreen(warriorId: 'tanaji')),
    );
    await tester.pumpAndSettle();

    expect(find.text('तानाजी मालुसरे'), findsOneWidget);
    expect(
      find.text('आधी लगीन कोंढाण्याचं, मग माझ्या रायबाचं!'),
      findsOneWidget,
    );
    expect(find.text('इ.स. १६००, उमरठ, पोलादपूर (कोकण)'), findsOneWidget);
  });

  testWidgets('WarriorDetailScreen renders Hambirrao Mohite details', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(const WarriorDetailScreen(warriorId: 'hambirrao')),
    );
    await tester.pumpAndSettle();

    expect(find.text('हंबीरराव मोहिते'), findsOneWidget);
    expect(
      find.text('राजांचे रक्षण करणे हाच माझ्या रक्ताचा अखेरचा धर्म!'),
      findsOneWidget,
    );
    expect(find.text('तळबीड, कराड, सातारा'), findsOneWidget);
  });

  testWidgets('WarriorDetailScreen switches tabs and shows battle modal', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      createTestApp(const WarriorDetailScreen(warriorId: 'shivaji')),
    );
    await tester.pumpAndSettle();

    // 1. Switch to 'प्रमुख लढाया' tab
    final battlesTab = find.text('प्रमुख लढाया');
    expect(battlesTab, findsOneWidget);
    await tester.ensureVisible(battlesTab);
    await tester.pumpAndSettle();
    await tester.tap(battlesTab);
    await tester.pumpAndSettle();

    expect(find.text('ऐतिहासिक लढाया व मोहिमा'), findsOneWidget);
    expect(find.text('प्रतापगडची लढाई व अफझलखान वध'), findsOneWidget);

    // 2. Open battle bottom sheet
    final viewDetailsBtn = find.text('सविस्तर रणनीती व परिणाम पहा').first;
    await tester.ensureVisible(viewDetailsBtn);
    await tester.pumpAndSettle();
    await tester.tap(viewDetailsBtn);
    await tester.pumpAndSettle();

    expect(find.text('शत्रू सेनापती / सत्ता'), findsOneWidget);
    expect(find.text('मराठा रणनीती व डावपेच'), findsOneWidget);
    expect(find.text('युद्धाचा ऐतिहासिक परिणाम'), findsOneWidget);

    // Close bottom sheet
    final closeBtn = find.text('बंद करा');
    await tester.tap(closeBtn);
    await tester.pumpAndSettle();

    // 3. Switch to 'जीवनप्रवास' (Timeline) tab
    final timelineTab = find.text('जीवनप्रवास');
    await tester.ensureVisible(timelineTab);
    await tester.pumpAndSettle();
    await tester.tap(timelineTab);
    await tester.pumpAndSettle();

    expect(find.text('जीवनक्रम व महत्वाचे टप्पे'), findsOneWidget);
    expect(find.text('१६३०'), findsOneWidget);
    expect(find.text('जन्म शिवनेरीवर'), findsOneWidget);

    // 4. Switch to 'प्रेरणादायी प्रसंग' tab
    final legendsTab = find.text('प्रेरणादायी प्रसंग');
    await tester.ensureVisible(legendsTab);
    await tester.pumpAndSettle();
    await tester.tap(legendsTab);
    await tester.pumpAndSettle();

    expect(find.text('प्रेरणादायी संदेश'), findsOneWidget);
  });
}
