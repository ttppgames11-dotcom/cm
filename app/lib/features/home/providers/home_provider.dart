import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/current_user_provider.dart';
import '../../../widgets/home/home_models.dart';
import '../data/local_home_data_source.dart';
import '../repositories/home_repository.dart';

/// Provider for [LocalHomeDataSource].
final homeDataSourceProvider = Provider<LocalHomeDataSource>((ref) {
  return LocalHomeDataSource();
});

/// Provider for [HomeRepository].
final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  final dataSource = ref.watch(homeDataSourceProvider);
  return LocalHomeRepository(dataSource);
});

/// Aggregate state for the Home screen.
class HomeDashboardState {
  const HomeDashboardState({
    required this.memberData,
    required this.heroBanner,
    required this.quickActions,
    required this.upcomingEvent,
    required this.heritageHighlights,
    required this.communityActivity,
  });

  final MemberCardData memberData;
  final HeroBannerData heroBanner;
  final List<QuickActionData> quickActions;
  final UpcomingEventData upcomingEvent;
  final List<HeritageData> heritageHighlights;
  final CommunityActivityData communityActivity;
}

/// Provider for the Home screen dashboard data.
final homeProvider = FutureProvider<HomeDashboardState>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  final currentUser = ref.watch(currentUserProvider);

  final memberData = await repository.getMemberCardData(currentUser);
  final heroBanner = await repository.getHeroBanner();
  final quickActions = await repository.getQuickActions();
  final upcomingEvent = await repository.getUpcomingEvent();
  final heritageHighlights = await repository.getHeritageHighlights();
  final communityActivity = await repository.getCommunityActivity();

  return HomeDashboardState(
    memberData: memberData,
    heroBanner: heroBanner,
    quickActions: quickActions,
    upcomingEvent: upcomingEvent,
    heritageHighlights: heritageHighlights,
    communityActivity: communityActivity,
  );
});

/// Provider for the member card specifically.
final memberCardDataProvider = FutureProvider<MemberCardData>((ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  final currentUser = ref.watch(currentUserProvider);
  return repository.getMemberCardData(currentUser);
});
