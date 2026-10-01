// A shared post link (https://api.connectmaratha.com/post/<id>) opens the
// post inside the app through the /post/:id route.
import 'package:app/core/auth/auth_scope.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/routing/app_router.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/auth/screens/login_screen.dart';
import 'package:app/features/community/providers/community_provider.dart';
import 'package:app/features/community/repositories/demo_community_repository.dart';
import 'package:app/features/community/screens/post_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

Future<GoRouter> _app(WidgetTester tester, {required bool signedIn}) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});
  final repository = LocalAuthRepository(AuthLocalDataSource());
  final auth = AuthController(repository);
  if (signedIn) {
    await tester.runAsync(auth.loginWithDemoAccount);
  } else {
    await tester.runAsync(auth.restoreSession);
  }
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

Future<void> _settle(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 600));
}

void main() {
  testWidgets('a post link opens that post', (tester) async {
    final router = await _app(tester, signedIn: true);
    router.go('/post/demo-p1');
    await _settle(tester);

    expect(find.byType(PostDetailScreen), findsOneWidget);
    expect(find.text('राजेंद्र भोसले'), findsOneWidget);
    expect(find.byIcon(Icons.share_outlined), findsOneWidget);
    // Someone else's post can be reported from here too.
    expect(find.byIcon(Icons.flag_outlined), findsOneWidget);
  });

  testWidgets('a link to a deleted post says so', (tester) async {
    final router = await _app(tester, signedIn: true);
    router.go('/post/P-does-not-exist');
    await _settle(tester);

    expect(find.text('ही पोस्ट उपलब्ध नाही'), findsOneWidget);
    expect(find.text('समाज फीड पहा'), findsOneWidget);
  });

  testWidgets('signed out: the link asks to log in, then shows the post', (
    tester,
  ) async {
    final router = await _app(tester, signedIn: false);
    router.go('/post/demo-p1');
    await _settle(tester);

    expect(find.byType(LoginScreen), findsOneWidget);
    expect(find.byType(PostDetailScreen), findsNothing);

    await tester.enterText(find.byType(TextFormField).at(0), 'member@x.com');
    await tester.enterText(find.byType(TextFormField).at(1), 'whatever123');
    await tester.ensureVisible(find.text('लॉगिन करा'));
    await tester.tap(find.text('लॉगिन करा'));
    await _settle(tester);
    await _settle(tester);

    expect(find.byType(PostDetailScreen), findsOneWidget);
    expect(find.text('राजेंद्र भोसले'), findsOneWidget);
  });
}
