import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// महाराष्ट्राच्या बोली (website: MarathiDialectsArchivePage.jsx).
///
/// The website's "listen" buttons use the browser's text-to-speech; the app
/// has no speech engine yet, so the text comparisons are shown without audio.
class DialectsScreen extends StatefulWidget {
  const DialectsScreen({super.key});

  @override
  State<DialectsScreen> createState() => _DialectsScreenState();
}

class _DialectsScreenState extends State<DialectsScreen> {
  int _phrase = 0;

  @override
  Widget build(BuildContext context) {
    final phrase = CultureData.phraseComparisons[_phrase];
    return ContentPage(
      hero: const ContentHero(
        badge: '🗣️ बोली व भाषा आर्काइव्ह',
        title: 'महाराष्ट्राच्या बोली (Marathi Dialects Archive)',
        subtitle:
            '"दर बारा कोसांवर भाषा बदलते"—प्रमाण मराठी, वर्हाडी, मालवणी, अहिराणी, आगरी, कोळी, मराठवाडी आणि झाडीबोली यांच्या उच्चार, वाक्प्रचार, व लहेजांचे संकलन व थेट तुलना.',
      ),
      children: [
        const ContentSection(
          title: '"तू कुठं चाललास?" — एकाच वाक्याचे प्रादेशिक रूपे',
          subtitle:
              'वाक्य निवडा आणि संपूर्ण महाराष्ट्रातील बोलींमध्ये त्याचे रूप पाहा.',
          child: SizedBox.shrink(),
        ),
        FilterChipBar(
          labels: [
            for (final p in CultureData.phraseComparisons)
              p.label.split(' (').first,
          ],
          selected: _phrase,
          onSelected: (i) => setState(() => _phrase = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            children: [
              InfoCard(
                title: phrase.standard,
                subtitle: 'प्रमाण मराठी (Standard Marathi) • ${phrase.english}',
                accent: HeritageColors.maroon,
              ),
              for (final v in phrase.variants)
                InfoCard(
                  title: v.$3,
                  subtitle: '🚩 ${v.$1} • ${v.$2}',
                  body: v.$4.isEmpty ? null : 'वापर: ${v.$4}',
                ),
            ],
          ),
        ),
        ContentSection(
          title: 'महाराष्ट्राच्या प्रमुख बोलींचे सविस्तर स्वरूप',
          subtitle:
              'बोली म्हणजे भाषेचे विकृत रूप नसून त्या त्या प्रदेशाचे निसर्गदत्त व समृद्ध मौखिक वैभव आहे.',
          child: CardList(
            children: [
              for (final d in CultureData.dialects)
                InfoCard(
                  title: d.name,
                  subtitle: '📍 ${d.region}',
                  tag: d.speakers,
                  body: d.characteristics,
                  facts: [
                    ('नमुना वाक्य', '${d.sample} (${d.english})'),
                    ('म्हण', '${d.proverb} — ${d.proverbMeaning}'),
                  ],
                  footer: Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'संदर्भ: ${d.source}',
                      style: HomeTheme.marathiBody(
                        fontSize: 11.5,
                        color: HomeTheme.textMuted,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
