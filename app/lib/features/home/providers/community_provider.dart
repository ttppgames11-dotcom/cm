import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../widgets/home/home_models.dart';
import 'home_provider.dart';

/// Provider for community activity posts.
final communityProvider = FutureProvider<List<CommunityActivityData>>((
  ref,
) async {
  final repository = ref.watch(homeRepositoryProvider);
  return repository.getCommunityActivities();
});

/// Provider for the single featured community post on the home screen.
final featuredCommunityPostProvider = FutureProvider<CommunityActivityData>((
  ref,
) async {
  final repository = ref.watch(homeRepositoryProvider);
  return repository.getCommunityActivity();
});
