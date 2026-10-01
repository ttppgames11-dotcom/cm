import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_profile.dart';
import '../models/user_role.dart';
import 'auth_provider.dart';

/// Provider for the currently authenticated [UserProfile], or null if unauthenticated.
final currentUserProvider = Provider<UserProfile?>((ref) {
  final authController = ref.watch(authControllerProvider);
  return authController.state.profile;
});

/// Neutral placeholder used only while a session is being restored. It never
/// shows another person's details.
const _placeholderProfile = UserProfile(
  id: '',
  name: 'सदस्य',
  tier: 'Basic',
  role: UserRole.member,
  phone: '',
  city: '',
);

/// The authenticated profile, or a neutral placeholder when there is none.
final currentUserOrDefaultProvider = Provider<UserProfile>((ref) {
  return ref.watch(currentUserProvider) ?? _placeholderProfile;
});
