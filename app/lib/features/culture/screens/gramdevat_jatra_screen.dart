import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';
import '../models/culture_models.dart';

/// ग्रामदैवत, जत्रा, नाट्य व पारंपरिक खेळ (website: GramdevatJatraPage.jsx).
class GramdevatJatraScreen extends StatefulWidget {
  const GramdevatJatraScreen({super.key});

  @override
  State<GramdevatJatraScreen> createState() => _GramdevatJatraScreenState();
}

class _GramdevatJatraScreenState extends State<GramdevatJatraScreen> {
  static const _tabs = [
    '🛕 ग्रामदैवत व कुलदैवत',
    '🎪 जत्रा व उत्सव दिनदर्शिका',
    '🎭 नाट्य, तमाशा व दशावतार',
    '🏏 पारंपरिक देशी खेळ',
  ];

  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        badge: '🛕 ग्रामदैवत, जत्रा व लोकसंस्कृती',
        title: 'ग्रामदैवत, जत्रा, नाट्य व पारंपरिक खेळ',
        subtitle:
            'महाराष्ट्राच्या गावागावातील जिवंत संस्कृती: ग्रामदैवतांची उत्पत्ती आख्यायिका, वार्षिक जत्रा-उत्सव, दशावतार-तमाशा-पोवाडा नाट्यपरंपरा आणि विटी-दांडू, लगोरीसारखे पारंपरिक देशी खेळ.',
      ),
      children: [
        const SizedBox(height: 16),
        FilterChipBar(
          labels: _tabs,
          selected: _tab,
          onSelected: (i) => setState(() => _tab = i),
        ),
        switch (_tab) {
          0 => _deities(context),
          1 => _jatraCalendar(),
          2 => _traditions(
            'दशावतार, तमाशा, लावणी व पोवाडा',
            CultureData.folkTraditions.where((f) => !f.isGame).toList(),
          ),
          _ => _traditions(
            'विटी-दांडू, लगोरी व देशी खेळ',
            CultureData.folkTraditions.where((f) => f.isGame).toList(),
          ),
        },
      ],
    );
  }

  Widget _deities(BuildContext context) {
    return ContentSection(
      title: 'महाराष्ट्राची ग्रामदैवते व स्वराज्य अधिष्ठात्री',
      subtitle:
          'गावागावातील श्रद्धास्थाने, मूळ आख्यायिका, संबंधित घराणी, वार्षिक यात्रा आणि जवळील किल्ले.',
      child: CardList(
        children: [
          for (final g in CultureData.gramdevats)
            InfoCard(
              emoji: '🛕',
              title: g.name,
              subtitle: '📍 ${g.location}',
              tag: g.type,
              body: g.originStory,
              actionLabel: 'सविस्तर माहिती →',
              onAction: () => _showDeity(context, g),
            ),
        ],
      ),
    );
  }

  void _showDeity(BuildContext context, Gramdevat g) {
    showContentSheet(
      context,
      title: '🛕 ${g.name}',
      subtitle: '📍 ${g.location} • ${g.region}',
      children: [
        const SizedBox(height: 8),
        InfoCard(
          title: g.deity,
          facts: [
            ('👑 संबंधित राजवंश / कालखंड', '${g.dynasty} (${g.period})'),
            ('🏛️ स्थापत्यशैली', g.architecture),
            ('👥 संबंधित कुळ व समाज', g.communities),
            ('🗓️ वार्षिक जत्रा / उत्सव', g.jatraDate),
          ],
        ),
        const MiniHeading('📜 उत्पत्ती कथा व स्थानिक आख्यायिका'),
        BodyText(g.originStory),
        const MiniHeading('🎉 वार्षिक यात्रा विधी व लोकपरंपरा'),
        BulletList(items: g.rituals, bullet: '🚩'),
        const MiniHeading('🏰 जवळील किल्ला / दुर्ग'),
        BodyText(g.connectedFort),
        const MiniHeading('🍲 संबंधित स्थानिक प्रसाद / खाद्य'),
        BodyText(g.connectedFood),
        const MiniHeading('📖 संदर्भ'),
        BodyText(g.source),
      ],
    );
  }

  Widget _jatraCalendar() {
    return ContentSection(
      title: 'महाराष्ट्रातील प्रमुख जत्रा, पालखी व लोकोत्सव',
      subtitle:
          'जत्रा म्हणजे केवळ धार्मिक विधी नव्हे, तर ग्रामीण अर्थव्यवस्था, लोककला, खेळ आणि सांस्कृतिक संमेलनाचा महासोहळा.',
      child: CardList(
        children: [
          for (final g in CultureData.gramdevats)
            InfoCard(
              emoji: '🎪',
              title: g.name,
              subtitle: '🗓️ ${g.jatraDate}',
              facts: [('स्थान', g.location)],
              footer: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: BulletList(items: g.rituals, bullet: '🚩'),
              ),
            ),
        ],
      ),
    );
  }

  Widget _traditions(String title, List<FolkTradition> list) {
    return ContentSection(
      title: title,
      child: CardList(
        emptyText: 'माहिती अद्याप नोंदवलेली नाही.',
        children: [
          for (final f in list)
            InfoCard(
              emoji: f.isGame ? '🏏' : '🎭',
              title: f.name,
              subtitle: '📍 ${f.region}',
              tag: f.category,
              body: f.roots,
              facts: [
                ('सादरीकरणाचा प्रसंग', f.occasion),
                ('आजची स्थिती', f.modernStatus),
                ('संदर्भ', f.source),
              ],
              footer: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const MiniHeading('मुख्य घटक'),
                  TagWrap(tags: f.elements),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
