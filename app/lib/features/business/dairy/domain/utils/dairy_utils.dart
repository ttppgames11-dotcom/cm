import 'package:flutter/material.dart';

class DairyCategoryInfo {
  final String emoji;
  final Color bgColor;
  final Color textColor;
  final Color accentColor;

  const DairyCategoryInfo({
    required this.emoji,
    required this.bgColor,
    required this.textColor,
    required this.accentColor,
  });
}

class DairyUtils {
  /// Validates Indian mobile number: 10 digits starting with 6-9,
  /// with optional country code (+91, 91) or leading 0.
  static bool isValidIndianPhone(String? input) {
    if (input == null || input.trim().isEmpty) return false;
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 10) {
      return RegExp(r'^[6-9]\d{9}$').hasMatch(digits);
    } else if (digits.length == 11 && digits.startsWith('0')) {
      return RegExp(r'^[6-9]\d{9}$').hasMatch(digits.substring(1));
    } else if (digits.length == 12 && digits.startsWith('91')) {
      return RegExp(r'^[6-9]\d{9}$').hasMatch(digits.substring(2));
    }
    return false;
  }

  /// Normalizes an Indian mobile number to 10 digits starting with 6-9.
  /// Returns `null` if invalid.
  static String? normalizeIndianPhone(String? input) {
    if (input == null || input.trim().isEmpty) return null;
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 10 && RegExp(r'^[6-9]\d{9}$').hasMatch(digits)) {
      return digits;
    } else if (digits.length == 11 && digits.startsWith('0')) {
      final sub = digits.substring(1);
      if (RegExp(r'^[6-9]\d{9}$').hasMatch(sub)) return sub;
    } else if (digits.length == 12 && digits.startsWith('91')) {
      final sub = digits.substring(2);
      if (RegExp(r'^[6-9]\d{9}$').hasMatch(sub)) return sub;
    }
    return null;
  }

  /// Masks phone number for display without exposing full digits.
  /// e.g. "9865432100" -> "98****2100"
  static String maskPhone(String? input) {
    if (input == null || input.trim().isEmpty) return '';
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) return input;
    final last10 = digits.substring(digits.length - 10);
    return '${last10.substring(0, 2)}****${last10.substring(6)}';
  }

  /// Returns visual design tokens and emoji for each product category.
  static DairyCategoryInfo getCategoryInfo(String category) {
    final cat = category.trim().toLowerCase();
    if (cat.contains('दही')) {
      return const DairyCategoryInfo(
        emoji: '🥣',
        bgColor: Color(0xFFFFF9C4),
        textColor: Color(0xFFF57F17),
        accentColor: Color(0xFFFBC02D),
      );
    } else if (cat.contains('पनीर')) {
      return const DairyCategoryInfo(
        emoji: '🧀',
        bgColor: Color(0xFFFFE0B2),
        textColor: Color(0xFFE65100),
        accentColor: Color(0xFFFB8C00),
      );
    } else if (cat.contains('तूप') || cat.contains('ghee')) {
      return const DairyCategoryInfo(
        emoji: '🧈',
        bgColor: Color(0xFFFFF8E1),
        textColor: Color(0xFFBF360C),
        accentColor: Color(0xFFFFB300),
      );
    } else if (cat.contains('ताक') || cat.contains('लस्सी')) {
      return const DairyCategoryInfo(
        emoji: '🥤',
        bgColor: Color(0xFFE0F7FA),
        textColor: Color(0xFF006064),
        accentColor: Color(0xFF00ACC1),
      );
    } else if (cat.contains('श्रीखंड')) {
      return const DairyCategoryInfo(
        emoji: '🍯',
        bgColor: Color(0xFFF3E5F5),
        textColor: Color(0xFF4A148C),
        accentColor: Color(0xFF8E24AA),
      );
    } else {
      // Default to milk ('दूध' or 'इतर')
      return const DairyCategoryInfo(
        emoji: '🥛',
        bgColor: Color(0xFFE8F5E9),
        textColor: Color(0xFF1B5E20),
        accentColor: Color(0xFF2E7D32),
      );
    }
  }

  /// Format price in rupees with ₹ sign
  static String formatPrice(double? price) {
    if (price == null) return '';
    if (price == price.toInt()) {
      return '₹${price.toInt()}';
    }
    return '₹${price.toStringAsFixed(2)}';
  }
}
