import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'website_home_features_data.dart';

/// Section: Community Services & Business Directory (विश्वासू सेवा व उद्योग निर्देशिका)
/// 4 key verified service sectors matching the website home section
class CommunityServicesSection extends StatelessWidget {
  final List<HomeServiceCategory> categories;
  final ValueChanged<HomeServiceCategory>? onCategoryTap;
  final VoidCallback? onSeeAll;

  const CommunityServicesSection({
    super.key,
    this.categories = HomeServiceCategory.categories,
    this.onCategoryTap,
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
                        'विश्वासू सेवा व उद्योग निर्देशिका',
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
                    'सर्व सेवा →',
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
            'मराठा समाजाचे स्वतःचे विश्वासार्ह व्यावसायिक नेटवर्क',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF7A6A5D),
            ),
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: categories.length,
            // Grows with the system font size so enlarged text still fits.
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: MediaQuery.textScalerOf(context).scale(124),
            ),
            itemBuilder: (context, index) {
              final cat = categories[index];
              return InkWell(
                onTap: () => onCategoryTap?.call(cat),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                          Text(cat.iconEmoji, style: const TextStyle(fontSize: 22)),
                          const Spacer(),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFFD1D5DB)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat.titleMr,
                        style: GoogleFonts.mukta(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        cat.subtitleMr,
                        style: GoogleFonts.mukta(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF6B7280),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
