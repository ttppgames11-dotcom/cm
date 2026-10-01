import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

/// Shared back-button + title header used by every Profile sub-page
/// (Personal Info, Security, My Events, Saved, Notifications, Help, About),
/// mirroring the visual language already used on [ProfileScreen] itself
/// (white circular back button, warm cream background, Mukta type).
class ProfileSubPageHeader extends StatelessWidget {
  const ProfileSubPageHeader({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Material(
            color: Colors.white,
            shape: const CircleBorder(),
            elevation: 1.5,
            shadowColor: const Color(0xFF2B1B12).withAlpha(30),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () {
                if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                } else {
                  context.go('/profile');
                }
              },
              child: Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: const Color(0xFFE5DCD0),
                    width: 1.2,
                  ),
                ),
                child: const Icon(
                  Icons.arrow_back_rounded,
                  color: Color(0xFF2B1B12),
                  size: 20,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0xFFFBEFE6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFFE84C10), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.mukta(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF2B1B12),
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.mukta(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

/// Shows a small, warm-cream themed confirmation snackbar, matching the
/// style already used across Profile/Business screens.
void showProfileMessage(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      backgroundColor: Colors.white,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFF2EAE0)),
      ),
      content: Text(
        message,
        style: GoogleFonts.mukta(
          color: const Color(0xFF2B1B12),
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
      duration: const Duration(seconds: 2),
    ),
  );
}
