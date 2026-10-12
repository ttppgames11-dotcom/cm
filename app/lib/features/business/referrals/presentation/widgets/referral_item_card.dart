import 'package:flutter/material.dart';

import '../../domain/models/referral.dart';
import '../../domain/models/referral_stats.dart';
import '../../domain/models/referral_status.dart';

class ReferralItemCard extends StatelessWidget {
  const ReferralItemCard({
    super.key,
    required this.referral,
    required this.isGivenTab,
    required this.onTap,
  });

  final Referral referral;
  final bool isGivenTab;
  final VoidCallback onTap;

  String _formatDate(DateTime? dt) {
    if (dt == null) return '';
    final d = dt.toLocal();
    final months = [
      'जाने', 'फेब्रु', 'मार्च', 'एप्रिल', 'मे', 'जून',
      'जुलै', 'ऑगस्ट', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'
    ];
    final monthName = months[d.month - 1];
    return '${d.day} $monthName ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final status = referral.statusClass;
    final urgency = referral.urgencyLevel;
    final otherMemberName = isGivenTab
        ? (referral.recipientName?.isNotEmpty == true ? referral.recipientName! : 'सर्व सदस्य')
        : (referral.giverName?.isNotEmpty == true ? referral.giverName! : 'समाज सदस्य');

    final otherMemberLabel = isGivenTab ? 'मिळालेला सदस्य:' : 'पाठवणारा सदस्य:';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E4D7), width: 1.1),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Urgency badge & Status Chip
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Urgency Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: getUrgencyBgColor(urgency),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: getUrgencyColor(urgency).withValues(alpha: 0.3),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.priority_high_rounded,
                            size: 12,
                            color: getUrgencyColor(urgency),
                          ),
                          const SizedBox(width: 3),
                          Text(
                            'महत्त्व: ${getUrgencyDisplayLabel(urgency)}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: getUrgencyColor(urgency),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Status Chip
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: getStatusBgColor(status),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: getStatusColor(status).withValues(alpha: 0.35),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: getStatusColor(status),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            getStatusDisplayLabel(status),
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: getStatusColor(status),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Lead Title
                Text(
                  referral.title.isNotEmpty ? referral.title : 'व्यवसाय संदर्भ',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2B1B12),
                    height: 1.25,
                  ),
                ),

                // Category tag if present
                if (referral.category != null && referral.category!.isNotEmpty) ...[
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7F1EB),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      referral.category!,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF7A6A5D),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 10),
                const Divider(color: Color(0xFFF5ECE2), height: 1),
                const SizedBox(height: 10),

                // Client Name & Masked Phone
                Row(
                  children: [
                    const Icon(Icons.person_pin_rounded, size: 16, color: Color(0xFFE65100)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        referral.clientName.isNotEmpty ? referral.clientName : 'ग्राहक',
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF3E2723),
                        ),
                      ),
                    ),
                    if (referral.maskedPhone.isNotEmpty)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.phone_rounded, size: 13, color: Color(0xFF8D7B6F)),
                          const SizedBox(width: 4),
                          Text(
                            referral.maskedPhone,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF7A6A5D),
                              letterSpacing: 0.3,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
                const SizedBox(height: 6),

                // Other member row
                Row(
                  children: [
                    Icon(
                      isGivenTab ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded,
                      size: 14,
                      color: const Color(0xFF8D7B6F),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      otherMemberLabel,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF8D7B6F),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        otherMemberName,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF4E342E),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Bottom row: Value & Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Value
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'मूल्य: ',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFF7A6A5D),
                          ),
                        ),
                        Text(
                          referral.value > 0
                              ? '₹${formatIndianNumber(referral.value.round())}'
                              : 'अंदाजे',
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: referral.value > 0 ? const Color(0xFF2E7D32) : const Color(0xFF7A6A5D),
                          ),
                        ),
                      ],
                    ),

                    // Date
                    if (referral.createdAt != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 12, color: Color(0xFF9E8E81)),
                          const SizedBox(width: 4),
                          Text(
                            _formatDate(referral.createdAt),
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF8D7B6F),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
