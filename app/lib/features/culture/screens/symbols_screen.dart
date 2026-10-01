import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// स्वराज्याची शस्त्रे व प्रतीके (website: SymbolsPage.jsx and the symbols
/// section of PhotoGalleryPage.jsx).
class SymbolsScreen extends StatelessWidget {
  const SymbolsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        badge: '⚔️ स्वराज्य प्रतीके',
        title: 'स्वराज्याची शस्त्रे, नाणी व प्रतीके',
        subtitle:
            'दांडपट्टा, वाघनखे, भवानी तलवार, शिवराई-होन नाणी, राजमुद्रा आणि भगवा ध्वज — मराठा सामर्थ्य व सार्वभौमत्वाची चिन्हे.',
      ),
      children: [
        ContentSection(
          title: 'मराठा शस्त्रे व चलन',
          child: CardList(
            children: [
              for (final w in CultureData.weapons)
                InfoCard(
                  emoji: w.icon,
                  title: w.name,
                  subtitle: w.subtitle,
                  body: w.description,
                  facts: w.specs,
                ),
            ],
          ),
        ),
        const ContentSection(
          title: '🚩 स्वराज्य प्रतीके व ऐतिहासिक वारसा',
          child: CardList(
            children: [
              InfoCard(
                emoji: '⚜️',
                title: 'छत्रपती शिवरायांची राजमुद्रा',
                body:
                    "'प्रतिपच्चंद्रलेखेव...' — प्रतिपदेच्या चंद्रकलेप्रमाणे वाढत जाणारी आणि विश्वाला वंद्य ठरणारी ही मुद्रा रयतेच्या कल्याणासाठी राज्य करते.",
              ),
              InfoCard(
                emoji: '🚩',
                title: 'जरीपटक व भगवा ध्वज',
                body:
                    'स्वराज्याचे सार्वभौम प्रतीक, त्याग, शौर्य आणि सह्याद्रीच्या बलिदानाचे तेज दर्शवणारा दोन टोकांचा पवित्र भगवा ध्वज.',
              ),
              InfoCard(
                emoji: '⚓',
                title: 'भारतीय आरमाराचे जनक',
                body:
                    'सिंधुदुर्ग, विजयदुर्ग, पद्मदुर्ग यांसारखे जलदुर्ग उभारून परकीय आक्रमक सत्तांना समुद्रावरच थोपवणारे शिवरायांचे अद्वितीय नौदल.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
