import '../../../core/network/api_client.dart';
import '../data/community_data.dart';
import '../models/community_models.dart';
import 'community_repository.dart';

/// In-memory community feed and members for the offline demo build
/// ([ApiConfig.demoMode]). Posts and likes last until the app is closed.
class DemoCommunityRepository extends CommunityRepository {
  DemoCommunityRepository(super.api);

  static const _avatar = 'assets/avatars/user_profile.webp';

  final List<CommunityFeedPost> _posts = [
    const CommunityFeedPost(
      id: 'demo-p1',
      authorId: 'cm-2',
      authorName: 'राजेंद्र भोसले',
      authorTitle: 'उद्योजक',
      authorAvatar: _avatar,
      timeAgo: '२ तासांपूर्वी',
      content:
          'पुण्यात पुढील महिन्यात समाज उद्योजक मेळावा होत आहे. नवीन व्यावसायिकांनी जरूर सहभागी व्हावे! 🚩',
      likesCount: 24,
      commentsCount: 0,
    ),
    const CommunityFeedPost(
      id: 'demo-p2',
      authorId: 'cm-3',
      authorName: 'प्रिया देशमुख',
      authorTitle: 'समाज सदस्य',
      authorAvatar: _avatar,
      timeAgo: '५ तासांपूर्वी',
      content:
          'शिवजयंतीनिमित्त रक्तदान शिबिराचे आयोजन केले आहे. इच्छुकांनी नोंदणी करावी. 🙏',
      likesCount: 41,
      commentsCount: 0,
    ),
    const CommunityFeedPost(
      id: 'demo-p3',
      authorId: 'cm-1',
      authorName: 'अभय गोंड',
      authorTitle: 'सॉफ्टवेअर आर्किटेक्ट',
      authorAvatar: _avatar,
      timeAgo: '१ दिवसापूर्वी',
      content:
          'Connect Maratha ॲप लवकरच Play Store वर येत आहे. तुमचे अभिप्राय नक्की कळवा!',
      likesCount: 67,
      commentsCount: 0,
    ),
  ];

  @override
  Future<List<CommunityFeedPost>> fetchFeed({
    required String myMemberId,
  }) async => List.of(_posts);

  @override
  Future<CommunityFeedPost> createPost(
    String text, {
    required String myMemberId,
    String? imagePath,
  }) async {
    final post = CommunityFeedPost(
      id: 'demo-${DateTime.now().microsecondsSinceEpoch}',
      authorId: myMemberId,
      isMine: true,
      authorName: 'तुम्ही',
      authorTitle: 'समाज सदस्य',
      authorAvatar: _avatar,
      timeAgo: 'आत्ताच',
      content: text,
      likesCount: 0,
      commentsCount: 0,
    );
    _posts.insert(0, post);
    return post;
  }

  @override
  Future<CommunityFeedPost> fetchPost(
    String postId, {
    required String myMemberId,
  }) async {
    return _posts.firstWhere(
      (p) => p.id == postId,
      orElse: () => throw ApiException('पोस्ट सापडली नाही.', statusCode: 404),
    );
  }

  @override
  Future<List<PostComment>> addComment(
    String postId,
    String text, {
    required String myMemberId,
  }) async {
    final i = _posts.indexWhere((p) => p.id == postId);
    if (i < 0) return const [];
    final comments = [
      ..._posts[i].comments,
      PostComment(
        id: 'demo-c${DateTime.now().microsecondsSinceEpoch}',
        authorId: myMemberId,
        authorName: 'तुम्ही',
        text: text,
        timeAgo: 'आत्ताच',
        isMine: true,
      ),
    ];
    _posts[i] = _posts[i].copyWith(comments: comments);
    return comments;
  }

  @override
  Future<void> deletePost(String postId) async =>
      _posts.removeWhere((p) => p.id == postId);

  @override
  Future<({bool liked, int count})> toggleLike(String postId) async {
    final i = _posts.indexWhere((p) => p.id == postId);
    if (i < 0) return (liked: false, count: 0);
    final p = _posts[i];
    final liked = !p.isLikedByMe;
    _posts[i] = p.copyWith(
      isLikedByMe: liked,
      likesCount: p.likesCount + (liked ? 1 : -1),
    );
    return (liked: liked, count: _posts[i].likesCount);
  }

  @override
  Future<void> report({
    required String targetType,
    required String targetId,
    required ReportReason reason,
    String details = '',
  }) async {}

  @override
  Future<void> blockMember(String memberId) async =>
      _posts.removeWhere((p) => p.authorId == memberId);

  @override
  Future<void> unblockMember(String memberId) async {}

  @override
  Future<List<CommunityMember>> fetchMembers() async => CommunityData.members;
}
