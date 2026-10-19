import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/features/auth/widgets/signup_consent_dialog.dart';

void main() {
  testWidgets('Google sign-up consent: Continue only after all 3 boxes, returns the flags', (tester) async {
    Map<String, Object?>? result;
    var closed = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder:
              (context) => TextButton(
                onPressed: () async {
                  result = await showSignupConsentDialog(context);
                  closed = true;
                },
                child: const Text('open'),
              ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();

    FilledButton button() => tester.widget(find.byKey(const Key('consent_continue_button')));
    expect(button().onPressed, isNull);

    await tester.tap(find.descendant(of: find.byKey(const Key('consent_terms_checkbox')), matching: find.byType(Checkbox)));
    await tester.tap(find.descendant(of: find.byKey(const Key('consent_privacy_checkbox')), matching: find.byType(Checkbox)));
    await tester.pump();
    expect(button().onPressed, isNull, reason: '18+ not confirmed yet');

    await tester.tap(find.descendant(of: find.byKey(const Key('consent_age_checkbox')), matching: find.byType(Checkbox)));
    await tester.pump();
    expect(button().onPressed, isNotNull);

    await tester.tap(find.byKey(const Key('consent_continue_button')));
    await tester.pumpAndSettle();
    expect(closed, isTrue);
    expect(result, {
      'termsAccepted': true,
      'privacyAccepted': true,
      'ageConfirmed': true,
      'dpdpConsent': true,
    });
  });

  testWidgets('cancelling the consent dialog returns null (no account is created)', (tester) async {
    Map<String, Object?>? result = {};
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder:
              (context) => TextButton(
                onPressed: () async => result = await showSignupConsentDialog(context),
                child: const Text('open'),
              ),
        ),
      ),
    );
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('रद्द करा'));
    await tester.pumpAndSettle();
    expect(result, isNull);
  });
}
