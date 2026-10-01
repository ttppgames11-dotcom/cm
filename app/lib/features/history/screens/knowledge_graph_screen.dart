import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_part2_data.dart';
import '../models/history_models.dart';
import '../widgets/content_kit.dart';

/// घटना शोधा ↔ इतिहास संबंध आलेख (website: KnowledgeGraphExplorerPage.jsx).
/// Pick an event to see the people, places, documents, travel route and local
/// food connected to it.
class KnowledgeGraphScreen extends StatefulWidget {
  const KnowledgeGraphScreen({super.key});

  @override
  State<KnowledgeGraphScreen> createState() => _KnowledgeGraphScreenState();
}

class _KnowledgeGraphScreenState extends State<KnowledgeGraphScreen> {
  int _epoch = 0;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final epoch = HistoryPart2Data.knowledgeGraphEpochs[_epoch].$1;
    final q = _query.trim().toLowerCase();
    final events =
        HistoryPart2Data.knowledgeGraph.where((e) {
          final matchQuery =
              q.isEmpty ||
              e.title.toLowerCase().contains(q) ||
              e.location.toLowerCase().contains(q) ||
              e.summary.toLowerCase().contains(q);
          final matchEpoch = epoch == 'all' || e.epoch.contains(epoch);
          return matchQuery && matchEpoch;
        }).toList();

    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF7C1D05), Color(0xFFB91C1C), Color(0xFFE65100)],
        badge: '⚡ इतिहास नॉलेज ग्राफ',
        title: 'घटना शोधा ↔ इतिहास संबंध आलेख',
        subtitle:
            'इतिहासातील एका घटनेपासून ते आजची ठिकाणे, गड-किल्ले, मंदिरे, दस्तऐवज, स्थानिक खाद्यसंस्कृती आणि प्रत्यक्ष पर्यटन मार्गापर्यंत—सर्व काही एकमेकांशी जोडलेले!',
      ),
      children: [
        ContentSearchField(
          hint: 'ऐतिहासिक घटना, व्यक्ती किंवा ठिकाण शोधा',
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: 12),
        FilterChipBar(
          labels: [for (final e in HistoryPart2Data.knowledgeGraphEpochs) e.$2],
          selected: _epoch,
          onSelected: (i) => setState(() => _epoch = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'अशी घटना सापडली नाही.',
            children: [
              for (final e in events)
                InfoCard(
                  emoji: '🚩',
                  title: e.title,
                  subtitle: '📅 ${e.date}',
                  body: e.summary,
                  facts: [
                    ('मुख्य स्थान', e.location),
                    ('विश्वासार्हता', e.confidence),
                  ],
                  actionLabel: 'संबंध आलेख पहा →',
                  onAction: () => _showEvent(context, e),
                ),
            ],
          ),
        ),
      ],
    );
  }

  void _showEvent(BuildContext context, KnowledgeEvent e) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: HomeTheme.bgWarmCream,
      builder:
          (context) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.85,
            maxChildSize: 0.95,
            builder:
                (context, controller) => ListView(
                  controller: controller,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                  children: [
                    Text(
                      e.epoch,
                      style: HomeTheme.marathiBody(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: HeritageColors.saffronDeep,
                      ),
                    ),
                    Text(
                      e.title,
                      style: HomeTheme.marathiHeading(
                        fontSize: 19,
                        fontWeight: FontWeight.w800,
                        color: HeritageColors.maroonDark,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '📅 ${e.date}\n📍 ${e.location}',
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        color: HeritageColors.body,
                      ),
                    ),
                    const MiniHeading('ऐतिहासिक महत्त्व व परिणाम'),
                    Text(
                      e.summary,
                      style: HomeTheme.marathiBody(
                        fontSize: 13.5,
                        color: HomeTheme.textDark,
                        height: 1.55,
                      ),
                    ),
                    const MiniHeading('👑 संबंधित व्यक्ती'),
                    CardList(
                      children: [
                        for (final p in e.people)
                          _Node(title: p.$1, subtitle: 'भूमिका: ${p.$2}'),
                      ],
                    ),
                    const MiniHeading('🏰 संबंधित ऐतिहासिक स्थळे व मंदिरे'),
                    CardList(
                      children: [
                        for (final p in e.places)
                          _Node(
                            title: '📍 ${p.$1}',
                            subtitle: '${p.$2} (${p.$3})',
                            background: const Color(0xFFF8FAFC),
                          ),
                      ],
                    ),
                    if (e.artifacts.isNotEmpty) ...[
                      const MiniHeading('🏷️ दस्तऐवज, नाणी व चिन्हे'),
                      TagWrap(
                        tags: e.artifacts,
                        background: const Color(0xFFFEF2F2),
                        foreground: const Color(0xFF991B1B),
                      ),
                    ],
                    const MiniHeading(
                      '🚗 आजचा पर्यटन व खाद्य मार्ग',
                      color: Color(0xFF166534),
                    ),
                    Text(
                      'सुचवलेला मार्ग: ${e.route.join(' → ')}',
                      style: HomeTheme.marathiBody(
                        fontSize: 13,
                        color: const Color(0xFF14532D),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TagWrap(
                      tags: [for (final c in e.cuisine) '🍲 $c'],
                      background: const Color(0xFFF0FDF4),
                      foreground: const Color(0xFF166534),
                    ),
                    const MiniHeading('📜 दस्तऐवज संदर्भ'),
                    Text(
                      e.source,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        color: HeritageColors.body,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
          ),
    );
  }
}

class _Node extends StatelessWidget {
  const _Node({
    required this.title,
    required this.subtitle,
    this.background = const Color(0xFFFFFBEB),
  });

  final String title;
  final String subtitle;
  final Color background;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: HomeTheme.marathiHeading(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF78350F),
              height: 1.3,
            ),
          ),
          Text(
            subtitle,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              color: const Color(0xFF92400E),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
