import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';
import '../../../core/theme/home_theme.dart';
import '../../history/widgets/content_kit.dart';

/// आमच्याबद्दल — Connect Maratha (website: AboutPage.jsx, GovernancePage.jsx).
///
/// Only statements the organisation has confirmed, or that are clearly goals,
/// are included. Left out until verified: the advisory board names, the
/// "1800-123-1674" helpline, current-scale claims (3,000+ branches, 5,000+
/// businesses), financial figures (₹42.5 lakh, 1,450+ students) and the
/// fake charter/audit-report downloads and contact-form ticket.
class AboutOrganisationScreen extends StatelessWidget {
  const AboutOrganisationScreen({super.key});

  Future<void> _email(BuildContext context) async {
    final ok = await launchUrl(
      Uri(scheme: 'mailto', path: ApiConfig.supportEmail),
    );
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('कृपया ${ApiConfig.supportEmail} वर लिहा.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        badge: '🚩 इतिहास जपूया • समाज जोडूया • भविष्य घडवूया',
        title: 'आमच्याबद्दल — Connect Maratha',
        subtitle:
            'इतिहासाचे अस्सल संवर्धन, आधुनिक पिढीची विधायक जोडणी आणि सक्षम भविष्यनिर्मिती • अभ्यासक, विचारवंत, तंत्रज्ञान तज्ज्ञ व समाजसेवकांचे स्वतंत्र लोकसहभागी डिजिटल व्यासपीठ.',
      ),
      children: [
        const ContentSection(
          title: 'संस्कृती, स्वाभिमान व समृद्धीचे व्यासपीठ',
          subtitle:
              '"जपा इतिहास • जपा संस्कृती • सन्मान करा कर्तृत्वाचा • जोडा समाज • घडवा भविष्य"',
          child: CardList(
            children: [
              InfoCard(
                title: '१. इतिहास व वारसा संवर्धन',
                body:
                    'छत्रपती शिवाजी महाराज व छत्रपती संभाजी महाराजांच्या स्वराज्याची विचारधारा, गड-किल्ल्यांचे जतन आणि ऐतिहासिक साधनांची सत्यता जपणे. विकृतीकरणाला विरोध करून संशोधनधारित इतिहास पुढील पिढीपर्यंत पोहोचवणे.',
              ),
              InfoCard(
                title: '२. उद्योग व व्यावसायिक सक्षमीकरण',
                accent: HomeTheme.gold,
                body:
                    "मराठी तरुणांमध्ये उद्योजकतेची बीजे रोवणे, 'व्यवसाय संगम'च्या माध्यमातून स्थानिक व जागतिक पातळीवर परस्परांना उद्योग-व्यवसाय मिळवून देणे आणि आर्थिक सक्षमीकरणाचा मार्ग प्रशस्त करणे.",
              ),
              InfoCard(
                title: '३. शिक्षण, करिअर व सामाजिक एकता',
                accent: Color(0xFF2E7D32),
                body:
                    'गरजू विद्यार्थ्यांना शिष्यवृत्ती व स्पर्धा परीक्षांचे मार्गदर्शन देणे, आपत्कालीन रक्तपुरवठा व वैद्यकीय साहाय्य करणे आणि महिला नेतृत्वाला सर्व क्षेत्रांत बळ देणे.',
              ),
            ],
          ),
        ),
        const ContentSection(
          title: '🎯 दृष्टी (Vision 2030): ग्लोबल मराठा',
          subtitle:
              '२०३० पर्यंत जगभरातील मराठा समाजाला जोडणारे सर्वात विश्वासू व स्वतंत्र डिजिटल व्यासपीठ — आमची उद्दिष्टे:',
          child: CardList(
            children: [
              InfoCard(
                emoji: '🏰',
                title: '३५०+ गड-किल्ल्यांचे डिजिटायझेशन',
                body:
                    'प्रत्येक किल्ल्याचा अस्सल इतिहास, आभासी दर्शन, संवर्धन कृती आराखडा आणि आंतरराष्ट्रीय पातळीवर शिवकालीन स्थापत्यकलेचा प्रचार.',
              ),
              InfoCard(
                emoji: '💼',
                title: 'व्यवसाय संगमातून आर्थिक संपन्नता',
                body:
                    "'व्यवसाय संगम' चॅप्टर्सच्या माध्यमातून मराठी उद्योजक व व्यावसायिकांना थेट राष्ट्रीय व आंतरराष्ट्रीय खरेदीदारांशी जोडणे.",
              ),
              InfoCard(
                emoji: '🎓',
                title: 'मराठा युवा करिअर सक्षमीकरण',
                body:
                    'UPSC, MPSC, आयटी, आर्टिफिशिअल इंटेलिजन्स आणि संरक्षण दलात मराठा तरुणांचे प्रमाण सर्वोच्च पातळीवर नेणे.',
              ),
            ],
          ),
        ),
        const ContentSection(
          title: '🚩 ध्येय — आमचे ५ मुख्य कार्यस्तंभ',
          child: CardList(
            children: [
              InfoCard(
                title: '१. अस्सल ऐतिहासिक ज्ञाननिर्मिती',
                body:
                    'ऐतिहासिक साधनांचे (बखरी, मोडी लिपी कागदपत्रे, अस्सल फर्मान) संकलन व सार्वजनिक डिजिटल ग्रंथालय.',
              ),
              InfoCard(
                title: '२. स्वयंपूर्ण व्यवसाय मंडळे',
                body:
                    'जिल्हानिहाय व्यवसाय संगम चॅप्टर्सची स्थापना आणि शून्य मध्यस्थी व्यापार.',
              ),
              InfoCard(
                title: '३. आपत्कालीन सेवा व रक्तदाते नेटवर्क',
                body:
                    "तालुकानिहाय 'ब्लड कनेक्ट' व संकटमोचक रुग्ण साहाय्य पथके उभारणे.",
              ),
              InfoCard(
                title: '४. युवा व क्रीडा प्रतिभा विकास',
                body:
                    'मर्दानी खेळ, कुस्ती, दुर्गभ्रमंती, आणि ऑलिम्पिक खेळांसाठी ग्रामीण गुणवंतांना आर्थिक पाठबळ.',
              ),
              InfoCard(
                title: '५. डिजिटल स्वाभिमान व सुरक्षितता',
                body:
                    'DPDP कायदा २०२३ नुसार डेटा गोपनीयता, विना-राजकारण लोकसहभाग व पारदर्शक कारभार.',
              ),
            ],
          ),
        ),
        const ContentSection(
          title: '💎 ज्या मूल्यांवर Connect Maratha उभा आहे',
          child: HubTileGridStaticValues(),
        ),
        const ContentSection(
          title: '📖 आमची गाथा',
          subtitle: 'एका संकल्पातून उभे राहिलेले डिजिटल व्यासपीठ',
          child: DateEventCard(
            date: '२०२४',
            tag: 'संकल्प व बीज',
            title: 'इतिहास संवर्धन व विस्कळीत तरुणांची एकजूट',
            body:
                'गड-किल्ले भटकंती करणारे तरुण, इतिहास अभ्यासक आणि काही मराठी आयटी व्यावसायिकांनी एकत्र येऊन समाजाला जात-पात किंवा राजकारणाच्या पलीकडे नेऊन एकात्मिक डिजिटल व्यासपीठ देण्याचा निर्णय घेतला.',
          ),
        ),
        const ContentSection(
          title: '🏢 स्वायत्त, लोकसहभागी व नफाविरहित रचना',
          child: CardList(
            children: [
              InfoCard(
                emoji: '📜',
                title: 'कायदेशीर स्वरूप (Section 8 Non-Profit)',
                body:
                    'Connect Maratha हे कंपनी कायदा २०१३ च्या कलम ८ अंतर्गत नोंदणीकृत नफाविरहित स्वायत्त व्यासपीठ आहे. या व्यासपीठावर कोणताही राजकीय पक्ष, दबावगट किंवा वैयक्तिक मालकी हक्क चालत नाही.',
              ),
              InfoCard(
                emoji: '🤝',
                title: 'आमची सनद — आमच्या बांधिलकी',
                footer: BulletList(
                  items: [
                    'स्वतंत्र व स्वायत्त व्यासपीठ: कोणत्याही राजकीय पक्षापासून अलिप्त.',
                    'ऐतिहासिक सत्यता संरक्षण: छत्रपती शिवाजी महाराज, छत्रपती संभाजी महाराज व मराठा साम्राज्याच्या अस्सल ऐतिहासिक संदर्भांचे रक्षण आणि प्रचार.',
                    'व्यवसाय व रोजगार सक्षमीकरण: मराठी तरुणांना शून्य-मध्यस्थी व्यापार, नोकऱ्या व स्टार्टअप मार्गदर्शन उपलब्ध करणे.',
                    'डिजिटल वैयक्तिक डेटा संरक्षण (DPDP 2023): कोणत्याही सदस्याची माहिती विक्री किंवा गैरवापर केली जाणार नाही.',
                    'पारदर्शकता: सार्वजनिक निधीचा वापर गड-किल्ले संवर्धन, विद्यार्थी साहाय्य व आपत्कालीन मदतीसाठी.',
                  ],
                ),
              ),
            ],
          ),
        ),
        ContentSection(
          title: '✉️ संपर्क',
          subtitle: 'प्रश्न, सूचना किंवा सहभागासाठी आम्हाला लिहा.',
          child: FilledButton.icon(
            onPressed: () => _email(context),
            icon: const Icon(Icons.email_rounded),
            label: Text(ApiConfig.supportEmail),
            style: FilledButton.styleFrom(
              backgroundColor: HeritageColors.maroon,
              padding: const EdgeInsets.symmetric(vertical: 13),
            ),
          ),
        ),
      ],
    );
  }
}

/// The four core values as a two-column grid.
class HubTileGridStaticValues extends StatelessWidget {
  const HubTileGridStaticValues({super.key});

  static const _values = [
    (
      '⚔️',
      'शौर्य व स्वाभिमान',
      'छत्रपतींच्या स्वराज्याचे बाणेदार वारसदार म्हणून सन्मानाने आणि ताठ मानेने जगणे.',
    ),
    (
      '🤝',
      'परस्पर सहकार्य (बंधुभाव)',
      "'एक मराठा लाख मराठा' या घोषणेला आर्थिक व व्यावसायिक सहकार्याची खरी दिशा देणे.",
    ),
    (
      '🛡️',
      'निःस्वार्थ समाजसेवा',
      'पीडित, वंचित व गरजू घटकांना सर्वतोपरी साहाय्य करणे हेच आमचे प्रथम कर्तव्य.',
    ),
    (
      '⚖️',
      'पारदर्शकता व निष्पक्षता',
      'शून्य राजकारण, पारदर्शक कारभार आणि सर्वांसाठी समान विकासाची संधी.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return CardList(
      children: [
        for (final v in _values) InfoCard(emoji: v.$1, title: v.$2, body: v.$3),
      ],
    );
  }
}
