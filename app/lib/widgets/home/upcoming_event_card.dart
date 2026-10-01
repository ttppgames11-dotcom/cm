import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';
import 'section_header.dart';

/// Section 5: UpcomingEventCard (Light Theme)
/// - Section header "Upcoming Event" with "See All" link
/// - White card with soft drop shadow (no border)
/// - Date badge overlaid on top-left of image
/// - Event title in dark brown-black #2B1B12
/// - Description in warm gray-brown #7A6A5D
/// - Three info rows (location pin, clock, people count)
/// - Orange filled button "नोंदणी करा" with arrow
class UpcomingEventCard extends StatelessWidget {
  final UpcomingEventData event;
  final VoidCallback? onSeeAll;
  final VoidCallback? onRegister;

  const UpcomingEventCard({
    super.key,
    this.event = UpcomingEventData.defaultEvent,
    this.onSeeAll,
    this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Upcoming Event',
          actionLabel: 'See All',
          onAction: onSeeAll,
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
          decoration: HomeTheme.cardDecoration(
            radius: 18,
            backgroundColor: Colors.white,
            shadows: HomeTheme.softShadow,
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Event Image with Date Badge Overlay
                SizedBox(
                  height: 155,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Event Image
                      Image.asset(
                        event.imageAsset,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: HomeTheme.bgCardSecondary,
                            child: const Center(
                              child: Icon(
                                Icons.event_rounded,
                                size: 50,
                                color: HomeTheme.primaryOrange,
                              ),
                            ),
                          );
                        },
                      ),

                      // Gradient at bottom of image
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.15),
                                Colors.black.withValues(alpha: 0.45),
                              ],
                              stops: const [0.5, 0.8, 1.0],
                            ),
                          ),
                        ),
                      ),

                      // Date Badge on the Left
                      Positioned(
                        top: 12,
                        left: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xEB2B1B12),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.35),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                event.dateDay,
                                style: HomeTheme.headerSerif(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  height: 1.05,
                                ),
                              ),
                              const SizedBox(height: 1),
                              Text(
                                event.dateMonth,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: HomeTheme.primaryOrange,
                                  height: 1.1,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Card Details
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 14.0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Event Title in Marathi
                      Text(
                        event.titleMr,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiHeading(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          color: HomeTheme.textDark,
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 4),

                      // Description line
                      Text(
                        event.descriptionMr,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiBody(
                          fontSize: 12.5,
                          color: HomeTheme.textMuted,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // 3 Info Rows (Location, Time, Attendees)
                      _buildInfoRow(
                        icon: Icons.location_on_rounded,
                        text: event.location,
                      ),
                      const SizedBox(height: 6),
                      _buildInfoRow(
                        icon: Icons.access_time_filled_rounded,
                        text: event.time,
                      ),
                      const SizedBox(height: 6),
                      _buildInfoRow(
                        icon: Icons.groups_rounded,
                        text: event.attendeesCount,
                      ),

                      const SizedBox(height: 16),

                      // Orange Filled Button "नोंदणी करा" with Arrow
                      SizedBox(
                        width: double.infinity,
                        height: 44,
                        child: FilledButton(
                          onPressed: onRegister ?? event.onRegister,
                          style: FilledButton.styleFrom(
                            backgroundColor: HomeTheme.primaryOrange,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                event.ctaText,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.arrow_forward_rounded,
                                size: 16,
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow({required IconData icon, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 16, color: HomeTheme.primaryOrange),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: HomeTheme.marathiBody(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: HomeTheme.textMuted,
              height: 1.3,
            ),
          ),
        ),
      ],
    );
  }
}
