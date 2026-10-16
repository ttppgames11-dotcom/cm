import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:app/core/auth/auth_scope.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/providers/location_provider.dart';
import 'package:app/features/auth/screens/register_screen.dart';
import 'helpers/local_auth_repository.dart';
import 'helpers/test_location_repository.dart';

const _validCode = 'REF-96K-1001';
const _offlineCode = 'REF-96K-0000';

/// Answers the referral check like the live backend does.
class _FakeReferralApi extends ApiClient {
  _FakeReferralApi() : super(SecureTokenStore());

  final checked = <String>[];

  @override
  Future<Map<String, dynamic>> get(String path, {bool auth = false}) async {
    final code = Uri.decodeComponent(path.split('/').last);
    checked.add(code);
    if (code == _validCode) {
      return {
        'success': true,
        'isValid': true,
        'referrer': {'id': 'M1001', 'name': 'अमोल जाधव', 'district': 'पुणे'},
      };
    }
    if (code == _offlineCode) throw Exception('no network');
    throw ApiException('हा रेफरल आयडी आढळला नाही.', statusCode: 404);
  }
}

Future<_FakeReferralApi> _pumpRegister(WidgetTester tester) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(() => tester.view.resetPhysicalSize());

  SharedPreferences.setMockInitialValues({});
  final api = _FakeReferralApi();
  final authController = AuthController(
    LocalAuthRepository(AuthLocalDataSource()),
  );
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authControllerProvider.overrideWith((ref) => authController),
        locationRepositoryProvider.overrideWithValue(TestLocationRepository()),
        apiClientProvider.overrideWithValue(api),
      ],
      child: AuthScope(
        controller: authController,
        child: const MaterialApp(home: RegisterScreen()),
      ),
    ),
  );
  await tester.pumpAndSettle();

  await tester.enterText(find.byKey(const Key('register_name_field')), 'Test User');
  await tester.enterText(find.byKey(const Key('register_mobile_field')), '9876543210');
  await tester.enterText(find.byKey(const Key('register_password_field')), 'swarajya123');
  await tester.tap(find.byKey(const Key('register_terms_checkbox')));
  await tester.tap(find.byKey(const Key('register_privacy_checkbox')));
  await tester.tap(find.byKey(const Key('register_age_checkbox')));
  await tester.pumpAndSettle();
  return api;
}

Future<void> _enterReferral(WidgetTester tester, String code) async {
  await tester.enterText(find.byKey(const Key('register_referral_code_field')), code);
  // Let the 600 ms debounce fire and the check finish.
  await tester.pump(const Duration(milliseconds: 700));
  await tester.pumpAndSettle();
}

Future<void> _tapNext(WidgetTester tester) async {
  await tester.tap(find.byKey(const Key('register_next_button')));
  await tester.pumpAndSettle();
}

final _profileStep = find.text('प्रोफाईल माहिती / Profile Form');

void main() {
  testWidgets('a real referral code shows the referrer and allows Next', (tester) async {
    await _pumpRegister(tester);
    await _enterReferral(tester, _validCode);

    expect(find.textContaining('अमोल जाधव (पुणे)'), findsOneWidget);
    expect(find.byKey(const Key('register_referral_error')), findsNothing);

    await _tapNext(tester);
    expect(_profileStep, findsOneWidget);
  });

  testWidgets('an unknown referral code shows an error and blocks Next', (tester) async {
    await _pumpRegister(tester);
    await _enterReferral(tester, 'WRONG-CODE');

    expect(find.byKey(const Key('register_referral_error')), findsOneWidget);
    expect(find.textContaining('Referral ID not found'), findsWidgets);

    await _tapNext(tester);
    expect(_profileStep, findsNothing);
  });

  testWidgets('the member cannot use their own mobile number as the referral', (tester) async {
    final api = await _pumpRegister(tester);
    await _enterReferral(tester, '+91 98765 43210');

    expect(find.textContaining('own number'), findsWidgets);
    // Rejected on the phone; never sent to the server.
    expect(api.checked, isEmpty);

    await _tapNext(tester);
    expect(_profileStep, findsNothing);
  });

  testWidgets('an empty referral code is fine (it is optional)', (tester) async {
    final api = await _pumpRegister(tester);

    await _tapNext(tester);
    expect(_profileStep, findsOneWidget);
    expect(api.checked, isEmpty);
  });

  testWidgets('a network failure says the code could not be checked, not that it is wrong', (tester) async {
    await _pumpRegister(tester);
    await _enterReferral(tester, _offlineCode);

    expect(find.textContaining('Could not check the referral ID'), findsOneWidget);
    expect(find.textContaining('Referral ID not found'), findsNothing);

    await _tapNext(tester);
    expect(_profileStep, findsNothing);
  });

  testWidgets('tapping Next before the debounce fires still checks the code', (tester) async {
    final api = await _pumpRegister(tester);
    await tester.enterText(find.byKey(const Key('register_referral_code_field')), _validCode);
    // No wait: Next must verify the code itself.
    await _tapNext(tester);

    expect(api.checked, [_validCode]);
    expect(_profileStep, findsOneWidget);
  });
}
