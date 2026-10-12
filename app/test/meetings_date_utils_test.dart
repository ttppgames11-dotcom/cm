import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:app/features/business/meetings/domain/utils/meeting_date_utils.dart';

void main() {
  group('MeetingDateUtils - Date Parsing', () {
    test('Parses Marathi textual date with Devanagari numerals', () {
      final date = MeetingDateUtils.parseTolerantDate('२० ऑक्टोबर २०२६');
      expect(date, isNotNull);
      expect(date!.year, 2026);
      expect(date.month, 10);
      expect(date.day, 20);
    });

    test('Parses Marathi textual date with various months', () {
      final d1 = MeetingDateUtils.parseTolerantDate('१५ जानेवारी २०२५');
      expect(d1, equals(DateTime(2025, 1, 15)));

      final d2 = MeetingDateUtils.parseTolerantDate('५ ऑगस्ट २०२४');
      expect(d2, equals(DateTime(2024, 8, 5)));

      final d3 = MeetingDateUtils.parseTolerantDate('३१ डिसेंबर २०२७');
      expect(d3, equals(DateTime(2027, 12, 31)));
    });

    test('Parses ISO date format', () {
      final date = MeetingDateUtils.parseTolerantDate('2026-10-20');
      expect(date, equals(DateTime(2026, 10, 20)));

      final dateIsoT = MeetingDateUtils.parseTolerantDate('2026-10-20T14:30:00Z');
      expect(dateIsoT, equals(DateTime(2026, 10, 20)));
    });

    test('Parses English date formats', () {
      final d1 = MeetingDateUtils.parseTolerantDate('20 October 2026');
      expect(d1, equals(DateTime(2026, 10, 20)));

      final d2 = MeetingDateUtils.parseTolerantDate('October 20, 2026');
      expect(d2, equals(DateTime(2026, 10, 20)));

      final d3 = MeetingDateUtils.parseTolerantDate('20-10-2026');
      expect(d3, equals(DateTime(2026, 10, 20)));

      final d4 = MeetingDateUtils.parseTolerantDate('20/10/2026');
      expect(d4, equals(DateTime(2026, 10, 20)));
    });

    test('Returns null for unparseable or empty dates', () {
      expect(MeetingDateUtils.parseTolerantDate(''), isNull);
      expect(MeetingDateUtils.parseTolerantDate(null), isNull);
      expect(MeetingDateUtils.parseTolerantDate('काहीतरी अनपेक्षित मजकूर'), isNull);
      expect(MeetingDateUtils.parseTolerantDate('invalid-date-string'), isNull);
    });
  });

  group('MeetingDateUtils - Marathi Formatting', () {
    test('formatMarathiDate formats correctly', () {
      final dt = DateTime(2026, 10, 20);
      final formatted = MeetingDateUtils.formatMarathiDate(dt);
      expect(formatted, '२० ऑक्टोबर २०२६');
    });

    test('formatMarathiTime formats morning, afternoon, evening, night correctly', () {
      expect(MeetingDateUtils.formatMarathiTime(const TimeOfDay(hour: 10, minute: 0)), 'सकाळी १०:००');
      expect(MeetingDateUtils.formatMarathiTime(const TimeOfDay(hour: 14, minute: 30)), 'दुपारी ०२:३०');
      expect(MeetingDateUtils.formatMarathiTime(const TimeOfDay(hour: 17, minute: 15)), 'संध्याकाळी ०५:१५');
      expect(MeetingDateUtils.formatMarathiTime(const TimeOfDay(hour: 21, minute: 45)), 'रात्री ०९:४५');
    });
  });

  group('MeetingDateUtils - Upcoming / Past Split', () {
    final today = DateTime(2026, 10, 10);

    test('Today date is Upcoming', () {
      final isUp = MeetingDateUtils.isUpcoming(
        dateStr: '१० ऑक्टोबर २०२६',
        status: 'निश्चित',
        referenceToday: today,
      );
      expect(isUp, isTrue);
    });

    test('Future date is Upcoming', () {
      final isUp = MeetingDateUtils.isUpcoming(
        dateStr: '२० ऑक्टोबर २०२६',
        status: 'Confirmed',
        referenceToday: today,
      );
      expect(isUp, isTrue);
    });

    test('Past date is not Upcoming (is Past)', () {
      final isUp = MeetingDateUtils.isUpcoming(
        dateStr: '०९ ऑक्टोबर २०२६',
        status: 'Confirmed',
        referenceToday: today,
      );
      expect(isUp, isFalse);
    });

    test('Future date with cancelled status is treated as Past', () {
      // Marathi status
      final isUp1 = MeetingDateUtils.isUpcoming(
        dateStr: '२० ऑक्टोबर २०२६',
        status: 'रद्द (Cancelled)',
        referenceToday: today,
      );
      expect(isUp1, isFalse);

      // English status
      final isUp2 = MeetingDateUtils.isUpcoming(
        dateStr: '2026-10-25',
        status: 'cancelled',
        referenceToday: today,
      );
      expect(isUp2, isFalse);
    });

    test('Unparseable date defaults to Upcoming (unless cancelled)', () {
      final isUp = MeetingDateUtils.isUpcoming(
        dateStr: 'तारीख निश्चित नाही',
        status: 'Confirmed',
        referenceToday: today,
      );
      expect(isUp, isTrue);

      final isCancelled = MeetingDateUtils.isUpcoming(
        dateStr: 'तारीख निश्चित नाही',
        status: 'रद्द',
        referenceToday: today,
      );
      expect(isCancelled, isFalse);
    });
  });
}
