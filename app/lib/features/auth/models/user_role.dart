/// Mirrors the role dropdown on the existing website's login form
/// (`cm-login.html` → `#loginRole`).
enum UserRole {
  member('सदस्य (General Member)'),
  business('व्यावसायिक / उद्योजक (Business Owner)'),
  provider('सेवा प्रदाता (Service Provider)'),
  karyakarta('कार्यकर्ता / समन्वयक (Coordinator)');

  const UserRole(this.label);

  final String label;

  String get displayName => label;

  static UserRole fromName(String name) {
    return UserRole.values.firstWhere(
      (role) => role.name == name,
      orElse: () => UserRole.member,
    );
  }
}
