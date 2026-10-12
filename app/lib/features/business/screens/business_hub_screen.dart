import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/config/feature_tiles_config.dart';
import '../../../widgets/home/custom_bottom_nav_bar.dart';

/// Business Hub Item model
class _HubServiceItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconBgColor;
  final String? route;

  const _HubServiceItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconBgColor,
    this.route,
  });
}

/// Business Screen (व्यवसाय मुख्य पृष्ठ)
/// Displays the Business Hub matching the reference UI:
/// - Hero Header: Sunset backdrop, bold title "व्यवसाय", tagline "आपल्या समाजाचा, आपल्या उद्योगाचा अभिमान"
/// - Search & Filter Bar: "व्यवसाय, सेवा, शहर किंवा कीवर्ड शोधा..." + "फिल्टर" button
/// - Section 1: "संपर्क आणि व्यवसाय संधी" (एकत्र या, वाढा आणि नव्या संधी निर्माण करा)
///     1. सर्व मराठा व्यवसाय निर्देशिका (शोधा आणि संपर्क साधा)
///     2. रेफरल व व्यवसाय देवाणघेवाण (लीड द्या आणि प्रगती पहा)
///     3. १-टू-१ व्यवसाय बैठका (सदस्यांना भेटण्याची वेळ ठरवा)
/// - Section 2: "उद्योग आणि वित्तीय संस्था" (समाजाच्या प्रगतीसाठी मजबूत आर्थिक पाया)
///     1. मराठा दूध व कृषी संकलन केंद्र (शेतकरी आणि दुग्ध उत्पादने)
/// - Native CustomBottomNavBar kept visible at bottom
class BusinessHubScreen extends StatefulWidget {
  const BusinessHubScreen({super.key});

  @override
  State<BusinessHubScreen> createState() => _BusinessHubScreenState();
}

class _BusinessHubScreenState extends State<BusinessHubScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }



  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('विभाग व फिल्टर निवडा', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Color(0xFF2B1B12))),
            const SizedBox(height: 14),
            if (FeatureTilesConfig.isBusinessHubRouteEnabled('/business/directory'))
              ListTile(
                leading: const Icon(Icons.storefront_rounded, color: Color(0xFFE65100)),
                title: const Text('सर्व मराठा व्यवसाय निर्देशिका'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/business/directory');
                },
              ),
            if (FeatureTilesConfig.isBusinessHubRouteEnabled('/business/referrals'))
              ListTile(
                leading: const Icon(Icons.link_rounded, color: Color(0xFFD32F2F)),
                title: const Text('रेफरल व व्यवसाय देवाणघेवाण'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/business/referrals');
                },
              ),
            if (FeatureTilesConfig.isBusinessHubRouteEnabled('/business/meetings'))
              ListTile(
                leading: const Icon(Icons.coffee_rounded, color: Color(0xFF5D4037)),
                title: const Text('१-टू-१ व्यवसाय बैठका'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/business/meetings');
                },
              ),
            if (FeatureTilesConfig.isBusinessHubRouteEnabled('/business/dairy'))
              ListTile(
                leading: const Icon(Icons.water_drop_rounded, color: Color(0xFF1976D2)),
                title: const Text('मराठा दूध व कृषी संकलन केंद्र'),
                onTap: () {
                  Navigator.pop(ctx);
                  context.push('/business/dairy');
                },
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Sleek Sunset Shivaji Maharaj Header
              _buildHeader(context),

              // 2. Search & Filter Bar
              _buildSearchBar(),

              const SizedBox(height: 10),

              // 3. Card 1: संपर्क आणि व्यवसाय संधी
              _buildSectionCard(
                headerIcon: Icons.handshake_rounded,
                headerTitle: 'संपर्क आणि व्यवसाय संधी',
                headerSubtitle: 'एकत्र या, वाढा आणि नव्या संधी निर्माण करा',
                items: [
                  _HubServiceItem(
                    title: 'सर्व मराठा व्यवसाय निर्देशिका',
                    subtitle: 'शोधा आणि संपर्क साधा',
                    icon: Icons.storefront_rounded,
                    iconBgColor: const Color(0xFFFF6D00), // Bright Orange
                    route: '/business/directory',
                  ),
                  _HubServiceItem(
                    title: 'व्यवसाय संगम व मंडळे',
                    subtitle: 'आपल्या शहरातील मंडळात सहभागी व्हा',
                    icon: Icons.groups_rounded,
                    iconBgColor: const Color(0xFF8B1E1E), // Dark Maroon
                    route: '/business/sangam',
                  ),
                  _HubServiceItem(
                    title: 'रेफरल व व्यवसाय देवाणघेवाण',
                    subtitle: 'लीड द्या आणि प्रगती पहा',
                    icon: Icons.link_rounded,
                    iconBgColor: const Color(0xFFD32F2F), // Red
                    route: '/business/referrals',
                  ),
                  _HubServiceItem(
                    title: '१-टू-१ व्यवसाय बैठका',
                    subtitle: 'सदस्यांना भेटण्याची वेळ ठरवा',
                    icon: Icons.coffee_rounded,
                    iconBgColor: const Color(0xFF5D4037), // Dark Warm Brown
                    route: '/business/meetings',
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // 4. Card 2: उद्योग आणि वित्तीय संस्था
              _buildSectionCard(
                headerIcon: Icons.domain_rounded,
                headerTitle: 'उद्योग आणि वित्तीय संस्था',
                headerSubtitle: 'समाजाच्या प्रगतीसाठी मजबूत आर्थिक पाया',
                items: [
                  _HubServiceItem(
                    title: 'मराठा बिल्डर्स व डेव्हलपर्स',
                    subtitle: 'गृहप्रकल्प आणि सदस्य सवलत',
                    icon: Icons.apartment_rounded,
                    iconBgColor: const Color(0xFF8B1E1E), // Dark Maroon
                    route: '/business/builders',
                  ),
                  _HubServiceItem(
                    title: 'मराठा उत्पादक व उद्योग',
                    subtitle: 'कारखाने, निर्यात आणि चौकशी',
                    icon: Icons.precision_manufacturing_rounded,
                    iconBgColor: const Color(0xFFFFA000), // Golden Amber
                    route: '/business/manufacturers',
                  ),
                  _HubServiceItem(
                    title: 'मराठा दूध व कृषी संकलन केंद्र',
                    subtitle: 'शेतकरी आणि दुग्ध उत्पादने',
                    icon: Icons.water_drop_rounded,
                    iconBgColor: const Color(0xFFD32F2F), // Red
                    route: '/business/dairy',
                  ),
                ],
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const CustomBottomNavBar(
        currentIndex: 2, // "व्यवसाय" tab active
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFFF7ED),
            Color(0xFFFFEDD5),
            Color(0xFFFFE0B2),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Sunset Fort Silhouette & Flag on the right side
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            width: 220,
            child: ShaderMask(
              shaderCallback: (rect) {
                return const LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [Colors.transparent, Colors.black],
                  stops: [0.0, 0.45],
                ).createShader(rect);
              },
              blendMode: BlendMode.dstIn,
              child: Image.asset(
                'assets/images/hero_banner.webp',
                fit: BoxFit.cover,
                alignment: Alignment.centerRight,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 16, 14),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF1E1E1E), size: 24),
                  onPressed: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.pop(context);
                    } else {
                      context.go('/home');
                    }
                  },
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'व्यवसाय',
                        style: GoogleFonts.mukta(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFD32F2F),
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'आपल्या समाजाचा, आपल्या उद्योगाचा अभिमान',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF8B1E1E),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEADCCF), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, color: Color(0xFF8D7B6F), size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                onSubmitted: (val) {
                  if (val.trim().isNotEmpty) {
                    context.push('/business/directory');
                  }
                },
                style: const TextStyle(fontSize: 13.5),
                decoration: const InputDecoration(
                  hintText: 'व्यवसाय, सेवा, शहर किंवा कीवर्ड शोधा...',
                  hintStyle: TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            if (_searchQuery.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.clear_rounded, size: 18),
                onPressed: () {
                  _searchController.clear();
                  setState(() => _searchQuery = '');
                },
              ),
            Container(width: 1, height: 24, color: const Color(0xFFEADCCF)),
            TextButton.icon(
              onPressed: _showFilterModal,
              icon: const Icon(Icons.tune_rounded, size: 18, color: Color(0xFF8B1E1E)),
              label: const Text(
                'फिल्टर',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF8B1E1E),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData headerIcon,
    required String headerTitle,
    required String headerSubtitle,
    required List<_HubServiceItem> items,
  }) {
    // Filter items based on configuration and search query
    final filtered = items.where((it) {
      if (!FeatureTilesConfig.isBusinessHubRouteEnabled(it.route)) {
        return false;
      }
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return it.title.toLowerCase().contains(q) || it.subtitle.toLowerCase().contains(q);
    }).toList();

    if (filtered.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFF1E5D8), width: 1.0),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFF0E6),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Icon(headerIcon, color: const Color(0xFFE65100), size: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          headerTitle,
                          style: const TextStyle(
                            fontSize: 16.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF8B1E1E),
                            letterSpacing: -0.2,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          headerSubtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF7A6A5D),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0xFFF4EBE2), thickness: 1),

            // Card Items List
            for (int i = 0; i < filtered.length; i++) ...[
              if (i > 0)
                const Divider(height: 1, color: Color(0xFFF7F0EA), indent: 64, thickness: 0.8),
              _buildRowItem(filtered[i]),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRowItem(_HubServiceItem item) {
    return InkWell(
      onTap: () {
        if (item.route != null) {
          context.push(item.route!);
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Circular Colored Badge with White Icon
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: item.iconBgColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: item.iconBgColor.withValues(alpha: 0.28),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: Icon(item.icon, color: Colors.white, size: 22),
              ),
            ),
            const SizedBox(width: 14),

            // Title & Subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.subtitle,
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: Color(0xFF7A6A5D),
                    ),
                  ),
                ],
              ),
            ),

            // Orange Chevron Arrow
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFFE65100),
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}
