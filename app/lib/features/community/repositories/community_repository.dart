import 'dart:io';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../models/community_models.dart';

/// Why a member is reporting content. The keys are the values the backend
/// accepts (`/api/community/report`); the labels are shown to the user.
enum ReportReason {
  spam('spam', 'स्पॅम / जाहिरात'),
  abuse('abuse', 'अपमानास्पद भाषा'),
  harassment('harassment', 'छळवणूक / धमकी'),
  hate('hate', 'द्वेष पसरवणारे'),
  sexual('sexual', 'अश्लील मजकूर'),
  violence('violence', 'हिंसा'),
  misinformation('misinformation', 'चुकीची माहिती'),
  impersonation('impersonation', 'खोटी ओळख'),
  other('other', 'इतर');

  const ReportReason(this.key, this.label);
  final String key;
  final String label;
}

/// Community feed, members, report and block — all served by the secured
/// backend. Every call is made as the signed-in member; the server derives the
/// author/reporter from the access token.
class CommunityRepository {
  CommunityRepository(this._api);

  final ApiClient _api;

  Future<List<CommunityFeedPost>> fetchFeed({
    required String myMemberId,
  }) async {
    final data = await _api.get('/api/community/posts', auth: true);
    final posts = (data['posts'] as List? ?? const []).whereType<Map>();
    return posts
        .map((p) => _postFrom(Map<String, dynamic>.from(p), myMemberId))
        .toList();
  }

  /// One post by ID, e.g. opened from a shared link. Throws [ApiException]
  /// with status 404 when the post was deleted or hidden.
  Future<CommunityFeedPost> fetchPost(
    String postId, {
    required String myMemberId,
  }) async {
    final data = await _api.get(
      '/api/community/posts/${Uri.encodeComponent(postId)}',
      auth: true,
    );
    return _postFrom(
      Map<String, dynamic>.from(data['post'] as Map),
      myMemberId,
    );
  }

  /// Publishes a post. [imagePath] is a picture on this phone to attach: it
  /// is uploaded first, then the post is created with it.
  Future<CommunityFeedPost> createPost(
    String text, {
    required String myMemberId,
    String? imagePath,
  }) async {
    String? imageId;
    if (imagePath != null) {
      final uploaded = await _api.uploadImage(
        '/api/media/post',
        await File(imagePath).readAsBytes(),
      );
      imageId = uploaded['id']?.toString();
    }
    final data = await _api.post(
      '/api/community/posts',
      auth: true,
      body: {'text': text, if (imageId != null) 'image_id': imageId},
    );
    return _postFrom(
      Map<String, dynamic>.from(data['post'] as Map),
      myMemberId,
    );
  }

  /// Adds a comment and returns the post's comments as the server now has
  /// them (oldest first).
  Future<List<PostComment>> addComment(
    String postId,
    String text, {
    required String myMemberId,
  }) async {
    final data = await _api.post(
      '/api/community/posts/$postId/comments',
      auth: true,
      body: {'text': text},
    );
    return _commentsFrom(data['comments'], myMemberId);
  }

  Future<void> deletePost(String postId) async {
    await _api.delete('/api/community/posts/$postId', auth: true);
  }

  /// Toggles the like and returns the server's new like count.
  Future<({bool liked, int count})> toggleLike(String postId) async {
    final data = await _api.post(
      '/api/community/posts/$postId/like',
      auth: true,
    );
    return (
      liked: data['liked'] == true,
      count: (data['likes_count'] as num?)?.toInt() ?? 0,
    );
  }

  Future<void> report({
    required String targetType,
    required String targetId,
    required ReportReason reason,
    String details = '',
  }) async {
    await _api.post(
      '/api/community/report',
      auth: true,
      body: {
        'target_type': targetType,
        'target_id': targetId,
        'reason': reason.key,
        if (details.trim().isNotEmpty) 'details': details.trim(),
      },
    );
  }

  Future<void> blockMember(String memberId) async {
    await _api.post('/api/community/blocks/$memberId', auth: true);
  }

  Future<void> unblockMember(String memberId) async {
    await _api.delete('/api/community/blocks/$memberId', auth: true);
  }

  Future<List<CommunityMember>> fetchMembers() async {
    final data = await _api.get('/api/members', auth: true);
    final members = (data['members'] as List? ?? const []).whereType<Map>();
    return members
        .map((m) => _memberFrom(Map<String, dynamic>.from(m)))
        .toList();
  }

  // ── mapping ────────────────────────────────────────────────────────────

  static const _defaultAvatar = 'assets/avatars/user_profile.webp';

  CommunityFeedPost _postFrom(Map<String, dynamic> p, String myMemberId) {
    final authorId = (p['author_id'] ?? '').toString();
    final comments = p['comments'];
    return CommunityFeedPost(
      id: (p['id'] ?? '').toString(),
      authorId: authorId,
      isMine: authorId.isNotEmpty && authorId == myMemberId,
      authorName: (p['author_name'] ?? 'सदस्य').toString(),
      authorTitle: 'समाज सदस्य',
      authorAvatar: _defaultAvatar,
      authorPhotoUrl: ApiConfig.mediaUrl(p['author_photo']?.toString()),
      timeAgo: _timeAgo((p['created_at'] ?? '').toString()),
      content: (p['text'] ?? '').toString(),
      imageUrl: ApiConfig.mediaUrl(p['image']?.toString()),
      likesCount: (p['likes_count'] as num?)?.toInt() ?? 0,
      commentsCount: comments is List ? comments.length : 0,
      comments: _commentsFrom(comments, myMemberId),
    );
  }

  List<PostComment> _commentsFrom(Object? raw, String myMemberId) {
    if (raw is! List) return const [];
    return [
      for (final c in raw.whereType<Map>())
        PostComment(
          id: (c['id'] ?? '').toString(),
          authorId: (c['author_id'] ?? '').toString(),
          authorName: (c['author_name'] ?? 'सदस्य').toString(),
          authorPhotoUrl: ApiConfig.mediaUrl(c['author_photo']?.toString()),
          text: (c['text'] ?? '').toString(),
          timeAgo: _timeAgo((c['created_at'] ?? '').toString()),
          isMine:
              myMemberId.isNotEmpty &&
              (c['author_id'] ?? '').toString() == myMemberId,
        ),
    ];
  }

  CommunityMember _memberFrom(Map<String, dynamic> m) {
    final city = (m['city'] ?? '').toString();
    final district = (m['district'] ?? '').toString();
    final where = [city, district].where((s) => s.isNotEmpty).join(', ');
    final profession = (m['profession'] ?? '').toString();
    final skills = m['skills'];
    final d = district.toLowerCase();
    final regionKey =
        d.contains('पुणे') || d.contains('pune')
            ? 'pune'
            : d.contains('मुंबई') || d.contains('mumbai')
            ? 'mumbai'
            : d.contains('नाशिक') || d.contains('nashik')
            ? 'nashik'
            : 'outside';
    return CommunityMember(
      id: (m['id'] ?? '').toString(),
      name: (m['name'] ?? 'सदस्य').toString(),
      roleOrTitle: profession.isEmpty ? 'समाज सदस्य' : profession,
      profession: profession,
      location: where,
      regionKey: regionKey,
      avatarAsset: _defaultAvatar,
      photoUrl: ApiConfig.mediaUrl(m['photo']?.toString()),
      tier: (m['tier'] ?? 'Basic').toString(),
      skills:
          skills is List ? skills.map((s) => s.toString()).toList() : const [],
      isVerified: false,
    );
  }

  /// "YYYY-MM-DD HH:MM:SS" (server clock) -> short Marathi relative time.
  String _timeAgo(String raw) {
    // The server clock (PostgreSQL) is UTC.
    final parsed = DateTime.tryParse('${raw.replaceFirst(' ', 'T')}Z');
    if (parsed == null) return '';
    final diff = DateTime.now().toUtc().difference(parsed);
    if (diff.inMinutes < 1) return 'आत्ताच';
    if (diff.inMinutes < 60) return '${diff.inMinutes} मिनिटांपूर्वी';
    if (diff.inHours < 24) return '${diff.inHours} तासांपूर्वी';
    if (diff.inDays < 30) return '${diff.inDays} दिवसांपूर्वी';
    return '${parsed.day}/${parsed.month}/${parsed.year}';
  }
}
