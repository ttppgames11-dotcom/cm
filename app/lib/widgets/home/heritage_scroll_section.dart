import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';
import 'section_header.dart';

/// Reusable HeritageCard widget (Light Theme)
/// - Structure: Image on top (rounded top corners), white section below
/// - Title and subtitle in Marathi on white background
/// - "वाचा अधिक →" (Read More) text link in orange below subtitle
class HeritageCard extends StatelessWidget {
  final HeritageData item;
  final VoidCallback? onTap;
  final double width;
  final double height;

  const HeritageCard({
    super.key,
    required this.item,
    this.onTap,
    this.width = 170.0,
    this.height = 236.0,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? item.onTap,
      child: Container(
        width: width,
        height: height,
        decoration: HomeTheme.cardDecoration(
          radius: 16,
          backgroundColor: Colors.white,
          shadows: HomeTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top: Image with rounded top corners
              SizedBox(
                height: 116,
                width: double.infinity,
                child: Image.asset(
                  item.imageAsset,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: HomeTheme.bgCardSecondary,
                      child: const Center(
                        child: Icon(
                          Icons.fort_rounded,
                          color: HomeTheme.primaryOrange,
                          size: 36,
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Bottom: White section with title, subtitle, and "वाचा अधिक →" link
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10.0,
                    vertical: 8.0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.titleMr,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiHeading(
                              fontSize: 14.0,
                              fontWeight: FontWeight.w800,
                              color: HomeTheme.textDark,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.subtitleMr,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiBody(
                              fontSize: 11.0,
                              fontWeight: FontWeight.w500,
                              color: HomeTheme.textMuted,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),

                      // "वाचा अधिक →" text link in orange
                      Text(
                        'वाचा अधिक →',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: HomeTheme.primaryOrange,
                          height: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Section 6: HeritageScrollSection (Light Theme)
/// - Section header "Explore Maratha Heritage" with "See All" link
/// - Horizontal ListView.builder of stacked image + white content cards
class HeritageScrollSection extends StatelessWidget {
  final List<HeritageData> items;
  final VoidCallback? onSeeAll;
  final ValueChanged<HeritageData>? onItemTap;

  const HeritageScrollSection({
    super.key,
    this.items = const [],
    this.onSeeAll,
    this.onItemTap,
  });

  @override
  Widget build(BuildContext context) {
    final list = items.isNotEmpty ? items : HeritageData.defaultList;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Explore Maratha Heritage',
          actionLabel: 'See All',
          onAction: onSeeAll,
        ),
        SizedBox(
          height: 236,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 4.0,
            ),
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: list.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = list[index];
              return HeritageCard(
                item: item,
                onTap: () => onItemTap?.call(item),
              );
            },
          ),
        ),
      ],
    );
  }
}
