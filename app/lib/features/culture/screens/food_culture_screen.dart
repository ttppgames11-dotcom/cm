import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';
import '../models/culture_models.dart';

/// महाराष्ट्राची खाद्यसंस्कृती (website: MaharashtraFoodCulturePage.jsx).
class FoodCultureScreen extends StatefulWidget {
  const FoodCultureScreen({super.key});

  @override
  State<FoodCultureScreen> createState() => _FoodCultureScreenState();
}

class _FoodCultureScreenState extends State<FoodCultureScreen> {
  static const _regions = [
    ('all', 'सर्व प्रदेश'),
    ('कोकण', 'कोकण'),
    ('कोल्हापूर', 'कोल्हापूर'),
    ('विदर्भ', 'विदर्भ (सावजी)'),
    ('पश्चिम', 'पश्चिम महाराष्ट्र'),
    ('खानदेश', 'खानदेश'),
  ];

  int _region = 0;

  @override
  Widget build(BuildContext context) {
    final key = _regions[_region].$1;
    final foods =
        key == 'all'
            ? CultureData.foods
            : CultureData.foods.where((f) => f.region.contains(key)).toList();

    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF7C2D12), Color(0xFFB45309)],
        badge: '🍲 महाराष्ट्राची खाद्यसंस्कृती',
        title: 'महाराष्ट्राची खाद्यसंस्कृती (Food Culture & Provenance)',
        subtitle:
            'केवळ रेसिपी नाही तर इतिहास, भौगोलिक उगम, घटक, पारंपरिक कृती, सण-उत्सव आणि समाजजीवनाशी जोडलेली अस्सल खाद्य परंपरा.',
      ),
      children: [
        const ContentSection(
          title: 'प्रदेशनिहाय पारंपरिक खाद्य संपदा',
          subtitle:
              'कोकणची सोलकढी, कोल्हापूरचा तांबडा-पांढरा रस्सा, विदर्भाचे सावजी ते पश्चिम महाराष्ट्राचे पुरणपोळी व पिठलं-भाकरी.',
          child: SizedBox.shrink(),
        ),
        FilterChipBar(
          labels: [for (final r in _regions) r.$2],
          selected: _region,
          onSelected: (i) => setState(() => _region = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'या प्रदेशाचे पदार्थ अद्याप नोंदवलेले नाहीत.',
            children: [
              for (final f in foods)
                InfoCard(
                  emoji: '🍲',
                  title: f.name,
                  subtitle: '📍 उगम: ${f.region.split(' (').first}',
                  tag: f.category,
                  body: f.history,
                  actionLabel: 'सविस्तर ज्ञान कार्ड →',
                  onAction: () => _showFood(context, f),
                ),
            ],
          ),
        ),
      ],
    );
  }

  void _showFood(BuildContext context, FoodItem f) {
    showContentSheet(
      context,
      title: f.name,
      subtitle: '🍲 ${f.category} • 📍 ${f.region}',
      children: [
        const MiniHeading('🌿 मुख्य घटक व मसाले'),
        BulletList(items: f.ingredients, bullet: '✓'),
        const MiniHeading('🥣 पारंपरिक बनवण्याची पद्धत'),
        BodyText(f.preparation),
        const MiniHeading('📜 इतिहास व पार्श्वभूमी'),
        BodyText(f.history),
        const MiniHeading('🎉 प्रसंग व सण-उत्सव'),
        BodyText(f.occasion),
        const MiniHeading('👥 सामाजिक / स्थानिक नाते'),
        BodyText(f.community),
        const MiniHeading('📍 अस्सल चव कुठे अनुभवाल?'),
        BodyText(f.whereToExperience),
        const MiniHeading('📖 स्रोत'),
        BodyText(f.source),
      ],
    );
  }
}
