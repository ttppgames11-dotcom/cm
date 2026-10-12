enum DairyKind { centre, brand }

/// A single unified defensive normalizer for Dairy records from GET /dairy.
/// Handles both collection centres and dairy brand organizations.
/// Every field except [id] can be missing; ids are strings.
class DairyItem {
  final String id;
  final DairyKind kind;

  // Collection Centre fields
  final String? dairyName;
  final String? village;
  final String? taluka;
  final String? district;
  final String? morningTiming;
  final String? eveningTiming;
  final int? registeredFarmers;
  final String? centerHead;
  final List<String> facilities;
  final String? milkRateCow;
  final String? milkRateBuffalo;
  final String? contact;
  final String? dailyCollection;
  final bool verified;
  final String? ownerId;

  // Brand fields
  final String? brandName;
  final String? type;
  final String? dailyProcurement;
  final String? headquarters;
  final String? products;
  final String? phone;
  final String? website;
  final DateTime? createdAt;

  const DairyItem({
    required this.id,
    required this.kind,
    this.dairyName,
    this.village,
    this.taluka,
    this.district,
    this.morningTiming,
    this.eveningTiming,
    this.registeredFarmers,
    this.centerHead,
    this.facilities = const [],
    this.milkRateCow,
    this.milkRateBuffalo,
    this.contact,
    this.dailyCollection,
    this.verified = false,
    this.ownerId,
    this.brandName,
    this.type,
    this.dailyProcurement,
    this.headquarters,
    this.products,
    this.phone,
    this.website,
    this.createdAt,
  });

  bool get isBrand => kind == DairyKind.brand;
  bool get isCentre => kind == DairyKind.centre;

  /// Display title for card headers
  String get displayName {
    if (isBrand) {
      return (brandName ?? dairyName ?? 'दुग्ध ब्रँड').trim();
    }
    return (dairyName ?? 'संकलन केंद्र').trim();
  }

  /// Primary phone number for calling
  String? get primaryPhone {
    final p = isBrand ? (phone ?? contact) : (contact ?? phone);
    if (p == null || p.trim().isEmpty) return null;
    return p.trim();
  }

  /// Formatted location line: "village, ता. taluka, जि. district" for centres,
  /// or headquarters / district for brands.
  /// Shows only segments that have actual data.
  String get formattedLocation {
    if (isBrand) {
      if (headquarters != null && headquarters!.trim().isNotEmpty) {
        return headquarters!.trim();
      }
      if (district != null && district!.trim().isNotEmpty) {
        return district!.trim();
      }
      return '';
    }
    final parts = <String>[];
    if (village != null && village!.trim().isNotEmpty) {
      parts.add(village!.trim());
    }
    if (taluka != null && taluka!.trim().isNotEmpty) {
      parts.add('ता. ${taluka!.trim()}');
    }
    if (district != null && district!.trim().isNotEmpty) {
      parts.add('जि. ${district!.trim()}');
    }
    return parts.join(', ');
  }

  /// Formatted timings string
  String? get formattedTimings {
    final parts = <String>[];
    if (morningTiming != null && morningTiming!.trim().isNotEmpty) {
      parts.add('सकाळ: ${morningTiming!.trim()}');
    }
    if (eveningTiming != null && eveningTiming!.trim().isNotEmpty) {
      parts.add('संध्याकाळ: ${eveningTiming!.trim()}');
    }
    if (parts.isEmpty) return null;
    return parts.join(' • ');
  }

  factory DairyItem.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? '').toString();

    // Invert/classify kind: records with brandName or kind "brand" are brands, others are centres
    final rawKind = (json['kind'] ?? '').toString().toLowerCase().trim();
    final rawBrandName = (json['brandName'] ?? json['brand_name'])?.toString();
    final hasBrand = rawBrandName != null && rawBrandName.trim().isNotEmpty;
    final isBrand = rawKind == 'brand' || hasBrand;
    final kind = isBrand ? DairyKind.brand : DairyKind.centre;

    // Normalizing name for centres: dairyName or centerName or name
    final dName = (json['dairyName'] ??
            json['dairy_name'] ??
            json['centerName'] ??
            json['center_name'] ??
            json['name'])
        ?.toString();

    // Normalizing facilities (can be a List or a comma/pipe split string)
    List<String> parsedFacilities = [];
    final rawFac = json['facilities'];
    if (rawFac is List) {
      parsedFacilities = rawFac
          .map((f) => f?.toString().trim() ?? '')
          .where((f) => f.isNotEmpty)
          .toList();
    } else if (rawFac is String && rawFac.trim().isNotEmpty) {
      parsedFacilities = rawFac
          .split(RegExp(r'[,|]'))
          .map((f) => f.trim())
          .where((f) => f.isNotEmpty)
          .toList();
    }

    // Normalizing registeredFarmers (num or string)
    int? parsedFarmers;
    final rawFarmers = json['registeredFarmers'] ??
        json['registered_farmers'] ??
        json['farmers'];
    if (rawFarmers is num) {
      parsedFarmers = rawFarmers.toInt();
    } else if (rawFarmers is String) {
      parsedFarmers = int.tryParse(rawFarmers.replaceAll(RegExp(r'\D'), ''));
    }

    // Normalizing contact or phone
    final contactVal =
        (json['contact'] ?? json['phone'] ?? json['mobile'])?.toString();
    final phoneVal =
        (json['phone'] ?? json['contact'] ?? json['mobile'])?.toString();

    // Normalizing timings
    final mTiming =
        (json['morningTiming'] ?? json['morning_timing'] ?? json['timing'])
            ?.toString();
    final eTiming =
        (json['eveningTiming'] ?? json['evening_timing'])?.toString();

    // Normalizing verified flag
    bool isVerified = false;
    final rawVer = json['verified'];
    if (rawVer is bool) {
      isVerified = rawVer;
    } else if (rawVer is String) {
      isVerified = rawVer.toLowerCase() == 'true' || rawVer == '1';
    }

    // Normalizing createdAt
    DateTime? parsedCreatedAt;
    final rawCreated = json['createdAt'] ?? json['created_at'];
    if (rawCreated is String) {
      parsedCreatedAt = DateTime.tryParse(rawCreated);
    }

    return DairyItem(
      id: id,
      kind: kind,
      dairyName: dName,
      village: (json['village'] ?? json['location'])?.toString(),
      taluka: json['taluka']?.toString(),
      district: json['district']?.toString(),
      morningTiming: mTiming,
      eveningTiming: eTiming,
      registeredFarmers: parsedFarmers,
      centerHead: (json['centerHead'] ?? json['center_head'])?.toString(),
      facilities: parsedFacilities,
      milkRateCow: (json['milkRateCow'] ??
              json['milk_rate_cow'] ??
              json['avgFat'])
          ?.toString(),
      milkRateBuffalo: (json['milkRateBuffalo'] ??
              json['milk_rate_buffalo'])
          ?.toString(),
      contact: contactVal,
      dailyCollection: (json['dailyCollection'] ?? json['daily_collection'])
          ?.toString(),
      verified: isVerified,
      ownerId: (json['ownerId'] ?? json['owner_id'])?.toString(),
      brandName: rawBrandName,
      type: json['type']?.toString(),
      dailyProcurement: (json['dailyProcurement'] ??
              json['daily_procurement'])
          ?.toString(),
      headquarters: json['headquarters']?.toString(),
      products: json['products']?.toString(),
      phone: phoneVal,
      website: json['website']?.toString(),
      createdAt: parsedCreatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'kind': isBrand ? 'brand' : 'centre',
      if (dairyName != null) 'dairyName': dairyName,
      if (village != null) 'village': village,
      if (taluka != null) 'taluka': taluka,
      if (district != null) 'district': district,
      if (morningTiming != null) 'morningTiming': morningTiming,
      if (eveningTiming != null) 'eveningTiming': eveningTiming,
      if (registeredFarmers != null) 'registeredFarmers': registeredFarmers,
      if (centerHead != null) 'centerHead': centerHead,
      'facilities': facilities,
      if (milkRateCow != null) 'milkRateCow': milkRateCow,
      if (milkRateBuffalo != null) 'milkRateBuffalo': milkRateBuffalo,
      if (contact != null) 'contact': contact,
      if (dailyCollection != null) 'dailyCollection': dailyCollection,
      'verified': verified,
      if (ownerId != null) 'ownerId': ownerId,
      if (brandName != null) 'brandName': brandName,
      if (type != null) 'type': type,
      if (dailyProcurement != null) 'dailyProcurement': dailyProcurement,
      if (headquarters != null) 'headquarters': headquarters,
      if (products != null) 'products': products,
      if (phone != null) 'phone': phone,
      if (website != null) 'website': website,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}
