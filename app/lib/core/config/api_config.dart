import 'package:flutter/foundation.dart';

enum AppEnv { dev, staging, prod }

/// Environment-specific configuration, chosen at build time.
///
///   Development : flutter run --dart-define=API_BASE_URL=http://PC-LAN-IP:5000
///   Staging     : flutter build apk --dart-define=APP_ENV=staging
///   Production  : flutter build appbundle --release     (APP_ENV defaults to prod)
///
/// Release builds always default to production and [validate] refuses to start
/// if the resolved API address is not a public HTTPS URL, so a production build
/// can never silently talk to localhost, a LAN address or plain HTTP.
class ApiConfig {
  ApiConfig._();

  static const String _envName = String.fromEnvironment(
    'APP_ENV',
    defaultValue: kReleaseMode ? 'prod' : 'dev',
  );

  /// Explicit override (development / CI only).
  static const String _baseUrlOverride = String.fromEnvironment('API_BASE_URL');

  /// Offline demo build for showing the app to people before the backend is
  /// live: login and the community feed use on-device sample data and no
  /// request reaches any server. NEVER upload a demo build to Google Play.
  ///   flutter build apk --release --dart-define=DEMO_MODE=true
  static const bool demoMode = bool.fromEnvironment('DEMO_MODE');

  /// Web OAuth client ID used to obtain a Google ID token the backend can verify.
  static const String googleWebClientId = String.fromEnvironment(
    'GOOGLE_WEB_CLIENT_ID',
  );

  /// Sentry project key (DSN) for crash and error reports. Empty = reporting
  /// is off (debug runs, tests, and any build made without it):
  ///   flutter build appbundle --release --dart-define=SENTRY_DSN=https://...
  static const String sentryDsn = String.fromEnvironment('SENTRY_DSN');

  /// Public privacy policy page (must match the Play Console listing).
  static const String privacyPolicyUrl = String.fromEnvironment(
    'PRIVACY_POLICY_URL',
    defaultValue: 'https://www.connectmaratha.com/privacy',
  );

  /// Support address shown in the app and Play listing.
  static const String supportEmail = String.fromEnvironment(
    'SUPPORT_EMAIL',
    defaultValue: 'support@connectmaratha.com',
  );

  static AppEnv get env => switch (_envName) {
    'prod' || 'production' => AppEnv.prod,
    'staging' => AppEnv.staging,
    _ => AppEnv.dev,
  };

  static String get baseUrl {
    if (_baseUrlOverride.isNotEmpty) {
      return _baseUrlOverride.replaceAll(RegExp(r'/+$'), '');
    }
    return switch (env) {
      AppEnv.prod => 'https://api.connectmaratha.com',
      AppEnv.staging => 'https://staging-api.connectmaratha.com',
      // Live production & development API server
      AppEnv.dev => 'https://api.connectmaratha.com',
    };
  }

  static final _mediaPath = RegExp(r'^/media/[a-f0-9]{32}$');

  /// Full address of a member-uploaded picture (profile photo, post photo)
  /// from the path the server stores, e.g. `/media/3f…`. Null for anything
  /// else, so the app never loads a picture from an address it was handed.
  static String? mediaUrl(String? path) =>
      path != null && _mediaPath.hasMatch(path) ? '$baseUrl$path' : null;

  /// Fails fast when a release build is pointed at an unsafe API address.
  static void validate() {
    if (!kReleaseMode || demoMode) return;
    final uri = Uri.tryParse(baseUrl);
    final host = uri?.host ?? '';
    final isPrivateHost =
        host == 'localhost' ||
        host.startsWith('127.') ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        RegExp(r'^172\.(1[6-9]|2\d|3[01])\.').hasMatch(host) ||
        host.endsWith('.local');
    if (uri == null || uri.scheme != 'https' || host.isEmpty || isPrivateHost) {
      throw StateError(
        'Release build must use a public HTTPS API address (got "$baseUrl"). '
        'Set API_BASE_URL or build with the production configuration.',
      );
    }
  }
}
