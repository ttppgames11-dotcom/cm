import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/providers/auth_provider.dart';
import '../../domain/models/meeting.dart';
import '../providers/meetings_providers.dart';
import 'reschedule_bottom_sheet.dart';

class MeetingCard extends ConsumerWidget {
  const MeetingCard({
    super.key,
    required this.meeting,
    required this.isUpcoming,
  });

  final Meeting meeting;
  final bool isUpcoming;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authController = ref.watch(authControllerProvider);
    final myId = authController.state.profile?.id ?? '';
    final actionsUnsupported = ref.watch(meetingActionsUnsupportedProvider);

    final isMeRequester = meeting.requesterId == myId ||
        (myId.isNotEmpty && meeting.requesterId == null && meeting.recipientId != myId);

    final otherPersonName = isMeRequester
        ? (meeting.recipientName?.isNotEmpty == true ? meeting.recipientName! : 'सदस्य')
        : (meeting.requesterName?.isNotEmpty == true ? meeting.requesterName! : 'सदस्य');

    final roleLabel = isMeRequester ? 'तुम्ही विनंती केली' : 'तुम्हाला विनंती आली';

    // Status chip determination
    final statusStr = meeting.status ?? 'Confirmed';
    final isCancelled = statusStr.toLowerCase().contains('cancel') || statusStr.contains('रद्द');
    final isCompleted = statusStr.toLowerCase().contains('complete') || statusStr.contains('पूर्ण');

    Color statusColor;
    Color statusBg;
    String statusText;

    if (isCancelled) {
      statusColor = const Color(0xFFC62828);
      statusBg = const Color(0xFFFFEBEE);
      statusText = 'रद्द';
    } else if (isCompleted) {
      statusColor = const Color(0xFF1565C0);
      statusBg = const Color(0xFFE3F2FD);
      statusText = 'पूर्ण';
    } else {
      statusColor = const Color(0xFF2E7D32);
      statusBg = const Color(0xFFE8F5E9);
      statusText = 'निश्चित';
    }

    final isOnline = (meeting.location ?? '').toLowerCase().contains('ऑनलाइन') ||
        (meeting.location ?? '').toLowerCase().contains('online');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEDE3D8), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Role Badge + Status Chip
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isMeRequester ? const Color(0xFFFFF3E0) : const Color(0xFFEFEBE9),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isMeRequester ? const Color(0xFFFFCC80) : const Color(0xFFD7CCC8),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isMeRequester ? Icons.call_made_rounded : Icons.call_received_rounded,
                        size: 13,
                        color: isMeRequester ? const Color(0xFFE65100) : const Color(0xFF5D4037),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        roleLabel,
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: isMeRequester ? const Color(0xFFE65100) : const Color(0xFF5D4037),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        statusText,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Person Name & Avatar
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: const Color(0xFFFFE0B2),
                  child: Text(
                    otherPersonName.isNotEmpty ? otherPersonName[0] : 'म',
                    style: const TextStyle(
                      color: Color(0xFFE65100),
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        otherPersonName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      if (meeting.topic != null && meeting.topic!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            meeting.topic!,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF8D6E63),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),
            const Divider(height: 1, color: Color(0xFFF0E5D8)),
            const SizedBox(height: 12),

            // Date and Time Row
            Row(
              children: [
                const Icon(Icons.calendar_today_rounded, size: 15, color: Color(0xFFE65100)),
                const SizedBox(width: 6),
                Text(
                  meeting.date ?? 'तारीख निश्चित नाही',
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF3E2723),
                  ),
                ),
                if (meeting.time != null && meeting.time!.isNotEmpty) ...[
                  const SizedBox(width: 12),
                  const Icon(Icons.access_time_rounded, size: 15, color: Color(0xFFE65100)),
                  const SizedBox(width: 4),
                  Text(
                    meeting.time!,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF5D4037),
                    ),
                  ),
                ],
              ],
            ),

            // Location Row
            if (meeting.location != null && meeting.location!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(
                    isOnline ? Icons.videocam_rounded : Icons.location_on_rounded,
                    size: 16,
                    color: isOnline ? const Color(0xFF1976D2) : const Color(0xFFE65100),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      meeting.location!,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isOnline ? const Color(0xFF1565C0) : const Color(0xFF6D4C41),
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Notes Row if present
            if (meeting.notes != null && meeting.notes!.trim().isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF7F2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  meeting.notes!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6D4C41),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],

            // Action Buttons
            if (isUpcoming && !isCancelled && !actionsUnsupported) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        RescheduleBottomSheet.show(context, meeting);
                      },
                      icon: const Icon(Icons.edit_calendar_rounded, size: 16),
                      label: const Text('वेळ बदला'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFE65100),
                        side: const BorderSide(color: Color(0xFFE65100)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _confirmCancel(context, ref),
                      icon: const Icon(Icons.cancel_outlined, size: 16),
                      label: const Text('रद्द करा'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFC62828),
                        side: const BorderSide(color: Color(0xFFEF9A9A)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                    ),
                  ),
                ],
              ),
            ] else if (!isUpcoming && !isCancelled && !isCompleted && !actionsUnsupported) ...[
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _markCompleted(context, ref),
                  icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                  label: const Text('पूर्ण झाली (Mark Completed)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _confirmCancel(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('बैठक रद्द करावी का?'),
        content: const Text('तुम्हाला ही व्यवसाय बैठक खरोखर रद्द करायची आहे का?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('नाही'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(dialogCtx).pop();
              try {
                await ref.read(meetingsProvider.notifier).cancelMeeting(meeting.id);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('बैठक रद्द करण्यात आली.'),
                      backgroundColor: Color(0xFFD32F2F),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('रद्द करणे अयशस्वी: $e'),
                      backgroundColor: const Color(0xFFD32F2F),
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFC62828),
              foregroundColor: Colors.white,
            ),
            child: const Text('हो, रद्द करा'),
          ),
        ],
      ),
    );
  }

  void _markCompleted(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(meetingsProvider.notifier).completeMeeting(meeting.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('बैठक पूर्ण म्हणून नोंदवली गेली.'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('स्थिती बदलणे अयशस्वी: $e'),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    }
  }
}
