/// Domain model representing a Builder Project record from GET /builders.
/// Parses defensively: all fields except `id` can be missing; ids are strings.
class BuilderProject {
  final String id;
  final String? projectName;
  final String? developer;
  final String? location;
  final String? city;
  final String? configuration;
  final String? priceRange;
  final String? phone;
  final bool reraApproved;
  final String? reraNumber;
  final String? discountForMembers;
  final String? ownerName;
  final String? ownerId;
  final String? projectType;
  final int? flatsDelivered;
  final List<String> amenities;
  final String? possessionDate;
  final DateTime? createdAt;

  bool get hasVerifiedRera =>
      reraApproved && reraNumber != null && reraNumber!.trim().isNotEmpty;

  const BuilderProject({
    required this.id,
    this.projectName,
    this.developer,
    this.location,
    this.city,
    this.configuration,
    this.priceRange,
    this.phone,
    this.reraApproved = false,
    this.reraNumber,
    this.discountForMembers,
    this.ownerName,
    this.ownerId,
    this.projectType,
    this.flatsDelivered,
    this.amenities = const [],
    this.possessionDate,
    this.createdAt,
  });

  factory BuilderProject.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? '').toString();

    // Defensive parsing for amenities (may be list, comma-separated string, or missing)
    List<String> parsedAmenities = [];
    final rawAmenities = json['amenities'];
    if (rawAmenities is List) {
      parsedAmenities = rawAmenities
          .map((a) => a?.toString().trim() ?? '')
          .where((a) => a.isNotEmpty)
          .toList();
    } else if (rawAmenities is String && rawAmenities.trim().isNotEmpty) {
      parsedAmenities = rawAmenities
          .split(RegExp(r'[,|]'))
          .map((a) => a.trim())
          .where((a) => a.isNotEmpty)
          .toList();
    }

    // Defensive flatsDelivered parsing (num or string)
    int? parsedFlats;
    final rawFlats = json['flatsDelivered'] ?? json['flats_delivered'];
    if (rawFlats is num) {
      parsedFlats = rawFlats.toInt();
    } else if (rawFlats is String) {
      parsedFlats = int.tryParse(rawFlats.replaceAll(RegExp(r'\D'), ''));
    }

    // Defensive reraApproved parsing
    bool parsedReraApproved = false;
    final rawReraApp = json['reraApproved'] ?? json['rera_approved'];
    if (rawReraApp is bool) {
      parsedReraApproved = rawReraApp;
    } else if (rawReraApp is String) {
      parsedReraApproved = rawReraApp.toLowerCase() == 'true' || rawReraApp == '1';
    } else if (rawReraApp is num) {
      parsedReraApproved = rawReraApp == 1;
    }

    // CreatedAt parsing
    DateTime? parsedCreatedAt;
    final rawCreated = json['createdAt'] ?? json['created_at'];
    if (rawCreated is String) {
      parsedCreatedAt = DateTime.tryParse(rawCreated);
    } else if (rawCreated is int) {
      parsedCreatedAt = DateTime.fromMillisecondsSinceEpoch(rawCreated);
    }

    final devName = (json['developer'] ?? json['name'])?.toString();
    final projName = (json['projectName'] ?? json['projects'] ?? json['title'])?.toString();
    final loc = (json['location'] ?? json['city'])?.toString();
    final cty = (json['city'] ?? json['location'])?.toString();
    final reraNum = (json['reraNumber'] ?? json['rera_number'] ?? json['rera'])?.toString();

    return BuilderProject(
      id: id,
      projectName: projName,
      developer: devName,
      location: loc,
      city: cty,
      configuration: (json['configuration'] ?? json['specialty'] ?? json['category'])?.toString(),
      priceRange: (json['priceRange'] ?? json['price_range'] ?? json['price'])?.toString(),
      phone: json['phone']?.toString(),
      reraApproved: parsedReraApproved,
      reraNumber: reraNum,
      discountForMembers: (json['discountForMembers'] ?? json['discount_for_members'] ?? json['desc'])?.toString(),
      ownerName: (json['ownerName'] ?? json['owner_name'])?.toString(),
      ownerId: (json['ownerId'] ?? json['owner_id'])?.toString(),
      projectType: (json['projectType'] ?? json['project_type'])?.toString(),
      flatsDelivered: parsedFlats,
      amenities: parsedAmenities,
      possessionDate: (json['possessionDate'] ?? json['possession_date'])?.toString(),
      createdAt: parsedCreatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'projectName': projectName,
      'developer': developer,
      'location': location,
      'city': city,
      'configuration': configuration,
      'priceRange': priceRange,
      'phone': phone,
      'reraApproved': reraApproved,
      'reraNumber': reraNumber,
      'discountForMembers': discountForMembers,
      'ownerName': ownerName,
      'ownerId': ownerId,
      'projectType': projectType,
      'flatsDelivered': flatsDelivered,
      'amenities': amenities,
      'possessionDate': possessionDate,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}
