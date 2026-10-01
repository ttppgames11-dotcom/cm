import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_part2_data.dart';
import '../models/history_models.dart';
import '../widgets/content_kit.dart';

/// Connect Maratha ज्ञानकोश (website: DnyankoshPage.jsx).
class DnyankoshScreen extends StatefulWidget {
  const DnyankoshScreen({super.key});

  @override
  State<DnyankoshScreen> createState() => _DnyankoshScreenState();
}

class _DnyankoshScreenState extends State<DnyankoshScreen> {
  int _category = 0;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final cat = HistoryPart2Data.dnyankoshCategories[_category].$1;
    final q = _query.trim().toLowerCase();
    final entries =
        HistoryPart2Data.dnyankosh.where((e) {
          final matchCat = cat == 'all' || e.category == cat;
          final matchQuery =
              q.isEmpty ||
              e.name.toLowerCase().contains(q) ||
              e.meta.toLowerCase().contains(q);
          return matchCat && matchQuery;
        }).toList();

    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF2A0709), HeritageColors.maroon],
        badge: '📚 मराठा डिजिटल ज्ञानकोश',
        title: 'Connect Maratha ज्ञानकोश',
        subtitle:
            'व्यक्ती, किल्ले, लढाया, घराणी आणि संज्ञा — मराठा इतिहासाशी संबंधित अस्सल ऐतिहासिक संदर्भ माहिती एकाच ठिकाणी शोधा.',
      ),
      children: [
        ContentSearchField(
          hint: 'व्यक्ती, किल्ला, लढाई किंवा संज्ञा शोधा',
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: 12),
        FilterChipBar(
          labels: [for (final c in HistoryPart2Data.dnyankoshCategories) c.$2],
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'अशी नोंद सापडली नाही.',
            children: [for (final e in entries) _EntryTile(entry: e)],
          ),
        ),
      ],
    );
  }
}

class _EntryTile extends StatelessWidget {
  const _EntryTile({required this.entry});

  final DnyankoshEntry entry;

  @override
  Widget build(BuildContext context) {
    final route = entry.route;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: route == null ? null : () => context.push(route),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: HeritageColors.line),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: HeritageColors.cream,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(entry.icon, style: const TextStyle(fontSize: 24)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.name,
                      style: HomeTheme.marathiHeading(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: HeritageColors.maroonDark,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      entry.meta,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        color: HeritageColors.body,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
              if (route != null)
                const Padding(
                  padding: EdgeInsets.only(left: 6, top: 2),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    color: HeritageColors.saffronDeep,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
