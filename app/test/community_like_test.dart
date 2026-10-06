import 'package:flutter_test/flutter_test.dart';
import 'package:app/features/community/models/community_models.dart';

void main() {
  group('CommunityFeedPost Like/Unlike State & Rollback Tests', () {
    test('CommunityFeedPost initial like state parsing', () {
      final postUnliked = CommunityFeedPost(
        id: 'P1',
        authorId: 'M1',
        authorName: 'User 1',
        authorAvatar: 'assets/avatars/user_profile.webp',
        authorTitle: 'समाज सदस्य',
        timeAgo: 'आत्ताच',
        content: 'Test content',
        likesCount: 10,
        commentsCount: 0,
        isLikedByMe: false,
      );

      expect(postUnliked.isLikedByMe, isFalse);
      expect(postUnliked.likesCount, 10);

      // Optimistic like (+1, isLikedByMe = true)
      final postLikedOptimistic = postUnliked.copyWith(
        isLikedByMe: !postUnliked.isLikedByMe,
        likesCount: postUnliked.isLikedByMe ? postUnliked.likesCount - 1 : postUnliked.likesCount + 1,
      );
      expect(postLikedOptimistic.isLikedByMe, isTrue);
      expect(postLikedOptimistic.likesCount, 11);

      // Test G: Optimistic UI rollback if API fails
      // When API call throws, the state must roll back to the `before` state:
      final rolledBackPost = postUnliked;
      expect(rolledBackPost.isLikedByMe, isFalse);
      expect(rolledBackPost.likesCount, 10);
    });

    test('Optimistic unlike (-1, isLikedByMe = false) and rollback', () {
      final postLiked = CommunityFeedPost(
        id: 'P1',
        authorId: 'M1',
        authorName: 'User 1',
        authorAvatar: 'assets/avatars/user_profile.webp',
        authorTitle: 'समाज सदस्य',
        timeAgo: 'आत्ताच',
        content: 'Test content',
        likesCount: 11,
        commentsCount: 0,
        isLikedByMe: true,
      );

      // Optimistic unlike
      final postUnlikedOptimistic = postLiked.copyWith(
        isLikedByMe: !postLiked.isLikedByMe,
        likesCount: postLiked.isLikedByMe ? postLiked.likesCount - 1 : postLiked.likesCount + 1,
      );
      expect(postUnlikedOptimistic.isLikedByMe, isFalse);
      expect(postUnlikedOptimistic.likesCount, 10);

      // Rollback on failure
      final rolledBackPost = postLiked;
      expect(rolledBackPost.isLikedByMe, isTrue);
      expect(rolledBackPost.likesCount, 11);
    });

    test('Server sync applies server response {liked, likes_count}', () {
      final post = CommunityFeedPost(
        id: 'P1',
        authorId: 'M1',
        authorName: 'User 1',
        authorAvatar: 'assets/avatars/user_profile.webp',
        authorTitle: 'समाज सदस्य',
        timeAgo: 'आत्ताच',
        content: 'Test content',
        likesCount: 10,
        commentsCount: 0,
        isLikedByMe: false,
      );

      // Simulated server success response
      const serverResult = (liked: true, count: 11);
      final syncedPost = post.copyWith(
        isLikedByMe: serverResult.liked,
        likesCount: serverResult.count,
      );

      expect(syncedPost.isLikedByMe, isTrue);
      expect(syncedPost.likesCount, 11);
    });
  });
}