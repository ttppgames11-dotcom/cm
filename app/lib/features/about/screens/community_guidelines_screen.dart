import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';
import '../../history/widgets/content_kit.dart';

/// Terms of use & community guidelines. Users accept these at registration;
/// Google Play requires them for apps with user-generated content, together
/// with in-app reporting and blocking (Community → ⋮ → तक्रार / ब्लॉक).
class CommunityGuidelinesScreen extends StatelessWidget {
  const CommunityGuidelinesScreen({super.key});

  static const updated = '२८ सप्टेंबर २०२६';

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        badge: '📜 वापराच्या अटी',
        title: 'समुदाय मार्गदर्शक तत्त्वे व वापराच्या अटी',
        subtitle:
            'Connect मराठा हे सन्मान, विश्वास व बंधुभावावर आधारित व्यासपीठ आहे. नोंदणी करून आपण खालील अटी मान्य करता. (अद्ययावत: $updated)',
      ),
      children: [
        const ContentSection(
          title: '१. कोण वापरू शकते',
          child: BulletList(
            items: [
              'हे अ‍ॅप १८ वर्षे व त्यावरील व्यक्तींसाठी आहे.',
              'नोंदणी करताना आपली खरी माहिती द्या. दुसऱ्याच्या नावाने खाते उघडू नका.',
              'आपल्या पासवर्डची व खात्याची सुरक्षा ही आपली जबाबदारी आहे.',
            ],
          ),
        ),
        const ContentSection(
          title: '२. काय पोस्ट करू नये (शून्य सहनशीलता)',
          subtitle: 'खालील प्रकारचा मजकूर पूर्णपणे निषिद्ध आहे:',
          child: BulletList(
            bullet: '🚫',
            items: [
              'कोणत्याही जाती, धर्म, समाज, लिंग किंवा व्यक्तीविरुद्ध द्वेष पसरवणारा किंवा अपमानास्पद मजकूर.',
              'छळवणूक, धमकी, ट्रोलिंग किंवा एखाद्याला लक्ष्य करणे.',
              'अश्लील, लैंगिक किंवा बालकांचे शोषण करणारा मजकूर.',
              'हिंसाचाराला प्रोत्साहन, दहशत किंवा बेकायदेशीर कृत्ये.',
              'खोटी माहिती, अफवा किंवा इतिहासाचे जाणीवपूर्वक विकृतीकरण.',
              'स्पॅम, फसवणूक, बनावट जाहिराती, पैसे मागणे किंवा आर्थिक योजना.',
              'इतरांची खासगी माहिती (फोन, पत्ता, फोटो) त्यांच्या परवानगीशिवाय.',
              'दुसऱ्याच्या नावाने किंवा संस्थेच्या नावाने तोतयागिरी.',
              'कॉपीराइट असलेले फोटो, व्हिडिओ किंवा लेख परवानगीशिवाय.',
            ],
          ),
        ),
        const ContentSection(
          title: '३. तक्रार व ब्लॉक',
          child: BulletList(
            items: [
              'अयोग्य पोस्ट किंवा सदस्य दिसल्यास "⋮" मेनूमधून "तक्रार करा" निवडा.',
              'एखाद्या सदस्याचा मजकूर पाहायचा नसल्यास त्याला "ब्लॉक" करा.',
              'प्रत्येक तक्रार आमचे नियंत्रक (moderators) तपासतात व लवकरात लवकर कारवाई करतात.',
            ],
          ),
        ),
        const ContentSection(
          title: '४. नियमभंग झाल्यास',
          child: BulletList(
            items: [
              'नियमभंग करणारा मजकूर पूर्वसूचनेशिवाय काढून टाकला जाऊ शकतो.',
              'वारंवार किंवा गंभीर नियमभंग केल्यास खाते तात्पुरते किंवा कायमचे निलंबित केले जाईल.',
              'बेकायदेशीर मजकुराबाबत कायद्यानुसार संबंधित यंत्रणांना माहिती दिली जाऊ शकते.',
            ],
          ),
        ),
        const ContentSection(
          title: '५. आपली माहिती व खाते हटवणे',
          child: BulletList(
            items: [
              'आपली माहिती कशी वापरली जाते हे "गोपनीयता धोरण" मध्ये दिले आहे.',
              'आपण कधीही प्रोफाईल → सुरक्षा आणि गोपनीयता → खाते हटवा येथून आपले खाते व माहिती कायमची हटवू शकता.',
              'Connect मराठा कोणत्याही राजकीय पक्षाशी संबंधित नाही. सदस्यांनी व्यक्त केलेली मते त्यांची वैयक्तिक असतात.',
              'या अटींमध्ये बदल झाल्यास अ‍ॅपमध्ये कळवले जाईल.',
            ],
          ),
        ),
        ContentSection(
          title: '६. संपर्क',
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.icon(
                onPressed:
                    () => launchUrl(
                      Uri(scheme: 'mailto', path: ApiConfig.supportEmail),
                    ),
                icon: const Icon(Icons.email_rounded),
                label: Text(ApiConfig.supportEmail),
                style: FilledButton.styleFrom(
                  backgroundColor: HeritageColors.maroon,
                ),
              ),
              OutlinedButton.icon(
                onPressed:
                    () => launchUrl(
                      Uri.parse(ApiConfig.privacyPolicyUrl),
                      mode: LaunchMode.externalApplication,
                    ),
                icon: const Icon(Icons.privacy_tip_outlined),
                label: const Text('गोपनीयता धोरण'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
