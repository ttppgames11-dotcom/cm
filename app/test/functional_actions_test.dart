// Controls that used to only show a message now really do something:
// favourites are kept, "Saved" lists only what was saved, comments can be
// read / added / reported, and "share" puts the text on the clipboard.
import 'package:app/core/favorites/favorites_store.dart';
import 'package:app/core/share/copy_share.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/community/models/community_models.dart';
import 'package:app/features/community/widgets/post_comments_sheet.dart';
import 'package:app/features/profile/screens/saved_items_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

const _post = CommunityFeedPost(
  id: 'p1',
  authorId: 'M2',
  authorName: 'राजेंद्र भोसले',
  authorTitle: 'समाज सदस्य',
  authorAvatar: '',
  timeAgo: '२ तासांपूर्वी',
  content: 'जय शिवराय',
  likesCount: 0,
  commentsCount: 1,
  comments: [
    PostComment(
      id: 'c1',
      authorId: 'M3',
      authorName: 'प्रिया देशमुख',
      text: 'खूप छान!',
      timeAgo: '१ तासापूर्वी',
    ),
  ],
);

Future<void> _pumpSheet(
  WidgetTester tester, {
  required Future<List<PostComment>> Function(String) onSend,
  void Function(PostComment)? onReport,
}) async {
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 2.0;
  addTearDown(tester.view.reset);
  final auth = AuthController(LocalAuthRepository(AuthLocalDataSource()));
  await tester.pumpWidget(
    ProviderScope(
      overrides: [authControllerProvider.overrideWith((ref) => auth)],
      child: MaterialApp(
        home: Scaffold(
          body: Align(
            alignment: Alignment.bottomCenter,
            child: PostCommentsSheet(
              post: _post,
              onSend: onSend,
              onReport: onReport ?? (_) {},
              errorText: (e) => e.toString(),
            ),
          ),
        ),
      ),
    ),
  );
  await tester.pump();
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FavoritesStore.instance.resetForTest();
  });

  group('favourites', () {
    test('a favourite is still there after the app restarts', () async {
      final store = FavoritesStore.instance;
      expect(await store.toggleFort('rajgad'), isTrue);
      expect(await store.toggleWarrior('shivaji'), isTrue);

      store.resetForTest(); // "restart": forget memory, read storage again
      expect(store.isFort('rajgad'), isFalse);
      await store.load();

      expect(store.isFort('rajgad'), isTrue);
      expect(store.isWarrior('shivaji'), isTrue);
      expect(store.isFort('sinhgad'), isFalse);
    });

    test('toggling again removes it', () async {
      final store = FavoritesStore.instance;
      await store.toggleFort('rajgad');
      expect(await store.toggleFort('rajgad'), isFalse);
      expect(store.fortIds, isEmpty);
    });

    testWidgets('Saved lists nothing until something is saved', (
      tester,
    ) async {
      await tester.pumpWidget(const MaterialApp(home: SavedItemsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('अजून काहीही जतन केलेले नाही'), findsOneWidget);
      expect(find.byIcon(Icons.favorite_rounded), findsNothing);
    });

    testWidgets('Saved shows a saved fort and lets it be removed', (
      tester,
    ) async {
      await tester.runAsync(() => FavoritesStore.instance.toggleFort('rajgad'));
      await tester.pumpWidget(const MaterialApp(home: SavedItemsScreen()));
      await tester.pumpAndSettle();

      expect(find.text('अजून काहीही जतन केलेले नाही'), findsNothing);
      expect(find.byIcon(Icons.favorite_rounded), findsOneWidget);

      await tester.tap(find.byIcon(Icons.favorite_rounded));
      await tester.pumpAndSettle();

      expect(find.text('अजून काहीही जतन केलेले नाही'), findsOneWidget);
    });
  });

  group('comments', () {
    testWidgets('existing comments are shown', (tester) async {
      await _pumpSheet(tester, onSend: (_) async => const []);

      expect(find.text('टिप्पण्या (1)'), findsOneWidget);
      expect(find.text('खूप छान!'), findsOneWidget);
      expect(find.textContaining('प्रिया देशमुख'), findsOneWidget);
    });

    testWidgets('a new comment is sent and appears', (tester) async {
      String? sent;
      await _pumpSheet(
        tester,
        onSend: (text) async {
          sent = text;
          return [
            ..._post.comments,
            PostComment(
              id: 'c2',
              authorId: 'me',
              authorName: 'मी',
              text: text,
              timeAgo: 'आत्ताच',
              isMine: true,
            ),
          ];
        },
      );

      await tester.enterText(find.byType(TextField), '  जय भवानी  ');
      await tester.tap(find.byIcon(Icons.send_rounded));
      await tester.pumpAndSettle();

      expect(sent, 'जय भवानी');
      expect(find.text('टिप्पण्या (2)'), findsOneWidget);
      expect(find.text('जय भवानी'), findsOneWidget);
    });

    testWidgets('a failed send shows the error and keeps the text', (
      tester,
    ) async {
      await _pumpSheet(
        tester,
        onSend: (_) async => throw Exception('इंटरनेट कनेक्शन नाही'),
      );

      await tester.enterText(find.byType(TextField), 'नमस्कार');
      await tester.tap(find.byIcon(Icons.send_rounded));
      await tester.pumpAndSettle();

      expect(find.textContaining('इंटरनेट कनेक्शन नाही'), findsOneWidget);
      expect(find.text('नमस्कार'), findsOneWidget); // still in the box
      expect(find.text('टिप्पण्या (1)'), findsOneWidget);
    });

    testWidgets("someone else's comment can be reported", (tester) async {
      PostComment? reported;
      await _pumpSheet(
        tester,
        onSend: (_) async => const [],
        onReport: (c) => reported = c,
      );

      await tester.tap(find.byIcon(Icons.flag_outlined));
      await tester.pump();

      expect(reported?.id, 'c1');
    });
  });

  group('share', () {
    test('a shared post carries a link others can open', () {
      final text = postShareText(
        postId: 'P-abc123',
        author: 'सुरेश पाटील',
        content: 'जय शिवराय! रायगड भेट.',
      );
      expect(postLink('P-abc123'), 'https://api.connectmaratha.com/post/P-abc123');
      expect(text, contains('जय शिवराय! रायगड भेट.'));
      expect(text, contains('सुरेश पाटील'));
      expect(text, contains('https://api.connectmaratha.com/post/P-abc123'));
    });

    test('a very long post is quoted briefly, the link stays whole', () {
      final text = postShareText(
        postId: 'P-1',
        author: 'a',
        content: 'अ' * 500,
      );
      expect(text.length, lessThan(320));
      expect(text, endsWith('https://api.connectmaratha.com/post/P-1'));
    });

    test('forts and warriors are shared with the app link', () {
      expect(withAppLink('🏰 राजगड (पुणे)'), contains(appStoreLink));
    });

    test('share opens the share sheet with the text', () async {
      String? sharedText;
      final original = shareSheet;
      addTearDown(() => shareSheet = original);
      shareSheet = (text, subject) async => sharedText = text;

      expect(await shareText('नमस्कार'), isTrue);
      expect(sharedText, 'नमस्कार');
    });

    testWidgets('without a share sheet the text is copied instead', (
      tester,
    ) async {
      String? copied;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (call) async {
          if (call.method == 'Clipboard.setData') {
            copied = (call.arguments as Map)['text'] as String?;
          }
          return null;
        },
      );
      final original = shareSheet;
      addTearDown(() {
        shareSheet = original;
        tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
          SystemChannels.platform,
          null,
        );
      });
      shareSheet = (text, subject) async => throw StateError('no share sheet');

      final shared = await shareText('नमस्कार');

      expect(shared, isFalse);
      expect(copied, 'नमस्कार');
    });
  });
}
