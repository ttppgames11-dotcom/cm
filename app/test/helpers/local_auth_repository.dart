import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/register_form_data.dart';
import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/models/user_role.dart';
import 'package:app/features/auth/repositories/auth_repository.dart';

import 'demo_accounts.dart';

/// Test-only implementation of [AuthRepository] for widget/unit tests.
/// Moved out of lib/ so production builds cannot execute mock auth.
class LocalAuthRepository implements AuthRepository {
  LocalAuthRepository(this._localDataSource);

  final AuthLocalDataSource _localDataSource;
  final Random _random = Random();

  @override
  Future<UserProfile?> restoreSession() => _localDataSource.readSession();

  @override
  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async {
    if (password.trim().isEmpty) {
      throw AuthException('कृपया डेमो पासवर्ड किंवा OTP टाका.');
    }
    final profile = DemoAccounts.profileFor(role, loginId: loginId);
    await _localDataSource.saveSession(profile);
    return profile;
  }

  @override
  Future<UserProfile> loginWithDemoAccount() async {
    final profile = DemoAccounts.profileFor(UserRole.member);
    await _localDataSource.saveSession(profile);
    return profile;
  }

  @override
  Future<UserProfile> register(RegisterFormData data) async {
    final generatedId = 'CM${10000000 + _random.nextInt(90000000)}';
    final village = data.village.isNotEmpty ? '${data.village.split('/').first.trim()}, ' : '';
    final taluka = data.taluka.isNotEmpty ? '${data.taluka.split('/').first.trim()}, ' : '';
    final district = data.district.isNotEmpty ? data.district.split('/').first.trim() : '';
    final location = data.city.isNotEmpty
        ? data.city.trim()
        : '$village$taluka$district'.trim().replaceAll(RegExp(r',\s*$'), '');
    final profile = UserProfile(
      id: generatedId,
      name: data.fullName.trim().isEmpty ? 'नवीन सदस्य' : data.fullName.trim(),
      tier: data.membershipTier,
      role: data.role,
      phone: data.mobile.trim(),
      city: location.isEmpty ? 'महाराष्ट्र' : location,
    );
    await _localDataSource.saveSession(profile);
    return profile;
  }

  @override
  Future<String> requestPasswordResetOtp(String phone) async {
    return '123456';
  }

  @override
  Future<void> sendForgotPasswordOtp(String email) async {}

  @override
  Future<String> verifyResetOtp({required String email, required String otp}) async {
    return 'test_mock_token_123';
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  }) async {}

  @override
  Future<UserProfile> updateProfile({
    required String name,
    required String phone,
    required String city,
  }) async {
    final current = await _localDataSource.readSession();
    if (current == null) throw AuthException('कृपया पुन्हा लॉगिन करा.');
    final updated = current.copyWith(name: name, phone: phone, city: city);
    await _localDataSource.saveSession(updated);
    return updated;
  }

  @override
  Future<void> logout() => _localDataSource.clearSession();

  @override
  Future<void> deleteAccount({String? password, String? googleIdToken}) =>
      _localDataSource.clearSession();

  @override
  set onSessionExpired(void Function()? callback) {}

  @override
  Future<UserProfile> loginWithGoogle({
    required String googleId,
    required String name,
    required String email,
    String? photoUrl,
    String? idToken,
    bool register = false,
  }) async {
    final memberId = 'CM${googleId.hashCode.abs() % 90000000 + 10000000}';
    final profile = UserProfile(
      id: memberId,
      name: name.trim().isEmpty ? 'Google सदस्य' : name.trim(),
      tier: 'Basic',
      role: UserRole.member,
      phone: '',
      city: 'महाराष्ट्र',
    );
    await _localDataSource.saveSession(profile);
    return profile;
  }
}
