import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/home_theme.dart';
import '../../features/history/data/history_data.dart';
import '../../features/history/widgets/content_kit.dart';
import 'section_header.dart';

/// Home sections ported from the website home page (HomePage.jsx) that the
/// app did not have yet. Links point at app pages; entries whose website page
/// has no app equivalent yet are left out.

// ── आजचा दिवस ────────────────────────────────────────────────────────────────

/// Picks the historical date matching today (day + month), else the next one
/// coming up in the year. The website shows one fixed date every day.
({String date, String title, String description, bool isToday}) todayInHistory(
  DateTime now,
) {
  const months = {
    'जानेवारी': 1,
    'फेब्रुवारी': 2,
    'मार्च': 3,
    'एप्रिल': 4,
    'मे': 5,
    'जून': 6,
    'जुलै': 7,
    'ऑगस्ट': 8,
    'सप्टेंबर': 9,
    'ऑक्टोबर': 10,
    'नोव्हेंबर': 11,
    'डिसेंबर': 12,
  };
  int digits(String s) => int.parse(
    s.replaceAllMapped(
      RegExp('[०-९]'),
      (m) => '${m[0]!.codeUnitAt(0) - 0x0966}',
    ),
  );

  final parsed = <({int month, int day, HistoricalDate d})>[];
  for (final d in HistoryData.dates) {
    final parts = d.date.split(' ');
    final month = parts.length >= 2 ? months[parts[1]] : null;
    if (month == null) continue;
    parsed.add((month: month, day: digits(parts[0]), d: d));
  }
  parsed.sort(
    (a, b) => (a.month * 100 + a.day).compareTo(b.month * 100 + b.day),
  );
  final key = now.month * 100 + now.day;
  final match = parsed.firstWhere(
    (p) => p.month * 100 + p.day >= key,
    orElse: () => parsed.first,
  );
  final isToday = match.month * 100 + match.day == key;
  return (
    date: match.d.date,
    title: match.d.title,
    description: match.d.description,
    isToday: isToday,
  );
}

// ── Four pillars + spotlights ────────────────────────────────────────────────

class FourPillarsSection extends StatelessWidget {
  const FourPillarsSection({super.key});

  static const _pillars = [
    (
      '⚔️',
      '१. जतन करा (PRESERVE)',
      'मराठा इतिहास, ३५०+ किल्ले, आरमार, समकालीन बखरी, पत्रे, नकाशे व बलिदान मास स्मृती.',
      'इतिहास दालन →',
      '/history',
    ),
    (
      '🌟',
      '२. गौरव करा (CELEBRATE)',
      'मराठा संस्कृती, सण-उत्सव, लोककला, खाद्यसंस्कृती व वारसा यांचा गौरव.',
      'संस्कृती दालन →',
      '/culture',
    ),
    (
      '🤝',
      '३. जोडा (CONNECT)',
      'समुदाय व व्यवसाय — व्यवसाय संगम, व्यावसायिक, विद्यार्थी व मेन्टॉर.',
      'व्यवसाय संगम →',
      '/business/sangam',
    ),
    (
      '🚀',
      '४. घडवा (BUILD)',
      'भविष्य व संधी — व्यवसाय, सेवा, नेटवर्किंग व सामाजिक प्रकल्प.',
      'व्यवसाय व सेवा →',
      '/business',
    ),
  ];

  static const _spotlights = [
    (
      'स्मृती पर्व',
      'बलिदान मास व ऐतिहासिक स्मृती दालन',
      'सक्तीचे धार्मिक कर्मकांड नसून स्वैच्छिक कृतज्ञता स्मरण आणि रचनात्मक समाजसेवा — रक्तदान, दुर्ग स्वच्छता, वृक्षारोपण.',
      'बलिदान मास दालन पहा →',
      '/history/balidan-maas',
    ),
    (
      'मूक मोर्चे',
      'मराठा क्रांती मूक मोर्चे व ऐतिहासिक चळवळी',
      '५८ शांततापूर्ण मूक मोर्चे, विद्यार्थिनींचे नेतृत्व व आरक्षण लढा — वस्तुनिष्ठ ऐतिहासिक दस्तऐवजीकरण.',
      'मोर्चे व चळवळी दालन →',
      '/history/movements',
    ),
    (
      'ज्ञान भांडार',
      'मराठा महाग्रंथालय व डिजिटल अर्काईव्ह',
      'बखरी, बुधभूषणम्, आज्ञापत्र, शिवभारत व मराठी रियासत — ऐतिहासिक साधनांचा संग्रह.',
      'महाग्रंथालय उघडा →',
      '/history/granthalaya',
    ),
    (
      'इतिहास क्विझ',
      'छत्रपती शिवराय व स्वराज्य इतिहास महाक्विझ',
      'विषय निवडा, प्रश्न सोडवा आणि प्रत्येक उत्तरानंतर स्पष्टीकरण व संदर्भ वाचा.',
      'क्विझ खेळा →',
      '/history/quiz',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionHeader(
          title: 'Connect Maratha चे ४ आधारस्तंभ',
          actionLabel: '',
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: LayoutBuilder(
            builder: (context, constraints) {
              const gap = 10.0;
              final width = (constraints.maxWidth - gap) / 2;
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  for (final p in _pillars)
                    SizedBox(
                      width: width,
                      child: _PillarCard(
                        emoji: p.$1,
                        title: p.$2,
                        body: p.$3,
                        link: p.$4,
                        onTap: () => context.push(p.$5),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: MediaQuery.textScalerOf(context).scale(200),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _spotlights.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, i) {
              final s = _spotlights[i];
              return _SpotlightCard(
                tag: s.$1,
                title: s.$2,
                body: s.$3,
                link: s.$4,
                onTap: () => context.push(s.$5),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _PillarCard extends StatelessWidget {
  const _PillarCard({
    required this.emoji,
    required this.title,
    required this.body,
    required this.link,
    required this.onTap,
  });

  final String emoji;
  final String title;
  final String body;
  final String link;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: Ink(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFF5500), Color(0xFFD84315)],
          ),
        ),
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(emoji, style: const TextStyle(fontSize: 24)),
                const SizedBox(height: 6),
                Text(
                  title,
                  style: HomeTheme.marathiHeading(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: HomeTheme.marathiBody(
                    fontSize: 11.5,
                    color: Colors.white.withValues(alpha: 0.92),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  link,
                  style: HomeTheme.marathiBody(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SpotlightCard extends StatelessWidget {
  const _SpotlightCard({
    required this.tag,
    required this.title,
    required this.body,
    required this.link,
    required this.onTap,
  });

  final String tag;
  final String title;
  final String body;
  final String link;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      child: Material(
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: Ink(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: HeritageColors.solemnGradient,
            ),
          ),
          child: InkWell(
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: HeritageColors.saffron,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      tag,
                      style: HomeTheme.marathiBody(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: HeritageColors.maroonDark,
                        height: 1.3,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: HomeTheme.marathiHeading(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      body,
                      overflow: TextOverflow.fade,
                      style: HomeTheme.marathiBody(
                        fontSize: 12,
                        color: const Color(0xFFFFF8E7),
                        height: 1.45,
                      ),
                    ),
                  ),
                  Text(
                    link,
                    style: HomeTheme.marathiBody(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFF0B866),
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Legendary portraits ─────────────────────────────────────────────────────

class PortraitStrip extends StatelessWidget {
  const PortraitStrip({super.key});

  static const _portraits = [
    (
      'assets/images/warrior_shivaji.webp',
      'छत्रपती शिवाजी महाराज',
      'हिंदवी स्वराज्य संस्थापक',
      '/warrior/shivaji',
    ),
    (
      'assets/images/warrior_sambhaji.webp',
      'छत्रपती संभाजी महाराज',
      'अपराजित धर्मवीर',
      '/warrior/sambhaji',
    ),
    (
      'assets/images/warrior_bajirao.webp',
      'श्रीमंत बाजीराव पेशवे',
      'अपराजित सेनापती',
      '/warrior/bajirao',
    ),
    (
      'assets/images/warrior_tarabai.webp',
      'महाराणी ताराबाई',
      'मोगल साम्राज्य धडक',
      '/warrior/tarabai',
    ),
    (
      'assets/images/warrior_tanaji.webp',
      'सुभेदार तानाजी मालुसरे',
      'सिंहगडाचा सिंह',
      '/warrior/tanaji',
    ),
    (
      'assets/images/warrior_hambirrao.webp',
      'हंबीरराव मोहिते',
      'स्वराज्याचे सरसेनापती',
      '/warrior/hambirrao',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionHeader(title: 'अजरामर व्यक्तिरेखा', actionLabel: ''),
        SizedBox(
          height: 190,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _portraits.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, i) {
              final p = _portraits[i];
              return GestureDetector(
                onTap: () => context.push(p.$4),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: SizedBox(
                    width: 130,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset(p.$1, fit: BoxFit.cover),
                        const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Color(0xE6120903)],
                              stops: [0.45, 1],
                            ),
                          ),
                        ),
                        Positioned(
                          left: 8,
                          right: 8,
                          bottom: 8,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.$2,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  height: 1.25,
                                ),
                              ),
                              Text(
                                p.$3,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiBody(
                                  fontSize: 10.5,
                                  color: const Color(0xFFF0B866),
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// ── Rajmudra ────────────────────────────────────────────────────────────────

class RajmudraSection extends StatelessWidget {
  const RajmudraSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF5EC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: HomeTheme.gold, width: 1.5),
      ),
      child: Column(
        children: [
          // Octagonal seal, as on the website.
          Container(
            width: 150,
            height: 150,
            alignment: Alignment.center,
            decoration: const ShapeDecoration(
              color: Color(0xFFC73800),
              shape: StarBorder.polygon(
                sides: 8,
                rotation: 22.5,
                side: BorderSide(color: Colors.white, width: 4),
              ),
            ),
            padding: const EdgeInsets.all(22),
            child: FittedBox(
              child: Text(
                'प्रतिपच्चंद्रलेखेव\nवर्धिष्णुर्विश्ववंदिता\nशाहसूनोः शिवस्यैषा\nमुद्रा भद्राय\nराजते ॥',
                textAlign: TextAlign.center,
                style: HomeTheme.marathiHeading(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  height: 1.45,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          const QuoteBlock(
            quote: HistoryData.rajmudraVerse,
            meaning:
                'प्रतिपदेच्या चंद्रकलेप्रमाणे प्रतिदिन वृद्धिंगत होणारी, विश्वाला वंदनीय असणारी, शहाजीपुत्र छत्रपती शिवाजी महाराजांची ही राजमुद्रा केवळ आणि केवळ प्रजेच्या कल्याणासाठी तळपते आहे!',
          ),
        ],
      ),
    );
  }
}

// ── Living Bhagwa flag ──────────────────────────────────────────────────────

class BhagwaFlagCard extends StatelessWidget {
  const BhagwaFlagCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        image: DecorationImage(
          image: const AssetImage('assets/images/hero_banner.webp'),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            const Color(0xFFC73800).withValues(alpha: 0.7),
            BlendMode.multiply,
          ),
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '🚩 स्वराज्याचे प्रतीक',
            style: HomeTheme.marathiBody(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: const Color(0xFFFFE082),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'आजही अभिमानाने फडकणारा जिवंत भगवा ध्वज',
            style: HomeTheme.marathiHeading(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '"ज्यांचे आरमार त्यांचा समुद्र!" म्हणणाऱ्या छत्रपती शिवरायांचा भगवा ध्वज — शौर्य, स्वाभिमान आणि अखंड स्वराज्याचे प्रतीक. साडेतीनशे वर्षांपूर्वी सह्याद्रीच्या कड्यांवर व गडकोटांवर फडकलेला हा ध्वज आजही प्रत्येक मराठ्याच्या मनात तितक्याच जाज्वल्य निष्ठेने फडकत आहे.',
            style: HomeTheme.marathiBody(
              fontSize: 13,
              color: Colors.white,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () => context.push('/culture/symbols'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFFC73800),
            ),
            child: Text(
              'राजमुद्रा व मराठा चिन्हे पहा →',
              style: HomeTheme.marathiBody(
                fontSize: 13.5,
                fontWeight: FontWeight.w800,
                color: const Color(0xFFC73800),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── The Great Maratha Empire ────────────────────────────────────────────────

class MarathaEmpireSection extends StatelessWidget {
  const MarathaEmpireSection({super.key});

  static const _cards = [
    (
      '⚔️',
      'अस्सल १८ वे शतक',
      'मराठा सैन्य युद्ध मोहीम',
      'घोडदळ (पागा), तोफखाना, पायदळ आणि भगवा ध्वज घेऊन रणांगणात उतरणाऱ्या मराठा सैन्याचे ऐतिहासिक चित्रण.',
    ),
    (
      '👑',
      '६ जून १६७४',
      'शिवराज्याभिषेक सोहळा (Coronation)',
      'दुर्गराज रायगडावर ३२ मण सुवर्ण सिंहासनावर संपन्न झालेला वैदिक राज्याभिषेक. रयतेच्या सार्वभौम मराठा साम्राज्याची अधिकृत स्थापना.',
    ),
    (
      '🗺️',
      'साम्राज्य नकाशा',
      'मराठा साम्राज्य विस्तार',
      'छत्रपती शाहू महाराज व बाजीराव पेशवे यांच्या नेतृत्वाखाली माळवा, गुजरात, बुंदेलखंड, दिल्ली व ओरिसापर्यंत झालेला अफाट विस्तार.',
    ),
    (
      '🐎',
      'मराठा घोडदळ',
      'मराठा घोडदळ शिलेदार (Maratha Sowar)',
      'चिलखत, शिरस्त्राण, भाला (बर्ची), ढाल व तलवार सज्ज मराठा घोडेस्वार — ज्यांच्या वेगवान घोडदौडीने मुघल व युरोपीय सत्तांना पराभूत केले.',
    ),
    (
      '🗡️',
      'शस्त्रागार',
      'मराठा शस्त्रास्त्रे व चिलखत संग्रह',
      'दांडपट्टा, धोप, तेगा, कट्यार, वाघनखे, गेंड्याच्या कातड्याची ढाल आणि जाळीदार लोखंडी चिलखत — मराठा युद्धकलेची अस्सल शस्त्रे.',
    ),
    (
      '🛡️',
      '१३ जुलै १६६०',
      'पावनखिंडीचा रणसंग्राम',
      'घोडखिंडीत शत्रूच्या अजस्त्र सेनेला रोखून धरणारे वीर बाजीप्रभू देशपांडे व ३०० बांदल मावळ्यांचे अमर बलिदान.',
    ),
  ];

  static const _eras = [
    (
      '१६४५ – १६८०',
      'हिंदवी स्वराज्य स्थापना युग',
      'छत्रपती शिवाजी महाराज',
      '३५०+ गडकोट, स्वतंत्र आरमार, अष्टप्रधान मंडळ, गनिमी कावा आणि स्वराज्याची सार्वभौम स्थापना.',
    ),
    (
      '१६८१ – १७०७',
      '२७ वर्षांचा स्वातंत्र्य संग्राम',
      'संभाजी महाराज, राजाराम महाराज, महाराणी ताराबाई, संताजी घोरपडे, धनाजी जाधव',
      'मुघल बादशहा औरंगजेबाच्या प्रचंड सेनेशी अविरत संघर्ष; औरंगजेबाचा संपूर्ण पराभव व महाराष्ट्रातच दफन.',
    ),
    (
      '१७०८ – १७६१',
      'साम्राज्य विस्तार व पेशवाई युग',
      'छत्रपती शाहू महाराज, बाजीराव पेशवे, चिमाजी आप्पा, नानासाहेब पेशवे',
      'अटकेपार भगवा ध्वज फडकवला (१७५८), माळवा-गुजरात-बुंदेलखंड विजय, पोर्तुगीजांचा वसईत दारुण पराभव (१७३९).',
    ),
    (
      '१७६१ – १८१८',
      'मराठा पुनरुत्थान व महादजी युग',
      'महादजी शिंदे, नाना फडणवीस, अहिल्याबाई होळकर, तुकोजी होळकर',
      'पानिपतनंतर अवघ्या १० वर्षांत दिल्ली पुन्हा जिंकली; मुघल बादशहाला मराठ्यांचे मांडलिक बनवले व इंग्रजांना पराभूत केले.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(
          title: 'अखंड मराठा साम्राज्य (१६७४ ते १८१८)',
          actionLabel: 'इतिहास',
          onAction: () => context.push('/history'),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: BodyText(
            'छत्रपती शिवाजी महाराजांनी १६७४ मध्ये स्थापन केलेले सार्वभौम स्वराज्य, छत्रपती संभाजी महाराजांचा अभेद्य लढा, आणि पेशवे, शिंदे, होळकर, भोसले, गायकवाड, पवार घराण्यांनी भारतभर फडकवलेला भगवा ध्वज. १८ व्या शतकात संपूर्ण हिंदुस्थानवर मराठा सत्तेचा एकछत्री दरारा होता.',
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: MediaQuery.textScalerOf(context).scale(170),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _cards.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, i) {
              final c = _cards[i];
              return Container(
                width: 240,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: HeritageColors.maroonGradient,
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${c.$1}  ${c.$2}',
                      style: HomeTheme.marathiBody(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFFF0B866),
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      c.$3,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: HomeTheme.marathiHeading(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Expanded(
                      child: Text(
                        c.$4,
                        overflow: TextOverflow.fade,
                        style: HomeTheme.marathiBody(
                          fontSize: 12,
                          color: const Color(0xFFE6DDCE),
                          height: 1.45,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: CardList(
            children: [
              for (final e in _eras)
                InfoCard(
                  title: e.$2,
                  subtitle: e.$1,
                  body: e.$4,
                  facts: [('प्रमुख छत्रपती / सेनापती', e.$3)],
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── All portals directory ───────────────────────────────────────────────────

class PortalDirectory extends StatefulWidget {
  const PortalDirectory({super.key});

  @override
  State<PortalDirectory> createState() => _PortalDirectoryState();
}

typedef _Portal = (String icon, String title, String desc, String route);

class _PortalDirectoryState extends State<PortalDirectory> {
  static const _tabs = <(String, List<_Portal>)>[
    (
      '⚔️ इतिहास व राज्यकर्ते',
      [
        (
          '📜',
          'मराठा इतिहास कालपट',
          '१६३० ते १८१८ चा अखंड मराठा साम्राज्य विस्तार व महत्त्वाच्या घडामोडी.',
          '/history',
        ),
        (
          '⚔️',
          'प्रमुख ७ रणांगणे',
          'पावनखिंड, पुरंदर, सिंहगड, पालखेड, वसई, पानिपत व वडगाव व्यूहरचना.',
          '/history/battles',
        ),
        (
          '👑',
          'छत्रपती शिवाजी महाराज',
          'हिंदवी स्वराज्य संस्थापक, रयतेचे राजे व युगपुरुष जीवनगाथा.',
          '/warrior/shivaji',
        ),
        (
          '🛡️',
          'छत्रपती संभाजी महाराज',
          'अपराजित पराक्रम, संस्कृत बुधभूषणम् व सर्वोच्च बलिदान.',
          '/warrior/sambhaji',
        ),
        (
          '🗡️',
          'महाराणी ताराबाई',
          'मोगल बादशहाला सळो की पळो करून स्वराज्य टिकवणारी रणरागिणी.',
          '/warrior/tarabai',
        ),
        (
          '🐎',
          'बाजीराव पेशवे प्रथम',
          '४१ लढायांमध्ये अपराजित, अटकेपार भगवा नेणारे महान सेनापती.',
          '/warrior/bajirao',
        ),
        (
          '🥾',
          'शिवकालीन मावळे व सरदार',
          'तानाजी, बाजीप्रभू, मुरारबाजी, संताजी-धनाजी व निष्ठावंत वीर.',
          '/history/warriors',
        ),
        (
          '⚓',
          'मराठा आरमार व जलदुर्ग',
          'सरखेल कान्होजी आंग्रे, सिंधुदुर्ग, विजयदुर्ग व सागरी साम्राज्य.',
          '/history/navy',
        ),
        (
          '⚖️',
          'स्वराज्य प्रशासन',
          'अष्टप्रधान मंडळ, महसूल गणक, किल्ले व्यवस्था व आज्ञापत्र.',
          '/history/swarajya-administration',
        ),
      ],
    ),
    (
      '🏰 गड-किल्ले व पर्यटन',
      [
        (
          '🗺️',
          'वारसा स्थळे (GPS)',
          'किल्ले, लेणी, मंदिरे व युनेस्को वारसास्थळे — नकाशात उघडा.',
          '/culture/heritage-places',
        ),
        (
          '👑',
          'दुर्गराज रायगड',
          'स्वराज्याची राजधानी, राज्याभिषेक वास्तू व पावन समाधी स्थळ.',
          '/fort/raigad',
        ),
        (
          '⛰️',
          'किल्ले राजगड',
          'स्वराज्याची पहिली राजधानी, सुवेळा, पद्मावती व संजीवनी माची.',
          '/fort/rajgad',
        ),
        (
          '🚩',
          'किल्ले शिवनेरी',
          'छत्रपती शिवाजी महाराजांचे पावन जन्मस्थान व शिवाई मंदिर.',
          '/fort/shivneri',
        ),
        (
          '⚔️',
          'किल्ले प्रतापगड',
          'अफझलखान वध स्थळ, भवानी माता मंदिर व जावळीचे अभेद्य खोरे.',
          '/fort/pratapgad',
        ),
        (
          '🥾',
          'वारसा ट्रेक व भ्रमंती',
          'पन्हाळा-पावनखिंड, राजगड-तोरणा व सह्याद्री दुर्ग भ्रमंती मार्ग.',
          '/history/trails',
        ),
        (
          '🛕',
          'शिवकालीन मंदिरे',
          'तुळजापूर भवानी, शिखर शिंगणापूर व शिवकालीन श्रद्धास्थाने.',
          '/culture/temples',
        ),
        (
          '🌍',
          'सांस्कृतिक विविधता (८ प्रदेश)',
          'कोकण, विदर्भ, मराठवाडा, खानदेश व पश्चिम महाराष्ट्राची जीवनशैली.',
          '/culture',
        ),
        (
          '🗣️',
          'महाराष्ट्राच्या बोली व लहेजा',
          'मालवणी, वऱ्हाडी, अहिराणी, आगरी व कोळी बोलींची परस्पर तुलना.',
          '/culture/dialects',
        ),
        (
          '🍲',
          'महाराष्ट्राची खाद्यसंस्कृती',
          'सोलकढी, तांबडा-पांढरा रस्सा, सावजी व अस्सल पारंपरिक पदार्थ.',
          '/culture/food',
        ),
        (
          '🎪',
          'ग्रामदैवत, जत्रा व लोककला',
          'गावची ग्रामदैवते, वार्षिक यात्रा दिनदर्शिका, दशावतार व देशी खेळ.',
          '/culture/gramdevat',
        ),
      ],
    ),
    (
      '📚 ग्रंथालय व चळवळी',
      [
        (
          '📖',
          'मराठा महाग्रंथालय',
          'सभासद बखर, शिवभारत, आज्ञापत्र व मराठी रियासत.',
          '/history/granthalaya',
        ),
        (
          '💡',
          'मराठा ज्ञानकोश',
          'व्यक्ती, किल्ले, लढाया, घराणी, प्रशासन व संज्ञा.',
          '/history/dnyankosh',
        ),
        (
          '🕯️',
          'धर्मवीर बलिदान मास स्मरण',
          'छत्रपती संभाजी महाराज व वीरांचे ऐतिहासिक स्वाभिमान स्मरण.',
          '/history/balidan-maas',
        ),
        (
          '🚩',
          '५८ क्रांती मूक मोर्चे',
          'शांततापूर्ण जनआंदोलने, आरक्षण लढा व सामाजिक चळवळी.',
          '/history/movements',
        ),
        (
          '📅',
          'ऐतिहासिक दिनविशेष',
          'शिवजन्म ते पालखेड — महत्त्वाचे ऐतिहासिक दिवस.',
          '/history/dates',
        ),
        (
          '⚡',
          'घटना ↔ स्थळे नॉलेज ग्राफ',
          'राज्याभिषेक, पन्हाळा वेढा यांसारख्या घटना, व्यक्ती, किल्ले व पर्यटन मार्ग.',
          '/history/knowledge-graph',
        ),
        (
          '🏆',
          'इतिहास महाक्विझ',
          'विषयनिहाय प्रश्न, स्पष्टीकरण व संदर्भ.',
          '/history/quiz',
        ),
      ],
    ),
    (
      '💼 व्यवसाय व करिअर',
      [
        (
          '🏢',
          'मराठा व्यवसाय निर्देशिका',
          'मराठा उद्योजक, कंपन्या व व्यावसायिक मंच.',
          '/business/directory',
        ),
        (
          '🤝',
          'व्यवसाय संगम',
          'स्थानिक बिझनेस चॅप्टर्स व नेटवर्किंग.',
          '/business/sangam',
        ),
        ('🥛', 'मराठा डेअरी', 'दुग्धव्यवसाय व सहकार.', '/business/dairy'),
        (
          '🏗️',
          'बिल्डर्स निर्देशिका',
          'बांधकाम व्यावसायिक.',
          '/business/builders',
        ),
        (
          '🏭',
          'उत्पादक निर्देशिका',
          'मराठा उत्पादक व उद्योग.',
          '/business/manufacturers',
        ),
      ],
    ),
    (
      '🌐 समुदाय व संस्था',
      [
        (
          '💬',
          'मराठा डिजिटल कम्युनिटी',
          'विचारविनिमय, सामाजिक संवाद आणि सुरक्षित बांधव मंच.',
          '/community',
        ),
        (
          '🗺️',
          'महाराष्ट्र नेटवर्क',
          'जिल्हे, तालुके व शाखांचे संघटनात्मक नेटवर्क.',
          '/network',
        ),
        (
          '🏛️',
          'Connect Maratha विषयी',
          'संस्थेची ओळख, ध्येय, मूल्ये व संपर्क.',
          '/about',
        ),
        (
          '⚙️',
          'खाते व गोपनीयता',
          'प्रोफाइल, सुरक्षा व डेटा गोपनीयता अधिकार.',
          '/profile/security',
        ),
        (
          '❓',
          'मदत आणि समर्थन',
          'सामान्य प्रश्न व ईमेल संपर्क.',
          '/profile/help',
        ),
      ],
    ),
  ];

  int _tab = 0;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final items =
        q.isEmpty
            ? _tabs[_tab].$2
            : [
              for (final t in _tabs)
                for (final p in t.$2)
                  if (p.$2.toLowerCase().contains(q) ||
                      p.$3.toLowerCase().contains(q))
                    p,
            ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionHeader(
          title: 'Connect Maratha — सर्व दालने',
          actionLabel: '',
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            onChanged: (v) => setState(() => _query = v),
            style: HomeTheme.marathiBody(fontSize: 14),
            decoration: InputDecoration(
              hintText: 'दालन शोधा (उदा. किल्ले, क्विझ, बोली)',
              hintStyle: HomeTheme.marathiBody(
                fontSize: 13,
                color: HomeTheme.textMuted,
              ),
              prefixIcon: const Icon(Icons.search_rounded),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: HeritageColors.line),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: HeritageColors.line),
              ),
            ),
          ),
        ),
        if (q.isEmpty) ...[
          const SizedBox(height: 10),
          FilterChipBar(
            labels: [for (final t in _tabs) t.$1],
            selected: _tab,
            onSelected: (i) => setState(() => _tab = i),
          ),
        ],
        const SizedBox(height: 10),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: CardList(
            emptyText: 'असे दालन सापडले नाही.',
            children: [
              for (final p in items)
                Material(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push(p.$4),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: HeritageColors.line),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.$1, style: const TextStyle(fontSize: 22)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.$2,
                                  style: HomeTheme.marathiHeading(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w800,
                                    color: HeritageColors.maroonDark,
                                    height: 1.3,
                                  ),
                                ),
                                Text(
                                  p.$3,
                                  style: HomeTheme.marathiBody(
                                    fontSize: 12,
                                    color: HeritageColors.body,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: HeritageColors.saffronDeep,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Join the community (replaces the old made-up sample post) ───────────────

class JoinCommunityCard extends StatelessWidget {
  const JoinCommunityCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: InfoCard(
        emoji: '💬',
        title: 'मराठा डिजिटल कम्युनिटी',
        subtitle: 'समाज फीड, गट व बांधव',
        body:
            'आपले विचार, उपक्रम व अनुभव शेअर करा आणि समाजबांधवांशी सुरक्षितपणे जोडले जा.',
        actionLabel: 'समुदाय दालन उघडा →',
        onAction: () => context.push('/community'),
      ),
    );
  }
}
