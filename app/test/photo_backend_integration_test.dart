// Integration test: one member uploads a profile photo and posts with a
// photo; ANOTHER member must see both. Uses the app's real network code
// against a running API (no mocks).
//
//   flutter test test/photo_backend_integration_test.dart --dart-define=API_BASE_URL=http://localhost:5000
//
// Skipped unless API_BASE_URL points at this computer, so it can never write
// to production. Creates and deletes its own throw-away members.
import 'dart:convert';
import 'dart:io';

import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/profile/profile_photo.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/register_form_data.dart';
import 'package:app/features/auth/repositories/remote_auth_repository.dart';
import 'package:app/features/community/repositories/community_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _MemoryTokens extends SecureTokenStore {
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

class _Member {
  _Member(this.phone) {
    api = ApiClient(tokens);
    auth = RemoteAuthRepository(AuthLocalDataSource(), api, tokens);
    community = CommunityRepository(api);
    photos = ProfilePhotoApi(api);
  }
  final String phone;
  final tokens = _MemoryTokens();
  late final ApiClient api;
  late final RemoteAuthRepository auth;
  late final CommunityRepository community;
  late final ProfilePhotoApi photos;
  late final String id;

  Future<void> register(String name) async {
    final profile = await auth.register(
      RegisterFormData(
        fullName: name,
        mobile: phone,
        password: _password,
        city: 'Haveli, Pune',
        district: 'पुणे / Pune',
      ),
    );
    id = profile.id;
  }
}

const _password = 'Passw0rd!x';

// A real 1x1 PNG.
final _png = base64Decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
);

Future<({int status, List<int> bytes, String? type})> _download(String url) async {
  final client = HttpClient();
  try {
    final res = await (await client.getUrl(Uri.parse(url))).close();
    final bytes = await res.fold<List<int>>([], (all, chunk) => all..addAll(chunk));
    return (status: res.statusCode, bytes: bytes, type: res.headers.contentType?.mimeType);
  } finally {
    client.close(force: true);
  }
}

void main() {
  final isLocal = RegExp(r'^http://(localhost|127\.0\.0\.1)(:\d+)?$').hasMatch(ApiConfig.baseUrl);
  final skip = isLocal ? null : 'needs --dart-define=API_BASE_URL=http://localhost:<port>';
  final stamp = DateTime.now().millisecondsSinceEpoch.toString().substring(6);
  late _Member a;
  late _Member b;
  late Directory dir;
  late File photo;

  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    HttpOverrides.global = null; // flutter_test blocks real HTTP by default
    SharedPreferences.setMockInitialValues({});
    dir = await Directory.systemTemp.createTemp('cm_it');
    photo = File('${dir.path}/photo.png')..writeAsBytesSync(_png);
    a = _Member('92${stamp}0');
    b = _Member('92${stamp}1');
    if (isLocal) {
      await a.register('Photo Test A');
      await b.register('Photo Test B');
    }
  });

  tearDownAll(() async {
    if (isLocal) {
      for (final m in [a, b]) {
        await m.auth.deleteAccount(password: _password);
      }
    }
    await dir.delete(recursive: true);
  });

  test('a post reaches the server and another member sees it', () async {
    final post = await a.community.createPost('integration text post $stamp', myMemberId: a.id);
    final feed = await b.community.fetchFeed(myMemberId: b.id);
    expect(feed.map((p) => p.id), contains(post.id));
  }, skip: skip);

  test('a profile photo is seen by another member', () async {
    final path = await a.photos.upload(photo);
    expect(ApiConfig.mediaUrl(path), isNotNull);
    expect((await a.auth.restoreSession())!.photo, path, reason: 'the profile carries it after a restart');

    final members = await b.community.fetchMembers();
    final seen = members.firstWhere((m) => m.id == a.id);
    expect(seen.photoUrl, ApiConfig.mediaUrl(path));
    final file = await _download(seen.photoUrl!);
    expect(file.status, 200);
    expect(file.type, 'image/png');
    expect(file.bytes, _png);
  }, skip: skip);

  test('a post with a photo is seen by another member, with the author\'s photo', () async {
    final post = await a.community.createPost('', myMemberId: a.id, imagePath: photo.path);
    expect(post.imageUrl, isNotNull);

    final feed = await b.community.fetchFeed(myMemberId: b.id);
    final seen = feed.firstWhere((p) => p.id == post.id);
    expect(seen.imageUrl, post.imageUrl);
    expect(seen.authorPhotoUrl, isNotNull);
    expect((await _download(seen.imageUrl!)).bytes, _png);
    expect((await _download(seen.authorPhotoUrl!)).status, 200);

    final opened = await b.community.fetchPost(post.id, myMemberId: b.id);
    expect(opened.imageUrl, post.imageUrl);

    await a.community.deletePost(post.id);
    expect((await _download(post.imageUrl!)).status, 404, reason: 'deleted with the post');
  }, skip: skip);

  test('removing the profile photo removes it for everyone', () async {
    final before = (await b.community.fetchMembers()).firstWhere((m) => m.id == a.id).photoUrl!;
    await a.photos.remove();
    expect((await b.community.fetchMembers()).firstWhere((m) => m.id == a.id).photoUrl, isNull);
    expect((await _download(before)).status, 404);
  }, skip: skip);

  test('a file that is not a picture is refused', () async {
    final fake = File('${dir.path}/fake.jpg')..writeAsStringSync('this is not a picture at all');
    await expectLater(
      a.photos.upload(fake),
      throwsA(isA<ApiException>().having((e) => e.code, 'code', 'INVALID_IMAGE')),
    );
  }, skip: skip);
}
