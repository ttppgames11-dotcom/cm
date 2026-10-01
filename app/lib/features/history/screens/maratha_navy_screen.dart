import 'package:flutter/material.dart';

import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// मराठा आरमार व सागरी सार्वभौमत्व (website: MarathaNavyPage.jsx).
class MarathaNavyScreen extends StatelessWidget {
  const MarathaNavyScreen({super.key});

  static const _navyBlue = Color(0xFF0369A1);

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        gradient: HeritageColors.navyGradient,
        badge: '⚓ भारतीय आरमाराचे जनक',
        title: 'मराठा आरमार व सागरी सार्वभौमत्व',
        quote:
            '"ज्याचा समुद्र, त्याचा देश!" — छत्रपती शिवाजी महाराज (आज्ञापत्र)',
        subtitle:
            'पोर्तुगीज, डच, ब्रिटिश व सिद्दी या परकीय सागरी सत्तांचा धोका ओळखून छत्रपती शिवरायांनी स्वतंत्र जहाजांची निर्मिती, आरमारी किल्ले आणि कुशल कोळी-भंडारी मावळ्यांचे अजिंक्य आरमार उभे केले.',
      ),
      children: [
        ContentSection(
          title: 'आरमारी सेनापती',
          titleColor: HeritageColors.navy,
          child: CardList(
            children: [
              for (final l in HistoryData.navyLeaders)
                InfoCard(
                  emoji: l.emoji,
                  title: l.title,
                  subtitle: l.subtitle,
                  body: l.body,
                  titleColor: HeritageColors.navy,
                  accent: HeritageColors.saffron,
                ),
            ],
          ),
        ),
        ContentSection(
          title: '🚢 मराठा लढाऊ जहाजांचे प्रकार',
          titleColor: HeritageColors.navy,
          child: CardList(
            children: [
              for (final s in HistoryData.warships)
                InfoCard(
                  title: s.title,
                  subtitle: s.subtitle,
                  body: s.body,
                  titleColor: _navyBlue,
                  accent: _navyBlue,
                  background: const Color(0xFFF0F9FF),
                ),
            ],
          ),
        ),
        ContentSection(
          title: '🏰 ऐतिहासिक सागरी जलदुर्ग (Sea Forts)',
          titleColor: HeritageColors.navy,
          child: CardList(
            children: [
              for (final f in HistoryData.seaForts)
                InfoCard(
                  title: f.$1,
                  tag: f.$2,
                  body: f.$3,
                  titleColor: const Color(0xFF0F172A),
                  accent: HeritageColors.navy,
                  background: const Color(0xFFF8FAFC),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
