import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';
import '../data/history_part2_data.dart';
import '../models/history_models.dart';
import '../widgets/content_kit.dart';

/// शिवकालीन स्वराज्य प्रशासन व अष्टप्रधान मंडळ (website: SwarajyaAdminPage.jsx).
class SwarajyaAdminScreen extends StatefulWidget {
  const SwarajyaAdminScreen({super.key});

  @override
  State<SwarajyaAdminScreen> createState() => _SwarajyaAdminScreenState();
}

class _SwarajyaAdminScreenState extends State<SwarajyaAdminScreen> {
  static const _sections = [
    '👑 अष्टप्रधान मंडळ',
    '🌾 महसूल व काठी मोजणी गणक',
    '🏰 किल्ले प्रशासनाची त्रिमूर्ती',
    '📜 आज्ञापत्र व पर्यावरण नीती',
    '🪙 नाणी, गुप्तहेर व न्यायव्यवस्था',
  ];

  int _section = 0;

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF2D0808), Color(0xFF4A0E0E), Color(0xFF7A1C1C)],
        badge: '🚩 फक्त युद्ध नव्हे — लोककल्याणकारी राज्यव्यवस्था',
        title: 'शिवकालीन स्वराज्य प्रशासन व अष्टप्रधान मंडळ',
        subtitle:
            'तलवारीने जिंकलेले राज्य टिकते ते पारदर्शक व न्याय्य व्यवस्थेने. छत्रपती शिवाजी महाराजांनी एकाच वेळी महसूल मोजणी, त्रिस्तरीय गडकोट संरक्षण, स्वतंत्र न्यायदान, कडक पर्यावरण रक्षण आणि गुणवत्तेवर आधारित मंत्रिमंडळ निर्माण करून आधुनिक कल्याणकारी राज्याचा पाया घातला.',
        stats: [
          ('अष्टप्रधान पद्धत', 'मंत्रिमंडळ स्वरूप (८ खाती)'),
          ('१००% थेट रोख', 'वेतन पद्धती (No Jahagir)'),
          ('शिवशाही काठी', 'जमीन मोजणी प्रमाण (८० तसू)'),
          ('त्रिस्तरीय', 'गड नियंत्रण — परस्पर तपासणी'),
        ],
      ),
      children: [
        const SizedBox(height: 16),
        FilterChipBar(
          labels: _sections,
          selected: _section,
          onSelected: (i) => setState(() => _section = i),
        ),
        switch (_section) {
          0 => const _AshtapradhanSection(),
          1 => const _RevenueSection(),
          2 => const _FortTriadSection(),
          3 => const _AdnyapatraSection(),
          _ => const _CurrencyIntelSection(),
        },
        const _SourcesSection(),
      ],
    );
  }
}

// ── 1. Ashtapradhan ─────────────────────────────────────────────────────────

class _AshtapradhanSection extends StatefulWidget {
  const _AshtapradhanSection();

  @override
  State<_AshtapradhanSection> createState() => _AshtapradhanSectionState();
}

class _AshtapradhanSectionState extends State<_AshtapradhanSection> {
  int _category = 0;

  @override
  Widget build(BuildContext context) {
    final cat = HistoryPart2Data.pradhanCategories[_category].$1;
    final ministers =
        cat == 'all'
            ? HistoryPart2Data.ashtapradhan
            : HistoryPart2Data.ashtapradhan
                .where((p) => p.category == cat)
                .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 12),
        FilterChipBar(
          labels: [for (final c in HistoryPart2Data.pradhanCategories) c.$2],
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            children: [
              for (final p in ministers)
                InfoCard(
                  emoji: p.icon,
                  title: p.postMr,
                  subtitle: p.postEn,
                  tag: p.salary,
                  accent: Color(p.color),
                  facts: [
                    ('प्रथम पदसिद्ध अधिकारी', p.name),
                    (
                      'संस्कृत / फारसी संज्ञा',
                      '${p.sanskritTitle} · ${p.persianTitle}',
                    ),
                  ],
                  actionLabel: 'सविस्तर सनद पहा →',
                  onAction: () => _showMinister(context, p),
                ),
            ],
          ),
        ),
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: InfoCard(
            emoji: '🛡️',
            title:
                'शिवकालीन अष्टप्रधान मंडळाचा मूलभूत नियम: कोणतीही जहागीर वा वतनदारी नाही!',
            titleColor: Color(0xFF7D3B00),
            accent: Color(0xFFD47A1E),
            background: Color(0xFFFFF4E5),
            body:
                'शिवरायांनी अष्टप्रधानांना गावे वा वतने जहागीर म्हणून दिली नाहीत, कारण वतनदार स्वतःचे सैन्य बाळगून राज्याविरुद्ध बंड करू शकतात. त्याऐवजी सर्वांना थेट राजकोषातून रोकड वेतन दिले जाई. प्रधानाचे पद वंशपरंपरागत नव्हते; केवळ गुणवत्तेवर छत्रपती त्यांची नेमणूक किंवा हकालपट्टी करू शकत होते.',
          ),
        ),
      ],
    );
  }

  void _showMinister(BuildContext context, Pradhan p) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder:
          (context) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.8,
            maxChildSize: 0.95,
            builder:
                (context, controller) => ListView(
                  controller: controller,
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'अधिकृत शासकीय सनद',
                                style: HomeTheme.marathiBody(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w800,
                                  color: Color(p.color),
                                ),
                              ),
                              Text(
                                p.postMr,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF2D0808),
                                  height: 1.3,
                                ),
                              ),
                              Text(
                                p.postEn,
                                style: HomeTheme.marathiBody(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFA06828),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(p.icon, style: const TextStyle(fontSize: 36)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    InfoCard(
                      title: p.name,
                      subtitle: '१६७४ शिवराज्याभिषेक कालीन नियुक्ती',
                      accent: Color(p.color),
                      background: const Color(0xFFFBF5EE),
                      facts: [
                        ('कार्यकाळ', p.period),
                        ('मानधन', p.salary),
                        ('ब्रीद', p.motto),
                      ],
                    ),
                    const MiniHeading('📜 मूलभूत कार्यभार व कर्तव्ये'),
                    Text(
                      p.duties,
                      style: HomeTheme.marathiBody(
                        fontSize: 13.5,
                        color: const Color(0xFF3C2E25),
                        height: 1.55,
                      ),
                    ),
                    const MiniHeading('⚖️ विशेष अधिकार व स्वाक्षरीचे अधिकार'),
                    BulletList(items: p.powers),
                    const MiniHeading(
                      '👥 कारभारी अष्टक (खात्यातील साहाय्यक अधिकारी)',
                    ),
                    TagWrap(tags: p.subordinates),
                    const MiniHeading('📖 ऐतिहासिक संदर्भ'),
                    Text(
                      p.source,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        color: const Color(0xFF6A584C),
                      ),
                    ),
                  ],
                ),
          ),
    );
  }
}

// ── 2. Revenue & land-measurement calculator ────────────────────────────────

class _RevenueSection extends StatefulWidget {
  const _RevenueSection();

  @override
  State<_RevenueSection> createState() => _RevenueSectionState();
}

class _RevenueSectionState extends State<_RevenueSection> {
  static const _green = Color(0xFF204010);
  double _bigha = 5;
  double _yield = 60;
  bool _drought = false;

  @override
  Widget build(BuildContext context) {
    // Website formula: 60% to the farmer, 40% state revenue; in a declared
    // drought the whole crop stays with the farmer and a tagai loan is given.
    final farmer = _drought ? _yield : _yield * 0.6;
    final state = _drought ? 0.0 : _yield * 0.4;
    final tagai = _bigha.round() * 500;

    return ContentSection(
      title: 'शिवशाही काठी व बिघा मोजणी पद्धत',
      titleColor: _green,
      subtitle: '🌾 अण्णाजी दत्तो यांची महसूल सुधारणा (१६७८)',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            "मोगल व आदिलशाहीत शेतजमिनीचा अंदाज न घेता वतनदार मनमानी कर (६०-७०%) आणि सक्तीची वेठबिगारी लादत. शिवरायांचे सचिव अण्णाजी दत्तो यांनी प्रत्यक्ष शेतात जाऊन 'शिवशाही काठी'ने अचूक मोजणी केली आणि पिकाच्या वास्तविक उत्पन्नावर सारा ठरवला.",
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: const Color(0xFF574A3E),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const HubTileGridStatic(
            items: [
              (
                '१ शिवशाही काठी',
                '५ हात ५ मुठी',
                'अंदाजे ८० तसू (८२ ते ८४ इंच लांबी)',
              ),
              (
                '१ बिघा क्षेत्रफळ',
                '४०० चौरस काठ्या',
                '२० काठ्या लांब × २० काठ्या रुंद',
              ),
              ('१ चावर (मोठे क्षेत्र)', '१२० बिघे', 'गाव शिवाराचे मोठे प्रमाण'),
              (
                'हक्काची वाटणी',
                '६०% रयत : ४०% सरकार',
                '३/५ वाटा शेतकऱ्याला, २/५ सरकारला',
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1C3311), Color(0xFF2A4C1B)],
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  '🧮 शिवशाही महसूल व रयत वाटा गणक',
                  style: HomeTheme.marathiHeading(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFFF7C978),
                    height: 1.3,
                  ),
                ),
                Text(
                  'आपली शेती व उत्पन्न निवडून शिवशाहीतील महसूल आणि दुष्काळ सवलतींचे प्रत्यक्ष गणित पाहा.',
                  style: HomeTheme.marathiBody(
                    fontSize: 12.5,
                    color: const Color(0xFFD4E8C8),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 8),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _drought,
                  onChanged: (v) => setState(() => _drought = v),
                  activeColor: const Color(0xFFFF8484),
                  title: Text(
                    _drought
                        ? '⚠️ दुष्काळ जाहीर (करमाफी सक्रिय)'
                        : '☀️ सर्वसाधारण हंगाम',
                    style: HomeTheme.marathiBody(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                _SliderRow(
                  label:
                      'शेतजमीन आकार: ${_bigha.round()} बिघा (${_bigha.round() * 400} चौरस काठ्या)',
                  value: _bigha,
                  min: 1,
                  max: 30,
                  divisions: 29,
                  onChanged: (v) => setState(() => _bigha = v),
                ),
                _SliderRow(
                  label:
                      'एकूण शेतपीक धान्य: ${_yield.round()} क्विंटल (अंदाजे ${(_yield / 3).round()} खंडी)',
                  value: _yield,
                  min: 10,
                  max: 300,
                  divisions: 58,
                  onChanged: (v) => setState(() => _yield = v),
                ),
                const SizedBox(height: 8),
                _ResultCard(
                  label:
                      '🌾 रयतेचा हक्काचा वाटा (${_drought ? '१००%' : '६०%'})',
                  value: '${farmer.toStringAsFixed(1)} क्विंटल',
                  note:
                      'शेतकऱ्याला घरखर्च, पुढील बियाणे व बाजारात विक्रीसाठी पूर्ण स्वातंत्र्य.',
                ),
                _ResultCard(
                  label:
                      '🏛️ सरकारी महसूल (${_drought ? '०% माफी' : '४०% सारा'})',
                  value: '${state.toStringAsFixed(1)} क्विंटल',
                  note:
                      _drought
                          ? 'दुष्काळामुळे सारा पूर्णपणे माफ करण्यात आला आहे.'
                          : 'किल्ले, सैन्य रसद व जनकल्याण कामांसाठी वापर.',
                  alert: _drought,
                ),
                _ResultCard(
                  label: '🪙 तगाई कर्ज व मदत',
                  value: _drought ? '₹$tagai' : 'लागू नाही',
                  note:
                      _drought
                          ? 'दुष्काळात बैलजोडी व बियाण्यांसाठी बिनव्याजी सरकारी तगाई कर्ज, जे पीक आल्यावर हप्त्यांनी फेडायचे.'
                          : 'अतिवृष्टी किंवा दुष्काळात सरकारकडून मोफत बी-बियाणे व बैल खरेदीसाठी मदत.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Two-column grid of (label, value, note) measurement facts.
class HubTileGridStatic extends StatelessWidget {
  const HubTileGridStatic({super.key, required this.items});

  final List<(String, String, String)> items;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        const gap = 10.0;
        final width = (constraints.maxWidth - gap) / 2;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [
            for (final i in items)
              Container(
                width: width,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FBF5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFC8DEC0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      i.$1,
                      style: HomeTheme.marathiBody(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF416333),
                        height: 1.3,
                      ),
                    ),
                    Text(
                      i.$2,
                      style: HomeTheme.marathiHeading(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1B3B0F),
                        height: 1.3,
                      ),
                    ),
                    Text(
                      i.$3,
                      style: HomeTheme.marathiBody(
                        fontSize: 11,
                        color: const Color(0xFF687B60),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }
}

class _SliderRow extends StatelessWidget {
  const _SliderRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.divisions,
    required this.onChanged,
  });

  final String label;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: HomeTheme.marathiBody(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: const Color(0xFFD4E8C8),
            height: 1.35,
          ),
        ),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: divisions,
          activeColor: const Color(0xFFF7C978),
          inactiveColor: Colors.white24,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({
    required this.label,
    required this.value,
    required this.note,
    this.alert = false,
  });

  final String label;
  final String value;
  final String note;
  final bool alert;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color:
            alert
                ? const Color(0xFF8A1515).withValues(alpha: 0.35)
                : Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: alert ? const Color(0xFFFF8484) : Colors.white24,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFF7C978),
              height: 1.3,
            ),
          ),
          Text(
            value,
            style: HomeTheme.marathiHeading(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: alert ? const Color(0xFFFF8484) : Colors.white,
              height: 1.3,
            ),
          ),
          Text(
            note,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              color: const Color(0xFFC8DEC0),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

// ── 3. Fort administration triad ────────────────────────────────────────────

class _FortTriadSection extends StatelessWidget {
  const _FortTriadSection();

  @override
  Widget build(BuildContext context) {
    return ContentSection(
      title:
          'किल्ले प्रशासनाची त्रिस्तरीय नियंत्रण व्यवस्था (Checks & Balances)',
      subtitle: '🏰 रामचंद्रपंत अमात्य आज्ञापत्र सूत्र',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            '"किल्ले हेच राज्याचे मूळ, किल्ले हेच राज्याचे वैभव, किल्ले हेच राज्याचे सैन्य." कोणत्याही एका अधिकाऱ्याने फितूर होऊन गड शत्रूच्या हवाली करू नये म्हणून शिवरायांनी प्रत्येक किल्ल्यावर तीन वेगवेगळ्या जातींतील व कौशल्यांतील स्वतंत्र अधिकाऱ्यांची त्रिस्तरीय नियुक्ती केली.',
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: const Color(0xFF574A3E),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const CardList(
            children: [
              InfoCard(
                emoji: '🗡️',
                title: 'हवालदार (किल्लेदार)',
                subtitle: 'पद: मराठा समाजातील शूर सरदार',
                accent: Color(0xFF8F2800),
                titleColor: Color(0xFF8F2800),
                footer: BulletList(
                  items: [
                    'गडाचा सर्वोच्च लष्करी अधिकारी व मुख्य रक्षक',
                    'किल्ल्याच्या सर्व दरवाजांच्या चाव्यांचा प्रत्यक्ष ताबा हवालदाराकडे असे',
                    'संध्याकाळी तोफेच्या आवाजानंतर दरवाजा बंद करणे व सकाळी उघडणे',
                    'शत्रूशी युद्धप्रसंगी गडावरील सैन्याचे प्रत्यक्ष सेनापतीपद',
                  ],
                ),
              ),
              InfoCard(
                emoji: '✍️',
                title: 'सबनीस',
                subtitle: 'पद: ब्राह्मण मुत्सद्दी / हिशेबनीस',
                accent: Color(0xFF1E517B),
                titleColor: Color(0xFF1E517B),
                footer: BulletList(
                  items: [
                    'किल्ल्याचा दफ्तरदार, हिशेब व पत्रव्यवहार प्रमुख',
                    'गडावरील सैनिकांचे हजेरी पुस्तक व रोख वेतन वाटप',
                    'राजधानीकडून येणाऱ्या सर्व शासकीय आज्ञापत्रांची नोंद ठेवणे',
                    'हवालदाराच्या परवानगीशिवाय कोणतेही पत्र किंवा वेतन मंजूर न करणे',
                  ],
                ),
              ),
              InfoCard(
                emoji: '📦',
                title: 'कारखानीस',
                subtitle: 'पद: प्रभू / कायस्थ प्रशासकीय तज्ज्ञ',
                accent: Color(0xFF7D4C1E),
                titleColor: Color(0xFF7D4C1E),
                footer: BulletList(
                  items: [
                    'रसद, धान्य कोठारे, दारूगोळा व तोफखान्याचा कारभारी',
                    'गडावरील पाणी टाक्यांची स्वच्छता व अन्नधान्याची साठवणूक',
                    'किल्ल्याच्या तटबंदी, बुरूज व दरवाजांच्या दुरुस्तीचे व्यवस्थापन',
                    'हवालदार व सबनीस या दोघांच्या संयुक्त मंजुरीशिवाय साठा न देणे',
                  ],
                ),
              ),
              InfoCard(
                emoji: '🔒',
                title: 'फितुरीला शून्य वाव — ऐतिहासिक तपासणी सूत्र',
                background: Color(0xFFF4ECE4),
                accent: Color(0xFF8F2800),
                body:
                    'कोणत्याही किल्ल्यावर हवालदार, सबनीस व कारखानीस हे तिघेही एकत्र आल्याशिवाय गड शत्रूच्या ताब्यात देणे किंवा दरवाजा उघडणे तांत्रिकदृष्ट्या अशक्य होते. याव्यतिरिक्त तटबंदीवर तटसरनोबत आणि डोंगर पायथ्याशी रामोशी, कोळी, भिल्ल व मातंग गडकरी यांची कडक रात्रगस्त असे. त्यामुळेच मुघल सैन्याला एका साध्या गडाला जिंकण्यासाठीही कित्येक वर्षे लढावे लागत असे.',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── 4. Adnyapatra & environmental ethics ────────────────────────────────────

class _AdnyapatraSection extends StatelessWidget {
  const _AdnyapatraSection();

  @override
  Widget build(BuildContext context) {
    return ContentSection(
      title: "रामचंद्रपंत अमात्यांचे 'आज्ञापत्र' (१७१६) व वृक्षसंवर्धन",
      titleColor: const Color(0xFF1B4D24),
      subtitle: '🌲 जगातील पहिली पर्यावरण व नागरी आचारसंहिता',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'मराठा आरमारात जहाजे व गलबते बांधण्यासाठी प्रचंड लाकूड लागत असे. परंतु छत्रपती शिवाजी महाराजांनी रयतेने पोटच्या लेकरासारखी वाढवलेली फळझाडे तोडण्यास सक्त मनाई करणारा जगातील पहिला पर्यावरण संरक्षण कायदा जारी केला.',
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: const Color(0xFF574A3E),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const CardList(
            children: [
              _Decree(
                heading: '📜 आज्ञापत्र: वृक्षसंरक्षण कलम',
                quote:
                    '"आरमारास लाकूड पाहिजे म्हणून आंबा, फणस आदी वृक्ष तोडू नयेत. हे वृक्ष काही एका वर्षात तयार होत नाहीत. रयतेने पोटच्या मुलांसारखी झाडे वाढविली असतात. ती तोडल्यास रयतेस दुःख होते. झाड वाळले असेल तर मालकास रास्त द्रव्य देऊन त्याचे संमतीने तोडावे."',
                attribution: '— रामचंद्रपंत अमात्य, आज्ञापत्र (आरमार प्रकरण)',
                color: Color(0xFF2F6824),
                background: Color(0xFFF6FAF4),
              ),
              _Decree(
                heading: '📜 चिपळूणचे पत्र (१६७४): रयतेचे संरक्षण',
                quote:
                    '"रयतेच्या भाजीच्या देठासही हात न लावणे. सैन्याने कोणाकडून फुकट काही घेऊ नये. शेतकऱ्यांचे लाकूड, पेंढा, दाणा फुकट नेल्यास ते उपाशी मरतील आणि मोगल बरे, तुम्ही वाईट असे म्हणतील! तेव्हा लष्कराने रयतेला अजिबात उपद्रव देऊ नये."',
                attribution:
                    '— छत्रपती शिवाजी महाराज, चिपळूण छावणीस पत्र (१४ एप्रिल १६७४)',
                color: Color(0xFF8F4E08),
                background: Color(0xFFFCF8F2),
              ),
              _Decree(
                heading: '📜 स्त्रियांचा सन्मान व कठोर आचारसंहिता',
                quote:
                    '"शत्रूच्या प्रदेशातही स्त्री, बालक, गोमाता व धर्मस्थाने यांना अभय असणे. युद्धात बंदीवान झालेल्या महिलांचा मातेसमान आदर करून त्यांना सन्मानाने त्यांच्या कुटुंबियांकडे पाठवावे. जो सैनिक स्त्रीवर हात टाकेल त्याचा तात्काळ शिरच्छेद करावा."',
                attribution: '— सभासद बखर व कल्याण सुभेदार सून प्रसंग (१६५७)',
                color: Color(0xFF9E1B1B),
                background: Color(0xFFFFF5F5),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Decree extends StatelessWidget {
  const _Decree({
    required this.heading,
    required this.quote,
    required this.attribution,
    required this.color,
    required this.background,
  });

  final String heading;
  final String quote;
  final String attribution;
  final Color color;
  final Color background;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            heading,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: color,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            quote,
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: color,
              height: 1.6,
            ).copyWith(fontStyle: FontStyle.italic),
          ),
          const SizedBox(height: 8),
          Text(
            attribution,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              color: HeritageColors.body,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

// ── 5. Currency, intelligence & justice ─────────────────────────────────────

class _CurrencyIntelSection extends StatelessWidget {
  const _CurrencyIntelSection();

  @override
  Widget build(BuildContext context) {
    return ContentSection(
      title: 'शिवकालीन नाणी, गुप्तहेर जाळे व न्यायनिवाडा',
      subtitle: '🪙 सार्वभौम अर्थव्यवस्था व सुरक्षा यंत्रणा',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'स्वतंत्र राज्याचे स्वतःचे चलन आणि अंतर्गत सुरक्षेसाठी अचूक माहिती देणारे गुप्तहेर असणे अनिवार्य होते. १६७४ च्या राज्याभिषेकानंतर शिवरायांनी परकीय चलनावरचे अवलंबित्व संपवून स्वतःची मुद्रांकित नाणी चलनात आणली.',
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: const Color(0xFF574A3E),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          const CardList(
            children: [
              InfoCard(
                emoji: '🪙',
                title: "सुवर्ण 'होन' व तांब्याची 'शिवराई'",
                subtitle: 'शिवराज्याभिषेक शक १६७४',
                titleColor: Color(0xFF8F2800),
                facts: [
                  (
                    'शिवराई (तांबे)',
                    "सर्वसामान्य व्यवहारांसाठी वजन सु. १० ते १२ ग्रॅम. दर्शनी भागावर 'श्री / राजा / शिव' आणि मागील भागावर 'छ / त्र / पती' देवनागरी लिपीत कोरलेले.",
                  ),
                  (
                    'होन (सुवर्ण)',
                    'उच्च दर्जाचे शुद्ध सोने, वजन सु. २.८ ते ३.० ग्रॅम. आंतरराष्ट्रीय व्यापारात प्रचंड विश्वासार्हता.',
                  ),
                ],
              ),
              InfoCard(
                emoji: '🕵️',
                title: 'बहिर्जी नाईक व गुप्तहेर यंत्रणा',
                subtitle: 'माहितीचा अचूक धागा',
                titleColor: Color(0xFF3A5A40),
                accent: Color(0xFF3A5A40),
                body:
                    'स्वराज्याचे गुप्तहेर प्रमुख बहिर्जी नाईक यांच्या हाताखाली ३००० पेक्षा जास्त वाकबगार गुप्तहेर कार्यरत होते. वेशांतर करणे, सांकेतिक शिट्ट्या, पक्ष्यांचे आवाज काढणे आणि शत्रूच्या छावणीतील रस्ते, दरवाजे व खजिने यांची आधीच नकाशासहित माहिती गोळा करणे हे त्यांचे मुख्य काम होते (उदा. सुरत लुटणे व शाहिस्तेखान छापा).',
              ),
              InfoCard(
                emoji: '⚖️',
                title: 'गोतसभा, पंचायत व निष्पक्ष न्याय',
                subtitle: 'समान कायदे व निःपक्षपाती दंड',
                titleColor: Color(0xFF6B2D5C),
                accent: Color(0xFF6B2D5C),
                body:
                    'गाव पातळीवर भांडणे सोडवण्यासाठी स्थानिक पाटील व गोतसभा (गावकरी पंचायत) होती. अपील मुख्य न्यायाधीश व छत्रपतींच्या दरबारात होत असे. रांझ्याच्या पाटलाने स्त्रीवर अन्याय केला असता त्याचे दोन्ही हात व पाय तोडण्याचा (चौरंग) कठोर निर्णय शिवरायांनी घेतला, ज्यामुळे स्वराज्यात गुन्हेगारीला मोठा आळा बसला.',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Sources & related pages ─────────────────────────────────────────────────

class _SourcesSection extends StatelessWidget {
  const _SourcesSection();

  @override
  Widget build(BuildContext context) {
    return ContentSection(
      title: '📖 अस्सल ऐतिहासिक संदर्भ व संशोधन आधार',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const BulletList(
            items: [
              'सभासद बखर: कृष्णाजी अनंत सभासद (१६९७)',
              'आज्ञापत्र: रामचंद्रपंत अमात्य (१७१६)',
              'जेधे शकावली व करीना: समकालीन नोंदी',
              'शिवभारत: कवींद्र परमानंद (१६७४)',
              'मराठ्यांच्या इतिहासाची साधने: वि. का. राजवाडे (२२ खंड)',
              'मराठी रियासत: रियासतकार गो. स. सरदेसाई',
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ActionChip(
                label: const Text('⚓ मराठा आरमार'),
                onPressed: () => context.push('/history/navy'),
              ),
              ActionChip(
                label: const Text('🕸️ नॉलेज ग्राफ'),
                onPressed: () => context.push('/history/knowledge-graph'),
              ),
              ActionChip(
                label: const Text('🏆 इतिहास ज्ञान क्विझ'),
                onPressed: () => context.push('/history/quiz'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
