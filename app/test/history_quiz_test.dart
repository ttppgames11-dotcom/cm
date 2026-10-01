import 'dart:math';

import 'package:app/features/history/data/history_part2_data.dart';
import 'package:app/features/history/data/history_quiz_data.dart';
import 'package:app/features/history/screens/history_quiz_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('quiz question bank', () {
    test('every question is well formed', () {
      final ids = <String>{};
      for (final q in HistoryQuizData.all) {
        expect(ids.add(q.id), isTrue, reason: 'duplicate id ${q.id}');
        expect(q.options, hasLength(4), reason: q.id);
        expect(q.correct, inInclusiveRange(0, 3), reason: q.id);
        expect(q.options.toSet(), hasLength(4), reason: 'duplicate option in ${q.id}');
        expect(
          HistoryPart2Data.quizCategoryLabels.containsKey(q.category),
          isTrue,
          reason: 'unknown category in ${q.id}',
        );
        expect(q.explanation, isNotEmpty, reason: q.id);
        expect(q.source, isNotEmpty, reason: q.id);
      }
    });

    test('answers are not always in the same position', () {
      final positions = {for (final q in HistoryQuizData.all) q.correct};
      expect(positions.length, greaterThan(2));
    });
  });

  testWidgets('a full round ends with a result and saves the best score', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(400, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      MaterialApp(home: HistoryQuizScreen(random: Random(7))),
    );
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('क्विझ सुरू करा →'));
    await tester.tap(find.text('क्विझ सुरू करा →'));
    await tester.pumpAndSettle();

    for (var i = 0; i < 10; i++) {
      expect(find.text('प्रश्न ${i + 1} / 10'), findsOneWidget);
      // Answer with the first option ("अ").
      final first = find.text('अ');
      await tester.ensureVisible(first);
      await tester.tap(first);
      await tester.pumpAndSettle();
      expect(
        find.textContaining(RegExp('बरोबर उत्तर!|चुकीचे उत्तर')),
        findsOneWidget,
      );
      final next = find.text(i < 9 ? 'पुढील प्रश्न →' : 'निकाल पहा');
      await tester.ensureVisible(next);
      await tester.tap(next);
      await tester.pumpAndSettle();
    }

    expect(find.text('आपला निकाल'), findsOneWidget);
    expect(find.textContaining('आपली उपाधी:'), findsOneWidget);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getInt('cm_quiz_best_percent'), isNotNull);
  });
}
