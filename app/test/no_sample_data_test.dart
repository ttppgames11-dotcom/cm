// The live (non-demo) app must not present invented businesses, people, phone
// numbers, prices or events as real. Sections without real entries show an
// honest "nothing listed yet" screen; sample data is for the demo build only.
import 'package:app/core/auth/auth_scope.dart';
import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/routing/app_router.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/community/providers/community_provider.dart';
import 'package:app/features/community/repositories/demo_community_repository.dart';
import 'package:app/features/network/data/maharashtra_network_data.dart';
import 'package:app/shared/widgets/nothing_listed_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

Future<GoRouter> _signedInApp(WidgetTester tester) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});
  final repository = LocalAuthRepository(AuthLocalDataSource());
  final auth = AuthController(repository);
  await tester.runAsync(auth.loginWithDemoAccount);
  final router = buildAppRouter(auth);
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWithValue(repository),
        authControllerProvider.overrideWith((ref) => auth),
        communityRepositoryProvider.overrideWithValue(
          DemoCommunityRepository(ApiClient(SecureTokenStore())),
        ),
      ],
      child: AuthScope(
        controller: auth,
        child: MaterialApp.router(routerConfig: router),
      ),
    ),
  );
  return router;
}

void main() {
  test('these tests run as the live build, not the demo build', () {
    expect(ApiConfig.demoMode, isFalse);
  });

  for (final route in const [
    '/business/directory',
    '/business/sangam',
    '/business/dairy',
    '/business/builders',
    '/business/manufacturers',
    '/profile/events',
  ]) {
    testWidgets('$route shows the honest empty state', (tester) async {
      final router = await _signedInApp(tester);
      router.go(route);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      expect(find.byType(NothingListedScreen), findsOneWidget);
      expect(find.text('Nothing listed yet'), findsOneWidget);
      // No invented phone numbers, prices or ratings.
      expect(find.textContaining('98765'), findsNothing);
      expect(find.textContaining('₹'), findsNothing);
    });
  }

  testWidgets('there is no bank screen', (tester) async {
    final router = await _signedInApp(tester);
    router.go('/business/bank');
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.textContaining('मराठा बँक'), findsNothing);
    expect(find.textContaining('खाते उघडा'), findsNothing);
  });

  test('network data carries no coordinator names or phone numbers', () {
    for (final section in MaharashtraNetworkData.sections) {
      for (final item in section.items) {
        final text = '${item.titleMr} ${item.titleEn} ${item.description}';
        expect(RegExp(r'\+91|\d{5}\s?\d{5}').hasMatch(text), isFalse);
      }
    }
  });
}
