import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';
import 'section_header.dart';

/// Reusable QuickActionCard widget (Light Theme)
/// - Pastel tinted background (soft peach/orange, soft red/pink, soft blue, soft green)
/// - Category accent color for the icon (colored, NOT white)
/// - Marathi title in dark text #2B1B12
/// - English subtitle in muted gray-brown #7A6A5D
/// - Small solid circular colored button with white arrow in bottom right
class QuickActionCard extends StatelessWidget {
  final Color overlayColor;
  final Color? pastelColor;
  final IconData icon;
  final String titleMr;
  final String subtitleEn;
  final String? backgroundImage;
  final VoidCallback? onTap;

  const QuickActionCard({
    super.key,
    required this.overlayColor,
    this.pastelColor,
    required this.icon,
    required this.titleMr,
    required this.subtitleEn,
    this.backgroundImage,
    this.onTap,
  });

  Color _resolvePastelColor() {
    if (pastelColor != null) return pastelColor!;
    // Match based on overlayColor or category
    final val = overlayColor.toARGB32();
    if (val == const Color(0xFFE8631A).toARGB32()) {
      return HomeTheme.pastelPeach;
    } else if (val == const Color(0xFF8B1E1E).toARGB32() ||
        val == const Color(0xFFD32F2F).toARGB32()) {
      return HomeTheme.pastelRed;
    } else if (val == const Color(0xFF1E4B8B).toARGB32() ||
        val == const Color(0xFF1976D2).toARGB32()) {
      return HomeTheme.pastelBlue;
    } else if (val == const Color(0xFF1E7044).toARGB32() ||
        val == const Color(0xFF2E7D32).toARGB32()) {
      return HomeTheme.pastelGreen;
    } else if (val == const Color(0xFFD97706).toARGB32()) {
      return HomeTheme.pastelAmber;
    }
    return HomeTheme.pastelPeach;
  }

  Color _resolveAccentColor() {
    final val = overlayColor.toARGB32();
    if (val == const Color(0xFF8B1E1E).toARGB32()) {
      return HomeTheme.accentRed;
    } else if (val == const Color(0xFF1E4B8B).toARGB32()) {
      return HomeTheme.accentBlue;
    } else if (val == const Color(0xFF1E7044).toARGB32()) {
      return HomeTheme.accentGreen;
    } else if (val == const Color(0xFFD97706).toARGB32()) {
      return HomeTheme.accentAmber;
    }
    return overlayColor;
  }

  @override
  Widget build(BuildContext context) {
    final cardBg = _resolvePastelColor();
    final accentColor = _resolveAccentColor();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: MediaQuery.textScalerOf(context).scale(114),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: accentColor.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 10.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Colored category icon (matching accent color, not white!) with the
            // small arrow button beside it, so the labels below get the full width.
            Row(
              children: [
                Icon(icon, color: accentColor, size: 24),
                const Spacer(),
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: accentColor,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.arrow_forward_rounded,
                      size: 12,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),

            // Titles shrink slightly rather than being cut off.
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Marathi Title in dark brown-black text
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    titleMr,
                    maxLines: 1,
                    style: HomeTheme.marathiHeading(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: HomeTheme.textDark,
                      height: 1.2,
                    ),
                  ),
                ),
                // English Subtitle in muted gray-brown
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    subtitleEn,
                    maxLines: 1,
                    style: HomeTheme.headerSerif(
                      fontSize: 9.0,
                      fontWeight: FontWeight.w600,
                      color: HomeTheme.textMuted,
                      letterSpacing: 0.2,
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

/// Section 4: QuickActionsGrid (Light Theme)
/// - Section header "Quick Actions" with "See All" link
/// - Horizontally scrollable row of pastel-tinted cards:
///   1. इतिहास (soft peach/orange)
///   2. व्यवसाय (soft red/pink)
///   3. समुदाय (soft blue)
///   4. सेवा व कार्य (soft green)
///   5. महाराष्ट्र नेटवर्क (soft amber)
class QuickActionsGrid extends StatelessWidget {
  final List<QuickActionData> actions;
  final VoidCallback? onSeeAll;

  const QuickActionsGrid({super.key, this.actions = const [], this.onSeeAll});

  static const List<Color> _pastelColors = [
    HomeTheme.pastelPeach,
    HomeTheme.pastelRed,
    HomeTheme.pastelBlue,
    HomeTheme.pastelGreen,
    HomeTheme.pastelAmber,
  ];

  static const List<Color> _accentColors = [
    HomeTheme.accentOrange,
    HomeTheme.accentRed,
    HomeTheme.accentBlue,
    HomeTheme.accentGreen,
    HomeTheme.accentAmber,
  ];

  @override
  Widget build(BuildContext context) {
    final list = actions.isNotEmpty ? actions : QuickActionData.defaultActions;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Quick Actions',
          actionLabel: 'See All',
          onAction: onSeeAll,
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            children: [
              for (int i = 0; i < list.length; i++) ...[
                if (i > 0) const SizedBox(width: 10),
                SizedBox(
                  width: 92,
                  child: QuickActionCard(
                    overlayColor:
                        i < _accentColors.length
                            ? _accentColors[i]
                            : list[i].overlayColor,
                    pastelColor:
                        i < _pastelColors.length ? _pastelColors[i] : null,
                    icon: list[i].icon,
                    titleMr: list[i].titleMr,
                    subtitleEn: list[i].subtitleEn,
                    backgroundImage: list[i].backgroundImage,
                    onTap: list[i].onTap,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
