import 'package:app/features/culture/data/culture_data.dart';
import 'package:app/features/culture/screens/culture_hub_screen.dart';
import 'package:app/features/culture/screens/food_culture_screen.dart';
import 'package:app/features/culture/screens/gramdevat_jatra_screen.dart';
import 'package:app/features/culture/screens/heritage_places_screen.dart';
import 'package:app/features/culture/screens/shivkal_festivals_screen.dart';
import 'package:app/features/history/screens/knowledge_graph_screen.dart';
import 'package:app/features/history/screens/swarajya_admin_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// The page-level layout test only sees each screen's first state. This one
/// opens the tabs, calculator and bottom sheets that need a tap to appear, on
/// the smallest phone and with enlarged system text.
void main() {
  const setups = <String, (Size, double)>{
    'small 320': (Size(320, 640), 1.0),
    'big-font 360': (Size(360, 740), 1.3),
  };

  for (final setup in setups.entries) {
    testWidgets('${setup.key}: every Swarajya administration section fits', (
      tester,
    ) async {
      final errors = await _collectLayoutErrors(tester, setup.value, () async {
        await tester.pumpWidget(const MaterialApp(home: SwarajyaAdminScreen()));
        await tester.pumpAndSettle();
        for (final label in [
          '🌾 महसूल व काठी मोजणी गणक',
          '🏰 किल्ले प्रशासनाची त्रिमूर्ती',
          '📜 आज्ञापत्र व पर्यावरण नीती',
          '🪙 नाणी, गुप्तहेर व न्यायव्यवस्था',
          '👑 अष्टप्रधान मंडळ',
        ]) {
          await tester.ensureVisible(find.text(label));
          await tester.tap(find.text(label));
          await tester.pumpAndSettle();
          await _scrollThrough(tester);
        }
        // Revenue calculator in drought mode.
        await tester.ensureVisible(find.text('🌾 महसूल व काठी मोजणी गणक'));
        await tester.tap(find.text('🌾 महसूल व काठी मोजणी गणक'));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.byType(Switch));
        await tester.tap(find.byType(Switch));
        await tester.pumpAndSettle();
        expect(find.text('₹2500'), findsOneWidget); // 5 bigha × 500
        // Minister detail sheet.
        await tester.ensureVisible(find.text('👑 अष्टप्रधान मंडळ'));
        await tester.tap(find.text('👑 अष्टप्रधान मंडळ'));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('सविस्तर सनद पहा →').first);
        await tester.tap(find.text('सविस्तर सनद पहा →').first);
        await tester.pumpAndSettle();
        expect(find.text('अधिकृत शासकीय सनद'), findsOneWidget);
      });
      expect(errors, isEmpty, reason: errors.join('\n'));
    });

    for (final sheet in <(String, Widget, String)>[
      ('region', const CultureHubScreen(), 'प्रदेशाची सविस्तर ओळख →'),
      ('food', const FoodCultureScreen(), 'सविस्तर ज्ञान कार्ड →'),
      ('deity', const GramdevatJatraScreen(), 'सविस्तर माहिती →'),
      ('place', const HeritagePlacesScreen(), 'सविस्तर माहिती व नकाशा →'),
    ]) {
      testWidgets('${setup.key}: culture ${sheet.$1} detail sheet fits', (
        tester,
      ) async {
        final errors = await _collectLayoutErrors(tester, setup.value, () async {
          await tester.pumpWidget(MaterialApp(home: sheet.$2));
          await tester.pumpAndSettle();
          final open = find.text(sheet.$3).first;
          await tester.ensureVisible(open);
          await tester.tap(open);
          await tester.pumpAndSettle();
          await _scrollThrough(tester);
        });
        expect(errors, isEmpty, reason: errors.join('\n'));
      });
    }

    testWidgets('${setup.key}: gramdevat tabs and festival comparisons fit', (
      tester,
    ) async {
      final errors = await _collectLayoutErrors(tester, setup.value, () async {
        await tester.pumpWidget(const MaterialApp(home: GramdevatJatraScreen()));
        await tester.pumpAndSettle();
        for (final tab in [
          '🎪 जत्रा व उत्सव दिनदर्शिका',
          '🎭 नाट्य, तमाशा व दशावतार',
          '🏏 पारंपरिक देशी खेळ',
        ]) {
          await tester.ensureVisible(find.text(tab));
          await tester.tap(find.text(tab));
          await tester.pumpAndSettle();
          await _scrollThrough(tester);
        }
        await tester.pumpWidget(const MaterialApp(home: ShivkalFestivalsScreen()));
        await tester.pumpAndSettle();
        for (final c in CultureData.festivalComparisons.skip(1)) {
          final chip = find.text(c.title.split('—').first.trim());
          await tester.ensureVisible(chip);
          await tester.tap(chip);
          await tester.pumpAndSettle();
        }
        await _scrollThrough(tester);
      });
      expect(errors, isEmpty, reason: errors.join('\n'));
    });

    testWidgets('${setup.key}: knowledge graph event sheet fits', (
      tester,
    ) async {
      final errors = await _collectLayoutErrors(tester, setup.value, () async {
        await tester.pumpWidget(const MaterialApp(home: KnowledgeGraphScreen()));
        await tester.pumpAndSettle();
        final open = find.text('संबंध आलेख पहा →').first;
        await tester.ensureVisible(open);
        await tester.tap(open);
        await tester.pumpAndSettle();
        expect(find.text('👑 संबंधित व्यक्ती'), findsOneWidget);
        await _scrollThrough(tester);
      });
      expect(errors, isEmpty, reason: errors.join('\n'));
    });
  }
}

Future<List<String>> _collectLayoutErrors(
  WidgetTester tester,
  (Size, double) setup,
  Future<void> Function() body,
) async {
  tester.view.physicalSize = setup.$1;
  tester.view.devicePixelRatio = 1;
  tester.platformDispatcher.textScaleFactorTestValue = setup.$2;
  addTearDown(tester.view.reset);
  addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

  final errors = <String>[];
  final previous = FlutterError.onError;
  FlutterError.onError = (d) {
    final where = RegExp(r'lib/[\w/]+\.dart:\d+:\d+').firstMatch(d.toString());
    errors.add(
      '${d.exceptionAsString().split('\n').first} @ ${where?.group(0) ?? '?'}',
    );
  };
  try {
    await body();
  } finally {
    FlutterError.onError = previous;
  }
  return errors;
}

Future<void> _scrollThrough(WidgetTester tester) async {
  final scrollables = find.byType(Scrollable);
  if (scrollables.evaluate().isEmpty) return;
  for (var i = 0; i < 6; i++) {
    await tester.drag(scrollables.last, const Offset(0, -500), warnIfMissed: false);
    await tester.pumpAndSettle();
  }
}
