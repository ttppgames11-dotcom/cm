import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// छत्रपती संभाजी महाराज बलिदान मास व स्मृती दालन (website: BalidanMaasPage.jsx).
///
/// The pledge is remembered on this device only. The website shows a
/// hard-coded "people who pledged" total; that number is not real, so the app
/// does not display a count.
class BalidanMaasScreen extends StatefulWidget {
  const BalidanMaasScreen({super.key});

  @override
  State<BalidanMaasScreen> createState() => _BalidanMaasScreenState();
}

class _BalidanMaasScreenState extends State<BalidanMaasScreen> {
  static const _pledgeKey = 'cm_balidan_maas_pledge';
  bool _pledged = false;

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) {
      if (mounted) {
        setState(() => _pledged = prefs.getBool(_pledgeKey) ?? false);
      }
    });
  }

  Future<void> _pledge() async {
    setState(() => _pledged = true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_pledgeKey, true);
  }

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: ContentHero(
        gradient: HeritageColors.solemnGradient,
        badge: '🕯️ ऐतिहासिक स्मृती पर्व',
        eyebrow: 'फाल्गुन शुद्ध प्रतिपदा ते फाल्गुन अमावास्या',
        title: 'छत्रपती संभाजी महाराज बलिदान मास व स्मृती दालन',
        subtitle:
            '"मरण आले तरी चालेल, पण स्वाभिमान व स्वराज्य सोडणार नाही!" — मोगल आक्रमक औरंगजेबाच्या अमानुष छळाला न झुकता मातृभूमी व धर्मासाठी सर्वोच्च बलिदान देणारे अद्वितीय युगपुरुष धर्मवीर छत्रपती संभाजी महाराज.',
        action: SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _pledged ? null : _pledge,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFE65100),
              disabledBackgroundColor: const Color(0xFF4CAF50),
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              shape: const StadiumBorder(),
            ),
            child: Text(
              _pledged
                  ? '✓ आपण बलिदान मास संकल्प केला आहे!'
                  : '🕯️ मी बलिदान मास संकल्प करतो',
              textAlign: TextAlign.center,
              style: HomeTheme.marathiBody(
                fontSize: 14.5,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                height: 1.3,
              ),
            ),
          ),
        ),
      ),
      children: [
        ContentSection(
          title: 'शंभूराजांचा पराक्रम',
          child: CardList(
            children: [
              for (final p in HistoryData.balidanPillars)
                InfoCard(emoji: p.emoji, title: p.title, body: p.body),
            ],
          ),
        ),
        ContentSection(
          title: '🕯️ बलिदान मास आचरण मार्गदर्शक (४० दिवस)',
          child: CardList(
            children: [
              for (final o in HistoryData.balidanObservance)
                InfoCard(
                  title: o.$1,
                  body: o.$2,
                  titleColor: HeritageColors.saffronDeep,
                  background: HeritageColors.cream,
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
          child: FilledButton(
            onPressed: () => context.push('/warrior/sambhaji'),
            style: FilledButton.styleFrom(
              backgroundColor: HeritageColors.maroon,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: Text(
              'छत्रपती संभाजी महाराज सविस्तर चरित्र वाचा →',
              textAlign: TextAlign.center,
              style: HomeTheme.marathiBody(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                height: 1.3,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
