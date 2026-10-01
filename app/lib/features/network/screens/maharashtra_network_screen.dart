import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';

import '../../../core/theme/home_theme.dart';
import '../../../widgets/home/custom_bottom_nav_bar.dart';
import '../data/maharashtra_network_data.dart';

/// Screen displaying the full Maharashtra Network with interactive tabs,
/// statistics, district clusters, and coordination contacts.
class MaharashtraNetworkScreen extends StatefulWidget {
  final int initialSectionIndex;

  const MaharashtraNetworkScreen({super.key, this.initialSectionIndex = 0});

  @override
  State<MaharashtraNetworkScreen> createState() =>
      _MaharashtraNetworkScreenState();
}

class _MaharashtraNetworkScreenState extends State<MaharashtraNetworkScreen> {
  late int _selectedSectionIndex;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedSectionIndex = widget.initialSectionIndex.clamp(
      0,
      MaharashtraNetworkData.sections.length - 1,
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  /// Coordinators are not appointed yet, so "contact" writes to the team.
  Future<void> _writeToTeam(String subject) async {
    final uri = Uri(
      scheme: 'mailto',
      path: ApiConfig.supportEmail,
      query: 'subject=${Uri.encodeComponent(subject)}',
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      _showMessage('कृपया ${ApiConfig.supportEmail} वर ईमेल करा.');
    }
  }

  void _showMessage(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFF2EAE0)),
        ),
        content: Text(
          msg,
          style: HomeTheme.marathiBody(
            fontSize: 13,
            color: HomeTheme.textDark,
            fontWeight: FontWeight.w600,
          ),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentSection =
        MaharashtraNetworkData.sections[_selectedSectionIndex];

    final filteredItems =
        currentSection.items.where((item) {
          if (_searchQuery.trim().isEmpty) return true;
          final q = _searchQuery.toLowerCase();
          return item.titleMr.toLowerCase().contains(q) ||
              item.districts.toLowerCase().contains(q) ||
              item.description.toLowerCase().contains(q);
        }).toList();

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Hero Header
            _buildHeroHeader(context),

            // 2. Summary KPI Strip
            _buildSummaryKpiStrip(),

            const SizedBox(height: 16),

            // 3. Search Bar
            _buildSearchBar(),

            const SizedBox(height: 14),

            // 4. Section Selector Tabs
            _buildSectionTabBar(),

            const SizedBox(height: 16),

            // 5. Section Header & Counter
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: [
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      color: currentSection.accentColor,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      currentSection.titleMr,
                      style: HomeTheme.marathiHeading(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: HomeTheme.textDark,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 9,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: currentSection.pastelColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: currentSection.accentColor.withValues(
                          alpha: 0.3,
                        ),
                      ),
                    ),
                    child: Text(
                      '${filteredItems.length} विभाग / शाखा',
                      style: GoogleFonts.mukta(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: currentSection.accentColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // 6. Divisional Items Cards
            if (filteredItems.isEmpty)
              _buildEmptySearchResults()
            else
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredItems.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = filteredItems[index];
                    return _buildDivisionCard(item, currentSection);
                  },
                ),
              ),

            const SizedBox(height: 20),

            // 7. Join Branch CTA Card
            _buildJoinBranchCard(context),

            const SizedBox(height: 28),
          ],
        ),
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: -1,
        onTap: (index) {
          if (index == 0) {
            context.go('/home');
          } else if (index == 1) {
            context.push('/community');
          } else if (index == 2) {
            context.push('/business');
          } else if (index == 3) {
            context.push('/search');
          } else if (index == 4) {
            context.push('/profile');
          }
        },
      ),
    );
  }

  Widget _buildHeroHeader(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2B1308), Color(0xFF1E0E06), Color(0xFF140703)],
        ),
      ),
      child: Stack(
        children: [
          // Background Fort watermark
          Positioned(
            right: -20,
            bottom: -15,
            width: 220,
            height: 180,
            child: Opacity(
              opacity: 0.18,
              child: Image.asset(
                'assets/images/heritage_rajgad.webp',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox(),
              ),
            ),
          ),

          Padding(
            padding: EdgeInsets.fromLTRB(16, topPadding + 10, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Navigation Bar (Back + Search)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    InkWell(
                      onTap: () {
                        if (Navigator.of(context).canPop()) {
                          Navigator.of(context).pop();
                        } else {
                          context.go('/home');
                        }
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.12),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.20),
                          ),
                        ),
                        child: const Icon(
                          Icons.arrow_back_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () => context.push('/search'),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.12),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.20),
                          ),
                        ),
                        child: const Icon(
                          Icons.search_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Top Badge Pill
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: HomeTheme.primaryOrange.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: HomeTheme.primaryOrange.withValues(alpha: 0.6),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.hub_rounded,
                        color: HomeTheme.primaryOrange,
                        size: 14,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        MaharashtraNetworkData.headlineBadge,
                        style: GoogleFonts.mukta(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFF9D66),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                // Title
                Row(
                  children: [
                    Text(
                      'महाराष्ट्र ',
                      // Mukta: Playfair has no Devanagari glyphs.
                      style: GoogleFonts.mukta(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'नेटवर्क',
                      style: GoogleFonts.mukta(
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                        color: HomeTheme.primaryOrange,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 4),

                // Subtitle
                Text(
                  MaharashtraNetworkData.mainSubtitle,
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.85),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryKpiStrip() {
    final entries = MaharashtraNetworkData.summaryStats.entries.toList();

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: HomeTheme.softShadow,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          for (int i = 0; i < entries.length; i++) ...[
            if (i > 0)
              Container(
                width: 1,
                height: 36,
                color: const Color(0xFFE5DCD0).withValues(alpha: 0.7),
              ),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    entries[i].key,
                    style: GoogleFonts.mukta(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: HomeTheme.primaryOrange,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    entries[i].value,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.mukta(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: HomeTheme.textMuted,
                      height: 1.1,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5DCD0)),
          boxShadow: HomeTheme.subtleShadow,
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          style: GoogleFonts.mukta(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: HomeTheme.textDark,
          ),
          decoration: InputDecoration(
            hintText: 'जिल्हा, तालुका किंवा शाखा शोधा... / Search Network',
            hintStyle: GoogleFonts.mukta(
              fontSize: 13,
              color: HomeTheme.textMuted,
            ),
            prefixIcon: const Icon(
              Icons.search_rounded,
              color: HomeTheme.primaryOrange,
              size: 20,
            ),
            suffixIcon:
                _searchQuery.isNotEmpty
                    ? IconButton(
                      icon: const Icon(Icons.close_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                    : null,
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTabBar() {
    final sections = MaharashtraNetworkData.sections;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          for (int i = 0; i < sections.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            _buildTabChip(
              section: sections[i],
              isSelected: _selectedSectionIndex == i,
              onTap: () {
                setState(() => _selectedSectionIndex = i);
                _showMessage('${sections[i].titleMr} निवडले');
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTabChip({
    required NetworkSection section,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? section.accentColor : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? section.accentColor : const Color(0xFFE5DCD0),
            width: 1.2,
          ),
          boxShadow: isSelected ? HomeTheme.softShadow : HomeTheme.subtleShadow,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              section.icon,
              size: 16,
              color: isSelected ? Colors.white : section.accentColor,
            ),
            const SizedBox(width: 6),
            Text(
              section.titleMr,
              style: GoogleFonts.mukta(
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? Colors.white : HomeTheme.textDark,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDivisionCard(NetworkDivisionItem item, NetworkSection section) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E6DC)),
        boxShadow: HomeTheme.softShadow,
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row with Icon and Division Name
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: section.pastelColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: section.accentColor.withValues(alpha: 0.25),
                  ),
                ),
                child: Icon(item.icon, color: section.accentColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.titleMr,
                      style: GoogleFonts.mukta(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: HomeTheme.textDark,
                        height: 1.2,
                      ),
                    ),
                    Text(
                      item.titleEn,
                      style: GoogleFonts.mukta(
                        fontSize: 11,
                        color: HomeTheme.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Districts covered pill
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFDFBF7),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFEFE8E0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: HomeTheme.primaryOrange,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'क्षेत्र: ${item.districts}',
                    style: GoogleFonts.mukta(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF5A4A3D),
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Description
          Text(
            item.description,
            style: GoogleFonts.mukta(
              fontSize: 12.5,
              color: HomeTheme.textMutedDark,
              height: 1.35,
            ),
          ),

          const SizedBox(height: 12),

          const Divider(height: 1, color: Color(0xFFF2ECE4)),

          const SizedBox(height: 10),

          // Coordinator & Actions Row
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'समन्वयक / संपर्क:',
                      style: GoogleFonts.mukta(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: HomeTheme.textMuted,
                      ),
                    ),
                    Text(
                      'समन्वयक लवकरच जाहीर होतील',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: HomeTheme.textDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Call action
              InkWell(
                onTap: () => _writeToTeam('${item.titleMr} — संपर्क'),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: section.accentColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.mail_outline_rounded,
                        size: 13,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'संपर्क',
                        style: GoogleFonts.mukta(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptySearchResults() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      child: Column(
        children: [
          Icon(
            Icons.search_off_rounded,
            size: 48,
            color: HomeTheme.textMuted.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 10),
          Text(
            'कोणतीही शाखा किंवा विभाग सापडला नाही',
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: HomeTheme.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'कृपया दुसरा जिल्हा किंवा तालुका शोधून पहा.',
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(fontSize: 12, color: HomeTheme.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildJoinBranchCard(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF6EE), Color(0xFFFDEEE0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFBD7BF)),
        boxShadow: HomeTheme.subtleShadow,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: HomeTheme.primaryOrange.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.group_add_rounded,
              color: HomeTheme.primaryOrange,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'आपल्या गावात नवीन शाखा सुरू करा',
                  style: GoogleFonts.mukta(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: HomeTheme.textDark,
                  ),
                ),
                Text(
                  'गावात Connect मराठा शाखा सुरू करण्यासाठी मध्यवर्ती समितीशी संपर्क साधा.',
                  style: GoogleFonts.mukta(
                    fontSize: 11.5,
                    color: HomeTheme.textMutedDark,
                    height: 1.25,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(
            onPressed: () => _writeToTeam('नवीन शाखा / New branch'),
            style: FilledButton.styleFrom(
              backgroundColor: HomeTheme.primaryOrange,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              'अर्ज करा',
              style: GoogleFonts.mukta(
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
