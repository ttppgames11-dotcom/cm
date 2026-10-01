import 'package:flutter/material.dart';

import '../data/history_part2_data.dart';
import '../models/history_models.dart';
import '../widgets/content_kit.dart';

/// मराठा चळवळी, मूक मोर्चे व ऐतिहासिक लढा (website: MovementsPage.jsx).
///
/// Read-only: the website's add/edit form only saves to the visitor's own
/// browser, so nobody else ever sees those edits. The website's "official
/// record ✓" badges are also omitted — nothing on the page backs them.
class MovementsScreen extends StatefulWidget {
  const MovementsScreen({super.key});

  @override
  State<MovementsScreen> createState() => _MovementsScreenState();
}

class _MovementsScreenState extends State<MovementsScreen> {
  int _category = 0;

  @override
  Widget build(BuildContext context) {
    final cat = HistoryPart2Data.movementCategories[_category].$1;
    final movements =
        cat == 'all'
            ? HistoryPart2Data.movements
            : HistoryPart2Data.movements
                .where((m) => m.category == cat)
                .toList();

    return ContentPage(
      hero: ContentHero(
        badge: '✊ ऐतिहासिक लोकआंदोलने',
        title: 'मराठा चळवळी, मूक मोर्चे व ऐतिहासिक लढा',
        subtitle:
            '५८ मूक मोर्चे, आरक्षण लढा, सारथी निर्मिती, अण्णासाहेब पाटील महामंडळ, गड संवर्धन आणि शेतकरी एल्गार.',
        stats: [
          ('${HistoryPart2Data.movements.length}', 'नोंदवलेली आंदोलने'),
          ('५८', 'ऐतिहासिक मूक मोर्चे'),
        ],
      ),
      children: [
        const SizedBox(height: 16),
        FilterChipBar(
          labels: [for (final c in HistoryPart2Data.movementCategories) c.$2],
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            children: [for (final m in movements) _MovementCard(movement: m)],
          ),
        ),
      ],
    );
  }
}

class _MovementCard extends StatelessWidget {
  const _MovementCard({required this.movement});

  final Movement movement;

  @override
  Widget build(BuildContext context) {
    final m = movement;
    return InfoCard(
      title: m.title,
      subtitle: '📅 ${m.period}',
      tag: m.categoryLabel,
      body: m.description,
      facts: [('सहभागी', m.participants), ('प्रमुख कार्यक्षेत्र', m.locations)],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const MiniHeading('📋 प्रमुख मागण्या'),
          BulletList(items: m.demands),
          const MiniHeading('🎯 मिळालेले यश व फलश्रुती'),
          BulletList(items: m.outcomes, bullet: '✓'),
        ],
      ),
    );
  }
}
