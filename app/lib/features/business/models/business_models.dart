import 'package:flutter/material.dart';

/// Industry category for a directory listing, matching the website's
/// `CATEGORIES` filter pills and the reference mobile UI.
enum BusinessCategory {
  all('all', 'सर्व', '🏢', Icons.grid_view_rounded),
  restaurant('restaurant', 'हॉटेल्स', '🍛', Icons.restaurant_rounded),
  shopping('shopping', 'खरेदी', '🛍️', Icons.shopping_cart_rounded),
  realEstate('realestate', 'रिअल इस्टेट', '🏗️', Icons.apartment_rounded),
  healthcare('healthcare', 'आरोग्य सेवा', '🩺', Icons.medical_services_rounded),
  it('it', 'IT सेवा', '💻', Icons.laptop_chromebook_rounded),
  manufacturing('manufacturing', 'उत्पादन', '⚙️', Icons.precision_manufacturing_rounded),
  travel('travel', 'प्रवास व पर्यटन', '🚌', Icons.directions_bus_rounded),
  services('services', 'व्यावसायिक सेवा', '🤝', Icons.handshake_rounded),
  other('other', 'इतर', '✨', Icons.more_horiz_rounded);

  const BusinessCategory(this.id, this.labelMr, this.emoji, [this.icon = Icons.business_rounded]);
  final String id;
  final String labelMr;
  final String emoji;
  final IconData icon;

  static BusinessCategory fromId(String id) {
    final clean = id.trim().toLowerCase();
    return BusinessCategory.values.firstWhere(
      (c) => c.id.toLowerCase() == clean,
      orElse: () => BusinessCategory.other,
    );
  }
}

/// A member review left on a business listing.
class BusinessReview {
  const BusinessReview({
    this.id,
    this.memberId,
    required this.memberName,
    required this.rating,
    required this.text,
    this.date,
  });

  final String? id;
  final String? memberId;
  final String memberName;
  final int rating;
  final String text;
  final String? date;

  factory BusinessReview.fromJson(Map<String, dynamic> json) {
    int parseRating(dynamic v) {
      if (v == null) return 5;
      if (v is int) return v;
      if (v is num) return v.round();
      return int.tryParse(v.toString()) ?? 5;
    }

    return BusinessReview(
      id: json['id']?.toString() ?? json['_id']?.toString(),
      memberId: json['memberId']?.toString() ?? json['userId']?.toString(),
      memberName: (json['memberName'] ?? json['author'] ?? json['userName'] ?? json['name'] ?? 'सदस्य').toString(),
      rating: parseRating(json['rating']),
      text: (json['text'] ?? json['comment'] ?? json['review'] ?? '').toString(),
      date: json['date']?.toString() ?? json['createdAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    if (memberId != null) 'memberId': memberId,
    'memberName': memberName,
    'rating': rating,
    'text': text,
    if (date != null) 'date': date,
  };
}

/// A Maratha-owned business directory entry matching the reference UI.
class Business {
  const Business({
    required this.id,
    required this.name,
    required this.ownerName,
    this.ownerId,
    required this.category,
    required this.city,
    required this.district,
    required this.phone,
    this.whatsapp,
    this.website,
    this.gstNumber,
    this.udyamNo,
    this.verified = false,
    this.photoEmoji = '🏢',
    this.imageUrl,
    this.rating = 4.8,
    this.reviewsCount = 42,
    this.services = const [],
    this.tags = const [],
    this.description,
    this.hours,
    this.offer,
    this.reviews = const [],
    this.isSaved = false,
  });

  final String id;
  final String name;
  final String ownerName;
  final String? ownerId;
  final BusinessCategory category;
  final String city;
  final String district;
  final String phone;
  final String? whatsapp;
  final String? website;
  final String? gstNumber;
  final String? udyamNo;
  final bool verified;
  final String photoEmoji;
  final String? imageUrl;
  final double rating;
  final int reviewsCount;
  final List<String> services;
  final List<String> tags;
  final String? description;
  final String? hours;
  final String? offer;
  final List<BusinessReview> reviews;
  final bool isSaved;

  /// Defensive JSON parser for records from GET /businesses and GET /businesses/:id.
  /// All fields except id may be missing. Services can be a String or List.
  factory Business.fromJson(Map<String, dynamic> json) {
    double parseRating(dynamic v) {
      if (v == null) return 0.0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0.0;
    }

    int parseCount(dynamic v) {
      if (v == null) return 0;
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse(v.toString()) ?? 0;
    }

    List<String> parseList(dynamic v) {
      if (v == null) return [];
      if (v is List) {
        return v.map((e) => e.toString().trim()).where((e) => e.isNotEmpty).toList();
      }
      if (v is String) {
        if (v.trim().isEmpty) return [];
        return v
            .split(RegExp(r'[,;\n]'))
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
      }
      return [];
    }

    final rawReviews = json['reviews'];
    final parsedReviews = <BusinessReview>[];
    if (rawReviews is List) {
      for (final r in rawReviews) {
        if (r is Map) {
          parsedReviews.add(BusinessReview.fromJson(Map<String, dynamic>.from(r)));
        }
      }
    }

    final catId = (json['category'] ?? json['categoryId'] ?? 'other').toString();
    final cat = BusinessCategory.fromId(catId);

    return Business(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? json['businessName'] ?? '').toString(),
      ownerName: (json['ownerName'] ?? json['owner'] ?? '').toString(),
      ownerId: json['ownerId']?.toString() ?? json['userId']?.toString(),
      category: cat,
      city: (json['city'] ?? '').toString(),
      district: (json['district'] ?? '').toString(),
      phone: (json['phone'] ?? json['mobile'] ?? json['contact'] ?? '').toString(),
      whatsapp: json['whatsapp']?.toString(),
      website: json['website']?.toString(),
      gstNumber: json['gstNumber']?.toString(),
      udyamNo: json['udyamNo']?.toString(),
      verified: json['verified'] == true || json['isVerified'] == true,
      photoEmoji: (json['photoEmoji'] ?? cat.emoji).toString(),
      imageUrl: json['imageUrl']?.toString() ?? json['image']?.toString(),
      rating: parseRating(json['rating']),
      reviewsCount: parseCount(json['reviewsCount'] ?? json['reviews_count'] ?? parsedReviews.length),
      services: parseList(json['services']),
      tags: parseList(json['tags']),
      description: json['description']?.toString(),
      hours: json['hours']?.toString(),
      offer: json['offer']?.toString() ?? json['offers']?.toString(),
      reviews: parsedReviews,
      isSaved: json['isSaved'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'owner': ownerName,
    'ownerName': ownerName,
    if (ownerId != null) 'ownerId': ownerId,
    'category': category.id,
    'city': city,
    'district': district,
    'phone': phone,
    if (whatsapp != null && whatsapp!.isNotEmpty) 'whatsapp': whatsapp,
    if (website != null && website!.isNotEmpty) 'website': website,
    if (gstNumber != null && gstNumber!.isNotEmpty) 'gstNumber': gstNumber,
    if (udyamNo != null && udyamNo!.isNotEmpty) 'udyamNo': udyamNo,
    'services': services,
    if (offer != null && offer!.isNotEmpty) 'offers': offer,
    if (description != null && description!.isNotEmpty) 'description': description,
    if (hours != null && hours!.isNotEmpty) 'hours': hours,
  };

  Business copyWith({
    String? id,
    String? name,
    String? ownerName,
    String? ownerId,
    BusinessCategory? category,
    String? city,
    String? district,
    String? phone,
    String? whatsapp,
    String? website,
    String? gstNumber,
    String? udyamNo,
    bool? verified,
    String? photoEmoji,
    String? imageUrl,
    double? rating,
    int? reviewsCount,
    List<String>? services,
    List<String>? tags,
    String? description,
    String? hours,
    String? offer,
    List<BusinessReview>? reviews,
    bool? isSaved,
  }) {
    return Business(
      id: id ?? this.id,
      name: name ?? this.name,
      ownerName: ownerName ?? this.ownerName,
      ownerId: ownerId ?? this.ownerId,
      category: category ?? this.category,
      city: city ?? this.city,
      district: district ?? this.district,
      phone: phone ?? this.phone,
      whatsapp: whatsapp ?? this.whatsapp,
      website: website ?? this.website,
      gstNumber: gstNumber ?? this.gstNumber,
      udyamNo: udyamNo ?? this.udyamNo,
      verified: verified ?? this.verified,
      photoEmoji: photoEmoji ?? this.photoEmoji,
      imageUrl: imageUrl ?? this.imageUrl,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      services: services ?? this.services,
      tags: tags ?? this.tags,
      description: description ?? this.description,
      hours: hours ?? this.hours,
      offer: offer ?? this.offer,
      reviews: reviews ?? this.reviews,
      isSaved: isSaved ?? this.isSaved,
    );
  }
}
