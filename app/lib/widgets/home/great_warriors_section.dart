import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'section_header.dart';
import 'website_home_features_data.dart';

/// Widget presenting 'साम्राज्याचे महायोद्धे व ऐतिहासिक चरित्र ग्रंथ'
/// from the E:\cm-web\cm\cm-home.html website homepage.
class GreatWarriorsSection extends StatelessWidget {
  final ValueChanged<GreatWarriorBio>? onWarriorTap;
  final VoidCallback? onSeeAll;

  const GreatWarriorsSection({
    super.key,
    this.onWarriorTap,
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
            title: 'साम्राज्याचे महायोद्धे',
            actionLabel: 'सर्व इतिहास',
            onAction: onSeeAll,
          ),
          const SizedBox(height: 8),

          SizedBox(
            height: 220,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: GreatWarriorBio.warriors.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final warrior = GreatWarriorBio.warriors[index];
                return GestureDetector(
                  onTap: () => onWarriorTap?.call(warrior),
                  child: Container(
                    width: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: HomeTheme.gold.withValues(alpha: 0.35),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      children: [
                        // Background image
                        Positioned.fill(
                          child: Image.asset(
                            warrior.imagePath,
                            fit: BoxFit.cover,
                            alignment: Alignment.topCenter,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: HomeTheme.accentMaroon,
                                alignment: Alignment.center,
                                child: const Icon(
                                  Icons.shield_rounded,
                                  size: 48,
                                  color: Colors.white24,
                                ),
                              );
                            },
                          ),
                        ),

                        // Scrim gradient
                        Positioned.fill(
                          child: Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  Color(0xCC1A0407),
                                  Color(0xF51A0407),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                stops: [0.3, 0.7, 1.0],
                              ),
                            ),
                          ),
                        ),

                        // Content text
                        Positioned(
                          left: 12,
                          right: 12,
                          bottom: 12,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: HomeTheme.primaryOrange,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  warrior.subtitleMr,
                                  style: HomeTheme.marathiHeading(
                                    fontSize: 10,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                warrior.titleMr,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 14,
                                  color: const Color(0xFFFFF8E7),
                                  fontWeight: FontWeight.w800,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                warrior.descMr,
                                style: HomeTheme.marathiBody(
                                  fontSize: 10.5,
                                  color: const Color(0xFFD4C8B8),
                                ).copyWith(height: 1.25),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                    'सविस्तर चरित्र वाचा',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: HomeTheme.marathiHeading(
                                      fontSize: 10,
                                      color: HomeTheme.gold,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(
                                    Icons.arrow_forward_rounded,
                                    size: 11,
                                    color: HomeTheme.gold,
                                  ),
                                ],
                              ),
                            ],
                          ),
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
