import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/auth/auth_scope.dart';
import '../core/config/app_version.dart';
import '../core/network/api_client.dart';
import '../core/profile/member_avatar.dart';
import '../core/profile/photo_picker_sheet.dart';
import '../core/profile/profile_photo.dart';
import '../features/auth/models/user_role.dart';
import '../features/auth/providers/auth_provider.dart'
    show authControllerProvider;
import '../features/profile/providers/profile_provider.dart';

/// Pixel-accurate Maratha-themed Profile Screen matching the Connect Maratha design mockup.
class ProfileScreen extends ConsumerStatefulWidget {
  final VoidCallback? onBack;

  const ProfileScreen({super.key, this.onBack});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // ─── Photo ───────────────────────────────────────────────────────────────

  /// The member's own photo: take or choose one, or remove it. It is
  /// uploaded so other members see it next to their name, posts and comments.
  Future<void> _pickPhoto() async {
    final photos = ref.read(myProfilePhotoProvider.notifier);
    final uploaded = ref.read(authControllerProvider).state.profile?.photo;
    final choice = await pickProfilePhoto(
      context,
      canRemove:
          ref.read(myProfilePhotoProvider).valueOrNull != null ||
          (uploaded ?? '').isNotEmpty,
    );
    if (choice == null) return;
    try {
      switch (choice) {
        case PhotoPicked(:final path):
          await photos.setPhoto(path);
          if (mounted) _showMessage(context, 'प्रोफाईल फोटो अपडेट झाला.');
        case PhotoRemoved():
          await photos.removePhoto();
      }
    } on ApiException catch (e) {
      // Saved on this phone; it is uploaded again when the app next starts.
      if (mounted) _showMessage(context, 'फोटो अपलोड झाला नाही. ${e.message}');
    } catch (_) {
      if (mounted) _showMessage(context, 'फोटो जतन करता आला नाही.');
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  void _showMessage(BuildContext context, String message) {
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

  void _showLogoutDialog(BuildContext context, [WidgetRef? ref]) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          title: Text(
            'लॉगआउट करू इच्छिता?',
            style: GoogleFonts.mukta(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1F2937),
            ),
          ),
          content: Text(
            'तुम्ही नक्की आपल्या खात्यामधून बाहेर पडू इच्छिता का?',
            style: GoogleFonts.mukta(
              fontSize: 14,
              color: const Color(0xFF4B5563),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(
                'रद्द करा',
                style: GoogleFonts.mukta(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF6B7280),
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFDC2626),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () async {
                final authScope = () {
                  try {
                    return AuthScope.of(context);
                  } catch (_) {
                    return null;
                  }
                }();
                Navigator.pop(dialogContext);
                try {
                  await ref?.read(authControllerProvider).logout();
                } catch (_) {}
                if (authScope != null) {
                  try {
                    await authScope.logout();
                  } catch (_) {}
                }
                if (context.mounted) {
                  context.go('/login');
                }
              },
              child: Text(
                'लॉगआउट',
                style: GoogleFonts.mukta(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileData = ref.watch(profileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: Stack(
        children: [
          // Top fort scenic header backdrop
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 180,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(
                  'assets/images/profile_fort_header_bg.webp',
                  fit: BoxFit.cover,
                  errorBuilder:
                      (context, error, stackTrace) =>
                          Container(color: const Color(0xFFF5EBE1)),
                ),
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withAlpha(40),
                        const Color(0xFFFAF7F2).withAlpha(120),
                        const Color(0xFFFAF7F2),
                      ],
                      stops: const [0.0, 0.6, 1.0],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Scrollable profile content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTopBar(context),
                  const SizedBox(height: 14),
                  _buildMainProfileCard(context, profileData),
                  const SizedBox(height: 16),
                  _buildMenuListCard(context),
                  const SizedBox(height: 14),
                  _buildLogoutButton(context, ref),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Back Button
        Padding(
          padding: const EdgeInsets.only(top: 2, right: 10),
          child: Material(
            color: Colors.white,
            shape: const CircleBorder(),
            elevation: 1.5,
            shadowColor: const Color(0xFF2B1B12).withAlpha(30),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () {
                if (widget.onBack != null) {
                  widget.onBack!();
                  return;
                }
                if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                } else {
                  try {
                    context.go('/home');
                  } catch (_) {
                    // Fallback in tests or without GoRouter
                  }
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
        ),

        // Left Title & Subtitle
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'माझे प्रोफाइल',
                style: GoogleFonts.mukta(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF2B1B12),
                  height: 1.15,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Connect मराठा परिवाराचा एक भाग',
                style: GoogleFonts.mukta(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF6B7280),
                ),
              ),
            ],
          ),
        ),

        // Right Icons & Motto
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Notification bell (no badge: there are no notifications yet)
                InkWell(
                  onTap: () => context.push('/profile/notifications'),
                  borderRadius: BorderRadius.circular(20),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: const Icon(
                      Icons.notifications_none_rounded,
                      color: Color(0xFF2B1B12),
                      size: 24,
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Settings Gear
                InkWell(
                  onTap: () => context.push('/profile/security'),
                  borderRadius: BorderRadius.circular(20),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(
                      Icons.settings_outlined,
                      color: Color(0xFF2B1B12),
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),

            // Slogan
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '" स्वराज्य\nहेच आमची\nओळख "',
                  textAlign: TextAlign.right,
                  style: GoogleFonts.mukta(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF7A2016),
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  width: 40,
                  height: 2,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE84C10),
                    borderRadius: BorderRadius.circular(1),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // ─── Main profile card ─────────────────────────────────────────────────

  /// Main Profile Card: Avatar, Camera Badge, Info, Edit Button and Calligraphic Watermark
  Widget _buildMainProfileCard(
    BuildContext context, [
    ProfileData? profileData,
  ]) {
    final user = profileData?.user;
    final displayName =
        user != null && user.name.isNotEmpty ? user.name : 'सदस्य';
    final roleName =
        user != null
            ? (user.role == UserRole.member
                ? 'सदस्य (General Member)'
                : user.role.displayName)
            : 'सदस्य (General Member)';
    // Never fall back to someone else's real contact details.
    final memberId = user?.id ?? '';
    final phone = user?.phone ?? '';
    final email = profileData?.email ?? '';
    final city = user?.city ?? '';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Stack(
          children: [
            // "जय शिवराय" Calligraphic Watermark on right
            Positioned(
              right: 12,
              top: 52,
              child: Opacity(
                opacity: 0.12,
                child: Text(
                  'जय\nशिवराय',
                  textAlign: TextAlign.right,
                  style: GoogleFonts.mukta(
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFFE84C10),
                    height: 1.0,
                  ),
                ),
              ),
            ),

            // Card details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Avatar with tappable Camera Badge ──────────────
                      GestureDetector(
                        onTap: _pickPhoto,
                        child: Stack(
                          children: [
                            Container(
                              width: 76,
                              height: 76,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xFFE84C10),
                                  width: 2.5,
                                ),
                              ),
                              child: const MyAvatar(size: 71),
                            ),
                            // Camera badge
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE84C10),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 2,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  color: Colors.white,
                                  size: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 14),

                      // User Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              displayName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.mukta(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF1F2937),
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              roleName,
                              style: GoogleFonts.mukta(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFE84C10),
                              ),
                            ),
                            const SizedBox(height: 1),
                            Text(
                              'Member ID : $memberId',
                              style: GoogleFonts.mukta(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF6B7280),
                              ),
                            ),
                            const SizedBox(height: 6),

                            // Phone
                            if (phone.isNotEmpty)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.phone,
                                    size: 13,
                                    color: Color(0xFF374151),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      phone,
                                      style: GoogleFonts.mukta(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF374151),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            const SizedBox(height: 3),

                            // Email
                            if (email.isNotEmpty)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.email_outlined,
                                    size: 13,
                                    color: Color(0xFF374151),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      email,
                                      style: GoogleFonts.mukta(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF374151),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            const SizedBox(height: 3),

                            // Location
                            if (city.isNotEmpty)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.location_on,
                                    size: 13,
                                    color: Color(0xFF374151),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      city,
                                      style: GoogleFonts.mukta(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF374151),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Edit Profile Button: its own full-width row so the name
                  // and details keep the whole width on narrow phones.
                  InkWell(
                    onTap: () => context.push('/profile/personal-info'),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFFE84C10),
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.edit_outlined,
                            color: Color(0xFFE84C10),
                            size: 14,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'प्रोफाईल संपादित करा',
                            style: GoogleFonts.mukta(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFFE84C10),
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
        ),
      ),
    );
  }

  /// Menu Options List Card with 8 items
  Widget _buildMenuListCard(BuildContext context) {
    final menuItems = [
      {
        'icon': Icons.person_outline_rounded,
        'title': 'वैयक्तिक माहिती',
        'subtitle': 'तुमची प्राथमिक माहिती',
      },
      {
        'icon': Icons.shield_outlined,
        'title': 'सुरक्षा आणि गोपनीयता',
        'subtitle': 'गोपनीयता धोरण, खाते हटवा',
      },
      {
        'icon': Icons.groups_outlined,
        'title': 'माझे समुदाय',
        'subtitle': 'समाज फीड आणि सदस्य',
      },
      {
        'icon': Icons.calendar_today_outlined,
        'title': 'माझे कार्यक्रम',
        'subtitle': 'नोंदणी केलेले आणि आगामी कार्यक्रम',
      },
      {
        'icon': Icons.bookmark_border_rounded,
        'title': 'जतन केलेले',
        'subtitle': 'तुमचे आवडते किल्ले व वीर',
      },
      {
        'icon': Icons.notifications_none_rounded,
        'title': 'सूचना',
        'subtitle': 'तुमच्यासाठी आलेल्या सूचना',
      },
      {
        'icon': Icons.help_outline_rounded,
        'title': 'मदत आणि समर्थन',
        'subtitle': 'सामान्य प्रश्न आणि संपर्क',
      },
      {
        'icon': Icons.info_outline_rounded,
        'title': 'अ‍ॅप विषयी',
        'subtitle': 'आवृत्ती $appVersionName',
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: menuItems.length,
          separatorBuilder:
              (_, __) => const Divider(
                height: 1,
                indent: 58,
                color: Color(0xFFF3F4F6),
              ),
          itemBuilder: (context, index) {
            final item = menuItems[index];
            return InkWell(
              onTap: () {
                switch (item['title']) {
                  case 'वैयक्तिक माहिती':
                    context.push('/profile/personal-info');
                    break;
                  case 'सुरक्षा आणि गोपनीयता':
                    context.push('/profile/security');
                    break;
                  case 'माझे समुदाय':
                    context.push('/community');
                    break;
                  case 'माझे कार्यक्रम':
                    context.push('/profile/events');
                    break;
                  case 'जतन केलेले':
                    context.push('/profile/saved');
                    break;
                  case 'सूचना':
                    context.push('/profile/notifications');
                    break;
                  case 'मदत आणि समर्थन':
                    context.push('/profile/help');
                    break;
                  case 'अ‍ॅप विषयी':
                    context.push('/profile/about');
                    break;
                  default:
                    _showMessage(context, item['title'] as String);
                }
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFBEFE6),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        color: const Color(0xFF8B4513),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['title'] as String,
                            style: GoogleFonts.mukta(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF1F2937),
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            item['subtitle'] as String,
                            style: GoogleFonts.mukta(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF6B7280),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: Color(0xFF9CA3AF),
                      size: 20,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  /// Logout Button with red styling
  Widget _buildLogoutButton(BuildContext context, [WidgetRef? ref]) {
    return InkWell(
      onTap: () => _showLogoutDialog(context, ref),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF5F5),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFFEE2E2), width: 1.2),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.logout_rounded,
              color: Color(0xFFDC2626),
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'लॉगआउट करा',
                style: GoogleFonts.mukta(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFFDC2626),
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFFDC2626),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
