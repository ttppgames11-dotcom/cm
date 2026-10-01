import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// मराठा इतिहास महाग्रंथालय — entry point to every History page
/// (website: HistoryPage.jsx).
class HistoryHubScreen extends StatefulWidget {
  const HistoryHubScreen({super.key});

  @override
  State<HistoryHubScreen> createState() => _HistoryHubScreenState();
}

class _HistoryHubScreenState extends State<HistoryHubScreen> {
  int _category = 0;

  @override
  Widget build(BuildContext context) {
    final categoryId = HistoryData.figureCategories[_category].$1;
    final figures =
        categoryId == 'all'
            ? HistoryData.figures
            : HistoryData.figures
                .where((f) => f.category == categoryId)
                .toList();

    return ContentPage(
      hero: const ContentHero(
        imageAsset: 'assets/images/hero_banner.webp',
        eyebrow: 'अखंड शौर्याची गौरवगाथा · १६३० ते १८१८',
        title: 'मराठा इतिहास महाग्रंथालय',
        subtitle:
            'स्वराज्य, संस्कृती, युद्धनीती आणि अद्वितीय सुशासन — अस्सल ऐतिहासिक साधनांवर आधारित मराठा साम्राज्याचा देदीप्यमान इतिहास.',
        stats: [
          ('१८८', 'वर्षांचे देदीप्यमान साम्राज्य'),
          ('३५०+', 'अभ्यासित गड-किल्ले'),
          ('१००+', 'निर्णायक लढाया'),
          ('अटकेपार', 'विस्तारित भगवा ध्वज'),
        ],
      ),
      children: [
        ContentSection(
          title: 'इतिहास दालने',
          subtitle: 'लढाया, वीर, आरमार, दिनविशेष आणि स्मृती पर्व',
          child: HubTileGrid(
            tiles: [
              HubTile(
                emoji: '⚔️',
                title: 'युद्धे व रणव्यूह',
                description: 'पावनखिंड ते पानिपत — ७ निर्णायक लढाया',
                onTap: () => context.push('/history/battles'),
              ),
              HubTile(
                emoji: '🛡️',
                title: 'अमर वीर व मावळे',
                description: 'तानाजी, बाजीप्रभू, मुरारबाजी व शिलेदार',
                onTap: () => context.push('/history/warriors'),
              ),
              HubTile(
                emoji: '⚓',
                title: 'मराठा आरमार',
                description: 'युद्धनौका, जलदुर्ग व आरमारी सेनापती',
                onTap: () => context.push('/history/navy'),
              ),
              HubTile(
                emoji: '🕯️',
                title: 'बलिदान मास',
                description: 'छत्रपती संभाजी महाराज स्मृती दालन',
                onTap: () => context.push('/history/balidan-maas'),
              ),
              HubTile(
                emoji: '📅',
                title: 'ऐतिहासिक दिनविशेष',
                description: 'शिवजन्म ते पालखेड — महत्त्वाचे दिवस',
                onTap: () => context.push('/history/dates'),
              ),
              HubTile(
                emoji: '⚖️',
                title: 'स्वराज्य प्रशासन',
                description: 'अष्टप्रधान, महसूल गणक, किल्ले व्यवस्था',
                onTap: () => context.push('/history/swarajya-administration'),
              ),
              HubTile(
                emoji: '📚',
                title: 'ज्ञानकोश',
                description: 'व्यक्ती, किल्ले, लढाया, घराणी व संज्ञा',
                onTap: () => context.push('/history/dnyankosh'),
              ),
              HubTile(
                emoji: '📜',
                title: 'महाग्रंथालय',
                description: 'बखरी, ग्रंथ व ऐतिहासिक दस्तऐवज',
                onTap: () => context.push('/history/granthalaya'),
              ),
              HubTile(
                emoji: '🕸️',
                title: 'नॉलेज ग्राफ',
                description: 'घटना ↔ व्यक्ती, स्थळे व पर्यटन मार्ग',
                onTap: () => context.push('/history/knowledge-graph'),
              ),
              HubTile(
                emoji: '🥾',
                title: 'दुर्ग ट्रेक मार्ग',
                description: '७ ऐतिहासिक गड-किल्ले मार्ग',
                onTap: () => context.push('/history/trails'),
              ),
              HubTile(
                emoji: '✊',
                title: 'मराठा चळवळी',
                description: 'मूक मोर्चे, आरक्षण लढा व लोकआंदोलने',
                onTap: () => context.push('/history/movements'),
              ),
              HubTile(
                emoji: '🏆',
                title: 'इतिहास क्विझ',
                description: 'आपली इतिहासाची जाण तपासा',
                onTap: () => context.push('/history/quiz'),
              ),
              HubTile(
                emoji: '🏰',
                title: 'गड-किल्ले',
                description: 'स्वराज्याचे साक्षीदार दुर्ग',
                onTap: () => context.push('/heritage'),
              ),
            ],
          ),
        ),
        const ContentSection(
          title: 'शिवराजमुद्रा',
          child: QuoteBlock(
            quote: HistoryData.rajmudraVerse,
            meaning: HistoryData.rajmudraMeaning,
          ),
        ),
        ContentSection(
          title: 'युगपुरुष व नेते',
          child: const SizedBox.shrink(),
        ),
        FilterChipBar(
          labels: [for (final c in HistoryData.figureCategories) c.$2],
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            children: [for (final f in figures) _FigureCard(figure: f)],
          ),
        ),
        const ContentSection(
          title: 'मराठा साम्राज्याचा सुवर्ण कालपट (१६३०–१८१८)',
          subtitle: 'CHRONOLOGY OF GLORY',
          child: TimelineList(items: HistoryData.empireTimeline),
        ),
      ],
    );
  }
}

class _FigureCard extends StatelessWidget {
  const _FigureCard({required this.figure});

  final HistoricalFigure figure;

  @override
  Widget build(BuildContext context) {
    final canOpen = figure.warriorId != null;
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap:
            canOpen ? () => context.push('/warrior/${figure.warriorId}') : null,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: HeritageColors.line),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 92,
                height: 116,
                color: HeritageColors.maroonDark,
                child:
                    figure.imageAsset != null
                        ? Image.asset(figure.imageAsset!, fit: BoxFit.cover)
                        : const Center(
                          child: Text('🚩', style: TextStyle(fontSize: 36)),
                        ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: HeritageColors.maroon,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          figure.badge,
                          style: HomeTheme.marathiBody(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.35,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        figure.name,
                        style: HomeTheme.marathiHeading(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w800,
                          color: HeritageColors.maroonDark,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        figure.description,
                        style: HomeTheme.marathiBody(
                          fontSize: 12.5,
                          color: HeritageColors.body,
                          height: 1.45,
                        ),
                      ),
                      if (canOpen) ...[
                        const SizedBox(height: 6),
                        Text(
                          'सविस्तर चरित्र वाचा →',
                          style: HomeTheme.marathiBody(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: HeritageColors.saffronDeep,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
