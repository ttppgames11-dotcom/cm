import '../models/meeting.dart';
import '../models/meeting_member.dart';

/// Repository interface for 1-to-1 Meetings operations.
abstract class MeetingsRepository {
  /// Fetches meetings where the member is requester or recipient.
  Future<List<Meeting>> getMeetings({String? memberId});

  /// Requests / schedules a new 1-to-1 meeting.
  Future<Meeting> createMeeting({
    required String recipientId,
    required String recipientName,
    required String date,
    String? time,
    String? topic,
    String? location,
    String? notes,
  });

  /// Reschedules an existing meeting.
  Future<Meeting> rescheduleMeeting(
    String meetingId, {
    required String date,
    String? time,
    String? location,
    String? notes,
  });

  /// Updates meeting status ("cancelled" or "completed").
  Future<Meeting> updateMeetingStatus(
    String meetingId, {
    required String status,
  });

  /// Public member search (returning only id, name, profession, city).
  Future<List<MeetingMember>> searchMembers(String query, {int limit = 10});
}
