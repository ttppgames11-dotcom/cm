/// Group category enum (शहरनिहाय vs आवडीनिहाय).
enum GroupCategory {
  location('शहर गट', 'शहरनिहाय गट', 'Location Groups'),
  interest('आवड गट', 'आवडीनिहाय गट', 'Interest Groups');

  const GroupCategory(this.badgeLabel, this.marathiTitle, this.englishTitle);
  final String badgeLabel;
  final String marathiTitle;
  final String englishTitle;
}

/// Filter criteria for the members directory.
enum MemberRegionFilter {
  all('all', 'सर्व (All)'),
  pune('pune', 'पुणे Connect'),
  mumbai('mumbai', 'मुंबई Connect'),
  nashik('nashik', 'नाशिक Connect'),
  outside('outside', 'महाराष्ट्राबाहेरील');

  const MemberRegionFilter(this.key, this.labelMr);
  final String key;
  final String labelMr;
}

/// A member profile in the community directory.
class CommunityMember {
  final String id;
  final String name;
  final String roleOrTitle;
  final String profession;
  final String location;
  final String regionKey; // 'pune', 'mumbai', 'nashik', 'outside'
  final String avatarAsset;

  /// Address of the member's own profile photo, or null (initials shown).
  final String? photoUrl;
  final String tier;
  final List<String> skills;
  final bool isVerified;

  const CommunityMember({
    required this.id,
    required this.name,
    required this.roleOrTitle,
    required this.profession,
    required this.location,
    required this.regionKey,
    required this.avatarAsset,
    this.photoUrl,
    required this.tier,
    required this.skills,
    this.isVerified = true,
  });
}

/// A post in the Community Feed.
class CommunityFeedPost {
  final String id;

  /// Backend member ID of the author ('' for static content).
  final String authorId;

  /// True when the signed-in member wrote this post (enables delete instead of report).
  final bool isMine;
  final String authorName;
  final String authorTitle;
  final String authorAvatar;

  /// Address of the author's own profile photo, or null (initials shown).
  final String? authorPhotoUrl;
  final String timeAgo;
  final String content;
  final String? imageAsset;

  /// Address of the photo attached to the post, or null.
  final String? imageUrl;
  final int likesCount;
  final int commentsCount;
  final bool isLikedByMe;

  /// Visible comments, oldest first (comments by blocked members are left
  /// out by the server).
  final List<PostComment> comments;

  const CommunityFeedPost({
    required this.id,
    this.authorId = '',
    this.isMine = false,
    required this.authorName,
    required this.authorTitle,
    required this.authorAvatar,
    this.authorPhotoUrl,
    required this.timeAgo,
    required this.content,
    this.imageAsset,
    this.imageUrl,
    required this.likesCount,
    required this.commentsCount,
    this.isLikedByMe = false,
    this.comments = const [],
  });

  CommunityFeedPost copyWith({
    bool? isLikedByMe,
    int? likesCount,
    int? commentsCount,
    List<PostComment>? comments,
  }) {
    return CommunityFeedPost(
      id: id,
      authorId: authorId,
      isMine: isMine,
      authorName: authorName,
      authorTitle: authorTitle,
      authorAvatar: authorAvatar,
      authorPhotoUrl: authorPhotoUrl,
      timeAgo: timeAgo,
      content: content,
      imageAsset: imageAsset,
      imageUrl: imageUrl,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? comments?.length ?? this.commentsCount,
      isLikedByMe: isLikedByMe ?? this.isLikedByMe,
      comments: comments ?? this.comments,
    );
  }
}

/// A community group model (city-based or interest-based).
class CommunityGroup {
  final String id;
  final String name;
  final String emoji;
  final String membersCountText;
  final String description;
  final GroupCategory category;
  final bool isJoined;

  const CommunityGroup({
    required this.id,
    required this.name,
    required this.emoji,
    required this.membersCountText,
    required this.description,
    required this.category,
    this.isJoined = false,
  });

  CommunityGroup copyWith({bool? isJoined}) {
    return CommunityGroup(
      id: id,
      name: name,
      emoji: emoji,
      membersCountText: membersCountText,
      description: description,
      category: category,
      isJoined: isJoined ?? this.isJoined,
    );
  }
}

/// One comment under a community feed post.
class PostComment {
  const PostComment({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.text,
    required this.timeAgo,
    this.isMine = false,
    this.authorPhotoUrl,
  });

  final String id;
  final String authorId;
  final String authorName;

  /// Address of the author's own profile photo, or null (initials shown).
  final String? authorPhotoUrl;
  final String text;
  final String timeAgo;

  /// True when the signed-in member wrote it (no "report" on your own).
  final bool isMine;
}
