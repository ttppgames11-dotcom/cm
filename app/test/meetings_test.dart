import 'package:flutter_test/flutter_test.dart';
import 'package:app/features/business/meetings/domain/models/meeting.dart';
import 'package:app/features/business/meetings/domain/models/meeting_member.dart';
import 'package:app/features/business/meetings/domain/utils/meeting_date_utils.dart';
import 'package:app/features/business/meetings/data/meetings_sample_data.dart';

void main() {
  group('Meeting Model - Defensive JSON Parsing', () {
    test('Defensively parses complete meeting JSON', () {
      final json = {
        'id': 'MT-999',
        'requesterId': 'M1001',
        'requesterName': 'अमोल जाधव',
        'recipientId': 'M1002',
        'recipientName': 'प्रिया देशमुख',
        'date': '२० ऑक्टोबर २०२६',
        'time': 'सकाळी ११:००',
        'topic': 'भागीदारी',
        'location': 'पुणे',
        'status': 'Confirmed',
        'notes': 'चर्चा',
        'createdAt': '2026-10-08T12:00:00Z',
      };

      final meeting = Meeting.fromJson(json);
      expect(meeting.id, 'MT-999');
      expect(meeting.requesterId, 'M1001');
      expect(meeting.requesterName, 'अमोल जाधव');
      expect(meeting.recipientId, 'M1002');
      expect(meeting.recipientName, 'प्रिया देशमुख');
      expect(meeting.date, '२० ऑक्टोबर २०२६');
      expect(meeting.time, 'सकाळी ११:००');
      expect(meeting.topic, 'भागीदारी');
      expect(meeting.location, 'पुणे');
      expect(meeting.status, 'Confirmed');
      expect(meeting.notes, 'चर्चा');
      expect(meeting.createdAt, equals(DateTime.parse('2026-10-08T12:00:00Z')));
    });

    test('Defensively parses snake_case keys from database', () {
      final json = {
        'id': 'MT-888',
        'requester_id': 'M1005',
        'requester_name': 'सचिन कदम',
        'recipient_id': 'M1008',
        'recipient_name': 'विकास गायकवाड',
        'date': '२५ ऑक्टोबर २०२६',
        'time': 'दुपारी ०२:००',
        'location': 'ऑनलाइन (Online)',
        'created_at': '2026-10-09T08:30:00Z',
      };

      final meeting = Meeting.fromJson(json);
      expect(meeting.id, 'MT-888');
      expect(meeting.requesterId, 'M1005');
      expect(meeting.requesterName, 'सचिन कदम');
      expect(meeting.recipientId, 'M1008');
      expect(meeting.recipientName, 'विकास गायकवाड');
      expect(meeting.location, 'ऑनलाइन (Online)');
      expect(meeting.createdAt, equals(DateTime.parse('2026-10-09T08:30:00Z')));
    });

    test('Defensively parses when all fields except id are missing or null', () {
      final json = <String, dynamic>{'id': 12345};

      final meeting = Meeting.fromJson(json);
      expect(meeting.id, '12345');
      expect(meeting.requesterId, isNull);
      expect(meeting.requesterName, isNull);
      expect(meeting.recipientId, isNull);
      expect(meeting.recipientName, isNull);
      expect(meeting.date, isNull);
      expect(meeting.time, isNull);
      expect(meeting.topic, isNull);
      expect(meeting.location, isNull);
      expect(meeting.status, isNull);
      expect(meeting.notes, isNull);
      expect(meeting.createdAt, isNull);
    });

    test('toJson and copyWith function as expected', () {
      final m = Meeting(
        id: 'M-1',
        requesterId: 'R1',
        date: '१० ऑक्टोबर २०२६',
      );
      final updated = m.copyWith(date: '१२ ऑक्टोबर २०२६', status: 'Confirmed');
      expect(updated.id, 'M-1');
      expect(updated.date, '१२ ऑक्टोबर २०२६');
      expect(updated.status, 'Confirmed');

      final json = updated.toJson();
      expect(json['id'], 'M-1');
      expect(json['date'], '१२ ऑक्टोबर २०२६');
      expect(json['status'], 'Confirmed');
    });
  });

  group('MeetingMember - Privacy Compliance', () {
    test('Exposes only name, profession, city and NEVER phone or email', () {
      final json = {
        'id': 'M1001',
        'name': 'अमोल जाधव',
        'profession': 'सॉफ्टवेअर अभियंता',
        'city': 'पुणे',
        'phone': '9876543210',
        'email': 'amol@example.com',
        'password': 'secretPassword',
      };

      final member = MeetingMember.fromJson(json);
      expect(member.id, 'M1001');
      expect(member.name, 'अमोल जाधव');
      expect(member.profession, 'सॉफ्टवेअर अभियंता');
      expect(member.city, 'पुणे');

      final exported = member.toJson();
      expect(exported.containsKey('phone'), isFalse);
      expect(exported.containsKey('email'), isFalse);
      expect(exported.containsKey('password'), isFalse);
    });
  });

  group('Sample Data & Sorting Logic', () {
    test('Sample meetings contain valid upcoming and past items', () {
      final samples = getSampleMeetings();
      expect(samples.length, greaterThanOrEqualTo(4));

      final upcoming = samples
          .where((m) => MeetingDateUtils.isUpcoming(dateStr: m.date, status: m.status))
          .toList();
      final past = samples
          .where((m) => !MeetingDateUtils.isUpcoming(dateStr: m.date, status: m.status))
          .toList();

      expect(upcoming.isNotEmpty, isTrue);
      expect(past.isNotEmpty, isTrue);
    });
  });
}
