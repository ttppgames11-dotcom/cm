import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'website_home_features_data.dart';

/// Section: Empire Statistics Strip (अखंड मराठा साम्राज्य सांख्यिकी)
/// 4 key historical stats matching the website's grand stat tiles
class EmpireStatsStrip extends StatelessWidget {
  final List<EmpireStatItem> stats;
  final VoidCallback? onTap;

  const EmpireStatsStrip({
    super.key,
    this.stats = EmpireStatItem.defaultStats,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 8),
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
                    'अखंड मराठा साम्राज्य गौरव',
                    style: GoogleFonts.mukta(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF2B1B12),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '१६७४ – १८१८',
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 94,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: stats.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final item = stats[index];
                return InkWell(
                  onTap: onTap,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 145,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFFF2E6D8),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2B1B12).withAlpha(12),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            Icon(item.icon, size: 16, color: item.accentColor),
                            const Spacer(),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: item.accentColor.withAlpha(100),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.value,
                          // Mukta: the values are Marathi (Playfair has no Devanagari).
                          style: GoogleFonts.mukta(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: item.accentColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          item.titleMr,
                          style: GoogleFonts.mukta(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF4A3E38),
                            height: 1.15,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
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
