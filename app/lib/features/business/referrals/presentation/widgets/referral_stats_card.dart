import 'package:flutter/material.dart';

import '../../domain/models/referral_stats.dart';

class ReferralStatsCard extends StatelessWidget {
  const ReferralStatsCard({
    super.key,
    required this.stats,
  });

  final ReferralStats stats;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF8B1E1E), // Deep Maratha Crimson
            Color(0xFFB71C1C),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF8B1E1E).withValues(alpha: 0.28),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Total Value Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'यशस्वी व्यवसाय मूल्य',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFFFFD7D7),
                    ),
                  ),
                  SizedBox(height: 2),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.workspace_premium_rounded, size: 14, color: Colors.white),
                    SizedBox(width: 4),
                    Text(
                      'रेफरल नेटवर्क',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            stats.formattedTotalValue,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 14),
          const Divider(color: Colors.white24, height: 1),
          const SizedBox(height: 12),

          // 3 Columns: दिलेले, मिळालेले, यशस्वी क्लोज
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem(
                label: 'दिलेले',
                count: stats.givenCount.toString(),
                icon: Icons.arrow_outward_rounded,
                iconColor: const Color(0xFFFFCC80),
              ),
              Container(width: 1, height: 32, color: Colors.white24),
              _buildStatItem(
                label: 'मिळालेले',
                count: stats.receivedCount.toString(),
                icon: Icons.south_west_rounded,
                iconColor: const Color(0xFF81D4FA),
              ),
              Container(width: 1, height: 32, color: Colors.white24),
              _buildStatItem(
                label: 'यशस्वी',
                count: stats.closedCount.toString(),
                icon: Icons.check_circle_rounded,
                iconColor: const Color(0xFFA5D6A7),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required String label,
    required String count,
    required IconData icon,
    required Color iconColor,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: iconColor),
            const SizedBox(width: 4),
            Text(
              count,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w500,
            color: Color(0xFFFFD7D7),
          ),
        ),
      ],
    );
  }
}
