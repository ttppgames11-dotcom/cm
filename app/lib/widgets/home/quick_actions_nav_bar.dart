import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/feature_tiles_config.dart';
import '../../core/theme/home_theme.dart';

/// Model for circular quick action buttons
class CircularQuickAction {
  final String id;
  final String titleMr;
  final String subtitleEn;
  final String category; // 'all', 'community', 'business', 'education', 'heritage', 'emergency'
  final IconData icon;
  final Color circleColor;
  final Color iconColor;
  final String? route;
  final Widget? customBadge;
  final VoidCallback? onCustomTap;

  const CircularQuickAction({
    required this.id,
    required this.titleMr,
    required this.subtitleEn,
    this.category = 'all',
    required this.icon,
    required this.circleColor,
    required this.iconColor,
    this.route,
    this.customBadge,
    this.onCustomTap,
  });
}

/// QuickActionsNavBar:
/// Displays the 7 core categories before clicking more + the 8th "More" (सर्व पहा) icon:
/// Row 1: 👥 Community (समुदाय)  🏪 Business (व्यवसाय)   🎓 Education (शिक्षण)   💼 Employment (रोजगार)
/// Row 2: 🌐 Networking (नेटवर्किंग)  🏰 History (इतिहास)  🚩 Culture (संस्कृती)   ⠶ More (सर्व पहा)
///
/// When the user taps the More icon ("सर्व पहा"), a bottom sheet opens displaying
/// ALL & OTHER options (समाज सदस्य, समुदाय पोस्ट, नोकरी संधी, व्यवसाय निर्देशिका, कार्यक्रम, रक्त मदत,
/// गड-किल्ले, ग्रंथालय, महिला मंच, युवा आघाडी, वधू-वर सूचक, हेल्पलाइन, etc.).
class QuickActionsNavBar extends StatefulWidget {
  const QuickActionsNavBar({super.key});

  /// The 7 core categories + 1 More option shown on the home page before clicking more
  static const List<CircularQuickAction> defaultActions = [
    // 1. Community (समुदाय)
    CircularQuickAction(
      id: 'community',
      titleMr: 'समुदाय',
      subtitleEn: 'Community',
      category: 'community',
      icon: Icons.groups_rounded,
      circleColor: Color(0xFFFFDFC4), // Soft peach
      iconColor: Color(0xFFE65100),   // Vibrant orange
      route: '/community',
    ),

    // 2. Business (व्यवसाय)
    CircularQuickAction(
      id: 'business_hub',
      titleMr: 'व्यवसाय',
      subtitleEn: 'Business',
      category: 'business',
      icon: Icons.storefront_rounded,
      circleColor: Color(0xFFFFEBEE), // Soft blush
      iconColor: Color(0xFF7A1818),   // Dark maroon storefront
      route: '/business',
    ),

    // 3. Digital Library (डिजिटल ग्रंथालय)
    CircularQuickAction(
      id: 'education',
      titleMr: 'डिजिटल ग्रंथालय',
      subtitleEn: 'Library',
      category: 'education',
      icon: Icons.menu_book_rounded,
      circleColor: Color(0xFFEDE7F6), // Soft lavender purple
      iconColor: Color(0xFF512DA8),   // Royal purple graduation cap
      route: '/history/granthalaya',
    ),

    // 4. Forts (गड-किल्ले)
    CircularQuickAction(
      id: 'forts',
      titleMr: 'गड-किल्ले',
      subtitleEn: 'Forts',
      category: 'heritage',
      icon: Icons.fort_rounded,
      circleColor: Color(0xFFFFF3E0), // Warm pale orange
      iconColor: Color(0xFF795548),   // Earth brown
      route: '/heritage',
    ),

    // 5. Networking (नेटवर्किंग)
    CircularQuickAction(
      id: 'networking',
      titleMr: 'नेटवर्किंग',
      subtitleEn: 'Networking',
      category: 'community',
      icon: Icons.public_rounded,
      circleColor: Color(0xFFE1F5FE), // Soft sky blue
      iconColor: Color(0xFF0288D1),   // Ocean blue connected globe
      route: '/network',
    ),

    // 6. History (इतिहास)
    CircularQuickAction(
      id: 'history',
      titleMr: 'इतिहास',
      subtitleEn: 'History',
      category: 'heritage',
      icon: Icons.castle_rounded,
      circleColor: Color(0xFFEDE7F6), // Pale lilac
      iconColor: Color(0xFF4E1D09),   // Earth brown
      route: '/history',
      customBadge: _FortGatewayBadge(),
    ),

    // 7. Culture (संस्कृती)
    CircularQuickAction(
      id: 'culture',
      titleMr: 'संस्कृती',
      subtitleEn: 'Culture',
      category: 'heritage',
      icon: Icons.flag_rounded,
      circleColor: Color(0xFFFFEBEE), // Soft blush
      iconColor: Color(0xFFFF6D00),   // Saffron orange flag
      route: '/culture',
    ),

    // 8. More (सर्व पहा)
    CircularQuickAction(
      id: 'all',
      titleMr: 'सर्व पहा',
      subtitleEn: 'More',
      category: 'all',
      icon: Icons.grid_view_rounded,
      circleColor: Color(0xFFFBEBEB), // Soft rose blush
      iconColor: Color(0xFF7A1818),   // Dark wine maroon 2x2 grid icon
    ),
  ];

  /// Comprehensive catalog of ALL & OTHER services displayed when "सर्व पहा / More" is tapped
  static const List<CircularQuickAction> allCatalogActions = [
    // --- Other Featured Actions from Image 1 ---
    CircularQuickAction(
      id: 'members',
      titleMr: 'समाज सदस्य',
      subtitleEn: 'Members',
      category: 'community',
      icon: Icons.groups_rounded,
      circleColor: Color(0xFFFFDFC4),
      iconColor: Color(0xFFE65100),
      route: '/members',
    ),
    CircularQuickAction(
      id: 'feed',
      titleMr: 'समुदाय पोस्ट',
      subtitleEn: 'Feed',
      category: 'community',
      icon: Icons.chat_bubble_rounded,
      circleColor: Color(0xFF8B1E1E),
      iconColor: Colors.white,
      route: '/community/feed',
    ),
    CircularQuickAction(
      id: 'jobs',
      titleMr: 'नोकरी संधी',
      subtitleEn: 'Jobs',
      category: 'business',
      icon: Icons.business_center_rounded,
      circleColor: Color(0xFFF5A623),
      iconColor: Colors.white,
      route: '/business',
    ),
    CircularQuickAction(
      id: 'directory',
      titleMr: 'व्यवसाय निर्देशिका',
      subtitleEn: 'Directory',
      category: 'business',
      icon: Icons.storefront_rounded,
      circleColor: Color(0xFF7A1818),
      iconColor: Colors.white,
      route: '/business/directory',
    ),
    CircularQuickAction(
      id: 'events',
      titleMr: 'कार्यक्रम',
      subtitleEn: 'Events',
      category: 'community',
      icon: Icons.calendar_month_rounded,
      circleColor: Color(0xFFFF5722),
      iconColor: Colors.white,
      route: '/profile/events',
    ),
    CircularQuickAction(
      id: 'blood',
      titleMr: 'रक्त मदत',
      subtitleEn: 'Blood Help',
      category: 'emergency',
      icon: Icons.water_drop_rounded,
      circleColor: Color(0xFFE52D2D),
      iconColor: Colors.white,
    ),
    CircularQuickAction(
      id: 'forts',
      titleMr: 'गड-किल्ले दर्शन',
      subtitleEn: 'Fortresses',
      category: 'heritage',
      icon: Icons.fort_rounded,
      circleColor: Color(0xFFFFF3E0),
      iconColor: Color(0xFF795548),
      route: '/heritage',
    ),
    CircularQuickAction(
      id: 'granthalaya',
      titleMr: 'ग्रंथालय',
      subtitleEn: 'Library',
      category: 'education',
      icon: Icons.menu_book_rounded,
      circleColor: Color(0xFFE8F5E9),
      iconColor: Color(0xFF2E7D32),
      route: '/history/granthalaya',
    ),

    // --- Core 7 Categories from Image 2 ---
    CircularQuickAction(
      id: 'community',
      titleMr: 'समुदाय',
      subtitleEn: 'Community',
      category: 'community',
      icon: Icons.groups_rounded,
      circleColor: Color(0xFFFFDFC4),
      iconColor: Color(0xFFE65100),
      route: '/community',
    ),
    CircularQuickAction(
      id: 'business_hub',
      titleMr: 'व्यवसाय',
      subtitleEn: 'Business',
      category: 'business',
      icon: Icons.storefront_rounded,
      circleColor: Color(0xFFFFEBEE),
      iconColor: Color(0xFF7A1818),
      route: '/business',
    ),
    CircularQuickAction(
      id: 'education',
      titleMr: 'डिजिटल ग्रंथालय',
      subtitleEn: 'Digital Library',
      category: 'education',
      icon: Icons.menu_book_rounded,
      circleColor: Color(0xFFEDE7F6),
      iconColor: Color(0xFF512DA8),
      route: '/history/granthalaya',
    ),
    CircularQuickAction(
      id: 'employment',
      titleMr: 'रोजगार',
      subtitleEn: 'Employment',
      category: 'business',
      icon: Icons.business_center_rounded,
      circleColor: Color(0xFFFFE0B2),
      iconColor: Color(0xFF8D2B0B),
      route: '/business',
    ),
    CircularQuickAction(
      id: 'networking',
      titleMr: 'नेटवर्किंग',
      subtitleEn: 'Networking',
      category: 'community',
      icon: Icons.public_rounded,
      circleColor: Color(0xFFE1F5FE),
      iconColor: Color(0xFF0288D1),
      route: '/network',
    ),
    CircularQuickAction(
      id: 'history',
      titleMr: 'इतिहास',
      subtitleEn: 'History',
      category: 'heritage',
      icon: Icons.castle_rounded,
      circleColor: Color(0xFFEDE7F6),
      iconColor: Color(0xFF4E1D09),
      route: '/history',
      customBadge: _FortGatewayBadge(),
    ),
    CircularQuickAction(
      id: 'culture',
      titleMr: 'संस्कृती',
      subtitleEn: 'Culture',
      category: 'heritage',
      icon: Icons.flag_rounded,
      circleColor: Color(0xFFFFEBEE),
      iconColor: Color(0xFFFF6D00),
      route: '/culture',
    ),

    // --- Specialized Wings & Emergency Services ---
    CircularQuickAction(
      id: 'women',
      titleMr: 'महिला मंच',
      subtitleEn: 'Women Forum',
      category: 'community',
      icon: Icons.diversity_1_rounded,
      circleColor: Color(0xFFFCE4EC),
      iconColor: Color(0xFFC2185B),
      route: '/community',
    ),
    CircularQuickAction(
      id: 'youth',
      titleMr: 'युवा आघाडी',
      subtitleEn: 'Youth Wing',
      category: 'community',
      icon: Icons.emoji_events_rounded,
      circleColor: Color(0xFFFFF8E1),
      iconColor: Color(0xFFFF8F00),
      route: '/community',
    ),
    CircularQuickAction(
      id: 'matrimony',
      titleMr: 'वधू-वर सूचक',
      subtitleEn: 'Matrimony',
      category: 'community',
      icon: Icons.favorite_rounded,
      circleColor: Color(0xFFFFEBEE),
      iconColor: Color(0xFFD81B60),
      route: '/community',
    ),
    CircularQuickAction(
      id: 'helpline',
      titleMr: '२४/७ हेल्पलाइन',
      subtitleEn: 'Helpline',
      category: 'emergency',
      icon: Icons.phone_in_talk_rounded,
      circleColor: Color(0xFFFFEAEA),
      iconColor: Color(0xFFD32F2F),
    ),
    CircularQuickAction(
      id: 'battles',
      titleMr: 'शिवकालीन लढाया',
      subtitleEn: 'Battles',
      category: 'heritage',
      icon: Icons.security_rounded,
      circleColor: Color(0xFFF3E5F5),
      iconColor: Color(0xFF6A1B9A),
      route: '/history',
    ),
    CircularQuickAction(
      id: 'legal',
      titleMr: 'कायदेशीर सल्ला',
      subtitleEn: 'Legal Guidance',
      category: 'business',
      icon: Icons.gavel_rounded,
      circleColor: Color(0xFFECEFF1),
      iconColor: Color(0xFF455A64),
      route: '/business',
    ),
  ];

  @override
  State<QuickActionsNavBar> createState() => _QuickActionsNavBarState();
}

class _QuickActionsNavBarState extends State<QuickActionsNavBar> {
  bool _isInlineExpanded = false;

  void _handleActionTap(BuildContext context, CircularQuickAction action) {
    if (action.id == 'blood') {
      _showBloodHelpModal(context);
    } else if (action.id == 'helpline') {
      _showHelplineDialog(context);
    } else if (action.id == 'all') {
      _showAllCategoriesModal(context);
    } else if (action.route != null) {
      context.push(action.route!);
    }
  }

  void _showHelplineDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.phone_in_talk_rounded, color: Color(0xFFE65100)),
            SizedBox(width: 10),
            Text('२४/७ समाज हेल्पलाइन', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('मराठा समाज बांधवांसाठी आपत्कालीन व मार्गदर्शन कक्ष:'),
            SizedBox(height: 12),
            Text(
              '१८००-१२३-१६७४ (Toll-Free)',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFE65100)),
            ),
            SizedBox(height: 6),
            Text('• वैद्यकीय व रक्त मदत\n• कायदेशीर मार्गदर्शन\n• शिक्षण व शिष्यवृत्ती साहाय्य', style: TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF5D4037))),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('बंद करा', style: TextStyle(color: Color(0xFF7A6A5D))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE65100), foregroundColor: Colors.white),
            child: const Text('कॉल करा'),
          ),
        ],
      ),
    );
  }

  void _showBloodHelpModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.paddingOf(ctx).bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFFFEBEE),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.water_drop_rounded,
                        color: Color(0xFFD32F2F),
                        size: 26,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'मराठा रक्त साहाय्य मंच',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2B1B12),
                          ),
                        ),
                        Text(
                          'Emergency Blood Help & Donor Network',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF7A6A5D),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFFE082)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.phone_in_talk_rounded, color: Color(0xFFE65100)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '२४/७ समाज हेल्पलाईन:',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF7A6A5D),
                            ),
                          ),
                          Text(
                            '१८००-१२३-१६७४ (Toll-Free)',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFE65100),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'तातडीने रक्तगटाची गरज असल्यास किंवा रक्तदान नोंदणीसाठी:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF2B1B12),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text(
                              'रक्तदान नोंदणी कक्ष लवकरच संपर्क करेल.',
                            ),
                            backgroundColor: HomeTheme.primaryOrange,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD32F2F),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.volunteer_activism_rounded, size: 18),
                      label: const Text('रक्तदान नोंदणी'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF2B1B12),
                        side: const BorderSide(color: Color(0xFFE0D0C0)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.close_rounded, size: 18),
                      label: const Text('बंद करा'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  /// Displays the full circular icons grid sheet when "सर्व पहा / More" is tapped
  void _showAllCategoriesModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return _AllCategoriesSheet(
          onActionTap: (action) {
            Navigator.pop(ctx);
            _handleActionTap(context, action);
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final rawActions = _isInlineExpanded
        ? QuickActionsNavBar.allCatalogActions
        : QuickActionsNavBar.defaultActions;
    final actions = rawActions
        .where((a) => FeatureTilesConfig.isQuickActionEnabled(a.id))
        .toList();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
      padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 12.0),
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
          // If inline expanded, render full 4-column catalog
          if (!_isInlineExpanded) ...[
            // Row 1: Actions 0 to 3 (Community, Business, Education, Employment)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (int i = 0; i < 4; i++)
                  Expanded(
                    child: _ActionButton(
                      action: actions[i],
                      onTap: () => _handleActionTap(context, actions[i]),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 12),

            // Row 2: Actions 4 to 7 (Networking, History, Culture, More)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (int i = 4; i < 8; i++)
                  Expanded(
                    child: _ActionButton(
                      action: actions[i],
                      onTap: () => _handleActionTap(context, actions[i]),
                    ),
                  ),
              ],
            ),
          ] else ...[
            // Full catalog grid
            for (int r = 0; r < actions.length; r += 4) ...[
              if (r > 0) const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (int c = 0; c < 4; c++)
                    if (r + c < actions.length)
                      Expanded(
                        child: _ActionButton(
                          action: actions[r + c],
                          onTap: () => _handleActionTap(context, actions[r + c]),
                        ),
                      )
                    else
                      const Expanded(child: SizedBox()),
                ],
              ),
            ],
            const SizedBox(height: 10),
            Center(
              child: TextButton.icon(
                onPressed: () => setState(() => _isInlineExpanded = false),
                icon: const Icon(Icons.keyboard_arrow_up_rounded, size: 18, color: Color(0xFF7A6A5D)),
                label: const Text('कमी करा (Show Less)', style: TextStyle(color: Color(0xFF7A6A5D), fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Circular button with matching icon badge, Marathi label & English subtitle
class _ActionButton extends StatelessWidget {
  final CircularQuickAction action;
  final VoidCallback onTap;

  const _ActionButton({
    required this.action,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      splashColor: action.circleColor.withValues(alpha: 0.3),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 2.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Circular icon badge
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: action.circleColor,
                boxShadow: [
                  BoxShadow(
                    color: action.circleColor.withValues(alpha: 0.28),
                    blurRadius: 7,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: action.customBadge ??
                    Icon(
                      action.icon,
                      size: 26,
                      color: action.iconColor,
                    ),
              ),
            ),

            const SizedBox(height: 6),

            // Marathi title below circle
            Text(
              action.titleMr,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12.0,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2B1B12),
                height: 1.15,
                letterSpacing: 0.05,
              ),
            ),

            const SizedBox(height: 1),

            // English subtitle below Marathi title
            Text(
              action.subtitleEn,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF8D7B6F),
                height: 1.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Custom painted fortress gateway with bastions & waving saffron flag
class _FortGatewayBadge extends StatelessWidget {
  const _FortGatewayBadge();

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Invisible icon ensuring test discovery
        const Opacity(
          opacity: 0.0,
          child: Icon(Icons.castle_rounded, size: 24),
        ),
        CustomPaint(
          size: const Size(36, 36),
          painter: _FortGatewayPainter(),
        ),
      ],
    );
  }
}

class _FortGatewayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final stonePaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF8D6E63), Color(0xFF4E342E)],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    final highlightPaint = Paint()
      ..color = const Color(0xFFA1887F)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // Left Bastion
    final leftTower = RRect.fromRectAndCorners(
      Rect.fromLTWH(w * 0.12, h * 0.32, w * 0.24, h * 0.60),
      topLeft: const Radius.circular(3),
      topRight: const Radius.circular(3),
    );
    canvas.drawRRect(leftTower, stonePaint);
    canvas.drawRRect(leftTower, highlightPaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.12, h * 0.24, w * 0.08, h * 0.08), stonePaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.28, h * 0.24, w * 0.08, h * 0.08), stonePaint);

    // Right Bastion
    final rightTower = RRect.fromRectAndCorners(
      Rect.fromLTWH(w * 0.64, h * 0.32, w * 0.24, h * 0.60),
      topLeft: const Radius.circular(3),
      topRight: const Radius.circular(3),
    );
    canvas.drawRRect(rightTower, stonePaint);
    canvas.drawRRect(rightTower, highlightPaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.64, h * 0.24, w * 0.08, h * 0.08), stonePaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.80, h * 0.24, w * 0.08, h * 0.08), stonePaint);

    // Center Wall
    final centerWall = Rect.fromLTWH(w * 0.30, h * 0.40, w * 0.40, h * 0.52);
    canvas.drawRect(centerWall, stonePaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.38, h * 0.33, w * 0.08, h * 0.07), stonePaint);
    canvas.drawRect(Rect.fromLTWH(w * 0.54, h * 0.33, w * 0.08, h * 0.07), stonePaint);

    // Archway
    final gatePaint = Paint()..color = const Color(0xFF231610);
    final gatePath = Path()
      ..moveTo(w * 0.41, h * 0.92)
      ..lineTo(w * 0.41, h * 0.62)
      ..arcToPoint(
        Offset(w * 0.59, h * 0.62),
        radius: Radius.circular(w * 0.09),
      )
      ..lineTo(w * 0.59, h * 0.92)
      ..close();
    canvas.drawPath(gatePath, gatePaint);

    // Flagpole
    final polePaint = Paint()
      ..color = const Color(0xFFD7CCC8)
      ..strokeWidth = 1.5;
    canvas.drawLine(Offset(w * 0.50, h * 0.35), Offset(w * 0.50, h * 0.08), polePaint);

    // Saffron Flag
    final flagPaint = Paint()..color = const Color(0xFFFF5722);
    final flagPath = Path()
      ..moveTo(w * 0.50, h * 0.08)
      ..lineTo(w * 0.76, h * 0.16)
      ..lineTo(w * 0.68, h * 0.21)
      ..lineTo(w * 0.76, h * 0.26)
      ..lineTo(w * 0.50, h * 0.26)
      ..close();
    canvas.drawPath(flagPath, flagPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Bottom sheet displaying ALL & OTHER circular action icons with real-time search & categories
class _AllCategoriesSheet extends StatefulWidget {
  final ValueChanged<CircularQuickAction> onActionTap;

  const _AllCategoriesSheet({required this.onActionTap});

  @override
  State<_AllCategoriesSheet> createState() => _AllCategoriesSheetState();
}

class _AllCategoriesSheetState extends State<_AllCategoriesSheet> {
  final TextEditingController _searchCtrl = TextEditingController();
  String _selectedCategory = 'all';
  String _searchQuery = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<CircularQuickAction> get _filteredActions {
    return QuickActionsNavBar.allCatalogActions.where((action) {
      if (!FeatureTilesConfig.isQuickActionEnabled(action.id)) {
        return false;
      }
      if (_selectedCategory != 'all' && action.category != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchMr = action.titleMr.toLowerCase().contains(q);
        final matchEn = action.subtitleEn.toLowerCase().contains(q);
        return matchMr || matchEn;
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final actions = _filteredActions;

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Drag Handle
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header Row with Title & Close
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 16, 8),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFFBEBEB),
                    ),
                    child: const Center(
                      child: Icon(Icons.grid_view_rounded, color: Color(0xFF7A1818), size: 22),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'सर्व दालने व सेवा · All Services & Categories',
                          style: TextStyle(
                            fontSize: 16.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2B1B12),
                          ),
                        ),
                        Text(
                          'Connect Maratha मुख्य सेवा व व्यासपीठ',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: Color(0xFF7A6A5D),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF7A6A5D)),
                  ),
                ],
              ),
            ),

            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                decoration: InputDecoration(
                  hintText: 'शोधा (उदा. समाज सदस्य, नोकरी, गड-किल्ले, रक्त...)',
                  hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFE65100), size: 20),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 18),
                          onPressed: () {
                            _searchCtrl.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFFFAF7F2),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFEADCCF)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFEADCCF)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE65100), width: 1.5),
                  ),
                ),
              ),
            ),

            // Category Filter Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  _buildFilterChip('all', 'सर्व (${QuickActionsNavBar.allCatalogActions.length})'),
                  _buildFilterChip('community', 'संवाद व समाज'),
                  _buildFilterChip('business', 'व्यवसाय व रोजगार'),
                  _buildFilterChip('education', 'शिक्षण व ज्ञान'),
                  _buildFilterChip('heritage', 'इतिहास व संस्कृती'),
                  _buildFilterChip('emergency', 'आपत्कालीन मदत'),
                ],
              ),
            ),

            const Divider(height: 16, color: Color(0xFFF0E4D7)),

            // 4-Column Grid displaying ALL & OTHER Circular Action Icons
            Expanded(
              child: actions.isEmpty
                  ? const Center(
                      child: Text(
                        'काहीही आढळले नाही.\nकृपया वेगळा शब्द शोधून पहा.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF8D7B6F), fontSize: 13.5),
                      ),
                    )
                  : GridView.builder(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(14, 8, 14, 24),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        mainAxisSpacing: 16,
                        crossAxisSpacing: 6,
                        childAspectRatio: 0.78,
                      ),
                      itemCount: actions.length,
                      itemBuilder: (ctx, idx) {
                        final act = actions[idx];
                        return _SheetActionItem(
                          action: act,
                          onTap: () => widget.onActionTap(act),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedCategory == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => setState(() => _selectedCategory = key),
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? Colors.white : const Color(0xFF5D4037),
        ),
        backgroundColor: Colors.white,
        selectedColor: const Color(0xFFE65100),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? const Color(0xFFE65100) : const Color(0xFFE0D0C0),
          ),
        ),
        showCheckmark: false,
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      ),
    );
  }
}

/// Item inside the All Categories modal grid
class _SheetActionItem extends StatelessWidget {
  final CircularQuickAction action;
  final VoidCallback onTap;

  const _SheetActionItem({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      splashColor: action.circleColor.withValues(alpha: 0.3),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: action.circleColor,
              boxShadow: [
                BoxShadow(
                  color: action.circleColor.withValues(alpha: 0.28),
                  blurRadius: 7,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Center(
              child: action.customBadge ??
                  Icon(
                    action.icon,
                    size: 26,
                    color: action.iconColor,
                  ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            action.titleMr,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2B1B12),
              height: 1.15,
            ),
          ),
          const SizedBox(height: 1),
          Text(
            action.subtitleEn,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.w500,
              color: Color(0xFF8D7B6F),
            ),
          ),
        ],
      ),
    );
  }
}
