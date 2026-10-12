import 'package:flutter/material.dart';

import '../../domain/models/referral_status.dart';

class ReferralStepIndicator extends StatelessWidget {
  const ReferralStepIndicator({
    super.key,
    required this.statusClass,
    this.createdAt,
  });

  final ReferralStatusClass statusClass;
  final DateTime? createdAt;

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
    // Current step index: 0 = newStatus, 1 = contacted, 2 = closed
    final currentStep = switch (statusClass) {
      ReferralStatusClass.newStatus => 0,
      ReferralStatusClass.contacted => 1,
      ReferralStatusClass.closed => 2,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E4D7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'रेफरल प्रगती',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2B1B12),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildStepNode(
                stepIndex: 0,
                currentStep: currentStep,
                title: 'नवीन नोंद',
                subtitle: createdAt != null ? _formatDate(createdAt) : null,
                icon: Icons.add_circle_outline_rounded,
              ),
              Expanded(
                child: _buildConnector(isDone: currentStep >= 1),
              ),
              _buildStepNode(
                stepIndex: 1,
                currentStep: currentStep,
                title: 'संपर्क साधला',
                subtitle: null, // Do NOT invent dates for other steps
                icon: Icons.chat_bubble_outline_rounded,
              ),
              Expanded(
                child: _buildConnector(isDone: currentStep >= 2),
              ),
              _buildStepNode(
                stepIndex: 2,
                currentStep: currentStep,
                title: 'यशस्वी क्लोज',
                subtitle: null, // Do NOT invent dates for other steps
                icon: Icons.check_circle_outline_rounded,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStepNode({
    required int stepIndex,
    required int currentStep,
    required String title,
    required String? subtitle,
    required IconData icon,
  }) {
    final isPassed = currentStep > stepIndex;
    final isCurrent = currentStep == stepIndex;
    final isUpcoming = currentStep < stepIndex;

    Color nodeBgColor;
    Color iconColor;
    if (isPassed) {
      nodeBgColor = const Color(0xFF2E7D32); // Green
      iconColor = Colors.white;
    } else if (isCurrent) {
      nodeBgColor = const Color(0xFFE65100); // Active Orange
      iconColor = Colors.white;
    } else {
      nodeBgColor = const Color(0xFFF5ECE2); // Inactive
      iconColor = const Color(0xFFBCAAA4);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: nodeBgColor,
            shape: BoxShape.circle,
            boxShadow: isCurrent
                ? [
                    BoxShadow(
                      color: const Color(0xFFE65100).withValues(alpha: 0.35),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: isPassed
                ? const Icon(Icons.check_rounded, color: Colors.white, size: 20)
                : Icon(icon, color: iconColor, size: 19),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          title,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: isCurrent || isPassed ? FontWeight.w700 : FontWeight.w500,
            color: isUpcoming ? const Color(0xFF9E8E81) : const Color(0xFF2B1B12),
          ),
          textAlign: TextAlign.center,
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 10,
              color: Color(0xFF8D7B6F),
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildConnector({required bool isDone}) {
    return Container(
      height: 3,
      margin: const EdgeInsets.only(bottom: 22, left: 4, right: 4),
      decoration: BoxDecoration(
        color: isDone ? const Color(0xFF2E7D32) : const Color(0xFFEADBCE),
        borderRadius: BorderRadius.circular(1.5),
      ),
    );
  }
}
