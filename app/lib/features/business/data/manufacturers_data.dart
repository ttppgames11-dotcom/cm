import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../models/directory_models.dart';

/// Mock data for the "मराठा मॅन्युफॅक्चरर्स" directory, ported from the
/// website's `ManufacturersPage.jsx`.
final manufacturersDirectoryConfig = DirectoryConfig(
  titleMr: 'मराठा मॅन्युफॅक्चरर्स',
  subtitleMr: 'उत्पादन क्षेत्रातील आघाडीचे मराठा उद्योजक व त्यांचे कारखाने.',
  headerIcon: Icons.precision_manufacturing_rounded,
  accentColor: HomeTheme.textMutedDark,
  categories: const [
    'सर्व श्रेणी',
    'मशीनरी',
    'ऑटोमोबाईल',
    'इलेक्ट्रिकल',
    'प्लास्टिक',
    'फूड & बेव्हरेज',
  ],
  entries: const [
    DirectoryEntry(
      name: 'श्रीशक्ती इंडस्ट्रीज प्रा. लि.',
      tagline: 'मशीनरी मॅन्युफॅक्चरिंग',
      category: 'मशीनरी',
      city: 'पुणे, महाराष्ट्र',
      icon: '⚙️',
      infoLines: [
        'उत्पादने: CNC लेथ मशीन, इंडस्ट्रियल गिअर्स, हायड्रॉलिक प्रेसेस',
        'निर्यात: २०+ देशांत (जर्मनी, यूएई, अमेरिका) | ३५०+ कामगार',
      ],
    ),
    DirectoryEntry(
      name: 'सह्याद्री ऑटोमोटिव्ह प्रा. लि.',
      tagline: 'ऑटो पार्ट्स & कॉम्पोनंट्स',
      category: 'ऑटोमोबाईल',
      city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
      icon: '🚗',
      infoLines: [
        'उत्पादने: इंजिन वॉल्व्ह, ब्रेक ड्रम, सस्पेन्शन सिस्टिम्स',
        'टाटा, महिंद्रा व बजाज यांचे OEM सप्लायर | ५००+ कामगार',
      ],
    ),
    DirectoryEntry(
      name: 'विजय इलेक्ट्रिकल्स प्रा. लि.',
      tagline: 'इलेक्ट्रिकल उपकरणे & ट्रान्सफॉर्मर्स',
      category: 'इलेक्ट्रिकल',
      city: 'नाशिक, महाराष्ट्र',
      icon: '⚡',
      infoLines: [
        'उत्पादने: पॉवर ट्रान्सफॉर्मर, सोलर इन्व्हर्टर, कंट्रोल पॅनेल्स',
        'महावितरण व आंतरराष्ट्रीय ऊर्जा प्रकल्प | २८०+ कामगार',
      ],
    ),
    DirectoryEntry(
      name: 'नेचर प्युअर फूड्स प्रा. लि.',
      tagline: 'फूड प्रोसेसिंग & कृषी प्रक्रिया',
      category: 'फूड & बेव्हरेज',
      city: 'कोल्हापूर, महाराष्ट्र',
      icon: '🌾',
      infoLines: [
        'उत्पादने: गूळ पावडर, काजू, फळांचे पल्प, ऑर्गेनिक मसाले',
        'यूरोप व आखाती देशांत थेट निर्यात | १८०+ शेतकरी व कामगार',
      ],
    ),
    DirectoryEntry(
      name: 'शिवनेरी पॉलिमर्स प्रा. लि.',
      tagline: 'प्लास्टिक & पॅकेजिंग सोल्युशन्स',
      category: 'प्लास्टिक',
      city: 'सांगली, महाराष्ट्र',
      icon: '📦',
      infoLines: [
        'उत्पादने: ड्रिप इरिगेशन पाईप्स, इंडस्ट्रियल कंटेनर्स, मोल्ड्स',
        'पश्चिम भारत व आफ्रिकन देशांत निर्यात | २२०+ कामगार',
      ],
    ),
  ],
);
