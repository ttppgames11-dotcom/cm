import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/api_config.dart';

/// Honest empty state for a section that has no real entries yet.
///
/// The live app must never show invented businesses, people, phone numbers,
/// prices or events as if they were real (sample data exists only in the
/// offline demo build). Until members add real entries, the section says so
/// and offers the one action that really works: writing to the team.
class NothingListedScreen extends StatelessWidget {
  const NothingListedScreen({
    super.key,
    required this.title,
    required this.icon,
    required this.message,
    this.contactSubject,
  });

  /// Section name shown in the app bar, e.g. "व्यवसाय निर्देशिका".
  final String title;
  final IconData icon;

  /// What will appear here later / how to get listed.
  final String message;

  /// When set, a "write to us" button opens an email with this subject.
  final String? contactSubject;

  Future<void> _write(BuildContext context) async {
    final uri = Uri(
      scheme: 'mailto',
      path: ApiConfig.supportEmail,
      query: 'subject=${Uri.encodeComponent(contactSubject ?? title)}',
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('कृपया ${ApiConfig.supportEmail} वर ईमेल करा.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.mukta(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2B1B12),
        elevation: 0.5,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFFF1E6),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 42, color: const Color(0xFFE84C10)),
                ),
                const SizedBox(height: 20),
                Text(
                  'अद्याप काहीही नोंदलेले नाही',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.mukta(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Nothing listed yet',
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF9CA3AF),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.mukta(
                    fontSize: 14,
                    height: 1.5,
                    color: const Color(0xFF6B7280),
                  ),
                ),
                if (contactSubject != null) ...[
                  const SizedBox(height: 22),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFE84C10),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 22,
                        vertical: 13,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => _write(context),
                    icon: const Icon(Icons.mail_outline_rounded, size: 18),
                    label: Text(
                      'आम्हाला लिहा / Write to us',
                      style: GoogleFonts.mukta(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
