// Crash reporting (Sentry): off without a DSN, and reports never carry a
// member's email address or phone number.
import 'package:app/core/diagnostics/error_reporter.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

void main() {
  test('without a DSN reporting is off and the app still starts', () async {
    expect(crashReportingEnabled, isFalse);

    var started = false;
    await startCrashReporting(() async => started = true);

    expect(started, isTrue);
    expect(await sendTestReport(), isFalse);
    // Must not throw when reporting is off.
    reportError(StateError('x'), StackTrace.current);
  });

  test('emails and phone numbers are removed from text', () {
    expect(
      scrubText('login failed for suresh.patil@example.com'),
      'login failed for <email>',
    );
    expect(scrubText('call 9876543210 now'), 'call <phone> now');
    expect(scrubText('+91 98220 11223 is taken'), '<phone> is taken');
    // Ordinary numbers, versions and IDs are left alone.
    expect(scrubText('status 404 after 20s'), 'status 404 after 20s');
    expect(scrubText('member M6076, version 1.0.1'), 'member M6076, version 1.0.1');
  });

  test('a report is stripped of the user and of contact details', () {
    final event = SentryEvent(
      message: SentryMessage('otp sent to a@b.co'),
      user: SentryUser(id: 'M1', email: 'a@b.co'),
      exceptions: [
        SentryException(type: 'AuthException', value: 'phone 9876543210 in use'),
      ],
    );

    final scrubbed = scrubEvent(event);

    expect(scrubbed.user, isNull);
    expect(scrubbed.message?.formatted, 'otp sent to <email>');
    expect(scrubbed.exceptions?.single.value, 'phone <phone> in use');
  });
}
