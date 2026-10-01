import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'section_header.dart';
import 'website_home_features_data.dart';

/// Widget presenting 'पानिपतनंतरचे महापुनरुत्थान व महादजी युग' (1761 to 1803)
/// from the E:\cm-web\cm\cm-home.html website homepage.
class MarathaResurgenceSection extends StatelessWidget {
  final VoidCallback? onSeeAll;

  const MarathaResurgenceSection({
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
            title: 'पानिपतनंतरचे महापुनरुत्थान',
            actionLabel: 'सविस्तर इतिहास',
            onAction: onSeeAll,
          ),
          const SizedBox(height: 8),

          // Overview banner card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2C0B0E), Color(0xFF4A1016)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: HomeTheme.gold.withValues(alpha: 0.35),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: HomeTheme.gold.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: HomeTheme.gold.withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        '👑 राखेमधून पुन्हा उभे राहिलेले महासाम्राज्य',
                        style: HomeTheme.marathiHeading(
                          fontSize: 11,
                          color: HomeTheme.gold,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '१७६१ च्या पानिपत युद्धाच्या अवघ्या १० वर्षांत पेशवे माधवराव, महादजी शिंदे, तुकोजी होळकर आणि नाना फडणवीस यांनी पुन्हा दिल्लीवर भगवा फडकवून मुघल बादशहाला मराठ्यांचे मांडलिक बनवले.',
                  style: HomeTheme.marathiBody(
                    fontSize: 12.5,
                    color: const Color(0xFFFFF8E7),
                  ).copyWith(height: 1.45),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Horizontal scroll of key leaders
          SizedBox(
            height: 184,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: ResurgenceLeader.leaders.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final leader = ResurgenceLeader.leaders[index];
                return _buildLeaderCard(leader);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderCard(ResurgenceLeader leader) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF0E4D4), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: HomeTheme.primaryOrange.withValues(alpha: 0.12),
                child: Icon(leader.icon, size: 18, color: HomeTheme.primaryOrange),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF4ED),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFFFD8BF)),
                  ),
                  child: Text(
                    leader.roleBadge,
                    style: HomeTheme.marathiHeading(
                      fontSize: 10.5,
                      color: HomeTheme.primaryOrange,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            leader.title,
            style: HomeTheme.marathiHeading(
              fontSize: 13,
              color: HomeTheme.textDark,
              fontWeight: FontWeight.w700,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Expanded(
            child: Text(
              leader.summary,
              style: HomeTheme.marathiBody(
                fontSize: 11,
                color: HomeTheme.textMuted,
              ).copyWith(height: 1.35),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: leader.tags.take(2).map((t) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF7F5F0),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  t,
                  style: HomeTheme.marathiBody(
                    fontSize: 9.5,
                    color: HomeTheme.textDark,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
