import 'dart:math';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_part2_data.dart';
import '../data/history_quiz_data.dart';
import '../models/history_models.dart';
import '../widgets/content_kit.dart';

/// छत्रपती शिवराय व स्वराज्य इतिहास महाक्विझ (website: MarathaQuizPage.jsx).
///
/// Offline: questions ship with the app and the best score is kept on this
/// device. The website's leaderboard needs the server (and its starting rows
/// are made-up names), so it is not included yet.
class HistoryQuizScreen extends StatefulWidget {
  const HistoryQuizScreen({super.key, this.random});

  /// Injectable for tests.
  final Random? random;

  @override
  State<HistoryQuizScreen> createState() => _HistoryQuizScreenState();
}

enum _Stage { setup, playing, result }

class _HistoryQuizScreenState extends State<HistoryQuizScreen> {
  static const _roundSize = 10;
  static const _allId = 'ALL';
  static const _bestKey = 'cm_quiz_best_percent';

  late final Random _random = widget.random ?? Random();
  _Stage _stage = _Stage.setup;
  String _category = _allId;
  List<QuizQuestion> _questions = const [];
  final Map<int, int> _answers = {};
  int _index = 0;
  bool _showHint = false;
  int? _best;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) {
      if (mounted) setState(() => _best = prefs.getInt(_bestKey));
    });
  }

  List<String> get _categoryIds => [_allId, ...HistoryQuizData.categories];

  int get _correctCount =>
      _answers.entries
          .where((e) => _questions[e.key].correct == e.value)
          .length;

  void _start() {
    final pool =
        _category == _allId
            ? [...HistoryQuizData.all]
            : HistoryQuizData.all
                .where((q) => q.category == _category)
                .toList();
    pool.shuffle(_random);
    setState(() {
      _questions = pool.take(_roundSize).toList();
      _answers.clear();
      _index = 0;
      _showHint = false;
      _stage = _Stage.playing;
    });
  }

  void _answer(int option) {
    if (_answers.containsKey(_index)) return;
    setState(() => _answers[_index] = option);
  }

  Future<void> _next() async {
    if (_index < _questions.length - 1) {
      setState(() {
        _index++;
        _showHint = false;
      });
      return;
    }
    final percent = (_correctCount * 100 / _questions.length).round();
    setState(() => _stage = _Stage.result);
    if (_best == null || percent > _best!) {
      setState(() => _best = percent);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_bestKey, percent);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: ContentHero(
        badge: '🏆 इतिहास ज्ञान क्विझ',
        title: 'छत्रपती शिवराय व स्वराज्य इतिहास महाक्विझ',
        subtitle:
            'विषय निवडा, प्रश्न सोडवा आणि आपली इतिहासाची जाण तपासा. प्रत्येक उत्तरानंतर सविस्तर स्पष्टीकरण व संदर्भ.',
        stats: [
          ('${HistoryQuizData.all.length}', 'प्रश्न'),
          ('${HistoryQuizData.categories.length}', 'विषय'),
          if (_best != null) ('$_best%', 'आपला सर्वोत्तम निकाल'),
        ],
      ),
      children: [
        switch (_stage) {
          _Stage.setup => _buildSetup(),
          _Stage.playing => _buildQuestion(),
          _Stage.result => _buildResult(),
        },
      ],
    );
  }

  String _label(String id) => HistoryPart2Data.quizCategoryLabels[id] ?? id;

  Widget _buildSetup() {
    return ContentSection(
      title: 'विषय निवडा',
      subtitle: 'प्रत्येक फेरीत $_roundSize प्रश्न (किंवा विषयात असतील तितके).',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final id in _categoryIds)
                ChoiceChip(
                  label: Text(id == _allId ? '🚩 सर्व विषय' : _label(id)),
                  selected: _category == id,
                  onSelected: (_) => setState(() => _category = id),
                  showCheckmark: false,
                  selectedColor: HeritageColors.maroon,
                  labelStyle: HomeTheme.marathiBody(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: _category == id ? Colors.white : HomeTheme.textDark,
                    height: 1.2,
                  ),
                  backgroundColor: Colors.white,
                  side: const BorderSide(color: HeritageColors.line),
                ),
            ],
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _start,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFE65100),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: Text(
              'क्विझ सुरू करा →',
              style: HomeTheme.marathiBody(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion() {
    final q = _questions[_index];
    final chosen = _answers[_index];
    final answered = chosen != null;

    return ContentSection(
      title: 'प्रश्न ${_index + 1} / ${_questions.length}',
      subtitle: _label(q.category),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          LinearProgressIndicator(
            value: (_index + (answered ? 1 : 0)) / _questions.length,
            color: HomeTheme.primaryOrange,
            backgroundColor: HeritageColors.line,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
          ),
          const SizedBox(height: 14),
          Text(
            q.question,
            style: HomeTheme.marathiHeading(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: HeritageColors.maroonDark,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 12),
          for (var i = 0; i < q.options.length; i++)
            _OptionTile(
              text: q.options[i],
              index: i,
              state:
                  !answered
                      ? _OptionState.idle
                      : i == q.correct
                      ? _OptionState.correct
                      : i == chosen
                      ? _OptionState.wrong
                      : _OptionState.dimmed,
              onTap: answered ? null : () => _answer(i),
            ),
          if (!answered && q.hint != null) ...[
            const SizedBox(height: 4),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => setState(() => _showHint = !_showHint),
                icon: const Icon(Icons.lightbulb_outline_rounded),
                label: Text(_showHint ? 'संकेत लपवा' : 'संकेत पहा'),
              ),
            ),
            if (_showHint)
              Text(
                '💡 ${q.hint!}',
                style: HomeTheme.marathiBody(
                  fontSize: 13,
                  color: HeritageColors.saffronDeep,
                  height: 1.5,
                ),
              ),
          ],
          if (answered) ...[
            const SizedBox(height: 8),
            InfoCard(
              emoji: chosen == q.correct ? '✅' : '❌',
              title: chosen == q.correct ? 'बरोबर उत्तर!' : 'चुकीचे उत्तर',
              accent:
                  chosen == q.correct
                      ? const Color(0xFF16A34A)
                      : const Color(0xFFDC2626),
              body: q.explanation,
              facts: [('संदर्भ', q.source)],
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _next,
              style: FilledButton.styleFrom(
                backgroundColor: HeritageColors.maroon,
                padding: const EdgeInsets.symmetric(vertical: 13),
              ),
              child: Text(
                _index < _questions.length - 1 ? 'पुढील प्रश्न →' : 'निकाल पहा',
                style: HomeTheme.marathiBody(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Rank titles from the website (getRankBadge).
  (String, String, String) _rank(int percent) {
    if (percent >= 90) {
      return (
        '🎖️',
        'स्वराज्य इतिहास भूषण',
        'छत्रपती शिवरायांच्या इतिहासाचे गाढे अभ्यासक व विद्वान!',
      );
    }
    if (percent >= 70) {
      return (
        '⚔️',
        'रणमर्द शूर सरदार',
        'मराठा इतिहासाची अचूक जाण व रणनीतीकार ज्ञान!',
      );
    }
    if (percent >= 50) {
      return (
        '🛡️',
        'जागृत मावळा',
        'चांगले ज्ञान! आणखी सखोल वाचनाने आपण सरदार पद गाठू शकता.',
      );
    }
    return (
      '📖',
      'उत्साही इतिहास अभ्यासक',
      'इतिहास जाणून घेण्याची चांगली सुरुवात. पुन्हा प्रयत्न करा!',
    );
  }

  Widget _buildResult() {
    final percent = (_correctCount * 100 / _questions.length).round();
    final rank = _rank(percent);
    return ContentSection(
      title: 'आपला निकाल',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InfoCard(
            emoji: rank.$1,
            title: 'आपली उपाधी: ${rank.$2}',
            subtitle: '$percent% ($_correctCount / ${_questions.length} बरोबर)',
            body: rank.$3,
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _start,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFE65100),
              padding: const EdgeInsets.symmetric(vertical: 13),
            ),
            child: Text(
              'पुन्हा खेळा',
              style: HomeTheme.marathiBody(
                fontSize: 14.5,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
          TextButton(
            onPressed: () => setState(() => _stage = _Stage.setup),
            child: const Text('दुसरा विषय निवडा'),
          ),
          const MiniHeading('📋 सर्व प्रश्नांचे पुनरावलोकन'),
          CardList(
            children: [
              for (var i = 0; i < _questions.length; i++)
                InfoCard(
                  emoji: _answers[i] == _questions[i].correct ? '✅' : '❌',
                  title: _questions[i].question,
                  accent:
                      _answers[i] == _questions[i].correct
                          ? const Color(0xFF16A34A)
                          : const Color(0xFFDC2626),
                  facts: [
                    if (_answers[i] != null &&
                        _answers[i] != _questions[i].correct)
                      ('आपले उत्तर', _questions[i].options[_answers[i]!]),
                    (
                      'बरोबर उत्तर',
                      _questions[i].options[_questions[i].correct],
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

enum _OptionState { idle, correct, wrong, dimmed }

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.text,
    required this.index,
    required this.state,
    required this.onTap,
  });

  final String text;
  final int index;
  final _OptionState state;
  final VoidCallback? onTap;

  static const _labels = ['अ', 'ब', 'क', 'ड'];

  @override
  Widget build(BuildContext context) {
    final (bg, border) = switch (state) {
      _OptionState.correct => (
        const Color(0xFFEAF7EE),
        const Color(0xFF16A34A),
      ),
      _OptionState.wrong => (const Color(0xFFFDECEC), const Color(0xFFDC2626)),
      _OptionState.dimmed => (const Color(0xFFF7F4F0), HeritageColors.line),
      _OptionState.idle => (Colors.white, HeritageColors.line),
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: border, width: 1.5),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 26,
                  height: 26,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: border.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    _labels[index % _labels.length],
                    style: HomeTheme.marathiBody(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: HeritageColors.maroonDark,
                      height: 1.1,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    text,
                    style: HomeTheme.marathiBody(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: HomeTheme.textDark,
                      height: 1.45,
                    ),
                  ),
                ),
                if (state == _OptionState.correct)
                  const Icon(
                    Icons.check_circle_rounded,
                    color: Color(0xFF16A34A),
                  ),
                if (state == _OptionState.wrong)
                  const Icon(Icons.cancel_rounded, color: Color(0xFFDC2626)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
