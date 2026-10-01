import '../models/register_form_data.dart';
import '../models/user_profile.dart';
import '../models/user_role.dart';

/// Seam between the auth controller and however accounts are actually
/// verified. Today [LocalAuthRepository] simulates everything on-device;
/// later this can be swapped for an implementation backed by a REST API
/// (Spring Boot) without changing any UI or controller code.
abstract class AuthRepository {
  Future<UserProfile?> restoreSession();

  Future<UserProfile> login({
    required String loginId,
    required String password,
    required UserRole role,
  });

  Future<UserProfile> loginWithDemoAccount();

  /// Sign in using a Google account. [googleId] is the stable subject ID,
  /// [name] and [email] come from the Google ID token.
  Future<UserProfile> loginWithGoogle({
    required String googleId,
    required String name,
    required String email,
    String? photoUrl,
    String? idToken,
    bool register = false,
  });

  Future<UserProfile> register(RegisterFormData data);

  /// Demo-only password reset: "sends" an OTP and returns it so the UI can
  /// display it, matching the existing website's simulated flow (no real
  /// SMS/email is ever sent).
  Future<String> requestPasswordResetOtp(String phone);

  /// Requests a 6-digit security OTP sent to the user's registered email.
  Future<void> sendForgotPasswordOtp(String email);

  /// Verifies the 6-digit OTP sent to [email] and returns a temporary [resetToken].
  Future<String> verifyResetOtp({required String email, required String otp});

  /// Resets the user's password using the verified [resetToken].
  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  });

  /// Saves the signed-in member's own name, phone and city on the server and
  /// returns the updated profile. Throws [AuthException] when it is rejected
  /// (e.g. `PHONE_IN_USE`) or the server cannot be reached.
  Future<UserProfile> updateProfile({
    required String name,
    required String phone,
    required String city,
  });

  Future<void> logout();

  /// Permanently deletes the signed-in member's account on the server.
  /// Password accounts pass [password]; Google accounts a fresh [googleIdToken].
  Future<void> deleteAccount({String? password, String? googleIdToken});

  /// Invoked when the session can no longer be refreshed (revoked/expired).
  set onSessionExpired(void Function()? callback);
}

class AuthException implements Exception {
  AuthException(this.message, {this.code});
  final String message;

  /// Machine-readable reason from the backend, e.g. `USER_NOT_FOUND`,
  /// `INVALID_PASSWORD`, `ALREADY_REGISTERED`.
  final String? code;

  @override
  String toString() => message;
}
