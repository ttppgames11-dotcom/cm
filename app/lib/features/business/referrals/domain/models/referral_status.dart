import 'package:flutter/material.dart';

/// Normalized Referral status classifications based on business logic.
enum ReferralStatusClass {
  newStatus,
  contacted,
  closed,
}

/// Constants sent to backend when updating status.
const String kStatusApiNew = 'नवीन (New)';
const String kStatusApiContacted = 'संपर्क साधला (Contacted)';
const String kStatusApiClosedWon = 'यशस्वी क्लोज (Closed Won)';

/// Classifies any raw status string (case-insensitive) into one of 3 states:
/// - Closed: contains 'क्लोज', 'closed', 'won', or 'success'
/// - Contacted: contains 'संपर्क', 'contact', or 'proposal'
/// - New: everything else
ReferralStatusClass classifyReferralStatus(String? raw) {
  if (raw == null) return ReferralStatusClass.newStatus;
  final s = raw.toLowerCase().trim();
  if (s.isEmpty) return ReferralStatusClass.newStatus;

  if (s.contains('क्लोज') ||
      s.contains('closed') ||
      s.contains('won') ||
      s.contains('success')) {
    return ReferralStatusClass.closed;
  }

  if (s.contains('संपर्क') ||
      s.contains('contact') ||
      s.contains('proposal')) {
    return ReferralStatusClass.contacted;
  }

  return ReferralStatusClass.newStatus;
}

/// Returns the Marathi localized display label for a status classification.
String getStatusDisplayLabel(ReferralStatusClass statusClass) {
  switch (statusClass) {
    case ReferralStatusClass.newStatus:
      return 'नवीन';
    case ReferralStatusClass.contacted:
      return 'संपर्क साधला';
    case ReferralStatusClass.closed:
      return 'यशस्वी क्लोज';
  }
}

/// Returns the exact API string to send to backend for a status classification.
String getStatusApiValue(ReferralStatusClass statusClass) {
  switch (statusClass) {
    case ReferralStatusClass.newStatus:
      return kStatusApiNew;
    case ReferralStatusClass.contacted:
      return kStatusApiContacted;
    case ReferralStatusClass.closed:
      return kStatusApiClosedWon;
  }
}

/// Colors for status badges.
Color getStatusColor(ReferralStatusClass statusClass) {
  switch (statusClass) {
    case ReferralStatusClass.newStatus:
      return const Color(0xFF1976D2); // Blue
    case ReferralStatusClass.contacted:
      return const Color(0xFFF57C00); // Amber/Orange
    case ReferralStatusClass.closed:
      return const Color(0xFF2E7D32); // Green
  }
}

Color getStatusBgColor(ReferralStatusClass statusClass) {
  switch (statusClass) {
    case ReferralStatusClass.newStatus:
      return const Color(0xFFE3F2FD);
    case ReferralStatusClass.contacted:
      return const Color(0xFFFFF3E0);
    case ReferralStatusClass.closed:
      return const Color(0xFFE8F5E9);
  }
}

/// Urgency levels.
enum ReferralUrgency {
  low,
  medium,
  high,
}

const String kUrgencyApiLow = 'कमी (Low)';
const String kUrgencyApiMedium = 'मध्यम (Medium)';
const String kUrgencyApiHigh = 'जास्त (High)';

/// Parses urgency string into [ReferralUrgency]. Treat missing or unknown as medium.
ReferralUrgency parseReferralUrgency(String? raw) {
  if (raw == null) return ReferralUrgency.medium;
  final s = raw.toLowerCase().trim();
  if (s.isEmpty) return ReferralUrgency.medium;

  if (s.contains('कमी') || s.contains('low')) {
    return ReferralUrgency.low;
  }
  if (s.contains('जास्त') || s.contains('high') || s.contains('urgent')) {
    return ReferralUrgency.high;
  }
  return ReferralUrgency.medium;
}

String getUrgencyApiValue(ReferralUrgency urgency) {
  switch (urgency) {
    case ReferralUrgency.low:
      return kUrgencyApiLow;
    case ReferralUrgency.medium:
      return kUrgencyApiMedium;
    case ReferralUrgency.high:
      return kUrgencyApiHigh;
  }
}

String getUrgencyDisplayLabel(ReferralUrgency urgency) {
  switch (urgency) {
    case ReferralUrgency.low:
      return 'कमी';
    case ReferralUrgency.medium:
      return 'मध्यम';
    case ReferralUrgency.high:
      return 'जास्त';
  }
}

Color getUrgencyColor(ReferralUrgency urgency) {
  switch (urgency) {
    case ReferralUrgency.low:
      return const Color(0xFF558B2F);
    case ReferralUrgency.medium:
      return const Color(0xFFE65100);
    case ReferralUrgency.high:
      return const Color(0xFFC62828);
  }
}

Color getUrgencyBgColor(ReferralUrgency urgency) {
  switch (urgency) {
    case ReferralUrgency.low:
      return const Color(0xFFF1F8E9);
    case ReferralUrgency.medium:
      return const Color(0xFFFFF3E0);
    case ReferralUrgency.high:
      return const Color(0xFFFFEBEE);
  }
}

/// Validates Indian mobile number: 10 digits starting with 6-9, optional +91/91/0 prefix.
bool isValidIndianPhone(String? phone) {
  if (phone == null) return false;
  final trimmed = phone.trim().replaceAll(RegExp(r'[\s\-]'), '');
  if (trimmed.isEmpty) return false;
  final regex = RegExp(r'^(?:\+91|91|0)?[6-9]\d{9}$');
  return regex.hasMatch(trimmed);
}

/// Masks client phone number for list display (e.g., +91 98XXXXXX21 or 98XXXXXX21).
String maskPhoneNumber(String? phone) {
  if (phone == null || phone.trim().isEmpty) return '';
  final cleaned = phone.trim();

  // Extract digits
  final digitsOnly = cleaned.replaceAll(RegExp(r'\D'), '');
  if (digitsOnly.length < 10) return cleaned;

  // Get last 10 digits
  final main10 = digitsOnly.substring(digitsOnly.length - 10);
  final first2 = main10.substring(0, 2);
  final last2 = main10.substring(8);
  final hasCountryCode = cleaned.startsWith('+91') || digitsOnly.length > 10;

  if (hasCountryCode) {
    return '+91 ${first2}XXXXXX$last2';
  }
  return '${first2}XXXXXX$last2';
}
