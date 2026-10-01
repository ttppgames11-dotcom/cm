import 'package:flutter/material.dart';

import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// मराठा युद्धे, लढाया व रणव्यूह दालन (website: BattlesPage.jsx).
class BattlesScreen extends StatefulWidget {
  const BattlesScreen({super.key});

  @override
  State<BattlesScreen> createState() => _BattlesScreenState();
}

class _BattlesScreenState extends State<BattlesScreen> {
  int _era = 0;

  @override
  Widget build(BuildContext context) {
    final eraId = HistoryData.battleEras[_era].$1;
    final battles =
        eraId == 'all'
            ? HistoryData.battles
            : HistoryData.battles.where((b) => b.era == eraId).toList();

    return ContentPage(
      hero: const ContentHero(
        badge: '⚔️ रणनीती व लष्करी व्यवस्था',
        title: 'मराठा युद्धे, लढाया व रणव्यूह दालन',
        subtitle:
            'गनिमी कावा, वेगवान अश्वदल, जलदुर्ग वेढा व डोंगररांगांमधील अजोड रणनीती • पावनखिंड ते पालखेड, वसई ते पानिपत — मराठा लष्करी इतिहासाची सत्य व संदर्भयुक्त शौर्यगाथा.',
      ),
      children: [
        ContentSection(
          title: 'मराठा लष्करी डावपेच — पाच मुख्य आधारस्तंभ',
          subtitle:
              'ऐतिहासिक साधनांवर आधारित मराठा सैन्याची युद्धपद्धती, ज्याने समकालीन सत्तांना चकित केले.',
          child: CardList(
            children: [
              for (final s in HistoryData.warStrategies)
                InfoCard(emoji: s.emoji, title: s.title, body: s.body),
            ],
          ),
        ),
        const ContentSection(
          title: '७ ऐतिहासिक निर्णायक लढाया',
          subtitle: 'ऐतिहासिक लढायांचा विस्तृत संग्रह',
          child: SizedBox.shrink(),
        ),
        FilterChipBar(
          labels: [for (final e in HistoryData.battleEras) e.$2],
          selected: _era,
          onSelected: (i) => setState(() => _era = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            children: [
              for (final b in battles)
                InfoCard(
                  title: b.title,
                  subtitle: b.date,
                  tag: b.location,
                  accent: HeritageColors.maroon,
                  body: b.description,
                  facts: [
                    ('सेनापती', b.commander),
                    ('महत्त्व', b.importance),
                    ('संदर्भ', b.reference),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }
}
