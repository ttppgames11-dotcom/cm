import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/profile/member_avatar.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';

/// Section 3: MemberIdCard (Light Theme)
/// - White card with soft drop shadow (no border)
/// - Circular avatar with thin orange ring
/// - Name in dark brown-black #2B1B12
/// - Membership chip with gold #D4A853 crown icon
/// - Personal quote in dark brown-black in quotation marks
/// - QR code generated via `qr_flutter` in dark brown-black
/// - Member ID label and ID number
/// - Trailing chevron icon in warm gray-brown
class MemberIdCard extends StatelessWidget {
  final MemberCardData member;
  final VoidCallback? onTap;

  const MemberIdCard({
    super.key,
    this.member = MemberCardData.defaultMember,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        padding: const EdgeInsets.all(16.0),
        decoration: HomeTheme.cardDecoration(
          radius: 18,
          backgroundColor: Colors.white,
          shadows: HomeTheme.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Avatar, Member Info, QR Code & Trailing Chevron
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Circular Avatar with thin orange border
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: HomeTheme.primaryOrange,
                      width: 1.6,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: HomeTheme.primaryOrange.withValues(alpha: 0.15),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const MyAvatar(size: 45),
                ),
                const SizedBox(width: 12),

                // Name, Subtitle, Tier
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        member.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiHeading(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          color: HomeTheme.textDark,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        member.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiBody(
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                          color: HomeTheme.textMuted,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Tier Chip with Gold Crown Icon
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF8EC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: HomeTheme.gold.withValues(alpha: 0.45),
                            width: 0.8,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.workspace_premium_rounded,
                              size: 13,
                              color: HomeTheme.gold,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                member.tier,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiBody(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: HomeTheme.textDark,
                                  height: 1.2,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // QR Code with Member ID
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFFEFE6DC),
                          width: 1,
                        ),
                      ),
                      child: QrImageView(
                        data: member.memberId,
                        version: QrVersions.auto,
                        size: 46,
                        padding: EdgeInsets.zero,
                        eyeStyle: const QrEyeStyle(
                          eyeShape: QrEyeShape.square,
                          color: Color(0xFF2B1B12),
                        ),
                        dataModuleStyle: const QrDataModuleStyle(
                          dataModuleShape: QrDataModuleShape.square,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Member ID',
                      style: HomeTheme.marathiBody(
                        fontSize: 8.5,
                        fontWeight: FontWeight.w500,
                        color: HomeTheme.textMuted,
                        height: 1.1,
                      ),
                    ),
                    Text(
                      member.memberId,
                      style: HomeTheme.marathiBody(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: HomeTheme.textDark,
                        height: 1.1,
                      ),
                    ),
                  ],
                ),

                const SizedBox(width: 4),

                // Trailing Chevron
                const Padding(
                  padding: EdgeInsets.only(top: 14.0),
                  child: Icon(
                    Icons.chevron_right_rounded,
                    color: HomeTheme.textMuted,
                    size: 22,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Subtle divider
            Divider(color: const Color(0xFFF2EAE0), height: 1, thickness: 0.8),

            const SizedBox(height: 10),

            // Middle: Personal Quote in Quotation Marks
            Center(
              child: Text(
                '“ ${member.quote} ”',
                textAlign: TextAlign.center,
                style: HomeTheme.marathiBody(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: HomeTheme.textDark,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
