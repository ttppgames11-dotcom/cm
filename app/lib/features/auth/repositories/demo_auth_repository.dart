import '../data/auth_local_data_source.dart';
import '../models/register_form_data.dart';
import '../models/user_profile.dart';
import '../models/user_role.dart';
import 'auth_repository.dart';

/// [AuthRepository] for the offline demo build ([ApiConfig.demoMode]).
/// Everything stays on the device; no request is sent anywhere.
class DemoAuthRepository implements AuthRepository {
  DemoAuthRepository(this._localDataSource);

  final AuthLocalDataSource _localDataSource;

  static const demoLoginId = 'demo';
  static const demoPassword = 'demo123';

  static const _demoUser = UserProfile(
    id: 'DEMO1001',
    name: 'डेमो सदस्य',
    tier: 'Gold',
    role: UserRole.member,
    phone: '9999999999',
    city: 'पुणे',
  );

  @override
  set onSessionExpired(void Function()? callback) {}

  @override
  Future<UserProfile?> restoreSession() => _localDataSource.readSession();

  @override
  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async {
    if (loginId.trim().toLowerCase() != demoLoginId ||
        password != demoPassword) {
      throw AuthException(
        'डेमो लॉगिन: युझर "$demoLoginId" आणि पासवर्ड "$demoPassword" वापरा.',
        code: 'INVALID_PASSWORD',
      );
    }
    await _localDataSource.saveSession(_demoUser);
    return _demoUser;
  }

  @override
  Future<UserProfile> loginWithDemoAccount() => login(
    loginId: demoLoginId,
    password: demoPassword,
    role: UserRole.member,
  );

  @override
  Future<UserProfile> register(RegisterFormData d) async {
    final profile = UserProfile(
      id: 'DEMO${DateTime.now().millisecondsSinceEpoch % 100000}',
      name: d.fullName.trim().isEmpty ? _demoUser.name : d.fullName.trim(),
      tier: 'Gold',
      role: d.role,
      phone: d.mobile.trim(),
      city: d.city.trim(),
    );
    await _localDataSource.saveSession(profile);
    return profile;
  }

  @override
  Future<UserProfile> updateProfile({
    required String name,
    required String phone,
    required String city,
  }) async {
    final current = await _localDataSource.readSession() ?? _demoUser;
    final updated = current.copyWith(name: name, phone: phone, city: city);
    await _localDataSource.saveSession(updated);
    return updated;
  }

  @override
  Future<UserProfile> loginWithGoogle({
    required String googleId,
    required String name,
    required String email,
    String? photoUrl,
    String? idToken,
    bool register = false,
  }) =>
      throw AuthException(
        'डेमो आवृत्तीत Google लॉगिन उपलब्ध नाही. युझर "$demoLoginId" / पासवर्ड "$demoPassword" वापरा.',
        code: 'NOT_AVAILABLE',
      );

  @override
  Future<String> requestPasswordResetOtp(String phone) =>
      throw AuthException(
        'डेमो आवृत्तीत पासवर्ड रीसेट उपलब्ध नाही.',
        code: 'NOT_AVAILABLE',
      );

  @override
  Future<void> sendForgotPasswordOtp(String email) async {
    // In demo mode, simulate successful dispatch
    await Future.delayed(const Duration(milliseconds: 300));
  }

  @override
  Future<String> verifyResetOtp({
    required String email,
    required String otp,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (otp.trim().length != 6) {
      throw AuthException(
        'कृपया ६-अंकी वैध OTP प्रविष्ट करा.',
        code: 'INVALID_OTP',
      );
    }
    return 'demo_reset_token_${DateTime.now().millisecondsSinceEpoch}';
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (newPassword.length < 8) {
      throw AuthException(
        'पासवर्ड किमान ८ अक्षरांचा असावा.',
        code: 'PASSWORD_TOO_SHORT',
      );
    }
  }

  @override
  Future<void> logout() => _localDataSource.clearSession();

  @override
  Future<void> deleteAccount({String? password, String? googleIdToken}) =>
      _localDataSource.clearSession();
}
