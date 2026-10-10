import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../models/directory_models.dart';

/// Directory config for the "मराठा बिल्डर्स व डेव्हलपर्स" directory.
/// Note: All invented RERA numbers, fake claims, and mock phone numbers have been stripped.
final buildersDirectoryConfig = DirectoryConfig(
  titleMr: 'मराठा बिल्डर्स व डेव्हलपर्स',
  subtitleMr: 'मराठा बांधकाम व्यावसायिक व गृहप्रकल्प निर्देशिका.',
  headerIcon: Icons.apartment_rounded,
  accentColor: HomeTheme.accentRed,
  categories: const [
    'सर्व बिल्डर्स',
    'गृहनिर्माण',
    'लक्झरी प्रोजेक्ट्स',
    'व्यावसायिक प्रकल्प',
    'टाउनशिप',
    'इंडस्ट्रियल',
  ],
  entries: const [
    DirectoryEntry(
      name: 'साई कन्स्ट्रक्शन्स',
      tagline: 'गृहनिर्माण प्रकल्प',
      category: 'गृहनिर्माण',
      city: 'पुणे, महाराष्ट्र',
      icon: '🏢',
      infoLines: [
        'प्रकल्प: साई हाइट्स (कोथरूड), साई रेसिडेन्सी (बाणेर)',
      ],
      description:
          'पुणे परिसरातील गृहप्रकल्प उभारणीतील अग्रगण्य मराठा व्यावसायिक.',
    ),
    DirectoryEntry(
      name: 'शिवनेरी बिल्डर्स',
      tagline: 'बांधकाम व्यावसायिक',
      category: 'लक्झरी प्रोजेक्ट्स',
      city: 'कोल्हापूर, महाराष्ट्र',
      icon: '🏰',
      infoLines: [
        'प्रकल्प: शिवनेरी व्हिला, शिवनेरी प्राईम',
      ],
      description:
          'पारंपरिक भक्कम पाया आणि आधुनिक वास्तुकलेचा संगम साधणारे कोल्हापूरचे बिल्डर्स.',
    ),
    DirectoryEntry(
      name: 'राजवीर डेव्हलपर्स',
      tagline: 'गृहप्रकल्प निर्मिती',
      category: 'गृहनिर्माण',
      city: 'नाशिक, महाराष्ट्र',
      icon: '🏡',
      infoLines: [
        'प्रकल्प: राजवीर पार्क, गंगापूर रोड',
      ],
      description:
          'नाशिक परिसरातील दर्जेदार गृहप्रकल्प उभारणी.',
    ),
    DirectoryEntry(
      name: 'महादेव कन्स्ट्रक्शन्स',
      tagline: 'व्यावसायिक प्रकल्प',
      category: 'व्यावसायिक प्रकल्प',
      city: 'मुंबई, महाराष्ट्र',
      icon: '🏬',
      infoLines: [
        'प्रकल्प: व्यावसायिक कॉम्प्लेक्स व कॉर्पोरेट स्पेसेस',
      ],
      description:
          'मुंबई महानगर क्षेत्रातील व्यावसायिक कॉम्प्लेक्स व कॉर्पोरेट ऑफिस स्पेसेस.',
    ),
    DirectoryEntry(
      name: 'भूमी बिल्डर्स',
      tagline: 'टाउनशिप प्रकल्प',
      category: 'टाउनशिप',
      city: 'नागपूर, महाराष्ट्र',
      icon: '🌆',
      infoLines: [
        'प्रकल्प: हरित टाउनशिप परिसर निर्मिती',
      ],
      description:
          'विदर्भातील हरित टाउनशिप व निसर्गरम्य परिसर निर्मिती.',
    ),
    DirectoryEntry(
      name: 'जगदंब इन्फ्रा',
      tagline: 'इंडस्ट्रियल शेड व पार्क',
      category: 'इंडस्ट्रियल',
      city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
      icon: '🏗️',
      infoLines: [
        'प्रकल्प: इंडस्ट्रियल पार्क व फॅक्टरी युनिट्स',
      ],
      description:
          'उद्योग व गोदामांसाठी इंडस्ट्रियल शेड व फॅक्टरी युनिट्स निर्मिती.',
    ),
    DirectoryEntry(
      name: 'वीर बिल्डर्स',
      tagline: 'प्रीमियम अपार्टमेंट्स',
      category: 'लक्झरी प्रोजेक्ट्स',
      city: 'ठाणे, महाराष्ट्र',
      icon: '💎',
      infoLines: [
        'प्रकल्प: प्रीमियम अपार्टमेंट्स आणि क्लबहाऊस सुविधा',
      ],
      description:
          'ठाणे व नवी मुंबईमधील प्रीमियम अपार्टमेंट्स आणि नागरी सुविधा.',
    ),
    DirectoryEntry(
      name: 'स्वराज कन्स्ट्रक्शन्स',
      tagline: 'गृहनिर्माण',
      category: 'गृहनिर्माण',
      city: 'सातारा, महाराष्ट्र',
      icon: '🚩',
      infoLines: [
        'प्रकल्प: गृहप्रकल्प निर्मिती',
      ],
      description:
          'सातारा परिसरातील दर्जेदार गृहप्रकल्प उभारणी.',
    ),
  ],
);
