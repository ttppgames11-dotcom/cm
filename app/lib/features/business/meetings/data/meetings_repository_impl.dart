import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import '../domain/models/meeting.dart';
import '../domain/models/meeting_member.dart';
import '../domain/repositories/meetings_repository.dart';
import 'meetings_sample_data.dart';

class MeetingsRepositoryImpl implements MeetingsRepository {
  MeetingsRepositoryImpl(this._api);

  final ApiClient _api;

  @override
  Future<List<Meeting>> getMeetings({String? memberId}) async {
    try {
      final query = (memberId != null && memberId.isNotEmpty) ? '?memberId=$memberId' : '';
      final res = await _api.get('/api/sangam/meetings$query', auth: true);

      final dataObj = res['data'];
      dynamic rawList;
      if (dataObj is Map && dataObj['meetings'] != null) {
        rawList = dataObj['meetings'];
      } else if (res['meetings'] != null) {
        rawList = res['meetings'];
      } else if (dataObj is List) {
        rawList = dataObj;
      }

      if (rawList is List) {
        return rawList
            .whereType<Map>()
            .map((item) => Meeting.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {
      if (ApiConfig.demoMode) {
        return getSampleMeetings();
      }
      rethrow;
    }

    if (ApiConfig.demoMode) {
      return getSampleMeetings();
    }
    return [];
  }

  @override
  Future<Meeting> createMeeting({
    required String recipientId,
    required String recipientName,
    required String date,
    String? time,
    String? topic,
    String? location,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      'recipientId': recipientId.trim(),
      'recipient_id': recipientId.trim(),
      'recipientName': recipientName.trim(),
      'recipient_name': recipientName.trim(),
      'date': date.trim(),
      if (time != null && time.trim().isNotEmpty) 'time': time.trim(),
      if (topic != null && topic.trim().isNotEmpty) 'topic': topic.trim(),
      if (location != null && location.trim().isNotEmpty) 'location': location.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };

    final res = await _api.post('/api/sangam/meetings', body: body, auth: true);

    final dataObj = res['data'];
    Map<String, dynamic> rawMeeting;
    if (dataObj is Map && dataObj['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj['meeting'] as Map);
    } else if (res['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(res['meeting'] as Map);
    } else if (dataObj is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj);
    } else {
      rawMeeting = res;
    }

    return Meeting.fromJson(rawMeeting);
  }

  @override
  Future<Meeting> rescheduleMeeting(
    String meetingId, {
    required String date,
    String? time,
    String? location,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      'date': date.trim(),
      if (time != null && time.trim().isNotEmpty) 'time': time.trim(),
      if (location != null && location.trim().isNotEmpty) 'location': location.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };

    final res = await _api.put(
      '/api/sangam/meetings/$meetingId',
      body: body,
      auth: true,
    );

    final dataObj = res['data'];
    Map<String, dynamic> rawMeeting;
    if (dataObj is Map && dataObj['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj['meeting'] as Map);
    } else if (res['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(res['meeting'] as Map);
    } else if (dataObj is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj);
    } else {
      rawMeeting = res;
    }

    return Meeting.fromJson(rawMeeting);
  }

  @override
  Future<Meeting> updateMeetingStatus(
    String meetingId, {
    required String status,
  }) async {
    final body = <String, dynamic>{
      'status': status,
    };

    final res = await _api.put(
      '/api/sangam/meetings/$meetingId/status',
      body: body,
      auth: true,
    );

    final dataObj = res['data'];
    Map<String, dynamic> rawMeeting;
    if (dataObj is Map && dataObj['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj['meeting'] as Map);
    } else if (res['meeting'] is Map) {
      rawMeeting = Map<String, dynamic>.from(res['meeting'] as Map);
    } else if (dataObj is Map) {
      rawMeeting = Map<String, dynamic>.from(dataObj);
    } else {
      rawMeeting = res;
    }

    return Meeting.fromJson(rawMeeting);
  }

  @override
  Future<List<MeetingMember>> searchMembers(String query, {int limit = 10}) async {
    final trimmed = query.trim();
    final encoded = Uri.encodeQueryComponent(trimmed);
    final res = await _api.get('/api/members?search=$encoded&limit=$limit', auth: false);

    final dataObj = res['data'];
    dynamic rawList;
    if (dataObj is Map && dataObj['members'] != null) {
      rawList = dataObj['members'];
    } else if (res['members'] != null) {
      rawList = res['members'];
    } else if (dataObj is List) {
      rawList = dataObj;
    }

    if (rawList is List) {
      return rawList
          .whereType<Map>()
          .map((item) => MeetingMember.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }
    return [];
  }
}
