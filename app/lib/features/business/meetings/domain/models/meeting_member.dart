/// Member representation for meeting requests.
/// Strict privacy requirement: Only name, profession and city are exposed.
/// Never includes phone, email, or other private contact fields.
class MeetingMember {
  final String id;
  final String name;
  final String? profession;
  final String? city;

  const MeetingMember({
    required this.id,
    required this.name,
    this.profession,
    this.city,
  });

  factory MeetingMember.fromJson(Map<String, dynamic> json) {
    return MeetingMember(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      profession: json['profession']?.toString(),
      city: json['city']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'profession': profession,
      'city': city,
    };
  }
}
