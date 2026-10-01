import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/api_config.dart';
import '../widgets/profile_subpage_header.dart';

class _Faq {
  const _Faq(this.question, this.answer);
  final String question;
  final String answer;
}

/// "मदत आणि समर्थन" — FAQ accordion plus contact actions.
class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  int? _expanded = 0;

  static const _faqs = [
    _Faq(
      'माझे सदस्यत्व कसे अपग्रेड करावे?',
      'प्रोफाईल > वैयक्तिक माहिती वरून तुमचा सद्य स्तर पाहू शकता. अपग्रेडसाठी कार्यक्रम व समुदाय उपक्रमांमध्ये सक्रिय सहभाग घ्या.',
    ),
    _Faq(
      'व्यवसाय निर्देशिकेत नोंदणी कशी करावी?',
      'व्यवसाय व संधी > व्यवसाय निर्देशिका उघडून "व्यवसाय जोडा" बटणावर क्लिक करा आणि माहिती भरा.',
    ),
    _Faq(
      'माझा पासवर्ड विसरलो तर काय करावे?',
      'स्वयंचलित पासवर्ड रीसेट अद्याप उपलब्ध नाही. कृपया आपल्या नोंदणीकृत मोबाईल नंबर / ईमेलसह सपोर्ट टीमला ईमेल करा; पडताळणीनंतर मदत केली जाईल.',
    ),
    _Faq(
      'कार्यक्रमाची नोंदणी रद्द कशी करावी?',
      'प्रोफाईल > माझे कार्यक्रम मध्ये जाऊन संबंधित कार्यक्रमावर टॅप करा आणि रद्द करा पर्याय निवडा.',
    ),
  ];

  void _showMessage(String message) {
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

  Future<void> _emailSupport() async {
    final uri = Uri(
      scheme: 'mailto',
      path: ApiConfig.supportEmail,
      query: 'subject=${Uri.encodeComponent('Connect Maratha मदत')}',
    );
    final ok = await launchUrl(uri);
    if (!ok && mounted) {
      _showMessage(
        'ईमेल अ‍ॅप उघडता आले नाही. कृपया ${ApiConfig.supportEmail} वर लिहा.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'मदत आणि समर्थन',
              subtitle: 'सामान्य प्रश्न आणि संपर्क',
              icon: Icons.help_outline_rounded,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  // Email is the only support channel that exists today; add
                  // phone/WhatsApp here once real numbers are set up.
                  _contactCard(
                    icon: Icons.email_rounded,
                    label: 'ईमेलद्वारे संपर्क: ${ApiConfig.supportEmail}',
                    color: const Color(0xFF1E4B8B),
                    onTap: _emailSupport,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'सामान्य प्रश्न',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 10),
                  for (var i = 0; i < _faqs.length; i++) _faqTile(i, _faqs[i]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _contactCard({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(
              label,
              style: GoogleFonts.mukta(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _faqTile(int index, _Faq faq) {
    final expanded = _expanded == index;
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
      child: Column(
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap:
                () => setState(() {
                  _expanded = expanded ? null : index;
                }),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      faq.question,
                      style: GoogleFonts.mukta(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                  ),
                  Icon(
                    expanded
                        ? Icons.remove_circle_outline_rounded
                        : Icons.add_circle_outline_rounded,
                    color: const Color(0xFFE84C10),
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
          if (expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  faq.answer,
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    color: const Color(0xFF6B7280),
                    height: 1.4,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
