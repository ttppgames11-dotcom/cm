import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'website_home_features_data.dart';

/// Section: Historians Insights (इतिहास संशोधकांचे विचारमंथन व अभ्यास)
/// Displays authoritative quotes and scholarly conclusions from Babasaheb Purandare, etc.
class HistoriansInsightsSection extends StatelessWidget {
  final List<HistorianInsight> insights;
  final VoidCallback? onSeeAll;

  const HistoriansInsightsSection({
    super.key,
    this.insights = HistorianInsight.insights,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 4,
                      height: 18,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE84C10),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'इतिहास संशोधकांचे विचारमंथन',
                        style: GoogleFonts.mukta(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF2B1B12),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (onSeeAll != null)
                GestureDetector(
                  onTap: onSeeAll,
                  child: Text(
                    'इतिहास दालन →',
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFE84C10),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'अस्सल मोडी कागदपत्रे व ऐतिहासिक संशोधनावर आधारित विचार',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF7A6A5D),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            // Grows with the system font size so enlarged text still fits.
            height: MediaQuery.textScalerOf(context).scale(176),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: insights.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final item = insights[index];
                return Container(
                  width: 250,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFF0E4D7), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF2B1B12).withAlpha(10),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF2EC),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFFFFD4C0)),
                                ),
                                child: Text(
                                  item.badge,
                                  style: GoogleFonts.mukta(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFFE84C10),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text('“', style: TextStyle(fontSize: 22, color: Color(0xFFD97706), height: 1)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.name,
                        style: GoogleFonts.mukta(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        item.title,
                        style: GoogleFonts.mukta(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF9CA3AF),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '“${item.quote}”',
                        style: GoogleFonts.mukta(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF4A3E38),
                          height: 1.25,
                          fontStyle: FontStyle.italic,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      Text(
                        '🌟 ${item.takeaway}',
                        style: GoogleFonts.mukta(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF15803D),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
