import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:app/screens/fort_detail_screen.dart';

void main() {
  testWidgets(
    'FortDetailScreen renders Rajgad with carousel header, Marathi title, altitude and quote',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(home: FortDetailScreen(fortId: 'rajgad')),
      );

      // Header checks
      expect(find.text('राजगड किल्ला'), findsOneWidget);
      expect(find.text('स्वराज्याची पहिली राजधानी'), findsWidgets);
      expect(find.text('स्वराज्याचा अभिमान'), findsOneWidget);
      expect(find.text('पुणे, महाराष्ट्र'), findsOneWidget);
      expect(find.text('१,३७६ मी. (४,५१४ फूट)'), findsOneWidget);
      expect(find.text('ट्रेकिंग • ऐतिहासिक • निसर्गरम्य'), findsOneWidget);

      // Quote checks
      expect(
        find.text('“ गड आला\nपण सिंह गेला तरी चालेल,\nपण गड राहिला पाहिजे. ”'),
        findsOneWidget,
      );

      // Action button checks
      expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
      expect(find.byIcon(Icons.share_rounded), findsOneWidget);
      expect(find.byIcon(Icons.favorite_border_rounded), findsOneWidget);
    },
  );

  testWidgets(
    'FortDetailScreen renders Sinhgad details and attractions accurately',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(home: FortDetailScreen(fortId: 'sinhgad')),
      );

      expect(find.text('सिंहगड किल्ला'), findsOneWidget);
      expect(find.text('गड आला पण सिंह गेला!'), findsWidgets);
      expect(find.text('नरवीर तानाजी मालुसरे स्मारक'), findsOneWidget);
      expect(find.text('कल्याण दरवाजा'), findsOneWidget);
      expect(find.text('देवटाके'), findsOneWidget);
    },
  );

  testWidgets(
    'FortDetailScreen renders Pratapgad details and Bhavani Mata Temple',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(home: FortDetailScreen(fortId: 'pratapgad')),
      );

      expect(find.text('प्रतापगड किल्ला'), findsOneWidget);
      expect(find.text('अफझलखान वधाचा रणसंग्राम'), findsWidgets);
      expect(find.text('भवानी माता मंदिर'), findsOneWidget);
      expect(find.text('अफझलखान वध स्थळ'), findsOneWidget);
    },
  );

  testWidgets('FortDetailScreen renders Shivneri details and birthplace hall', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(home: FortDetailScreen(fortId: 'shivneri')),
    );

    expect(find.text('शिवनेरी किल्ला'), findsOneWidget);
    expect(find.text('जेथे स्वराज्याची पहाट उगवली'), findsWidgets);
    expect(find.text('शिवजन्मस्थान इमारत'), findsOneWidget);
    expect(find.text('शिवाई देवी मंदिर'), findsOneWidget);
  });

  testWidgets('FortDetailScreen renders Raigad details and throne court', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(home: FortDetailScreen(fortId: 'raigad')),
    );

    expect(find.text('रायगड किल्ला'), findsOneWidget);
    expect(find.text('शिवछत्रपतींचा राज्याभिषेक सोहळा'), findsWidgets);
    expect(find.text('राजसभा व मेघडंबरी'), findsOneWidget);
    expect(find.text('छत्रपती शिवाजी महाराज समाधी'), findsOneWidget);
  });

  testWidgets('FortDetailScreen renders Torna details and Zunjar Machi', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(home: FortDetailScreen(fortId: 'torna')),
    );

    expect(find.text('तोरणा किल्ला (प्रचंडगड)'), findsOneWidget);
    expect(
      find.text('वयाच्या १६ व्या वर्षी महाराजांनी जिंकलेला गड'),
      findsWidgets,
    );
    expect(find.text('झुंझार माची'), findsOneWidget);
    expect(find.text('बुधला माची व तोरणजाई मंदिर'), findsOneWidget);
  });

  testWidgets('FortDetailScreen switches tabs across different sections', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(home: FortDetailScreen(fortId: 'rajgad')),
    );

    // Switch to How to Reach
    await tester.tap(find.text('कसे जायचे'));
    await tester.pumpAndSettle();
    expect(
      find.text('मार्ग १: पुणे ते गुंजवणे गाव (साहसी ट्रेक)'),
      findsOneWidget,
    );

    // Switch to Trek Info
    await tester.tap(find.text('ट्रेक माहिती'));
    await tester.pumpAndSettle();
    expect(find.text('१. पाली दरवाजा मार्ग (राजमार्ग)'), findsOneWidget);

    // Switch to Photos
    await tester.tap(find.text('छायाचित्रे'));
    await tester.pumpAndSettle();
    expect(find.text('राजगड किल्ला छायाचित्र दालन'), findsOneWidget);
  });
}
