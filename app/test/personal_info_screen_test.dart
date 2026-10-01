// "वैयक्तिक माहिती": editing the name must really save it (Play users reported
// that "Save" only showed a message and nothing changed).
import 'package:app/core/auth/auth_scope.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/repositories/auth_repository.dart';
import 'package:app/features/profile/screens/personal_info_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

class _PhoneTakenRepository extends LocalAuthRepository {
  _PhoneTakenRepository(super.local);

  @override
  Future<UserProfile> updateProfile({
    required String name,
    required String phone,
    required String city,
  }) async =>
      throw AuthException(
        'हा मोबाईल नंबर आधीच वापरात आहे.',
        code: 'PHONE_IN_USE',
      );
}

Future<AuthController> _open(
  WidgetTester tester,
  LocalAuthRepository repository,
) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});
  final auth = AuthController(repository);
  await tester.runAsync(auth.loginWithDemoAccount);
  await tester.pumpWidget(
    ProviderScope(
      overrides: [authControllerProvider.overrideWith((ref) => auth)],
      child: AuthScope(
        controller: auth,
        child: const MaterialApp(home: PersonalInfoScreen()),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return auth;
}

void main() {
  testWidgets('editing the name saves it to the account', (tester) async {
    final local = AuthLocalDataSource();
    final auth = await _open(tester, LocalAuthRepository(local));
    final before = auth.state.profile!;

    await tester.enterText(find.byType(TextField).at(0), 'नवीन नाव पाटील');
    await tester.tap(find.text('बदल जतन करा'));
    await tester.pumpAndSettle();

    expect(auth.state.profile!.name, 'नवीन नाव पाटील');
    expect(auth.state.profile!.id, before.id);
    expect(find.textContaining('जतन केली गेली आहे'), findsOneWidget);
    // ...and it survives an app restart (stored session).
    final stored = await tester.runAsync(local.readSession);
    expect(stored!.name, 'नवीन नाव पाटील');
  });

  testWidgets('an empty name is refused and nothing is saved', (tester) async {
    final auth = await _open(tester, LocalAuthRepository(AuthLocalDataSource()));
    final before = auth.state.profile!.name;

    await tester.enterText(find.byType(TextField).at(0), '   ');
    await tester.tap(find.text('बदल जतन करा'));
    await tester.pumpAndSettle();

    expect(find.text('नाव रिकामे ठेवता येत नाही.'), findsOneWidget);
    expect(auth.state.profile!.name, before);
  });

  testWidgets('an invalid mobile number is refused', (tester) async {
    final auth = await _open(tester, LocalAuthRepository(AuthLocalDataSource()));
    final before = auth.state.profile!.phone;

    await tester.enterText(find.byType(TextField).at(1), 'abc');
    await tester.tap(find.text('बदल जतन करा'));
    await tester.pumpAndSettle();

    expect(find.text('कृपया वैध मोबाईल नंबर टाका.'), findsOneWidget);
    expect(auth.state.profile!.phone, before);
  });

  testWidgets('a server rejection is shown and the profile is unchanged', (
    tester,
  ) async {
    final auth = await _open(
      tester,
      _PhoneTakenRepository(AuthLocalDataSource()),
    );
    final before = auth.state.profile!;

    await tester.enterText(find.byType(TextField).at(1), '9123456780');
    await tester.tap(find.text('बदल जतन करा'));
    await tester.pumpAndSettle();

    expect(find.text('हा मोबाईल नंबर आधीच वापरात आहे.'), findsOneWidget);
    expect(auth.state.profile!.phone, before.phone);
    expect(find.textContaining('जतन केली गेली आहे'), findsNothing);
  });

  testWidgets('saving without changes says so', (tester) async {
    await _open(tester, LocalAuthRepository(AuthLocalDataSource()));

    await tester.tap(find.text('बदल जतन करा'));
    await tester.pumpAndSettle();

    expect(find.text('कोणताही बदल केलेला नाही.'), findsOneWidget);
  });
}
