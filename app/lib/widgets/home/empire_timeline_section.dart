import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'section_header.dart';
import 'website_home_features_data.dart';

/// Widget presenting 'मराठा साम्राज्य महत्त्वाचे कालखंड (1630 – 1818 Timeline)'
/// from the E:\cm-web\cm\cm-home.html website homepage.
class EmpireTimelineSection extends StatelessWidget {
  final VoidCallback? onSeeAll;

  const EmpireTimelineSection({
    super.key,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'साम्राज्य महत्त्वाचे कालखंड',
            actionLabel: 'सविस्तर कालपट',
            onAction: onSeeAll,
          ),
          const SizedBox(height: 8),

          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF0E4D4), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: EmpireTimelineEvent.events.length,
              separatorBuilder: (context, index) => const Divider(
                color: Color(0xFFF5ECE1),
                height: 16,
                thickness: 1,
              ),
              itemBuilder: (context, index) {
                final event = EmpireTimelineEvent.events[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Year Badge
                    Container(
                      width: 72,
                      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            HomeTheme.primaryOrange,
                            HomeTheme.accentOrange,
                          ],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        event.year,
                        style: HomeTheme.marathiHeading(
                          fontSize: 12,
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Event Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            style: HomeTheme.marathiHeading(
                              fontSize: 13,
                              color: HomeTheme.textDark,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            event.significance,
                            style: HomeTheme.marathiBody(
                              fontSize: 11.5,
                              color: HomeTheme.textMuted,
                            ).copyWith(height: 1.35),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
