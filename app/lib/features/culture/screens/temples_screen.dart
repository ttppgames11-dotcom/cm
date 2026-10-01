import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// शिवकालीन मंदिरे, कुलदैवते व तीर्थक्षेत्रे (website: TemplesPage.jsx).
///
/// Read-only: the website's add/edit form only saves in the visitor's own
/// browser. Its "real-time" and "live darshan" claims are not repeated, and
/// aarti times carry a note that they may change.
class TemplesScreen extends StatelessWidget {
  const TemplesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        badge: '🚩 कुलदैवत व तीर्थक्षेत्र महादालन',
        title: 'शिवकालीन मंदिरे, कुलदैवते व तीर्थक्षेत्रे',
        subtitle:
            'तुळजापूर भवानी, रायगड जगदीश्वर, शिखर शिंगणापूर ते जेजुरी — स्वराज्याला आध्यात्मिक बळ देणारी पवित्र श्रद्धास्थाने.',
      ),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
          child: CardList(
            children: [
              for (final t in CultureData.temples)
                InfoCard(
                  emoji: t.icon,
                  title: t.name,
                  subtitle: '📍 ${t.place}',
                  tag: t.category,
                  body: t.description,
                  facts: [
                    ('इतिहास', t.history),
                    ('आरती वेळा', '${t.aartiTimes} (वेळा बदलू शकतात)'),
                  ],
                ),
            ],
          ),
        ),
        const ContentSection(
          title: 'पुण्यश्लोक अहिल्याबाई होळकर (१७२५–१७९५)',
          subtitle: '🏛️ ऐतिहासिक मंदिर जीर्णोद्धाराचा सुवर्ण वारसा',
          child: InfoCard(
            emoji: '🙏',
            title:
                'काशी विश्वनाथ ते सोमनाथ — मराठा साम्राज्याचे धर्मरक्षण कार्य',
            body:
                'मुघल व आक्रमकांच्या आघाताने उद्ध्वस्त झालेली हिंदू तीर्थक्षेत्रे पुन्हा वैभवाने उभी करण्याचे ऐतिहासिक कार्य पुण्यश्लोक राजमाता अहिल्याबाई होळकर यांनी केले. त्यांनी काशी विश्वनाथ, सोमनाथ, गया, बद्रीनाथ, केदारनाथ, अयोध्या, हरिद्वार ते दक्षिणेतील रामेश्वरमपर्यंत शेकडो मंदिरे, घाट, धर्मशाळा आणि अन्नछत्रे स्वखर्चाने उभारली.',
            footer: Padding(
              padding: EdgeInsets.only(top: 10),
              child: BulletList(
                bullet: '📍',
                items: [
                  'काशी विश्वनाथ मंदिर पुनर्निर्माण (१७८०)',
                  'सोमनाथ मंदिर जिर्णोद्धार (१७८३)',
                  'नर्मदा महेश्वर घाट व धर्मशाळा',
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
