import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// मराठी चित्रपट (website: MarathiMoviesPage.jsx).
///
/// Information only. The website's "watch now / HD trailer streaming" and
/// "official partner: YouTube / Zee Studios / Jio Cinema" claims have nothing
/// behind them, and its star ratings are not sourced, so none are shown.
class FilmsScreen extends StatefulWidget {
  const FilmsScreen({super.key});

  @override
  State<FilmsScreen> createState() => _FilmsScreenState();
}

class _FilmsScreenState extends State<FilmsScreen> {
  int _category = 0;

  @override
  Widget build(BuildContext context) {
    final cat = CultureData.filmCategories[_category];
    final films =
        _category == 0
            ? CultureData.films
            : CultureData.films.where((f) => f.category == cat).toList();

    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF1F1147), Color(0xFF4C1D95)],
        badge: '🎬 मराठी चित्रपट',
        title: 'मनाला भिडणारे मराठी चित्रपट !',
        subtitle:
            'मराठी कथा, मराठी स्वाभिमान ! मराठी चित्रपट पहा, मराठी कलाकारांना साथ द्या — मराठी संस्कृती जपा, मराठी सिनेमाचा अभिमान वाढवा !',
      ),
      children: [
        const SizedBox(height: 16),
        FilterChipBar(
          labels: CultureData.filmCategories,
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'या विभागात चित्रपट नाहीत.',
            children: [
              for (final f in films)
                InfoCard(
                  emoji: '🎬',
                  title: f.title,
                  subtitle: '${f.year} • ${f.genre}',
                  tag: f.category,
                  body: f.description,
                  facts: [('कलाकार', f.cast)],
                ),
            ],
          ),
        ),
      ],
    );
  }
}
