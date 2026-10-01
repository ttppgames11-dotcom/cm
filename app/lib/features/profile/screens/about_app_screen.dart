import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';
import '../../../core/config/app_version.dart';
import '../../../core/diagnostics/error_reporter.dart';
import '../widgets/profile_subpage_header.dart';

/// "अ‍ॅप विषयी" — app version, mission statement, and legal links.
class AboutAppScreen extends StatelessWidget {
  const AboutAppScreen({super.key});

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'अ‍ॅप विषयी',
              subtitle: 'आवृत्ती व माहिती',
              icon: Icons.info_outline_rounded,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBEFE6),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(
                            Icons.temple_hindu_rounded,
                            color: Color(0xFFE84C10),
                            size: 36,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Connect Maratha',
                          style: GoogleFonts.mukta(
                            fontSize: 19,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF2B1B12),
                          ),
                        ),
                        const SizedBox(height: 4),
                        // Long-press: sends a test report, so the team can
                        // confirm crash reporting works on this phone.
                        GestureDetector(
                          onLongPress: () async {
                            final sent = await sendTestReport();
                            if (!context.mounted) return;
                            _showMessage(
                              context,
                              sent
                                  ? 'चाचणी अहवाल पाठवला ✓ (Test report sent)'
                                  : 'या आवृत्तीत त्रुटी अहवाल बंद आहेत.',
                            );
                          },
                          child: Text(
                            'आवृत्ती $appVersionName (Build $appBuildNumber)',
                            style: GoogleFonts.mukta(
                              fontSize: 12.5,
                              color: const Color(0xFF6B7280),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(8),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Text(
                      'Connect Maratha हे मराठा समाजाला एकत्र आणणारे, त्यांचा इतिहास, संस्कृती, व्यवसाय आणि समुदाय उपक्रम जोडणारे व्यासपीठ आहे — आपला वारसा, आपली एकता.',
                      style: GoogleFonts.mukta(
                        fontSize: 13,
                        height: 1.5,
                        color: const Color(0xFF4B5563),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _linkTile(
                    context,
                    icon: Icons.account_balance_rounded,
                    title: 'Connect Maratha विषयी (संस्था)',
                    onTap: () => context.push('/about'),
                  ),
                  _linkTile(
                    context,
                    icon: Icons.gavel_rounded,
                    title: 'समुदाय नियम व वापराच्या अटी (Terms)',
                    onTap: () => context.push('/guidelines'),
                  ),
                  _linkTile(
                    context,
                    icon: Icons.privacy_tip_outlined,
                    title: 'गोपनीयता धोरण (Privacy Policy)',
                    onTap:
                        () => _open(
                          context,
                          Uri.parse(ApiConfig.privacyPolicyUrl),
                        ),
                  ),
                  _linkTile(
                    context,
                    icon: Icons.system_update_alt_rounded,
                    title: 'अपडेट तपासा (Check for Updates)',
                    onTap: () => _open(context, _playStoreUri),
                  ),
                  _linkTile(
                    context,
                    icon: Icons.star_border_rounded,
                    title: 'अ‍ॅपला रेट करा (Rate the App)',
                    onTap: () => _open(context, _playStoreUri),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      '© 2026 Connect Maratha. सर्व हक्क राखीव.',
                      style: GoogleFonts.mukta(
                        fontSize: 11,
                        color: const Color(0xFF9CA3AF),
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

  static final _playStoreUri = Uri.parse(
    'https://play.google.com/store/apps/details?id=com.connectmaratha.app',
  );

  Future<void> _open(BuildContext context, Uri uri) async {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      _showMessage(context, 'लिंक उघडता आली नाही.');
    }
  }

  Widget _linkTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF8B4513), size: 19),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1F2937),
                  ),
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
      ),
    );
  }
}
