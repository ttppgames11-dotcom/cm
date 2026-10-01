// Photos other members can see: the profile photo is uploaded (not kept on the
// phone only) and a post can carry a photo from the gallery or camera.
import 'dart:io';

import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/profile/member_avatar.dart';
import 'package:app/core/profile/profile_photo.dart';
import 'package:app/core/share/copy_share.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/models/user_role.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/community/models/community_models.dart';
import 'package:app/features/community/repositories/community_repository.dart';
import 'package:app/features/community/widgets/create_post_sheet.dart';
import 'package:app/features/community/widgets/post_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

const _photoA = '/media/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const _photoB = '/media/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

/// Records calls instead of using the network.
class _FakeApi extends ApiClient {
  _FakeApi() : super(SecureTokenStore());

  final calls = <String>[];
  Map<String, dynamic>? lastBody;
  Map<String, dynamic> feed = const {};

  @override
  Future<Map<String, dynamic>> get(String path, {bool auth = false}) async {
    calls.add('GET $path');
    return feed;
  }

  @override
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    calls.add('POST $path');
    lastBody = body;
    return {
      'post': {
        'id': 'P-1',
        'author_id': 'M1',
        'author_name': 'सुरेश',
        'text': body?['text'],
        'image': body?['image_id'] == null ? null : _photoB,
      },
    };
  }

  @override
  Future<Map<String, dynamic>> uploadImage(String path, List<int> bytes) async {
    calls.add('UPLOAD $path ${bytes.length}');
    return {'id': 'b' * 32, 'image': _photoB};
  }
}

class _FakePhotoApi extends ProfilePhotoApi {
  _FakePhotoApi() : super(ApiClient(SecureTokenStore()));

  int uploads = 0;
  int removals = 0;
  bool offline = false;
  String nextPath = _photoA;

  @override
  Future<String> upload(File file) async {
    if (offline) throw ApiException('इंटरनेट कनेक्शन नाही.', code: 'NO_INTERNET');
    uploads++;
    return nextPath;
  }

  @override
  Future<void> remove() async {
    removals++;
  }
}

class _FakeRepository extends CommunityRepository {
  _FakeRepository() : super(ApiClient(SecureTokenStore()));

  String? text;
  String? imagePath;
  bool fail = false;

  @override
  Future<CommunityFeedPost> createPost(
    String text, {
    required String myMemberId,
    String? imagePath,
  }) async {
    if (fail) throw ApiException('इंटरनेट कनेक्शन नाही.', code: 'NO_INTERNET');
    this.text = text;
    this.imagePath = imagePath;
    return CommunityFeedPost(
      id: 'P-new',
      authorName: 'मी',
      authorTitle: '',
      authorAvatar: '',
      timeAgo: 'आत्ताच',
      content: text,
      likesCount: 0,
      commentsCount: 0,
    );
  }
}

Future<void> _until(bool Function() done) async {
  for (var i = 0; i < 200 && !done(); i++) {
    await Future<void>.delayed(const Duration(milliseconds: 10));
  }
  expect(done(), isTrue, reason: 'timed out');
}

void main() {
  test('only the server\'s own picture paths become addresses', () {
    expect(ApiConfig.mediaUrl(_photoA), '${ApiConfig.baseUrl}$_photoA');
    expect(ApiConfig.mediaUrl(null), isNull);
    expect(ApiConfig.mediaUrl(''), isNull);
    expect(ApiConfig.mediaUrl('https://evil.example/x.png'), isNull);
    expect(ApiConfig.mediaUrl('/media/../api/admin'), isNull);
    expect(ApiConfig.mediaUrl('/assets/images/meeting.jpg'), isNull);
  });

  test('the profile keeps its photo across restarts', () {
    const profile = UserProfile(
      id: 'M1',
      name: 'a',
      tier: 'Basic',
      role: UserRole.member,
      phone: '',
      city: '',
      photo: _photoA,
    );
    expect(UserProfile.fromStorageMap(profile.toStorageMap()).photo, _photoA);
    expect(profile.copyWith(photo: '').photo, '');
    expect(profile.copyWith(name: 'b').photo, _photoA);
  });

  group('community repository', () {
    test('feed carries the author\'s photo, the post photo and commenters', () async {
      final api =
          _FakeApi()
            ..feed = {
              'posts': [
                {
                  'id': 'P-1',
                  'author_id': 'M2',
                  'author_name': 'प्रिया',
                  'author_photo': _photoA,
                  'text': 'रायगड',
                  'image': _photoB,
                  'comments': [
                    {'id': 'c1', 'author_id': 'M3', 'author_name': 'राहुल', 'author_photo': _photoA, 'text': 'छान'},
                    {'id': 'c2', 'author_id': 'M4', 'author_name': 'अमोल', 'author_photo': null, 'text': 'वा'},
                  ],
                },
                {'id': 'P-2', 'author_id': 'M5', 'author_name': 'x', 'text': 't', 'image': 'https://evil.example/x.png'},
              ],
            };
      final posts = await CommunityRepository(api).fetchFeed(myMemberId: 'M1');

      expect(posts[0].authorPhotoUrl, '${ApiConfig.baseUrl}$_photoA');
      expect(posts[0].imageUrl, '${ApiConfig.baseUrl}$_photoB');
      expect(posts[0].comments[0].authorPhotoUrl, '${ApiConfig.baseUrl}$_photoA');
      expect(posts[0].comments[1].authorPhotoUrl, isNull);
      expect(posts[1].authorPhotoUrl, isNull);
      expect(posts[1].imageUrl, isNull, reason: 'never load a foreign address');
    });

    test('a post with a photo uploads it first, then posts with its ID', () async {
      final dir = await Directory.systemTemp.createTemp('cm_post');
      addTearDown(() => dir.delete(recursive: true));
      final photo = File('${dir.path}/p.jpg')..writeAsBytesSync([1, 2, 3, 4]);
      final api = _FakeApi();

      final post = await CommunityRepository(
        api,
      ).createPost('रायगड', myMemberId: 'M1', imagePath: photo.path);

      expect(api.calls, ['UPLOAD /api/media/post 4', 'POST /api/community/posts']);
      expect(api.lastBody, {'text': 'रायगड', 'image_id': 'b' * 32});
      expect(post.imageUrl, '${ApiConfig.baseUrl}$_photoB');
      expect(post.isMine, isTrue);
    });

    test('a text-only post uploads nothing', () async {
      final api = _FakeApi();
      final post = await CommunityRepository(api).createPost('जय शिवराय', myMemberId: 'M1');
      expect(api.calls, ['POST /api/community/posts']);
      expect(api.lastBody, {'text': 'जय शिवराय'});
      expect(post.imageUrl, isNull);
    });
  });

  test('a picture over the size limit is refused before sending', () {
    expect(
      () => ApiClient(SecureTokenStore()).uploadImage('/api/media/post', List.filled(ApiClient.maxImageBytes + 1, 0)),
      throwsA(isA<ApiException>().having((e) => e.code, 'code', 'PAYLOAD_TOO_LARGE')),
    );
  });

  test('sharing a photo-only post still gives a readable message', () {
    final text = postShareText(postId: 'P-1', author: 'प्रिया', content: '  ');
    expect(text, contains('प्रिया यांची पोस्ट'));
    expect(text, contains(postLink('P-1')));
    expect(text, isNot(contains('""')));
  });

  group('profile photo', () {
    late Directory dir;
    late File picked;
    late AuthController auth;
    late ProfilePhotoStore store;
    late _FakePhotoApi api;
    late String memberId;

    ProviderContainer container() {
      final c = ProviderContainer(
        overrides: [
          authControllerProvider.overrideWith((ref) => auth),
          profilePhotoStoreProvider.overrideWithValue(store),
          profilePhotoApiProvider.overrideWithValue(api),
        ],
      );
      // Not disposed: that would dispose the shared AuthController, which a
      // test may hand to a second container (the "next app start").
      return c;
    }

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      dir = await Directory.systemTemp.createTemp('cm_photo');
      picked = File('${dir.path}/picked.jpg')..writeAsBytesSync([9, 9, 9]);
      store = ProfilePhotoStore(baseDir: () async => dir);
      api = _FakePhotoApi();
      auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await auth.loginWithDemoAccount();
      memberId = auth.state.profile!.id;
    });

    tearDown(() => dir.delete(recursive: true));

    test('a picked photo is uploaded and remembered on the profile', () async {
      final c = container();
      await c.read(myProfilePhotoProvider.future);
      await c.read(myProfilePhotoProvider.notifier).setPhoto(picked.path);

      expect(api.uploads, 1);
      expect(c.read(myProfilePhotoProvider).value, isNotNull);
      expect(auth.state.profile!.photo, _photoA);
      expect(await store.uploadedAs(memberId), _photoA);
      // Also in the cached session, for the next (possibly offline) start.
      expect((await AuthLocalDataSource().readSession())!.photo, _photoA);

      // Next start: same photo on the server, nothing is uploaded again.
      final next = container();
      expect(await next.read(myProfilePhotoProvider.future), isNotNull);
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(api.uploads, 1);
    });

    test('a failed upload keeps the photo and is retried on the next start', () async {
      api.offline = true;
      final c = container();
      await c.read(myProfilePhotoProvider.future);
      await expectLater(
        c.read(myProfilePhotoProvider.notifier).setPhoto(picked.path),
        throwsA(isA<ApiException>()),
      );
      expect(c.read(myProfilePhotoProvider).value, isNotNull, reason: 'still shown on this phone');
      expect(await store.uploadedAs(memberId), ProfilePhotoStore.pendingUpload);

      // The member already had an older photo on the server: the new one on
      // this phone must not be thrown away as "stale".
      auth.setProfilePhoto(_photoB);
      api.offline = false;
      final next = container();
      expect(await next.read(myProfilePhotoProvider.future), isNotNull);
      await _until(() => api.uploads == 1);
      await _until(() => auth.state.profile!.photo == _photoA);
    });

    test('a photo saved by the older app version is uploaded', () async {
      await store.save(memberId, picked.path); // no upload marker, none on server
      final c = container();
      expect(await c.read(myProfilePhotoProvider.future), isNotNull);
      await _until(() => auth.state.profile!.photo == _photoA);
      expect(api.uploads, 1);
    });

    test('a photo changed on another phone replaces the copy here', () async {
      await store.save(memberId, picked.path);
      await store.markUploadedAs(memberId, _photoA);
      auth.setProfilePhoto(_photoB); // what the server says now

      final c = container();
      expect(await c.read(myProfilePhotoProvider.future), isNull);
      expect(await store.load(memberId), isNull);
      expect(api.uploads, 0);
      expect(auth.state.profile!.photo, _photoB, reason: 'the avatar shows the server photo');
    });

    test('removing the photo removes it from the server too', () async {
      final c = container();
      await c.read(myProfilePhotoProvider.future);
      final photos = c.read(myProfilePhotoProvider.notifier);
      await photos.setPhoto(picked.path);
      await photos.removePhoto();

      expect(api.removals, 1);
      expect(c.read(myProfilePhotoProvider).value, isNull);
      expect(await store.load(memberId), isNull);
      expect(auth.state.profile!.photo, '');
    });
  });

  group('widgets', () {
    Future<AuthController> signedIn(WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(tester.view.reset);
      SharedPreferences.setMockInitialValues({});
      final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
      await tester.runAsync(auth.loginWithDemoAccount);
      return auth;
    }

    testWidgets('another member without a loadable photo shows their initial', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                MemberAvatar(name: 'Priya', photoUrl: 'https://api.connectmaratha.com$_photoA'),
                PostImage(url: 'https://api.connectmaratha.com$_photoB'),
              ],
            ),
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));
      // Network pictures cannot load in tests: the fallbacks must appear.
      expect(find.text('P'), findsOneWidget);
      expect(find.byIcon(Icons.broken_image_outlined), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('composer: text or a photo is needed, then it posts', (tester) async {
      final auth = await signedIn(tester);
      final repo = _FakeRepository();
      CommunityFeedPost? result;
      await tester.pumpWidget(
        ProviderScope(
          overrides: [authControllerProvider.overrideWith((ref) => auth)],
          child: MaterialApp(
            home: Scaffold(
              body: Builder(
                builder:
                    (context) => TextButton(
                      onPressed: () async {
                        result = await showModalBottomSheet<CommunityFeedPost>(
                          context: context,
                          isScrollControlled: true,
                          builder:
                              (_) => CreatePostSheet(
                                repository: repo,
                                myMemberId: 'M1',
                                authorName: 'संजय',
                                authorTier: 'Gold',
                              ),
                        );
                      },
                      child: const Text('open'),
                    ),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();

      expect(find.text('फोटो जोडा'), findsOneWidget);
      ElevatedButton button() => tester.widget(find.byType(ElevatedButton));
      expect(button().onPressed, isNull, reason: 'nothing to post yet');

      await tester.enterText(find.byType(TextField), '  जय शिवराय  ');
      await tester.pump();
      expect(button().onPressed, isNotNull);

      // A failure keeps the sheet open with what the member wrote.
      repo.fail = true;
      await tester.tap(find.text('पोस्ट करा'));
      await tester.pumpAndSettle();
      expect(find.text('इंटरनेट कनेक्शन नाही.'), findsOneWidget);
      expect(find.text('  जय शिवराय  '), findsOneWidget);
      expect(result, isNull);

      repo.fail = false;
      await tester.tap(find.text('पोस्ट करा'));
      await tester.pumpAndSettle();
      expect(repo.text, 'जय शिवराय');
      expect(repo.imagePath, isNull);
      expect(result?.id, 'P-new');
      expect(find.byType(CreatePostSheet), findsNothing);
    });
  });
}
