import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';

/// Section 8: CustomBottomNavBar & Section 9: Footer Tagline (Light Theme)
/// - 5 navigation tabs: Home, Community, Business, Discover (compass icon), Profile
/// - Outlined icons in muted gray-brown #7A6A5D for inactive items
/// - Active item (Home) in solid orange #E8631A (filled icon + orange text + small orange indicator)
/// - Footer tagline "|| जय शिवराय ||" below the bottom nav bar
class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int>? onTap;

  const CustomBottomNavBar({super.key, this.currentIndex = 0, this.onTap});

  @override
  Widget build(BuildContext context) {
    // White bar with a soft upward shadow
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(color: Color(0xFFF2EAE0), width: 1.0),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Navigation items row: 5 tabs
            SizedBox(
              height: 58,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // 1. Home (Active by default)
                  _buildNavItem(
                    index: 0,
                    outlineIcon: Icons.home_outlined,
                    filledIcon: Icons.home_rounded,
                    label: 'होम',
                    isSelected: currentIndex == 0,
                  ),

                  // 2. Community
                  _buildNavItem(
                    index: 1,
                    outlineIcon: Icons.groups_outlined,
                    filledIcon: Icons.groups_rounded,
                    label: 'समुदाय',
                    isSelected: currentIndex == 1,
                  ),

                  // 3. Business
                  _buildNavItem(
                    index: 2,
                    outlineIcon: Icons.storefront_outlined,
                    filledIcon: Icons.storefront_rounded,
                    label: 'व्यवसाय',
                    isSelected: currentIndex == 2,
                  ),

                  // 4. Discover (Compass Icon)
                  _buildNavItem(
                    index: 3,
                    outlineIcon: Icons.explore_outlined,
                    filledIcon: Icons.explore_rounded,
                    label: 'शोध',
                    isSelected: currentIndex == 3,
                  ),

                  // 5. Profile
                  _buildNavItem(
                    index: 4,
                    outlineIcon: Icons.person_outline_rounded,
                    filledIcon: Icons.person_rounded,
                    label: 'प्रोफाईल',
                    isSelected: currentIndex == 4,
                  ),
                ],
              ),
            ),

            // Section 9: Footer Tagline below bottom nav bar
            Padding(
              padding: const EdgeInsets.only(top: 1.0, bottom: 6.0),
              child: Text(
                '|| जय शिवराय ||',
                style: HomeTheme.marathiHeading(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: HomeTheme.textMutedDark,
                  letterSpacing: 1.2,
                  height: 1.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData outlineIcon,
    required IconData filledIcon,
    required String label,
    required bool isSelected,
  }) {
    final iconColor =
        isSelected ? HomeTheme.primaryOrange : HomeTheme.textMuted;
    final textColor =
        isSelected ? HomeTheme.primaryOrange : HomeTheme.textMuted;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap?.call(index),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? filledIcon : outlineIcon,
              size: 22,
              color: iconColor,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: HomeTheme.marathiHeading(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: textColor,
                height: 1.1,
              ),
            ),
            const SizedBox(height: 3),
            // Small orange indicator (underline/dot)
            Container(
              width: 14,
              height: 2.2,
              decoration: BoxDecoration(
                color:
                    isSelected ? HomeTheme.primaryOrange : Colors.transparent,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
