import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_profile.dart';

/// Local session storage. Mirrors the `cm_session`/`cm_user_*` keys the
/// existing website writes to `localStorage`, but backed by
/// `SharedPreferences` since this is a native app (no browser storage).
///
/// This is the only place in the app that touches storage directly —
/// repositories depend on this, never on `SharedPreferences` itself, so the
/// storage mechanism can change later without touching calling code.
class AuthLocalDataSource {
  static const _keySessionActive = 'cm_session_active';
  static const _keyUserId = 'cm_user_id';
  static const _keyUserName = 'cm_user_name';
  static const _keyUserTier = 'cm_user_tier';
  static const _keyUserRole = 'cm_user_role';
  static const _keyUserPhone = 'cm_user_phone';
  static const _keyUserCity = 'cm_user_city';
  static const _keyUserEmail = 'cm_user_email';
  static const _keyUserPhoto = 'cm_user_photo';

  Future<void> saveSession(UserProfile profile) async {
    final prefs = await SharedPreferences.getInstance();
    final map = profile.toStorageMap();
    await prefs.setBool(_keySessionActive, true);
    await prefs.setString(_keyUserId, map['id']!);
    await prefs.setString(_keyUserName, map['name']!);
    await prefs.setString(_keyUserTier, map['tier']!);
    await prefs.setString(_keyUserRole, map['role']!);
    await prefs.setString(_keyUserPhone, map['phone']!);
    await prefs.setString(_keyUserCity, map['city']!);
    await prefs.setString(_keyUserEmail, map['email'] ?? '');
    await prefs.setString(_keyUserPhoto, map['photo'] ?? '');
  }

  Future<UserProfile?> readSession() async {
    final prefs = await SharedPreferences.getInstance();
    final isActive = prefs.getBool(_keySessionActive) ?? false;
    if (!isActive) return null;

    final id = prefs.getString(_keyUserId);
    if (id == null || id.isEmpty) return null;

    return UserProfile.fromStorageMap({
      'id': id,
      'name': prefs.getString(_keyUserName) ?? '',
      'tier': prefs.getString(_keyUserTier) ?? 'Basic',
      'role': prefs.getString(_keyUserRole) ?? 'member',
      'phone': prefs.getString(_keyUserPhone) ?? '',
      'city': prefs.getString(_keyUserCity) ?? '',
      'email': prefs.getString(_keyUserEmail) ?? '',
      'photo': prefs.getString(_keyUserPhoto) ?? '',
    });
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keySessionActive, false);
    for (final key in [
      _keyUserId,
      _keyUserName,
      _keyUserTier,
      _keyUserRole,
      _keyUserPhone,
      _keyUserCity,
      _keyUserEmail,
      _keyUserPhoto,
    ]) {
      await prefs.remove(key);
    }
  }
}
