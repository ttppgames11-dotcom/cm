import 'package:flutter/material.dart';
import '../../core/profile/member_avatar.dart';
import '../../core/theme/home_theme.dart';

/// Section 1: HomeHeader (Light Theme)
/// - Background: warm cream #FDF8F2
/// - Fort logo icon in light container
/// - "Connect मराठा" wordmark (Connect in dark brown-black #2B1B12, मराठा in orange #E8631A)
/// - Tagline in muted warm gray-brown #7A6A5D
/// - Search icon & notification bell as light circular buttons with subtle drop shadow
/// - Profile avatar with thin orange ring
class HomeHeader extends StatelessWidget {
  final String logoAsset;
  final String tagline;
  final int unreadNotifications;
  final VoidCallback? onSearch;
  final VoidCallback? onNotifications;
  final VoidCallback? onProfile;

  const HomeHeader({
    super.key,
    this.logoAsset = 'assets/images/connect_maratha_logo.webp',
    this.tagline = 'आधुनिक युगातील आधुनिक संघटन',
    this.unreadNotifications = 0,
    this.onSearch,
    this.onNotifications,
    this.onProfile,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: HomeTheme.bgWarmCream,
      padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Logo & Wordmark
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _buildLogo(),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Shrink rather than cut off the app name on narrow phones.
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: RichText(
                          maxLines: 1,
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'Connect ',
                                style: HomeTheme.headerSerif(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: HomeTheme.textDark,
                                  letterSpacing: 0.4,
                                ),
                              ),
                              TextSpan(
                                text: 'मराठा',
                                style: HomeTheme.marathiHeading(
                                  fontSize: 21,
                                  fontWeight: FontWeight.w800,
                                  color: HomeTheme.primaryOrange,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 1),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          tagline,
                          maxLines: 1,
                          style: HomeTheme.marathiBody(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w500,
                            color: HomeTheme.textMuted,
                            height: 1.25,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Actions on right: Search, Notifications, Profile
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Search Button (Light circular button with subtle shadow)
              _buildCircularActionButton(
                icon: Icons.search_rounded,
                tooltip: 'शोधा / Search',
                onPressed: onSearch,
              ),
              const SizedBox(width: 8),

              // Notification Bell with Badge (Light circular button with subtle shadow)
              Stack(
                clipBehavior: Clip.none,
                children: [
                  _buildCircularActionButton(
                    icon: Icons.notifications_none_rounded,
                    tooltip: 'सूचना / Notifications',
                    onPressed: onNotifications,
                  ),
                  if (unreadNotifications > 0)
                    Positioned(
                      top: 7,
                      right: 7,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: HomeTheme.badgeRed,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 10),

              // Profile Avatar with Thin Orange Ring
              GestureDetector(
                onTap: onProfile,
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: HomeTheme.primaryOrange,
                      width: 1.8,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: HomeTheme.primaryOrange.withValues(alpha: 0.18),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const MyAvatar(size: 34),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    // The official logo is a round badge, so it sits in a circle at full size.
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: HomeTheme.subtleShadow,
      ),
      child: Image.asset(
        logoAsset,
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return const Icon(
            Icons.shield_rounded,
            color: HomeTheme.primaryOrange,
            size: 24,
          );
        },
      ),
    );
  }

  Widget _buildCircularActionButton({
    required IconData icon,
    required String tooltip,
    required VoidCallback? onPressed,
  }) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: HomeTheme.subtleShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Icon(icon, color: HomeTheme.textDark, size: 20),
        ),
      ),
    );
  }
}
