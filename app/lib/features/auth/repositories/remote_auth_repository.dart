import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_token_store.dart';
import '../data/auth_local_data_source.dart';
import '../models/register_form_data.dart';
import '../models/user_profile.dart';
import '../models/user_role.dart';
import 'auth_repository.dart';

/// [AuthRepository] backed by the Connect Maratha Express API.
///
/// Tokens live in the platform keystore ([SecureTokenStore]); only the
/// non-secret display profile is cached in SharedPreferences so the UI can
/// render immediately on launch.
class RemoteAuthRepository implements AuthRepository {
  RemoteAuthRepository(this._localDataSource, this._api, this._tokens);

  final AuthLocalDataSource _localDataSource;
  final ApiClient _api;
  final SecureTokenStore _tokens;

  @override
  set onSessionExpired(void Function()? callback) =>
      _api.onSessionExpired = callback;

  AuthException _toAuthException(ApiException e) =>
      AuthException(e.message, code: e.code);

  UserProfile _profileFrom(Map<String, dynamic> m, {UserRole? role}) {
    final city = (m['city'] ?? '').toString();
    final district = (m['district'] ?? '').toString();
    return UserProfile(
      id: (m['id'] ?? '').toString(),
      name: (m['name'] ?? '').toString(),
      tier: (m['tier'] ?? 'Basic').toString(),
      role: role ?? UserRole.fromName((m['role'] ?? 'member').toString()),
      phone: (m['phone'] ?? '').toString(),
      city: city.isNotEmpty ? city : district,
      email: (m['email'] ?? '').toString(),
      photo: (m['photo'] ?? '').toString(),
    );
  }

  Future<UserProfile> _startSession(
    Map<String, dynamic> data, {
    UserRole? role,
  }) async {
    final token = data['token']?.toString();
    final member = data['member'];
    if (token == null || token.isEmpty || member is! Map<String, dynamic>) {
      throw AuthException(
        'सर्व्हरकडून अवैध प्रतिसाद मिळाला.',
        code: 'BAD_RESPONSE',
      );
    }
    final profile = _profileFrom(member, role: role);
    await _tokens.save(
      accessToken: token,
      refreshToken: data['refreshToken']?.toString(),
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
    final current = await _localDataSource.readSession();
    if (current == null) {
      throw AuthException('कृपया पुन्हा लॉगिन करा.', code: 'SESSION_EXPIRED');
    }
    try {
      final data = await _api.put(
        '/api/members/${current.id}',
        body: {
          'name': name,
          'city': city,
          // An empty value would wipe the number; it is only ever replaced.
          if (phone.isNotEmpty) 'phone': phone,
        },
        auth: true,
      );
      final member = data['member'];
      final updated =
          member is Map<String, dynamic>
              ? _profileFrom(member).copyWith(
                email: current.email.isNotEmpty ? current.email : null,
                photo: member.containsKey('photo') ? null : current.photo,
              )
              : current.copyWith(name: name, phone: phone, city: city);
      await _localDataSource.saveSession(updated);
      return updated;
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  Future<void> _endSession() async {
    try {
      await _tokens.clear();
    } catch (_) {}
    try {
      await _localDataSource.clearSession();
    } catch (_) {}
  }

  /// A saved session only counts if the server still accepts it. Old
  /// local/demo sessions (no tokens) and revoked/expired sessions are cleared,
  /// so the user lands on the login page. If the server is unreachable the
  /// cached session is kept (offline tolerance).
  @override
  Future<UserProfile?> restoreSession() async {
    UserProfile? profile;
    try {
      profile = await _localDataSource.readSession();
    } catch (_) {
      await _endSession();
      return null;
    }
    if (profile == null) return null;

    String? access;
    String? refresh;
    try {
      access = await _tokens.readAccessToken();
      refresh = await _tokens.readRefreshToken();
    } catch (_) {
      // Keystore unavailable / corrupted on device: safely clear session and treat as logged out
      await _endSession();
      return null;
    }

    if ((access == null || access.isEmpty) &&
        (refresh == null || refresh.isEmpty)) {
      await _endSession();
      return null;
    }
    try {
      final data = await _api.get('/api/auth/me', auth: true);
      final member = data['member'];
      if (member is Map<String, dynamic>) {
        final fresh = _profileFrom(member);
        await _localDataSource.saveSession(fresh);
        return fresh;
      }
      return profile;
    } on ApiException catch (e) {
      if (e.code == 'SESSION_EXPIRED' ||
          e.statusCode == 401 ||
          e.statusCode == 403 ||
          e.statusCode == 404) {
        await _endSession();
        return null;
      }
      return profile; // offline / server down: keep the cached session
    } catch (_) {
      return profile; // other network errors: keep cached session for offline resilience
    }
  }

  @override
  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async {
    try {
      final data = await _api.post(
        '/api/auth/login',
        body: {'identifier': loginId.trim(), 'password': password},
      );
      return _startSession(data);
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<UserProfile> register(RegisterFormData d) async {
    try {
      final data = await _api.post(
        '/api/auth/register',
        body: {
          'name': d.fullName.trim(),
          'email': d.email.trim(),
          'phone': d.mobile.trim(),
          'password': d.password,
          'city': d.city.trim(),
          'district': d.district.isNotEmpty ? d.district.split('/').first.trim() : '',
          'state': d.state.isNotEmpty ? d.state.split('/').first.trim() : '',
          'country': d.country.isNotEmpty ? d.country.split('/').first.trim() : '',
          'taluka': d.taluka.isNotEmpty ? d.taluka.split('/').first.trim() : '',
          'village': d.village.isNotEmpty ? d.village.split('/').first.trim() : '',
          if (d.countryId != null) 'countryId': d.countryId,
          if (d.stateId != null) 'stateId': d.stateId,
          if (d.districtId != null) 'districtId': d.districtId,
          if (d.talukaId != null) 'talukaId': d.talukaId,
          if (d.villageId != null) 'villageId': d.villageId,
          'profession': d.profession.trim(),
          'business': d.businessName.trim(),
          'education': d.education,
          'skills': d.skills.trim(),
          'interests': d.interest,
          'about': d.about.trim(),
        },
      );
      return _startSession(data, role: d.role);
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<UserProfile> loginWithGoogle({
    required String googleId,
    required String name,
    required String email,
    String? photoUrl,
    String? idToken,
    bool register = false,
  }) async {
    if (idToken == null || idToken.isEmpty) {
      throw AuthException(
        'Google टोकन मिळाले नाही. कृपया पुन्हा प्रयत्न करा.',
        code: 'MISSING_GOOGLE_TOKEN',
      );
    }
    try {
      // The backend verifies the token with Google, then logs the member in
      // or creates the member row on first sign-in.
      final data = await _api.post(
        '/api/auth/google',
        body: {'idToken': idToken, if (register) 'register': true},
      );
      return _startSession(data);
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<UserProfile> loginWithDemoAccount() =>
      throw AuthException('डेमो लॉगिन उपलब्ध नाही.', code: 'DEMO_DISABLED');

  @override
  Future<String> requestPasswordResetOtp(String phone) =>
      throw AuthException(
        'पासवर्ड रीसेट सध्या उपलब्ध नाही. कृपया ईमेल पर्यायाचा वापर करा.',
        code: 'NOT_AVAILABLE',
      );

  @override
  Future<void> sendForgotPasswordOtp(String email) async {
    try {
      await _api.post(
        '/api/auth/forgot-password',
        body: {'email': email.trim()},
      );
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<String> verifyResetOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final data = await _api.post(
        '/api/auth/verify-reset-otp',
        body: {'email': email.trim(), 'otp': otp.trim()},
      );
      final resetToken = data['resetToken']?.toString();
      if (resetToken == null || resetToken.isEmpty) {
        throw AuthException(
          'अवैध रीसेट टोकन प्राप्त झाले.',
          code: 'INVALID_TOKEN',
        );
      }
      return resetToken;
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  }) async {
    try {
      await _api.post(
        '/api/auth/reset-password',
        body: {
          'email': email.trim(),
          'resetToken': resetToken,
          'newPassword': newPassword,
        },
      );
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
  }

  @override
  Future<void> logout() async {
    // Revoke the session server-side first; local sign-out must succeed even
    // when the request fails (e.g. offline).
    try {
      final refresh = await _tokens.readRefreshToken();
      if (refresh != null && refresh.isNotEmpty) {
        await _api.post('/api/auth/logout', body: {'refreshToken': refresh});
      }
    } catch (_) {}
    await _endSession();
  }

  @override
  Future<void> deleteAccount({String? password, String? googleIdToken}) async {
    try {
      await _api.delete(
        '/api/auth/account',
        auth: true,
        body: {
          'confirm': 'DELETE',
          if (password != null) 'password': password,
          if (googleIdToken != null) 'idToken': googleIdToken,
        },
      );
    } on ApiException catch (e) {
      throw _toAuthException(e);
    }
    await _endSession();
  }
}
