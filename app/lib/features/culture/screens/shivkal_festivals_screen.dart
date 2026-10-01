import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';
import '../models/culture_models.dart';

/// शिवकालीन उत्सव — पुरावे, परंपरा व ऐतिहासिक सत्य
/// (website: ShivkalFestivalsPage.jsx).
class ShivkalFestivalsScreen extends StatefulWidget {
  const ShivkalFestivalsScreen({super.key});

  @override
  State<ShivkalFestivalsScreen> createState() => _ShivkalFestivalsScreenState();
}

class _ShivkalFestivalsScreenState extends State<ShivkalFestivalsScreen> {
  int _scenario = 0;
  int _evidenceFilter = 0;
  String _query = '';

  static final _evidenceFilters = [
    ('all', 'सर्व १३ उत्सव'),
    for (final e in CultureData.evidenceLevels.values) (e.key, e.badge),
  ];

  @override
  Widget build(BuildContext context) {
    final scenario = CultureData.festivalComparisons[_scenario];
    final filterKey = _evidenceFilters[_evidenceFilter].$1;
    final q = _query.trim().toLowerCase();
    final festivals =
        CultureData.shivkalFestivals.where((f) {
          final matchEvidence = filterKey == 'all' || f.evidence == filterKey;
          final matchQuery =
              q.isEmpty ||
              f.title.toLowerCase().contains(q) ||
              f.subtitle.toLowerCase().contains(q) ||
              f.places.any((p) => p.toLowerCase().contains(q)) ||
              f.documentedFacts.any((p) => p.toLowerCase().contains(q));
          return matchEvidence && matchQuery;
        }).toList();

    return ContentPage(
      hero: const ContentHero(
        badge: '🏰 शिवकालीन ऐतिहासिक संशोधन',
        eyebrow: 'इ.स. १६३० ते १६८० कालखंड',
        title: 'शिवकालीन उत्सव — पुरावे, परंपरा व ऐतिहासिक सत्य',
        subtitle:
            'आज आपण जे उत्सव मोठ्या सार्वजनिक स्वरूपात पाहतो, ते सर्व छत्रपती शिवाजी महाराजांच्या काळात अगदी त्याच पद्धतीने होत नव्हते. समकालीन ऐतिहासिक संदर्भ, नंतरचे पुरावे, लोकपरंपरा व आधुनिक सार्वजनिक स्वरूप यांमधील फरक अचूकपणे समजून घेणे ऐतिहासिक सत्यतेसाठी आवश्यक आहे.',
        stats: [
          ('१३ सण व प्रसंग', 'दस्तऐवजी पुरावे व सविस्तर पुनर्रचना'),
          ('४-स्तरीय', 'पुरावे प्रणाली'),
          ('६ जून १६७४', 'शिवराज्याभिषेक सार्वभौम महामहोत्सव'),
        ],
      ),
      children: [
        ContentSection(
          title: 'सत्यनिष्ठ इतिहास मांडणीसाठी पुराव्यांची ४-स्तरीय चौकट',
          subtitle: 'ऐतिहासिक पद्धतशास्त्र • सप्रमाण व पूर्वग्रहमुक्त मांडणी',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const BodyText(
                'इतिहास म्हणजे केवळ आख्यायिका किंवा अंधश्रद्धा नव्हे. शिवकालीन कोणत्याही उत्सवाचा अभ्यास करताना उपलब्ध साधनांची विश्वासार्हता तपासणे अनिवार्य आहे. Connect Maratha खालील ४ स्तरांवर प्रत्येक सणाची वर्गवारी करते:',
              ),
              const SizedBox(height: 12),
              CardList(
                children: [
                  for (final e in CultureData.evidenceLevels.values)
                    InfoCard(
                      title: e.badge,
                      subtitle: e.label,
                      accent: Color(e.color),
                      body: e.description,
                    ),
                ],
              ),
            ],
          ),
        ),
        ContentSection(
          title: '“त्या काळात आजचा सण कसा दिसला असता?”',
          subtitle:
              'सण निवडा आणि १६७० चे शिवकालीन स्वरूप व आजचे आधुनिक रूप यांची समोरासमोर ऐतिहासिक तुलना अनुभवा.',
          child: const SizedBox.shrink(),
        ),
        FilterChipBar(
          labels: [
            for (final s in CultureData.festivalComparisons)
              s.title.split('—').first.trim(),
          ],
          selected: _scenario,
          onSelected: (i) => setState(() => _scenario = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: _ComparisonCard(scenario: scenario),
        ),
        ContentSection(
          title: 'शिवकालीन १३ सण, उत्सव व विधी',
          subtitle:
              'प्रत्येक उत्सवाचे समकालीन दस्तऐवज, संभाव्य पारंपरिक स्वरूप आणि आजच्या आधुनिक रूपातील फरक.',
          child: const SizedBox.shrink(),
        ),
        ContentSearchField(
          hint: 'सण, किल्ला किंवा पुरावा शोधा',
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: 12),
        FilterChipBar(
          labels: [for (final f in _evidenceFilters) f.$2],
          selected: _evidenceFilter,
          onSelected: (i) => setState(() => _evidenceFilter = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'असा उत्सव सापडला नाही.',
            children: [for (final f in festivals) _FestivalCard(festival: f)],
          ),
        ),
      ],
    );
  }
}

class _ComparisonCard extends StatelessWidget {
  const _ComparisonCard({required this.scenario});

  final FestivalComparison scenario;

  @override
  Widget build(BuildContext context) {
    return InfoCard(
      title: 'उत्सव: ${scenario.festival}',
      subtitle: '🏰 ${scenario.shivkalTime}  ↔  🏙️ ${scenario.modernTime}',
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final row in scenario.rows) ...[
            const SizedBox(height: 10),
            Text(
              row.$1,
              style: HomeTheme.marathiHeading(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: HeritageColors.maroon,
              ),
            ),
            _ThenNow(
              label: '🏰 शिवकाळ',
              text: row.$2,
              color: const Color(0xFFFDF3E6),
            ),
            const SizedBox(height: 4),
            _ThenNow(
              label: '🏙️ आज',
              text: row.$3,
              color: const Color(0xFFF1F5F9),
            ),
          ],
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              scenario.caution,
              style: HomeTheme.marathiBody(
                fontSize: 12.5,
                color: const Color(0xFF92400E),
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ThenNow extends StatelessWidget {
  const _ThenNow({
    required this.label,
    required this.text,
    required this.color,
  });

  final String label;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            TextSpan(text: text),
          ],
        ),
        style: HomeTheme.marathiBody(
          fontSize: 13,
          color: HomeTheme.textDark,
          height: 1.5,
        ),
      ),
    );
  }
}

class _FestivalCard extends StatelessWidget {
  const _FestivalCard({required this.festival});

  final ShivkalFestival festival;

  @override
  Widget build(BuildContext context) {
    final f = festival;
    final level = CultureData.evidenceLevels[f.evidence]!;
    return InfoCard(
      emoji: f.icon,
      title: f.title,
      subtitle: f.subtitle,
      tag: level.badge,
      accent: Color(level.color),
      facts: [('ऋतू', f.season), ('प्रकार', f.category)],
      footer: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const MiniHeading('📜 ऐतिहासिक संदर्भ व पुरावे'),
          BulletList(items: f.documentedFacts),
          const MiniHeading('🪔 संभाव्य पारंपरिक स्वरूप'),
          BulletList(items: f.reconstruction),
          const MiniHeading('⚖️ आजच्या स्वरूपातील फरक'),
          BodyText(f.modernDistinction),
          const MiniHeading('🏰 संबंधित स्थळे'),
          TagWrap(tags: f.places),
        ],
      ),
    );
  }
}
