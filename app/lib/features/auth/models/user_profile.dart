import 'user_role.dart';

/// The authenticated member's profile as currently known to the app.
///
/// Field set mirrors what the existing website stores per-session
/// (`cm_user_id`, `cm_user_name`, `cm_user_tier`, `cm_user_role`,
/// `cm_user_phone`, `cm_user_city` in `assets/js/app.js`), plus the member's
/// own email so the profile can show it.
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

  String get shortName => name.split(' ').first;

  UserProfile copyWith({
    String? name,
    String? phone,
    String? city,
    String? email,
    String? photo,
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
    );
  }
}
