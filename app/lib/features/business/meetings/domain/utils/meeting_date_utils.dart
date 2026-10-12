import 'package:flutter/material.dart';

/// Utilities for parsing, formatting, and sorting meeting dates in Marathi, ISO, and English formats.
class MeetingDateUtils {
  static const Map<int, String> marathiMonths = {
    1: 'जानेवारी',
    2: 'फेब्रुवारी',
    3: 'मार्च',
    4: 'एप्रिल',
    5: 'मे',
    6: 'जून',
    7: 'जुलै',
    8: 'ऑगस्ट',
    9: 'सप्टेंबर',
    10: 'ऑक्टोबर',
    11: 'नोव्हेंबर',
    12: 'डिसेंबर',
  };

  static const Map<String, int> monthLookup = {
    'जानेवारी': 1,
    'फेब्रुवारी': 2,
    'मार्च': 3,
    'एप्रिल': 4,
    'मे': 5,
    'जून': 6,
    'जुलै': 7,
    'ऑगस्ट': 8,
    'सप्टेंबर': 9,
    'ऑक्टोबर': 10,
    'नोव्हेंबर': 11,
    'डिसेंबर': 12,
    // English month names
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
  };

  static const Map<String, String> _devanagariToAscii = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };

  static const Map<String, String> _asciiToDevanagari = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  };

  /// Converts any Devanagari numerals in the text to ASCII digits 0-9.
  static String toAsciiDigits(String input) {
    var result = input;
    _devanagariToAscii.forEach((deva, ascii) {
      result = result.replaceAll(deva, ascii);
    });
    return result;
  }

  /// Converts ASCII digits 0-9 to Devanagari numerals ०-९.
  static String toDevanagariDigits(int number, {int minDigits = 1}) {
    final str = number.toString().padLeft(minDigits, '0');
    var result = '';
    for (int i = 0; i < str.length; i++) {
      final char = str[i];
      result += _asciiToDevanagari[char] ?? char;
    }
    return result;
  }

  /// Formats a [DateTime] to Marathi text: "२० ऑक्टोबर २०२६"
  static String formatMarathiDate(DateTime date) {
    final dayStr = toDevanagariDigits(date.day);
    final monthStr = marathiMonths[date.month] ?? '';
    final yearStr = toDevanagariDigits(date.year);
    return '$dayStr $monthStr $yearStr';
  }

  /// Formats a [TimeOfDay] into Marathi: "सकाळी १०:००", "दुपारी ०२:३०", "संध्याकाळी ०५:००", "रात्री ०९:१५"
  static String formatMarathiTime(TimeOfDay time) {
    String period;
    final hour24 = time.hour;
    if (hour24 >= 4 && hour24 < 12) {
      period = 'सकाळी';
    } else if (hour24 >= 12 && hour24 < 16) {
      period = 'दुपारी';
    } else if (hour24 >= 16 && hour24 < 20) {
      period = 'संध्याकाळी';
    } else {
      period = 'रात्री';
    }

    int hour12 = hour24 % 12;
    if (hour12 == 0) hour12 = 12;

    final hourStr = toDevanagariDigits(hour12, minDigits: 2);
    final minStr = toDevanagariDigits(time.minute, minDigits: 2);

    return '$period $hourStr:$minStr';
  }

  /// Tolerant date parser accepting:
  /// 1. Marathi textual dates: "२० ऑक्टोबर २०२६"
  /// 2. ISO dates: "2026-10-20" or "2026-10-20T10:00:00Z"
  /// 3. English textual dates: "20 October 2026", "October 20, 2026", "20-10-2026", "20/10/2026"
  /// Returns a normalized [DateTime] (date only, year/month/day at 00:00:00) or `null` if unparseable.
  static DateTime? parseTolerantDate(String? raw) {
    if (raw == null || raw.trim().isEmpty) return null;

    final cleaned = raw.trim();

    // 1. Try standard ISO parse
    try {
      final iso = DateTime.tryParse(cleaned);
      if (iso != null) {
        return DateTime(iso.year, iso.month, iso.day);
      }
    } catch (_) {}

    // Convert Devanagari numerals to ASCII for unified token parsing
    final ascii = toAsciiDigits(cleaned);

    // 2. Try regex for "DD-MM-YYYY" or "DD/MM/YYYY"
    final dmyMatch = RegExp(r'^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$').firstMatch(ascii);
    if (dmyMatch != null) {
      final d = int.tryParse(dmyMatch.group(1)!);
      final m = int.tryParse(dmyMatch.group(2)!);
      final y = int.tryParse(dmyMatch.group(3)!);
      if (d != null && m != null && y != null && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return DateTime(y, m, d);
      }
    }

    // 3. Try regex for "YYYY-MM-DD" or "YYYY/MM/DD"
    final ymdMatch = RegExp(r'^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$').firstMatch(ascii);
    if (ymdMatch != null) {
      final y = int.tryParse(ymdMatch.group(1)!);
      final m = int.tryParse(ymdMatch.group(2)!);
      final d = int.tryParse(ymdMatch.group(3)!);
      if (d != null && m != null && y != null && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return DateTime(y, m, d);
      }
    }

    // 4. Tokenize by whitespace, commas, dashes
    // e.g., "२० ऑक्टोबर २०२६" -> ["20", "ऑक्टोबर", "2026"]
    // "20 October 2026" -> ["20", "October", "2026"]
    // "October 20, 2026" -> ["October", "20", "2026"]
    final tokens = ascii
        .replaceAll(RegExp(r'[,.]'), ' ')
        .split(RegExp(r'\s+'))
        .where((t) => t.isNotEmpty)
        .toList();

    int? day;
    int? month;
    int? year;

    for (final token in tokens) {
      final lower = token.toLowerCase();
      // Check if it's a month name
      if (monthLookup.containsKey(lower)) {
        month = monthLookup[lower];
        continue;
      }

      // Check if it's an integer
      final num = int.tryParse(token);
      if (num != null) {
        if (num > 1000) {
          year = num;
        } else if (num >= 1 && num <= 31) {
          if (day == null) {
            day = num;
          } else if (year == null && num > 31) {
            year = num;
          }
        }
      }
    }

    if (day != null && month != null && year != null) {
      return DateTime(year, month, day);
    }

    return null;
  }

  /// Determines whether a meeting is Upcoming or Past.
  /// - Upcoming means date is today or later.
  /// - Past means before today.
  /// - Also treats status containing "रद्द" or "cancel" as Past.
  /// - If date cannot be parsed, treats the meeting as Upcoming.
  static bool isUpcoming({
    required String? dateStr,
    required String? status,
    DateTime? referenceToday,
  }) {
    // If status contains 'रद्द' or 'cancel' -> always Past
    final st = (status ?? '').toLowerCase();
    if (st.contains('रद्द') || st.contains('cancel')) {
      return false;
    }

    final parsedDate = parseTolerantDate(dateStr);
    if (parsedDate == null) {
      // If a date cannot be parsed, treat the meeting as Upcoming
      return true;
    }

    final today = referenceToday != null
        ? DateTime(referenceToday.year, referenceToday.month, referenceToday.day)
        : () {
            final now = DateTime.now();
            return DateTime(now.year, now.month, now.day);
          }();

    return !parsedDate.isBefore(today);
  }
}
