import 'user_role.dart';

/// The authenticated member's profile as currently known to the app.
///
/// Field set mirrors what the existing website stores per-session
/// (`cm_user_id`, `cm_user_name`, `cm_user_tier`, `cm_user_role`,
/// `cm_user_phone`, `cm_user_city` in `assets/js/app.js`), plus the member's
/// own email, reference_id, referred_by, and total_referrals.
class UserProfile {
  const UserProfile({
    required this.id,
    required this.name,
    required this.tier,
    required this.role,
    required this.phone,
    required this.city,
    this.email = '',
    this.photo = '',
    this.referenceId = '',
    this.referredBy = '',
    this.totalReferrals = 0,
    this.skills = '',
    this.about = '',
  });

  final String id;
  final String name;
  final String tier;
  final UserRole role;
  final String phone;
  final String city;
  final String email;

  /// Server path of the member's profile photo (`/media/<id>`), or '' when
  /// they have none. Other members see this picture.
  final String photo;

  /// Unique reference/referral code for this member (e.g. REF-96K-XXXX)
  final String referenceId;

  /// Code of the member who referred this user
  final String referredBy;

  /// Total count of members referred by this user
  final int totalReferrals;

  /// Skills entered by the member as a string
  final String skills;

  /// About / Bio entered by the member as a string
  final String about;

  String get shortName => name.split(' ').first;

  /// Clean display reference ID (fall back to member ID if empty)
  String get displayReferenceId {
    if (referenceId.isNotEmpty) return referenceId;
    final numPart = id.replaceAll(RegExp(r'\D'), '');
    return numPart.isNotEmpty ? 'REF-96K-$numPart' : id;
  }

  UserProfile copyWith({
    String? name,
    String? phone,
    String? city,
    String? email,
    String? photo,
    String? referenceId,
    String? referredBy,
    int? totalReferrals,
    String? skills,
    String? about,
  }) {
    return UserProfile(
      id: id,
      name: name ?? this.name,
      tier: tier,
      role: role,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      email: email ?? this.email,
      photo: photo ?? this.photo,
      referenceId: referenceId ?? this.referenceId,
      referredBy: referredBy ?? this.referredBy,
      totalReferrals: totalReferrals ?? this.totalReferrals,
      skills: skills ?? this.skills,
      about: about ?? this.about,
    );
  }

  Map<String, String> toStorageMap() => {
    'id': id,
    'name': name,
    'tier': tier,
    'role': role.name,
    'phone': phone,
    'city': city,
    'email': email,
    'photo': photo,
    'reference_id': referenceId,
    'referred_by': referredBy,
    'total_referrals': totalReferrals.toString(),
    'skills': skills,
    'about': about,
  };

  factory UserProfile.fromStorageMap(Map<String, String> map) {
    return UserProfile(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      tier: map['tier'] ?? 'Basic',
      role: UserRole.fromName(map['role'] ?? UserRole.member.name),
      phone: map['phone'] ?? '',
      city: map['city'] ?? '',
      email: map['email'] ?? '',
      photo: map['photo'] ?? '',
      referenceId: map['reference_id'] ?? '',
      referredBy: map['referred_by'] ?? '',
      totalReferrals: int.tryParse(map['total_referrals'] ?? '0') ?? 0,
      skills: map['skills'] ?? '',
      about: map['about'] ?? '',
    );
  }
}
