import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';
import 'section_header.dart';

/// Section 7: CommunityActivityCard (Light Theme)
/// - Section header "Recent Community Activity" with "See All" link
/// - White card with soft drop shadow (no border)
/// - Circular avatar with orange ring
/// - Author name in dark brown-black #2B1B12 + relative timestamp in muted warm gray
/// - Post text in dark brown-black
/// - Attached image on right side
/// - Like and comment stats
class CommunityActivityCard extends StatelessWidget {
  final CommunityActivityData post;
  final VoidCallback? onSeeAll;
  final VoidCallback? onMore;
  final VoidCallback? onTap;

  const CommunityActivityCard({
    super.key,
    this.post = CommunityActivityData.defaultPost,
    this.onSeeAll,
    this.onMore,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'Recent Community Activity',
          actionLabel: 'See All',
          onAction: onSeeAll,
        ),
        GestureDetector(
          onTap: onTap ?? post.onTap,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            padding: const EdgeInsets.all(14.0),
            decoration: HomeTheme.cardDecoration(
              radius: 18,
              backgroundColor: Colors.white,
              shadows: HomeTheme.softShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row: Avatar, Name + Timestamp, Three-Dot Menu
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Circular Avatar with orange border
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: HomeTheme.primaryOrange,
                          width: 1.5,
                        ),
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          post.authorAvatar,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: HomeTheme.bgCardSecondary,
                              child: const Icon(
                                Icons.person_rounded,
                                color: HomeTheme.primaryOrange,
                                size: 22,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Author Name and Relative Timestamp
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  post.authorName,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: HomeTheme.marathiHeading(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w700,
                                    color: HomeTheme.textDark,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(
                                Icons.verified_rounded,
                                size: 14,
                                color: HomeTheme.primaryOrange,
                              ),
                            ],
                          ),
                          Text(
                            post.timeAgo,
                            style: HomeTheme.marathiBody(
                              fontSize: 11,
                              color: HomeTheme.textMuted,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Three-dot Overflow Menu
                    IconButton(
                      icon: const Icon(
                        Icons.more_vert_rounded,
                        color: HomeTheme.textMuted,
                        size: 20,
                      ),
                      visualDensity: VisualDensity.compact,
                      onPressed: onMore ?? post.onMore,
                      tooltip: 'पर्याय / Options',
                      splashRadius: 18,
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Content Row: Post Text on Left, Attached Image on Right
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Post text (2 lines) and Social Counts
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.postText,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiBody(
                              fontSize: 13,
                              color: HomeTheme.textDark,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 10),
                          // Interaction Stats (Likes, Comments)
                          Row(
                            children: [
                              _buildStatItem(
                                icon: Icons.favorite_rounded,
                                count: post.likesCount.toString(),
                                color: HomeTheme.primaryOrange,
                              ),
                              const SizedBox(width: 14),
                              _buildStatItem(
                                icon: Icons.chat_bubble_outline_rounded,
                                count: post.commentsCount.toString(),
                                color: HomeTheme.textMuted,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Attached Image on the right side
                    if (post.attachedImage != null) ...[
                      const SizedBox(width: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: SizedBox(
                          width: 76,
                          height: 76,
                          child: Image.asset(
                            post.attachedImage!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: HomeTheme.bgCardSecondary,
                                child: const Icon(
                                  Icons.image_rounded,
                                  color: HomeTheme.primaryOrange,
                                  size: 28,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String count,
    required Color color,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          count,
          style: HomeTheme.marathiBody(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: HomeTheme.textMuted,
          ),
        ),
      ],
    );
  }
}
