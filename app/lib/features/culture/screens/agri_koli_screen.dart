import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// आगरी-कोळी समाज व सागरी वारसा (website: AgriKoliSamajPage.jsx).
class AgriKoliScreen extends StatelessWidget {
  const AgriKoliScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final maynak = CultureData.maynak;
    return ContentPage(
      hero: const ContentHero(
        gradient: HeritageColors.navyGradient,
        badge: '🌊 कोकण किनारपट्टी व खाडीचे भूमिपुत्र',
        eyebrow: 'स्वतंत्र संस्कृती, इतिहास व आरमार',
        title: 'आगरी-कोळी समाज व सागरी वारसा',
        subtitle:
            'कोकणच्या अथांग समुद्राचे राजे ‘कोळी बांधव’ आणि मिठागरे व खार जमिनीतील भातशेतीचे वैभव ‘आगरी समाज’—दोन्ही समुदायांची स्वतंत्र सामाजिक ओळख, जीवनशैली, खाद्यसंस्कृती, नारळी पौर्णिमा आणि छत्रपती शिवरायांच्या आरमारात मायनाक भंडारींनी गाजवलेला अतुलनीय पराक्रम!',
        stats: [
          ('🟠 आगरी समाज', 'मिठागरे, भातशेती व ठाणे-रायगड परिसर'),
          ('🔵 कोळी समाज', 'अथांग समुद्र, पारंपरिक मासेमारी व कोळीवाडा'),
          ('⚓ मायनाक भंडारी', '१६७९ खांदेरीचे आरमारी शौर्य'),
          ('🌕 नारळी पौर्णिमा', 'दर्यापूजन व सुवर्ण नारळ अर्पण'),
        ],
      ),
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, 0),
          child: InfoCard(
            emoji: '🧭',
            title:
                'आगरी आणि कोळी: एकच नव्हे, तर स्वतंत्र सांस्कृतिक ओळख असलेले दोन स्वाभिमानी समाज',
            subtitle: 'महत्त्वपूर्ण ऐतिहासिक व सामाजिक स्पष्टीकरण',
            background: Color(0xFFFFF8F0),
            body:
                'अनेकदा लोकप्रिय बोलचालीत ‘आगरी-कोळी’ असा एकच जोडशब्द वापरला जातो; परंतु ऐतिहासिक व सामाजिकदृष्ट्या हे दोन स्वतंत्र समुदाय आहेत. आगरी समाज हा प्रामुख्याने खाडी परिसर, मिठागरे (Salt pans) आणि किनारी भातशेतीशी जोडलेला आहे. तर कोळी समाज हा अथांग समुद्र, थेट खोल पाण्यातील मासेमारी, होड्या आणि कोळीवाड्यांशी जोडलेला आहे. Connect Maratha या दोन्ही समुदायांच्या स्वतंत्र अस्मितेचा, परस्पर बंधुभावाचा आणि महाराष्ट्राच्या जडणघडणीतील योगदानाचा गौरव करतो.',
          ),
        ),
        ContentSection(
          title: 'कोळीवाडा दर्शन — समुद्राच्या कुशीतील गावसंस्कृती',
          subtitle: 'कोळी संस्कृतीचे अविभाज्य अंग',
          child: CardList(
            children: [
              for (final n in CultureData.koliwadaNodes)
                InfoCard(
                  emoji: n.icon,
                  title: n.title,
                  subtitle: n.short,
                  accent: HeritageColors.navy,
                  body: n.full,
                  footer: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const MiniHeading('महत्त्वाची साधने व घटक'),
                      TagWrap(tags: n.tools),
                    ],
                  ),
                ),
            ],
          ),
        ),
        ContentSection(
          title: CultureData.agriTitle,
          subtitle: 'भूमी व संस्कृती • AGRI SAMAJ HERITAGE',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const BodyText(CultureData.agriOverview),
              const SizedBox(height: 12),
              CardList(
                children: [
                  for (final p in CultureData.agriPillars)
                    InfoCard(emoji: p.$1, title: p.$2, body: p.$3),
                ],
              ),
              const MiniHeading('📍 आगरी समाजाचे प्रमुख भौगोलिक केंद्र'),
              const TagWrap(tags: CultureData.agriRegions),
            ],
          ),
        ),
        ContentSection(
          title: CultureData.navyTitle,
          titleColor: HeritageColors.navy,
          subtitle: CultureData.navySubheading,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const BodyText(CultureData.navyConcept),
              const SizedBox(height: 12),
              InfoCard(
                emoji: '⚔️',
                title: maynak.name,
                subtitle: maynak.role,
                accent: HeritageColors.navy,
                titleColor: HeritageColors.navy,
                highlight: maynak.battle,
                body: maynak.description,
                facts: [('प्राथमिक ऐतिहासिक संदर्भ', maynak.sources)],
              ),
              const MiniHeading(
                'स्वराज्याचे प्रमुख जलदुर्ग व सागरी संरक्षण केंद्रे',
                color: HeritageColors.navy,
              ),
              CardList(
                children: [
                  for (final f in CultureData.agriSeaForts)
                    InfoCard(
                      emoji: f.$1,
                      title: f.$2,
                      body: f.$3,
                      accent: HeritageColors.navy,
                    ),
                ],
              ),
            ],
          ),
        ),
        ContentSection(
          title: 'आगरी व कोळी खाद्यसंस्कृती — झणझणीत मसाल्यांची मेजवानी',
          subtitle: 'अस्सल चव • COASTAL GASTRONOMY',
          child: CardList(
            children: [
              for (final c in CultureData.coastalCuisine)
                InfoCard(
                  emoji: c.icon,
                  title: c.dish,
                  subtitle: c.community,
                  tag: c.type,
                  body: c.description,
                  highlight: '💡 वैशिष्ट्य: ${c.specialty}',
                ),
            ],
          ),
        ),
        ContentSection(
          title: 'आगरी व कोळी बोली — समुद्राचा हेल व मातीचा गोडवा',
          subtitle: 'प्रमाण मराठी, आगरी बोली आणि कोळी भाषेतील दैनंदिन संवाद',
          child: CardList(
            children: [
              for (final p in CultureData.agriKoliPhrases)
                InfoCard(
                  title: p.$1,
                  facts: [
                    ('प्रमाण मराठी', p.$2),
                    ('आगरी', p.$3),
                    ('कोळी', p.$4),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }
}
