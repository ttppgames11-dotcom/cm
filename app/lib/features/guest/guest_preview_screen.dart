import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

/// ──────────────────────────────────────────────────────────────────────────
/// Guest Preview Screen — shown when the user taps "पाहुणे म्हणून पाहा".
///
/// Design principle: *show enough to excite, lock enough to convert*.
///   • Collapsing fort-hero app bar
///   • Guest badge + Mission banner with stats
///   • Heritage forts horizontal scroll (4 cards)
///   • Upcoming events (2 public, locked register button)
///   • Locked community activity with inline join prompt
///   • Member benefits 3×2 grid
///   • Warriors teaser list (3 visible + locked "see all")
///   • Sticky bottom CTA: "लॉगिन करा" + "नोंदणी करा"
/// ──────────────────────────────────────────────────────────────────────────
class GuestPreviewScreen extends StatefulWidget {
  const GuestPreviewScreen({super.key});

  @override
  State<GuestPreviewScreen> createState() => _GuestPreviewScreenState();
}

class _GuestPreviewScreenState extends State<GuestPreviewScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctl;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  // ── Colour palette ──────────────────────────────────────────────────────
  static const _saffron = Color(0xFFE84C10);
  static const _saffronLight = Color(0xFFFF5C1A);
  static const _cream = Color(0xFFFAF7F2);
  static const _darkBrown = Color(0xFF2B1B12);
  static const _midBrown = Color(0xFF8B6A52);
  static const _divider = Color(0xFFEEE8E2);
  static const _goldAccent = Color(0xFFE5C07B);

  @override
  void initState() {
    super.initState();
    _ctl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 650),
    );
    _fade = CurvedAnimation(parent: _ctl, curve: Curves.easeOut);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctl, curve: Curves.easeOut));
    _ctl.forward();
  }

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  void _goLogin() => context.go('/login');
  void _goRegister() => context.push('/register');

  // ══════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _cream,
      body: FadeTransition(
        opacity: _fade,
        child: SlideTransition(
          position: _slide,
          child: Stack(
            children: [
              CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  _sliverAppBar(),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: 20),
                          _guestBadge(),
                          const SizedBox(height: 20),
                          _missionBanner(),
                          const SizedBox(height: 24),
                          _sectionHeader(
                            icon: Icons.castle_rounded,
                            mr: 'मराठा दुर्ग वारसा',
                            en: 'Maratha Heritage Forts',
                          ),
                          const SizedBox(height: 12),
                          _fortCards(),
                          const SizedBox(height: 24),
                          _sectionHeader(
                            icon: Icons.groups_rounded,
                            mr: 'समुदाय घडामोडी',
                            en: 'Community Activity',
                          ),
                          const SizedBox(height: 12),
                          _lockedCommunity(),
                          const SizedBox(height: 24),
                          _benefitsPanel(),
                          const SizedBox(height: 24),
                          _warriorsTeaser(),
                          const SizedBox(height: 120), // clears sticky bar
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              Positioned(bottom: 0, left: 0, right: 0, child: _stickyBar()),
            ],
          ),
        ),
      ),
    );
  }

  // ── Sliver hero AppBar ──────────────────────────────────────────────────
  Widget _sliverAppBar() {
    return SliverAppBar(
      expandedHeight: 210,
      pinned: true,
      stretch: true,
      backgroundColor: _darkBrown,
      leading: IconButton(
        icon: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.black.withAlpha(90),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.arrow_back_rounded,
            color: Colors.white,
            size: 20,
          ),
        ),
        onPressed: _goLogin,
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: _goLogin,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
              decoration: BoxDecoration(
                color: _saffron,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'लॉगिन करा',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/heritage_rajgad.webp',
              fit: BoxFit.cover,
              errorBuilder:
                  (_, __, ___) => Container(color: const Color(0xFF3D1F0C)),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withAlpha(80),
                    Colors.black.withAlpha(170),
                    _darkBrown.withAlpha(230),
                  ],
                ),
              ),
            ),
            Positioned(
              bottom: 20,
              left: 20,
              right: 90,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _saffron.withAlpha(200),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'पाहुणे दृश्य  •  Guest Preview',
                      style: GoogleFonts.mukta(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: 'Connect ',
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        TextSpan(
                          text: 'मराठा',
                          style: GoogleFonts.mukta(
                            fontSize: 23,
                            fontWeight: FontWeight.w900,
                            color: _goldAccent,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'आधुनिक युगातील आधुनिक संघटन',
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Guest badge ─────────────────────────────────────────────────────────
  Widget _guestBadge() {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        decoration: BoxDecoration(
          color: _saffron.withAlpha(14),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: _saffron.withAlpha(60)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_outline_rounded, size: 16, color: _saffron),
            const SizedBox(width: 8),
            Text(
              'तुम्ही पाहुणे म्हणून पाहत आहात',
              style: GoogleFonts.mukta(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: _saffron,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Mission banner ──────────────────────────────────────────────────────
  Widget _missionBanner() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3D1F0C), Color(0xFF5C2D15)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: _saffron.withAlpha(50),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _saffron.withAlpha(50),
                  shape: BoxShape.circle,
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/images/connect_maratha_crest.webp',
                    fit: BoxFit.cover,
                    errorBuilder:
                        (_, __, ___) => const Icon(
                          Icons.shield_rounded,
                          color: _goldAccent,
                          size: 22,
                        ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'आमची दृष्टी  •  Our Mission',
                    style: GoogleFonts.mukta(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _goldAccent.withAlpha(200),
                    ),
                  ),
                  Text(
                    'Connect मराठा',
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      color: Colors.white60,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            '" स्वराज्य हेच आमची ओळख "',
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: _goldAccent,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Connect मराठा हे मराठा समाजाचे संयुक्त डिजिटल व्यासपीठ आहे — '
            'संस्कृती, व्यापार, इतिहास आणि सामाजिक एकतेचे केंद्र.',
            style: GoogleFonts.mukta(
              fontSize: 13,
              color: Colors.white70,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _statChip('७', 'निर्णायक लढाया'),
              const SizedBox(width: 10),
              _statChip('३६', 'जिल्हे'),
              const SizedBox(width: 10),
              _statChip('३५०+', 'किल्ले'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statChip(String val, String label) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withAlpha(25)),
      ),
      child: Column(
        children: [
          Text(
            val,
            style: GoogleFonts.mukta(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: _goldAccent,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.mukta(fontSize: 11, color: Colors.white60),
          ),
        ],
      ),
    ),
  );

  // ── Section header ──────────────────────────────────────────────────────
  Widget _sectionHeader({
    required IconData icon,
    required String mr,
    required String en,
    String? badge,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _saffron.withAlpha(18),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: _saffron, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                mr,
                style: GoogleFonts.mukta(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  color: _darkBrown,
                ),
              ),
              Text(
                en,
                style: GoogleFonts.mukta(fontSize: 11.5, color: _midBrown),
              ),
            ],
          ),
        ),
        if (badge != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _saffron.withAlpha(18),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _saffron.withAlpha(50)),
            ),
            child: Text(
              badge,
              style: GoogleFonts.mukta(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _saffron,
              ),
            ),
          ),
      ],
    );
  }

  // ── Heritage forts filter & expanded section ───────────────────────────
  int _selectedFortFilter = 0;

  Widget _fortCards() {
    final filters = [
      'सर्व किल्ले (All)',
      'गिरीदुर्ग (Hill)',
      'राजधानी (Capital)',
      'जलदुर्ग (Sea)',
    ];

    final allForts = [
      (
        'राजगड किल्ला',
        'पुणे',
        'स्वराज्याची पहिली राजधानी',
        'assets/images/heritage_rajgad.webp',
        'राजधानी',
        '४,५१४ फूट',
        'मध्यम',
      ),
      (
        'सिंहगड किल्ला',
        'पुणे',
        'तानाजी मालुसरे यांचा पराक्रम',
        'assets/images/heritage_sinhgad.webp',
        'गिरीदुर्ग',
        '४,३२० फूट',
        'सोपे',
      ),
      (
        'शिवनेरी किल्ला',
        'जुन्नर',
        'शिवरायांचे पवित्र जन्मस्थान',
        'assets/images/heritage_hero.webp',
        'गिरीदुर्ग',
        '३,५०० फूट',
        'सोपे',
      ),
      (
        'रायगड किल्ला',
        'रायगड',
        'शिवछत्रपतींचे राजधानी महादुर्ग',
        'assets/images/hero_banner.webp',
        'राजधानी',
        '२,७०० फूट',
        'मध्यम',
      ),
      (
        'तोरणा किल्ला',
        'पुणे',
        'स्वराज्याचे पहिले तोरण',
        'assets/images/post_rajgad_trek.webp',
        'गिरीदुर्ग',
        '४,६०३ फूट',
        'कठीण',
      ),
      (
        'प्रतापगड किल्ला',
        'सातारा',
        'अफझलखान वधाचा रणसंग्राम',
        'assets/images/event_rajgad.webp',
        'गिरीदुर्ग',
        '३,५४३ फूट',
        'मध्यम',
      ),
      (
        'सिंधुदुर्ग किल्ला',
        'मालवण',
        'शिवछत्रपतींचे अजिंक्य आरमार केंद्र',
        'assets/images/splash_background.webp',
        'जलदुर्ग',
        'समुद्र पातळी',
        'सोपे',
      ),
    ];

    final filteredForts =
        allForts.where((f) {
          if (_selectedFortFilter == 1) return f.$5 == 'गिरीदुर्ग';
          if (_selectedFortFilter == 2) return f.$5 == 'राजधानी';
          if (_selectedFortFilter == 3) return f.$5 == 'जलदुर्ग';
          return true;
        }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quick Category Chips
        SizedBox(
          height: 34,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: filters.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, idx) {
              final isSel = _selectedFortFilter == idx;
              return GestureDetector(
                onTap: () => setState(() => _selectedFortFilter = idx),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: isSel ? _saffron : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSel ? _saffron : const Color(0xFFE5E7EB),
                    ),
                    boxShadow:
                        isSel
                            ? [
                              BoxShadow(
                                color: _saffron.withAlpha(50),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ]
                            : null,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    filters[idx],
                    style: GoogleFonts.mukta(
                      fontSize: 11.5,
                      fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                      color: isSel ? Colors.white : const Color(0xFF5A4A3E),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),

        // Horizontal Fort Cards Slider
        SizedBox(
          height: 220,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: filteredForts.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, i) {
              final (name, district, subtitle, asset, type, height, diff) =
                  filteredForts[i];
              return GestureDetector(
                onTap:
                    () => _joinSheet(context, '$name सविस्तर माहिती व इतिहास'),
                child: Container(
                  width: 175,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(28),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset(
                          asset,
                          fit: BoxFit.cover,
                          errorBuilder:
                              (_, __, ___) =>
                                  Container(color: const Color(0xFF3D1F0C)),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withAlpha(60),
                                Colors.transparent,
                                Colors.black.withAlpha(230),
                              ],
                              stops: const [0.0, 0.35, 1.0],
                            ),
                          ),
                        ),
                        // District & Type Badges (Top)
                        Positioned(
                          top: 10,
                          left: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: _saffron.withAlpha(220),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              type,
                              style: GoogleFonts.mukta(
                                fontSize: 9.5,
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 10,
                          right: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withAlpha(150),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.white.withAlpha(40),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.location_on_rounded,
                                  size: 10,
                                  color: Color(0xFFFBBF24),
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  district,
                                  style: GoogleFonts.mukta(
                                    fontSize: 10,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Title, Subtitle, Height & Difficulty (Bottom)
                        Positioned(
                          bottom: 12,
                          left: 10,
                          right: 10,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.mukta(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  height: 1.2,
                                ),
                              ),
                              Text(
                                subtitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.mukta(
                                  fontSize: 10.5,
                                  color: const Color(0xFFE5D5C5),
                                  height: 1.2,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withAlpha(30),
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.landscape_rounded,
                                          size: 10,
                                          color: Color(0xFFE5C07B),
                                        ),
                                        const SizedBox(width: 3),
                                        Text(
                                          height,
                                          style: GoogleFonts.mukta(
                                            fontSize: 9.5,
                                            color: Colors.white,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: (diff == 'कठीण'
                                              ? Colors.red
                                              : diff == 'मध्यम'
                                              ? Colors.amber
                                              : Colors.green)
                                          .withAlpha(70),
                                      borderRadius: BorderRadius.circular(5),
                                    ),
                                    child: Text(
                                      diff,
                                      style: GoogleFonts.mukta(
                                        fontSize: 9.5,
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
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
        const SizedBox(height: 10),

        // Quick Forts Explorer Card Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF9F5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFFFDFC8)),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.travel_explore_rounded,
                color: _saffron,
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'महाराष्ट्रातील ३५०+ गड-किल्ले, नकाशे व ट्रेक गाईड्स',
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: _darkBrown,
                  ),
                ),
              ),
              GestureDetector(
                onTap: () => _joinSheet(context, '३५०+ गड-किल्ले निर्देशिका'),
                child: Row(
                  children: [
                    Text(
                      'सर्व पहा',
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: _saffron,
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 16,
                      color: _saffron,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Event card ──────────────────────────────────────────────────────────
  // ── Locked community card ───────────────────────────────────────────────
  Widget _lockedCommunity() {
    return GestureDetector(
      onTap: () => _joinSheet(context, 'समुदाय घडामोडी पहा'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: _divider),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Stack(
            children: [
              // blurred-behind content
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: _saffron.withAlpha(40),
                          child: Icon(Icons.person, color: _saffron, size: 20),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'तानाजी सावंत',
                              style: GoogleFonts.mukta(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: _darkBrown,
                              ),
                            ),
                            Text(
                              '2 तासांपूर्वी',
                              style: GoogleFonts.mukta(
                                fontSize: 11,
                                color: _midBrown,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'आज राजगड संवर्धन मोहिमेत सहभाग घेतला. सह्याद्रीच्या कुशीत '
                      'पूर्वजांचा पराक्रम अनुभवण्याचा हा क्षण अविस्मरणीय होता!',
                      style: GoogleFonts.mukta(
                        fontSize: 13,
                        color: _darkBrown,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(
                          Icons.favorite_outline_rounded,
                          size: 16,
                          color: _midBrown,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '184',
                          style: GoogleFonts.mukta(
                            fontSize: 12,
                            color: _midBrown,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 16,
                          color: _midBrown,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '32',
                          style: GoogleFonts.mukta(
                            fontSize: 12,
                            color: _midBrown,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
              // semi-transparent lock overlay
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(215),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: _saffron.withAlpha(18),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: _saffron.withAlpha(60),
                                width: 1.5,
                              ),
                            ),
                            child: Icon(
                              Icons.lock_rounded,
                              color: _saffron,
                              size: 24,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'समुदाय पाहण्यासाठी\nसदस्यत्व आवश्यक',
                            style: GoogleFonts.mukta(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w800,
                              color: _darkBrown,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Join to view Community Activity',
                            style: GoogleFonts.mukta(
                              fontSize: 12,
                              color: _midBrown,
                            ),
                          ),
                          const SizedBox(height: 10),
                          GestureDetector(
                            onTap: _goRegister,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 22,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [_saffronLight, Color(0xFFD63B08)],
                                ),
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: _saffron.withAlpha(60),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Text(
                                'मोफत सदस्य व्हा',
                                style: GoogleFonts.mukta(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Member benefits ─────────────────────────────────────────────────────
  Widget _benefitsPanel() {
    final benefits = [
      (
        Icons.card_membership_rounded,
        const Color(0xFFE84C10),
        'डिजिटल ID कार्ड',
      ),
      (
        Icons.event_available_rounded,
        const Color(0xFF1E7044),
        'कार्यक्रम नोंदणी',
      ),
      (Icons.groups_2_rounded, const Color(0xFF1E4B8B), 'समुदाय नेटवर्क'),
      (Icons.storefront_rounded, const Color(0xFF8B1E1E), 'व्यावसायिक सूची'),
      (Icons.castle_rounded, const Color(0xFF5C2D15), 'किल्ले माहिती'),
      (Icons.qr_code_2_rounded, const Color(0xFF6D28D9), 'QR ओळखपत्र'),
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _divider),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 20,
                decoration: BoxDecoration(
                  color: _saffron,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'सदस्यत्वाचे फायदे',
                style: GoogleFonts.mukta(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: _darkBrown,
                ),
              ),
              const Spacer(),
              Text(
                'Member Benefits',
                style: GoogleFonts.mukta(fontSize: 11, color: _midBrown),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            // Fixed height that grows with the system font size: an aspect
            // ratio made the tiles too short on narrow phones.
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: MediaQuery.textScalerOf(context).scale(92),
            ),
            itemCount: benefits.length,
            itemBuilder: (context, i) {
              final (icon, color, label) = benefits[i];
              return Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withAlpha(14),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: color.withAlpha(35)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(icon, color: color, size: 24),
                    const SizedBox(height: 6),
                    Text(
                      label,
                      style: GoogleFonts.mukta(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _darkBrown,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ── Warriors teaser ─────────────────────────────────────────────────────
  Widget _warriorsTeaser() {
    final warriors = [
      (
        'छत्रपती शिवाजी महाराज',
        'संस्थापक महाराज',
        'assets/images/warrior_shivaji.webp',
      ),
      (
        'तानाजी मालुसरे',
        'सिंहगडाचे वीर नरवीर',
        'assets/images/warrior_tanaji.webp',
      ),
      (
        'बाजीराव पेशवा',
        'अपराजित मराठा सेनापती',
        'assets/images/warrior_bajirao.webp',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionHeader(
          icon: Icons.military_tech_rounded,
          mr: 'मराठा वीर महापुरुष',
          en: 'Maratha Warriors',
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: _divider),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(8),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            children: [
              ...warriors.map((w) {
                final (name, role, img) = w;
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: _divider, width: 1),
                    ),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 44,
                          height: 44,
                          color: _saffron.withAlpha(20),
                          child: Image.asset(
                            img,
                            fit: BoxFit.cover,
                            errorBuilder:
                                (_, __, ___) => Icon(
                                  Icons.person_rounded,
                                  color: _saffron,
                                  size: 24,
                                ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: GoogleFonts.mukta(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w800,
                                color: _darkBrown,
                              ),
                            ),
                            Text(
                              role,
                              style: GoogleFonts.mukta(
                                fontSize: 12,
                                color: _midBrown,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: _saffron.withAlpha(150),
                      ),
                    ],
                  ),
                );
              }),
              // locked "see all" row
              GestureDetector(
                onTap: () => _joinSheet(context, 'सर्व वीर महापुरुष पहा'),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _saffron.withAlpha(10),
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(18),
                      bottomRight: Radius.circular(18),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.lock_rounded, size: 14, color: _saffron),
                      const SizedBox(width: 8),
                      Text(
                        'सर्व ६ वीर पाहण्यासाठी सदस्यत्व घ्या',
                        style: GoogleFonts.mukta(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: _saffron,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Sticky bottom bar ───────────────────────────────────────────────────
  Widget _stickyBar() {
    final bottom = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(16, 14, 16, 14 + bottom),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(30),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 38,
            height: 4,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFDDD5CC),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'आजच सदस्य व्हा!',
                      style: GoogleFonts.mukta(
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: _darkBrown,
                      ),
                    ),
                    Text(
                      'मोफत — Free Membership',
                      style: GoogleFonts.mukta(fontSize: 12, color: _midBrown),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: _goLogin,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _saffron, width: 1.5),
                  ),
                  child: Text(
                    'लॉगिन',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: _saffron,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _goRegister,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [_saffronLight, Color(0xFFD63B08)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: _saffron.withAlpha(80),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    'नोंदणी करा',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Join prompt bottom sheet ────────────────────────────────────────────
  void _joinSheet(BuildContext context, String featureName) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder:
          (ctx) => Container(
            padding: EdgeInsets.fromLTRB(
              24,
              20,
              24,
              20 + MediaQuery.of(ctx).padding.bottom,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDDD5CC),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _saffron.withAlpha(18),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.lock_rounded, color: _saffron, size: 32),
                ),
                const SizedBox(height: 16),
                Text(
                  'सदस्यत्व आवश्यक आहे',
                  style: GoogleFonts.mukta(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: _darkBrown,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '"$featureName" साठी Connect मराठाचे\nसदस्यत्व आवश्यक आहे.',
                  style: GoogleFonts.mukta(
                    fontSize: 13.5,
                    color: _midBrown,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.pop(ctx);
                          _goLogin();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            border: Border.all(color: _saffron, width: 1.5),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(
                              'लॉगिन करा',
                              style: GoogleFonts.mukta(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: _saffron,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.pop(ctx);
                          _goRegister();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [_saffronLight, Color(0xFFD63B08)],
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: _saffron.withAlpha(70),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              'मोफत नोंदणी करा',
                              style: GoogleFonts.mukta(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
    );
  }
}
