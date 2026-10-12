/// Lightweight member recipient model for "Give to" search.
/// Only contains name, profession, and city. Never exposes phone or email.
class ReferralMemberRecipient {
  final String id;
  final String name;
  final String profession;
  final String city;

  const ReferralMemberRecipient({
    required this.id,
    required this.name,
    this.profession = '',
    this.city = '',
  });

  factory ReferralMemberRecipient.fromJson(Map<String, dynamic> json) {
    return ReferralMemberRecipient(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      profession: (json['profession'] ?? json['role'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'profession': profession,
    'city': city,
  };
}
