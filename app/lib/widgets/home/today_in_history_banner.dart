import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Section: Today in History Banner (आजचा इतिहास)
/// Directly matches the website's `today-strip` from E:\cm-web\cm\cm-home.html:
/// "६ जून १६७४ — दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचा वैदिक सुवर्ण राज्याभिषेक..."
class TodayInHistoryBanner extends StatelessWidget {
  final String dateTitle;
  final String description;
  final VoidCallback? onTap;

  const TodayInHistoryBanner({
    super.key,
    this.dateTitle = '६ जून १६७४',
    this.description = 'दुर्गराज रायगडावर छत्रपती शिवाजी महाराजांचा वैदिक सुवर्ण राज्याभिषेक संपन्न झाला व "शिवराज्याभिषेक शक" सुरू झाले.',
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF9F5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFFD9C3), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFE84C10), Color(0xFFC73800)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'आजचा इतिहास',
                style: GoogleFonts.mukta(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: 0.3,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dateTitle,
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF9E360B),
                    ),
                  ),
                  Text(
                    description,
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF4A3E38),
                      height: 1.25,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            const Icon(
              Icons.history_edu_rounded,
              size: 20,
              color: Color(0xFFE84C10),
            ),
          ],
        ),
      ),
    );
  }
}
