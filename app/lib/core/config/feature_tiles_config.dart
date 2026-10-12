/// Configuration for active, production-ready feature tiles across Connect Maratha.
///
/// Any tile or menu item that does not yet have real backend services, or is
/// a placeholder / upcoming feature, is omitted or flagged false here.
/// Switching an ID to true will re-enable it across the UI.
class FeatureTilesConfig {
  FeatureTilesConfig._();

  /// Business Hub tiles enabled in Version 1:
  /// - business_directory: /business/directory (Real DB/Backend data)
  /// - referrals: /business/referrals (Real DB/Backend data)
  /// - meetings: /business/meetings (Real DB/Backend data)
  /// - dairy: /business/dairy (Real DB/Backend data)
  ///
  /// Hidden in V1 (placeholders / no backend / made-up facts):
  /// - sangam (/business/sangam - placeholder)
  /// - b2b_deals (bottom sheet - no backend submission)
  /// - bank_finances (bottom sheet - no backend submission)
  /// - builders (/business/builders - hidden in V1 per Item 5)
  /// - manufacturers (/business/manufacturers - placeholder in live mode)
  static const Set<String> enabledBusinessHubTileRoutes = {
    '/business/directory',
    '/business/referrals',
    '/business/meetings',
    '/business/dairy',
  };

  /// Home Quick Actions grid item IDs enabled in Version 1:
  /// Only items with real working destinations and content.
  static const Set<String> enabledQuickActionIds = {
    'all',              // 'सर्व पहा' (More sheet launcher)
    'members',          // /members (Samaj Sadasya Screen - Real members)
    'feed',             // /community/feed (Community Feed - Real posts)
    'community',        // /community (Samaj Sadasya Screen - Real members)
    'business_hub',     // /business (Business Hub)
    'education',        // /history/granthalaya (Granthalaya catalogue)
    'granthalaya',      // /history/granthalaya
    'networking',       // /network (Maharashtra Network)
    'history',          // /history (History Hub)
    'culture',          // /culture (Culture Hub)
    'forts',            // /heritage (Forts list)
    'battles',          // /history (Shivkal battles)
    'directory',        // /business/directory
  };

  /// Check whether a Business Hub route is enabled
  static bool isBusinessHubRouteEnabled(String? route) {
    if (route == null) return false;
    return enabledBusinessHubTileRoutes.contains(route);
  }

  /// Check whether a Quick Action ID is enabled
  static bool isQuickActionEnabled(String id) {
    return enabledQuickActionIds.contains(id);
  }
}
