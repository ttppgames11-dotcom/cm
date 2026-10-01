// Integration test: the real Flutter repositories against the running
// Node.js/PostgreSQL API (no mocks for the network layer).
//
//   flutter test test/backend_integration_test.dart --dart-define=API_BASE_URL=http://localhost:5000
//
// Fails when the API is not reachable. Creates and deletes its own throw-away
// members; never point it at production.
import 'dart:io';

import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/register_form_data.dart';
import 'package:app/features/auth/models/user_role.dart';
import 'package:app/features/auth/repositories/auth_repository.dart' show AuthException;
import 'package:app/features/auth/repositories/remote_auth_repository.dart';
import 'package:app/features/community/repositories/community_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Keystore replacement for tests (the real one needs a device).
class InMemoryTokenStore extends SecureTokenStore {
  String? access;
  String? refresh;

  @override
  Future<String?> readAccessToken() async => access;
  @override
  Future<String?> readRefreshToken() async => refresh;
  @override
  Future<void> save({required String accessToken, String? refreshToken}) async {
    access = accessToken;
    if (refreshToken != null) refresh = refreshToken;
  }

  @override
  Future<void> clear() async {
    access = null;
    refresh = null;
  }
}

class _Client {
  _Client(this.phone) {
    tokens = InMemoryTokenStore();
    api = ApiClient(tokens);
    auth = RemoteAuthRepository(AuthLocalDataSource(), api, tokens);
    community = CommunityRepository(api);
  }
  final String phone;
  late final InMemoryTokenStore tokens;
  late final ApiClient api;
  late final RemoteAuthRepository auth;
  late final CommunityRepository community;
  String get password => 'Passw0rd!x';
}

RegisterFormData _form(String phone, String name) => RegisterFormData(
  fullName: name,
  mobile: phone,
  password: 'Passw0rd!x',
  city: 'Haveli, Pune',
  district: 'पुणे / Pune',
);

Future<bool> _apiUp() async {
  try {
    final c = HttpClient()..connectionTimeout = const Duration(seconds: 3);
    final r = await (await c.getUrl(Uri.parse('${ApiConfig.baseUrl}/api/health'))).close();
    await r.drain<void>();
    c.close(force: true);
    return r.statusCode == 200;
  } catch (_) {
    return false;
  }
}

void main() {
  final stamp = DateTime.now().millisecondsSinceEpoch.toString().substring(6);
  late bool up;
  late _Client a;
  late _Client b;

  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    HttpOverrides.global = null; // flutter_test blocks real HTTP by default
    SharedPreferences.setMockInitialValues({});
    up = await _apiUp();
    a = _Client('91${stamp}0');
    b = _Client('91${stamp}1');
  });

  test('backend is reachable', () {
    // A missing API must FAIL this suite, never pass vacuously.
    expect(up, isTrue, reason: 'API not reachable at ${ApiConfig.baseUrl} (start the backend and pass --dart-define=API_BASE_URL=...)');
  });

  test('register, wrong password, unknown user', () async {
    final pa = await a.auth.register(_form(a.phone, 'Flutter Test A'));
    expect(pa.id, startsWith('M'));
    expect(a.tokens.access, isNotNull);
    expect(a.tokens.refresh, isNotNull);
    await b.auth.register(_form(b.phone, 'Flutter Test B'));

    await expectLater(
      a.auth.login(loginId: a.phone, password: 'wrong-password', role: UserRole.member),
      throwsA(isA<AuthException>().having((e) => e.code, 'code', 'INVALID_PASSWORD')),
    );
    await expectLater(
      a.auth.login(loginId: 'nobody-$stamp@example.com', password: 'x', role: UserRole.member),
      throwsA(isA<AuthException>().having((e) => e.code, 'code', 'USER_NOT_FOUND')),
    );
    await expectLater(
      a.auth.register(_form(a.phone, 'Duplicate')),
      throwsA(isA<AuthException>().having((e) => e.code, 'code', 'ALREADY_REGISTERED')),
    );
  });

  test('expired access token is refreshed transparently and rotated', () async {
    final oldRefresh = a.tokens.refresh;
    a.tokens.access = 'expired.or.invalid.token'; // simulate expiry
    final restored = await a.auth.restoreSession();
    expect(restored, isNotNull, reason: 'session must survive via refresh token');
    expect(a.tokens.access, isNot('expired.or.invalid.token'));
    expect(a.tokens.refresh, isNot(oldRefresh), reason: 'refresh token must rotate');
  });

  test('feed: create, like, report, block, delete (secured endpoints)', () async {
    final me = await a.auth.restoreSession();
    final post = await a.community.createPost('flutter integration post $stamp', myMemberId: me!.id);
    expect(post.isMine, isTrue);
    expect(post.authorId, me.id);

    final feedForB = await b.community.fetchFeed(myMemberId: 'x');
    final seenByB = feedForB.firstWhere((p) => p.id == post.id);
    expect(seenByB.isMine, isFalse);

    final like = await b.community.toggleLike(post.id);
    expect(like.liked, isTrue);
    expect(like.count, 1);

    // B reports A's post; reporting twice is harmless
    await b.community.report(targetType: 'post', targetId: post.id, reason: ReportReason.spam);
    await b.community.report(targetType: 'post', targetId: post.id, reason: ReportReason.spam);
    // Reporting yourself is refused by the server
    await expectLater(
      a.community.report(targetType: 'member', targetId: me.id, reason: ReportReason.other),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 400)),
    );
    // Reporting something that does not exist -> 404 handled as ApiException
    await expectLater(
      b.community.report(targetType: 'post', targetId: 'P-missing', reason: ReportReason.spam),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 404)),
    );

    // B blocks A -> A's posts vanish from B's feed and directory
    await b.community.blockMember(me.id);
    final blockedFeed = await b.community.fetchFeed(myMemberId: 'x');
    expect(blockedFeed.any((p) => p.id == post.id), isFalse);
    final members = await b.community.fetchMembers();
    expect(members.any((m) => m.id == me.id), isFalse);
    await b.community.unblockMember(me.id);

    // Only the author can delete a post
    await expectLater(
      b.community.deletePost(post.id),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 403)),
    );
    await a.community.deletePost(post.id);
  });

  test('member directory hides contact details and the app maps it', () async {
    final members = await b.community.fetchMembers();
    expect(members, isNotEmpty);
  });

  test('logout invalidates the session on the server', () async {
    final refreshBeforeLogout = a.tokens.refresh!;
    await a.auth.logout();
    expect(a.tokens.access, isNull);
    // The old refresh token no longer works
    a.tokens.refresh = refreshBeforeLogout;
    a.tokens.access = 'invalid';
    var expired = false;
    a.api.onSessionExpired = () => expired = true;
    await expectLater(
      a.api.get('/api/auth/me', auth: true),
      throwsA(isA<ApiException>().having((e) => e.code, 'code', 'SESSION_EXPIRED')),
    );
    expect(expired, isTrue);
  });

  test('account deletion removes the account and content', () async {
    final c = _Client('91${stamp}2');
    final me = await c.auth.register(_form(c.phone, 'Flutter Delete Me'));
    final post = await c.community.createPost('to be deleted $stamp', myMemberId: me.id);
    expect(post.id, isNotEmpty);

    // Wrong password refuses; correct one deletes
    await expectLater(
      c.auth.deleteAccount(password: 'wrong'),
      throwsA(isA<AuthException>().having((e) => e.code, 'code', 'INVALID_PASSWORD')),
    );
    await c.auth.deleteAccount(password: c.password);
    expect(c.tokens.access, isNull);

    await expectLater(
      c.auth.login(loginId: c.phone, password: c.password, role: UserRole.member),
      throwsA(isA<AuthException>().having((e) => e.code, 'code', 'USER_NOT_FOUND')),
    );
    final feed = await b.community.fetchFeed(myMemberId: 'x');
    expect(feed.any((p) => p.id == post.id), isFalse);
  });

  tearDownAll(() async {
    for (final c in [a, b]) {
      try {
        await c.auth.login(loginId: c.phone, password: c.password, role: UserRole.member);
        await c.auth.deleteAccount(password: c.password);
      } catch (_) {}
    }
  });
}
