import 'package:flutter/material.dart';

import '../data/history_part2_data.dart';
import '../widgets/content_kit.dart';

/// मराठा महाग्रंथालय व डिजिटल अर्काईव्ह (website: GranthalayaPage.jsx).
///
/// The website's "read" and "PDF" buttons lead nowhere yet (the PDF button
/// only says "coming soon"), so the app shows the catalogue without them.
class GranthalayaScreen extends StatefulWidget {
  const GranthalayaScreen({super.key});

  @override
  State<GranthalayaScreen> createState() => _GranthalayaScreenState();
}

class _GranthalayaScreenState extends State<GranthalayaScreen> {
  int _category = 0;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final cat = HistoryPart2Data.granthCategories[_category];
    final q = _query.trim().toLowerCase();
    final books =
        HistoryPart2Data.granths.where((g) {
          final matchCat = cat == 'सर्व' || g.category == cat;
          final matchQuery =
              q.isEmpty ||
              g.title.toLowerCase().contains(q) ||
              g.author.toLowerCase().contains(q) ||
              g.description.toLowerCase().contains(q);
          return matchCat && matchQuery;
        }).toList();

    return ContentPage(
      hero: const ContentHero(
        badge: '📚 डिजिटल अर्काईव्ह',
        title: 'मराठा महाग्रंथालय व डिजिटल अर्काईव्ह',
        subtitle:
            'सभासद बखर, शिवभारत, आज्ञापत्र, बुधभूषणम् आणि मोडी लिपीतील ऐतिहासिक दस्तऐवजांचा अस्सल व प्रमाणीकृत संग्रह.',
      ),
      children: [
        ContentSearchField(
          hint: 'ग्रंथ, बखर, लेखक किंवा विषय शोधा',
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: 12),
        FilterChipBar(
          labels: HistoryPart2Data.granthCategories,
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'असा ग्रंथ सापडला नाही.',
            children: [
              for (final g in books)
                InfoCard(
                  title: g.title,
                  subtitle: '✍️ ${g.author}',
                  tag: g.tag,
                  accent: HeritageColors.saffronDeep,
                  body: g.description,
                  facts: [
                    ('प्रकार', '${g.category} · ${g.level}'),
                    ('पृष्ठे', g.pages),
                    ('भाषा', g.language),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }
}
