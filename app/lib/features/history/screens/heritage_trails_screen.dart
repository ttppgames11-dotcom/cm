import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_part2_data.dart';
import '../widgets/content_kit.dart';

/// Heritage fort trails (website: HeritageTrailsPage.jsx).
///
/// Read-only: the website's add/edit form only saves to the visitor's own
/// browser.
class HeritageTrailsScreen extends StatelessWidget {
  const HeritageTrailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        imageAsset: 'assets/images/rajgad_carousel_2.webp',
        badge: '🥾 दुर्ग ट्रेक मार्ग',
        title: 'स्वराज्याचे ऐतिहासिक दुर्ग मार्ग',
        subtitle:
            'एकापेक्षा अधिक गड-किल्ले जोडणारे इतिहासप्रसिद्ध ट्रेक मार्ग — अंतर, कालावधी, अवघडपणा आणि योग्य हंगामासह.',
      ),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: CardList(
            children: [
              for (final t in HistoryPart2Data.trails)
                InfoCard(
                  emoji: '🏔️',
                  title: t.title,
                  subtitle: t.route,
                  accent: Color(t.difficultyColor),
                  body: t.description,
                  facts: [
                    ('प्रदेश', t.region),
                    ('अवघडपणा', t.difficulty),
                    ('कालावधी', t.time),
                    ('अंतर', t.distance),
                    ('योग्य हंगाम', t.bestSeason),
                  ],
                  footer: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const MiniHeading('🏰 मार्गातील किल्ले'),
                      TagWrap(tags: t.forts),
                      const MiniHeading('✨ वैशिष्ट्ये'),
                      Text(
                        t.highlights,
                        style: HomeTheme.marathiBody(
                          fontSize: 13,
                          color: HeritageColors.body,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
