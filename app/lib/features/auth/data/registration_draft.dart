import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// A half-filled registration, saved just before the camera / gallery opens.
///
/// Android may close the app while the camera or photo picker is on screen
/// (common on phones with little free memory). When the app starts again,
/// the splash screen sees the draft and returns to registration, which
/// restores every field and the chosen photo instead of dropping the member
/// back on the login page with everything lost.
///
/// The password is kept in the Keystore-backed secure storage, never in
/// SharedPreferences, and the draft expires after 30 minutes.
class RegistrationDraft {
  RegistrationDraft([FlutterSecureStorage? secure])
    : _secure = secure ?? const FlutterSecureStorage();

  static const _key = 'cm_registration_draft';
  static const _passwordKey = 'cm_registration_draft_password';
  static const _maxAge = Duration(minutes: 30);

  final FlutterSecureStorage _secure;

  /// Whether a recent draft is waiting (checked by the splash screen).
  static Future<bool> isPending() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return false;
    final saved = _savedAt(raw);
    return saved != null && DateTime.now().difference(saved) < _maxAge;
  }

  Future<void> save(Map<String, Object?> fields, String password) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode({...fields, 'savedAt': DateTime.now().toIso8601String()}),
    );
    await _secure.write(key: _passwordKey, value: password);
  }

  /// The saved fields and password, or null when there is no recent draft.
  Future<(Map<String, dynamic>, String)?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    final saved = _savedAt(raw);
    if (saved == null || DateTime.now().difference(saved) >= _maxAge) {
      await clear();
      return null;
    }
    final fields = jsonDecode(raw) as Map<String, dynamic>;
    final password = await _secure.read(key: _passwordKey) ?? '';
    return (fields, password);
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey(_key)) return;
    await prefs.remove(_key);
    await _secure.delete(key: _passwordKey);
  }

  static DateTime? _savedAt(String raw) {
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return DateTime.tryParse(map['savedAt'] as String? ?? '');
    } catch (_) {
      return null;
    }
  }
}
