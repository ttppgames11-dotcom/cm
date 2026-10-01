import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/models/user_profile.dart';
import '../../auth/models/user_role.dart';
import '../../auth/providers/current_user_provider.dart';

/// Data model representing profile stats, details, and current user identity.
class ProfileData {
  const ProfileData({
    required this.user,
    this.email = '',
    this.fortsVisited = 0,
    this.communityRank = 0,
    this.contributionScore = 0,
    this.eventsAttended = 0,
  });

  final UserProfile user;
  final String email;
  final int fortsVisited;
  final int communityRank;
  final int contributionScore;
  final int eventsAttended;
}

/// Provider for profile screen data, combining the authenticated user and community stats.
///
/// There is no activity-stats API yet, so those stay zero rather than showing
/// placeholder values as if they were the member's own.
final profileProvider = Provider<ProfileData>((ref) {
  final user =
      ref.watch(currentUserProvider) ??
      const UserProfile(
        id: '',
        name: '',
        tier: 'Basic',
        role: UserRole.member,
        phone: '',
        city: '',
      );
  return ProfileData(user: user, email: user.email);
});
