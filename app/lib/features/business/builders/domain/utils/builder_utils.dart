import '../models/builder_project.dart';

class BuilderUtils {
  /// Infers project type: "flats", "villas", or "plots".
  /// If `projectType` is provided and valid, uses it.
  /// Otherwise infers from `configuration` (and `projectName` / `category`):
  /// - contains "BHK" or "फ्लॅट" -> "flats"
  /// - contains "व्हिला", "villa", or "बंगलो" -> "villas"
  /// - contains "प्लॉट" or "plot" -> "plots"
  static String? inferProjectType(BuilderProject project) {
    return inferProjectTypeFromConfig(
      project.configuration,
      projectType: project.projectType,
      additionalContext: '${project.projectName ?? ''} ${project.developer ?? ''}',
    );
  }

  /// Infers project type from configuration string and optional projectType field.
  /// If projectType is missing, infer it from "configuration":
  /// contains "BHK" or "फ्लॅट" means flats; "व्हिला", "villa" or "बंगलो" means villas; "प्लॉट" or "plot" means plots.
  static String? inferProjectTypeFromConfig(
    String? configuration, {
    String? projectType,
    String? additionalContext,
  }) {
    final direct = (projectType ?? '').trim().toLowerCase();
    if (direct == 'flats' || direct == 'villas' || direct == 'plots') {
      return direct;
    }

    final text = '${configuration ?? ''} ${additionalContext ?? ''}'.toLowerCase();

    // Check villas first (व्हिला, villa, बंगलो)
    if (text.contains('व्हिला') || text.contains('villa') || text.contains('बंगलो')) {
      return 'villas';
    }

    // Check plots (प्लॉट, plot)
    if (text.contains('प्लॉट') || text.contains('plot')) {
      return 'plots';
    }

    // Check flats (bhk, फ्लॅट)
    if (text.contains('bhk') || text.contains('फ्लॅट') || text.contains('flat') || text.contains('अपार्टमेंट')) {
      return 'flats';
    }

    return null;
  }

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

  /// Alias for normalizeIndianPhone
  static String? normalizePhone(String? input) => normalizeIndianPhone(input);

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

  /// Masks phone number for secure display without exposing full digits.
  /// e.g. "9822011445" -> "98****1445"
  static String maskPhone(String? input) {
    if (input == null || input.trim().isEmpty) return '';
    final digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) return input;
    final last10 = digits.substring(digits.length - 10);
    return '${last10.substring(0, 2)}****${last10.substring(6)}';
  }
}
