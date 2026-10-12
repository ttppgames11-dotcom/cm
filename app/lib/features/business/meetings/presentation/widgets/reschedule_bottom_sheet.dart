import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/meeting.dart';
import '../../domain/utils/meeting_date_utils.dart';
import '../providers/meetings_providers.dart';

class RescheduleBottomSheet extends ConsumerStatefulWidget {
  const RescheduleBottomSheet({
    super.key,
    required this.meeting,
  });

  final Meeting meeting;

  static Future<bool?> show(BuildContext context, Meeting meeting) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => RescheduleBottomSheet(meeting: meeting),
    );
  }

  @override
  ConsumerState<RescheduleBottomSheet> createState() => _RescheduleBottomSheetState();
}

class _RescheduleBottomSheetState extends ConsumerState<RescheduleBottomSheet> {
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;
  late TextEditingController _locationController;
  late TextEditingController _notesController;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final parsed = MeetingDateUtils.parseTolerantDate(widget.meeting.date);
    final now = DateTime.now();
    _selectedDate = (parsed != null && !parsed.isBefore(DateTime(now.year, now.month, now.day)))
        ? parsed
        : now;
    _selectedTime = const TimeOfDay(hour: 11, minute: 0);
    _locationController = TextEditingController(text: widget.meeting.location ?? '');
    _notesController = TextEditingController(text: widget.meeting.notes ?? '');
  }

  @override
  void dispose() {
    _locationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'बैठकीची तारीख निवडा',
      confirmText: 'निश्चित करा',
      cancelText: 'रद्द',
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      helpText: 'बैठकीची वेळ निवडा',
      confirmText: 'निश्चित करा',
      cancelText: 'रद्द',
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<void> _submit() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);

    final marathiDate = MeetingDateUtils.formatMarathiDate(_selectedDate);
    final marathiTime = MeetingDateUtils.formatMarathiTime(_selectedTime);

    try {
      final success = await ref.read(meetingsProvider.notifier).rescheduleMeeting(
            widget.meeting.id,
            date: marathiDate,
            time: marathiTime,
            location: _locationController.text.trim(),
            notes: _notesController.text.trim(),
          );
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('बैठक यशस्वीरित्या पुनर्नियोजित केली!'),
              backgroundColor: Color(0xFF2E7D32),
            ),
          );
          Navigator.of(context).pop(true);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('पुनर्नियोजन अयशस्वी: ${e.toString()}'),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = MeetingDateUtils.formatMarathiDate(_selectedDate);
    final formattedTime = MeetingDateUtils.formatMarathiTime(_selectedTime);

    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF3E0),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.schedule_rounded,
                    color: Color(0xFFE65100),
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'वेळ बदला (Reschedule Meeting)',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'तारीख निवडा',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF5D4037),
              ),
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF7F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE0D5C9)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_rounded, size: 18, color: Color(0xFFE65100)),
                    const SizedBox(width: 10),
                    Text(
                      formattedDate,
                      style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Color(0xFF2B1B12)),
                    ),
                    const Spacer(),
                    const Text('बदला', style: TextStyle(fontSize: 12.5, color: Color(0xFFE65100), fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'वेळ निवडा',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF5D4037),
              ),
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: _pickTime,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF7F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE0D5C9)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 18, color: Color(0xFFE65100)),
                    const SizedBox(width: 10),
                    Text(
                      formattedTime,
                      style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Color(0xFF2B1B12)),
                    ),
                    const Spacer(),
                    const Text('बदला', style: TextStyle(fontSize: 12.5, color: Color(0xFFE65100), fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'स्थान (पर्यायी)',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFF5D4037),
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _locationController,
              decoration: InputDecoration(
                hintText: 'उदा. पुणे किंवा ऑनलाइन',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.5),
                prefixIcon: const Icon(Icons.place_outlined, size: 20, color: Color(0xFF7A6A5D)),
                filled: true,
                fillColor: const Color(0xFFFAF7F2),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE65100),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text(
                        'नवीन वेळ जतन करा',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
