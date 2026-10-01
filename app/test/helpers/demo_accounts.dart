import 'package:app/features/auth/models/user_profile.dart';
import 'package:app/features/auth/models/user_role.dart';

/// Test and fixture accounts ported from development demo profiles.
/// Moved to test-only helpers to ensure lib/ has zero demo login data.
class DemoAccounts {
  DemoAccounts._();

  static const _abhay = UserProfile(
    id: 'CM10000001',
    name: 'Abhay Gond',
    tier: 'Gold',
    role: UserRole.member,
    phone: '9876543210',
    city: 'Pune, Maharashtra',
  );

  static const Map<UserRole, UserProfile> byRole = {
    UserRole.member: UserProfile(
      id: 'CM12345678',
      name: 'संजय शिवाजी पाटील',
      tier: 'Gold',
      role: UserRole.member,
      phone: '9876543210',
      city: 'पुणे',
    ),
    UserRole.business: UserProfile(
      id: 'CMBIZ202601',
      name: 'प्रिया देशमुख',
      tier: 'Platinum',
      role: UserRole.business,
      phone: '9822004455',
      city: 'कोल्हापूर',
    ),
    UserRole.provider: UserProfile(
      id: 'CMSRV202602',
      name: 'राहुल मोहिते',
      tier: 'Silver',
      role: UserRole.provider,
      phone: '9766112233',
      city: 'सातारा',
    ),
    UserRole.karyakarta: UserProfile(
      id: 'CMKAR202603',
      name: 'अभिजित भोसले',
      tier: 'Coordinator',
      role: UserRole.karyakarta,
      phone: '9898989898',
      city: 'नाशिक',
    ),
  };

  static UserProfile profileFor(UserRole role, {String? loginId}) {
    if (loginId != null && loginId.trim().toLowerCase() == 'abhay') {
      return _abhay;
    }
    final base = byRole[role] ?? byRole[UserRole.member]!;
    if (loginId == null || loginId.isEmpty) return base;
    return UserProfile(
      id: loginId,
      name: base.name,
      tier: base.tier,
      role: base.role,
      phone: base.phone,
      city: base.city,
    );
  }
}
