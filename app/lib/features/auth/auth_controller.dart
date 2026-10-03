import 'package:flutter/foundation.dart';

import 'models/register_form_data.dart';
import 'models/user_profile.dart';
import 'models/user_role.dart';
import 'repositories/auth_repository.dart';

enum AuthStatus { unknown, authenticated, unauthenticated, error }

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.profile,
    this.isBusy = false,
    this.errorMessage,
    this.errorCode,
  });

  final AuthStatus status;
  final UserProfile? profile;
  final bool isBusy;
  final String? errorMessage;

  /// Backend reason code for the last failure (see `AuthException.code`).
  final String? errorCode;

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isUnauthenticated => status == AuthStatus.unauthenticated;
  bool get isLoading => isBusy || status == AuthStatus.unknown;
  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;

  AuthState copyWith({
    AuthStatus? status,
    UserProfile? profile,
    bool? isBusy,
    String? errorMessage,
    String? errorCode,
  }) {
    return AuthState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      isBusy: isBusy ?? this.isBusy,
      errorMessage: errorMessage,
      errorCode: errorCode,
    );
  }
}

/// App-wide authentication state. UI screens call methods here; this class
/// never touches storage directly, only [AuthRepository] — see
/// `local_auth_repository.dart` for why that seam matters.
///
/// A plain `ChangeNotifier` is enough at this app's current size: `go_router`
/// consumes it directly as a `refreshListenable`, and screens read it via
/// `AuthScope.of(context)`. Revisit this (e.g. Riverpod) only once several
/// features need shared, more complex async state.
class AuthController extends ChangeNotifier {
  AuthController(this._repository);

  final AuthRepository _repository;

  AuthState _state = const AuthState();
  AuthState get state => _state;

  void _update(AuthState newState) {
    _state = newState;
    notifyListeners();
  }

  Future<void> restoreSession() async {
    try {
      final profile = await _repository.restoreSession().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          return null;
        },
      );
      _update(
        _state.copyWith(
          status:
              profile != null
                  ? AuthStatus.authenticated
                  : AuthStatus.unauthenticated,
          profile: profile,
        ),
      );
    } catch (e) {
      _update(
        _state.copyWith(
          status: AuthStatus.unauthenticated,
          profile: null,
          errorMessage: e.toString(),
        ),
      );
    }
  }

  Future<bool> login({
    required String loginId,
    required String password,
    required UserRole role,
  }) async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    try {
      final profile = await _repository.login(
        loginId: loginId,
        password: password,
        role: role,
      );
      _update(
        _state.copyWith(
          status: AuthStatus.authenticated,
          profile: profile,
          isBusy: false,
        ),
      );
      return true;
    } catch (e) {
      _update(
        _state.copyWith(
          isBusy: false,
          errorMessage: e.toString(),
          errorCode: e is AuthException ? e.code : null,
        ),
      );
      return false;
    }
  }

  Future<bool> loginWithDemoAccount() async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    final profile = await _repository.loginWithDemoAccount();
    _update(
      _state.copyWith(
        status: AuthStatus.authenticated,
        profile: profile,
        isBusy: false,
      ),
    );
    return true;
  }

  Future<bool> loginWithGoogle({
    required String googleId,
    required String name,
    required String email,
    String? photoUrl,
    String? idToken,
    bool register = false,
  }) async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    try {
      final profile = await _repository.loginWithGoogle(
        googleId: googleId,
        name: name,
        email: email,
        photoUrl: photoUrl,
        idToken: idToken,
        register: register,
      );
      _update(
        _state.copyWith(
          status: AuthStatus.authenticated,
          profile: profile,
          isBusy: false,
        ),
      );
      return true;
    } catch (e) {
      _update(
        _state.copyWith(
          isBusy: false,
          errorMessage: e.toString(),
          errorCode: e is AuthException ? e.code : null,
        ),
      );
      return false;
    }
  }

  Future<bool> register(RegisterFormData data) async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    try {
      final profile = await _repository.register(data);
      _update(
        _state.copyWith(
          status: AuthStatus.authenticated,
          profile: profile,
          isBusy: false,
        ),
      );
      return true;
    } catch (e) {
      _update(
        _state.copyWith(
          isBusy: false,
          errorMessage: e.toString(),
          errorCode: e is AuthException ? e.code : null,
        ),
      );
      return false;
    }
  }

  /// Saves the member's own name, phone and city. Returns false, with
  /// [AuthState.errorMessage] set, when the change is rejected or the server
  /// cannot be reached; the profile then stays as it was.
  Future<bool> updateProfile({
    required String name,
    required String phone,
    required String city,
  }) async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    try {
      final profile = await _repository.updateProfile(
        name: name,
        phone: phone,
        city: city,
      );
      _update(_state.copyWith(profile: profile, isBusy: false));
      return true;
    } catch (e) {
      _update(
        _state.copyWith(
          isBusy: false,
          errorMessage: e.toString(),
          errorCode: e is AuthException ? e.code : null,
        ),
      );
      return false;
    }
  }

  /// The member's profile photo changed on the server ('' = removed).
  void setProfilePhoto(String photo) {
    final profile = _state.profile;
    if (profile == null || profile.photo == photo) return;
    _update(_state.copyWith(profile: profile.copyWith(photo: photo)));
  }

  Future<String> requestPasswordResetOtp(String phone) {
    return _repository.requestPasswordResetOtp(phone);
  }

  Future<void> sendForgotPasswordOtp(String email) {
    return _repository.sendForgotPasswordOtp(email);
  }

  Future<String> verifyResetOtp({required String email, required String otp}) {
    return _repository.verifyResetOtp(email: email, otp: otp);
  }

  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  }) {
    return _repository.resetPassword(
      email: email,
      resetToken: resetToken,
      newPassword: newPassword,
    );
  }

  /// Called by the API layer when the server no longer accepts the session.
  void handleSessionExpired() {
    if (_state.status != AuthStatus.authenticated) return;
    _update(const AuthState(status: AuthStatus.unauthenticated, profile: null));
  }

  Future<bool> deleteAccount({String? password, String? googleIdToken}) async {
    _update(_state.copyWith(isBusy: true, errorMessage: null, errorCode: null));
    try {
      await _repository.deleteAccount(
        password: password,
        googleIdToken: googleIdToken,
      );
      _update(
        const AuthState(status: AuthStatus.unauthenticated, profile: null),
      );
      return true;
    } catch (e) {
      _update(
        _state.copyWith(
          isBusy: false,
          errorMessage: e.toString(),
          errorCode: e is AuthException ? e.code : null,
        ),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _update(const AuthState(status: AuthStatus.unauthenticated, profile: null));
  }
}
