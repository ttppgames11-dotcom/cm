import '../../auth/models/user_profile.dart';
import '../../../widgets/home/home_models.dart';
import '../data/local_home_data_source.dart';

/// Repository interface for home/dashboard data.
/// Allows swapping local demo data for ApiDataSource later without UI changes.
abstract class HomeRepository {
  Future<HeroBannerData> getHeroBanner();
  Future<List<QuickActionData>> getQuickActions();
  Future<UpcomingEventData> getUpcomingEvent();
  Future<List<UpcomingEventData>> getAllUpcomingEvents();
  Future<List<HeritageData>> getHeritageHighlights();
  Future<CommunityActivityData> getCommunityActivity();
  Future<List<CommunityActivityData>> getCommunityActivities();
  Future<MemberCardData> getMemberCardData(UserProfile? profile);
}

/// Local implementation of [HomeRepository].
class LocalHomeRepository implements HomeRepository {
  const LocalHomeRepository(this._dataSource);

  final LocalHomeDataSource _dataSource;

  @override
  Future<HeroBannerData> getHeroBanner() async {
    return _dataSource.getHeroBanner();
  }

  @override
  Future<List<QuickActionData>> getQuickActions() async {
    return _dataSource.getQuickActions();
  }

  @override
  Future<UpcomingEventData> getUpcomingEvent() async {
    return _dataSource.getUpcomingEvent();
  }

  @override
  Future<List<UpcomingEventData>> getAllUpcomingEvents() async {
    return _dataSource.getAllUpcomingEvents();
  }

  @override
  Future<List<HeritageData>> getHeritageHighlights() async {
    return _dataSource.getHeritageHighlights();
  }

  @override
  Future<CommunityActivityData> getCommunityActivity() async {
    return _dataSource.getCommunityActivity();
  }

  @override
  Future<List<CommunityActivityData>> getCommunityActivities() async {
    return _dataSource.getCommunityActivities();
  }

  @override
  Future<MemberCardData> getMemberCardData(UserProfile? profile) async {
    return _dataSource.getMemberCardData(profile);
  }
}
