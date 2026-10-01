import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../config/api_config.dart';
import '../config/app_version.dart';

/// Whether this build sends crash / error reports (it was built with
/// `--dart-define=SENTRY_DSN=...`).
bool get crashReportingEnabled => ApiConfig.sentryDsn.isNotEmpty;

/// Starts Sentry (when this build has a DSN) and then runs [appRunner].
///
/// Reports carry the error, its stack trace, the app version and basic device
/// details (model, Android version). They never carry the member's name,
/// phone, email, password or tokens: `sendDefaultPii` is off, no user is
/// attached, screenshots are off, and [scrubEvent] removes anything that
/// looks like an email address or phone number from messages.
Future<void> startCrashReporting(Future<void> Function() appRunner) async {
  if (!crashReportingEnabled) {
    await appRunner();
    return;
  }
  await SentryFlutter.init((options) {
    options.dsn = ApiConfig.sentryDsn;
    options.environment = ApiConfig.env.name;
    options.release = 'com.connectmaratha.app@$appVersionName+$appBuildNumber';
    options.sendDefaultPii = false;
    options.attachScreenshot = false;
    options.attachViewHierarchy = false;
    // Errors only: no performance tracing or session replay.
    options.tracesSampleRate = 0;
    options.beforeSend = (event, hint) => scrubEvent(event);
  }, appRunner: appRunner);
}

final _email = RegExp(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}');
final _phone = RegExp(r'(?<!\d)(\+?\d[\d\s-]{8,14}\d)(?!\d)');

/// Replaces email addresses and phone numbers in [text] with placeholders.
@visibleForTesting
String scrubText(String text) =>
    text.replaceAll(_email, '<email>').replaceAll(_phone, '<phone>');

/// Last line of defence before a report leaves the phone: no user details,
/// and no email / phone number inside messages or exception texts.
@visibleForTesting
SentryEvent scrubEvent(SentryEvent event) {
  event.user = null;
  final message = event.message;
  if (message != null) {
    event.message = SentryMessage(scrubText(message.formatted));
  }
  for (final exception in event.exceptions ?? const <SentryException>[]) {
    final value = exception.value;
    if (value != null) exception.value = scrubText(value);
  }
  return event;
}

/// Central hook for uncaught errors (Flutter framework errors, platform
/// errors and anything escaping the root zone — see `main.dart`).
///
/// Debug builds print them; builds with a DSN send them to Sentry.
void reportError(Object error, StackTrace? stack) {
  if (kDebugMode) {
    debugPrint('Uncaught error: ${error.runtimeType}');
    if (stack != null) debugPrintStack(stackTrace: stack, maxFrames: 8);
  }
  if (crashReportingEnabled) {
    Sentry.captureException(error, stackTrace: stack);
  }
}

/// Sends a harmless test report so the team can confirm reporting works on a
/// phone (About screen → long-press the version). Returns false when this
/// build has no DSN.
Future<bool> sendTestReport() async {
  if (!crashReportingEnabled) return false;
  await Sentry.captureMessage(
    'Test report from Connect Maratha $appVersionName+$appBuildNumber',
    level: SentryLevel.info,
  );
  return true;
}
