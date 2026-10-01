import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../widgets/profile_subpage_header.dart';

/// "सूचना" — the member's notification inbox. The server does not send
/// notifications yet, so this shows an honest empty state instead of sample
/// messages that every member would mistake for real ones.
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'सूचना',
              subtitle: 'Notifications',
              icon: Icons.notifications_none_rounded,
            ),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 84,
                        height: 84,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFFF1E6),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.notifications_none_rounded,
                          size: 40,
                          color: Color(0xFFE84C10),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'अद्याप कोणतीही सूचना नाही',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.mukta(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'कार्यक्रम, समुदायातील उत्तरे व महत्त्वाच्या घोषणा येथे दिसतील.\n'
                        'No notifications yet.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.mukta(
                          fontSize: 13,
                          height: 1.45,
                          color: const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
