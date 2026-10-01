/// Industry category for a directory listing, mirroring the website's
/// `CATEGORIES` filter pills (see `cm-web`'s `BusinessDirectoryPage.jsx`).
enum BusinessCategory {
  all('all', 'सर्व व्यवसाय', '🏢'),
  it('it', 'IT व सॉफ्टवेअर', '💻'),
  restaurant('restaurant', 'भोजनालय / रेस्टॉरंट', '🍛'),
  realEstate('realestate', 'रिअल इस्टेट व बांधकाम', '🏗️'),
  manufacturing('manufacturing', 'उत्पादन व उद्योग', '⚙️'),
  travel('travel', 'प्रवास, पर्यटन व ट्रेक', '🚌'),
  services('services', 'व्यावसायिक सेवा', '🤝');

  const BusinessCategory(this.id, this.labelMr, this.emoji);
  final String id;
  final String labelMr;
  final String emoji;
}

/// A member review left on a business listing.
class BusinessReview {
  const BusinessReview({
    required this.memberName,
    required this.rating,
    required this.text,
  });

  final String memberName;
  final int rating;
  final String text;
}

/// A Maratha-owned business directory entry.
class Business {
  const Business({
    required this.id,
    required this.name,
    required this.ownerName,
    required this.category,
    required this.city,
    required this.district,
    required this.phone,
    this.whatsapp,
    this.photoEmoji = '🏢',
    this.rating = 4.8,
    this.services = const [],
    this.hours,
    this.offer,
    this.reviews = const [],
  });

  final String id;
  final String name;
  final String ownerName;
  final BusinessCategory category;
  final String city;
  final String district;
  final String phone;
  final String? whatsapp;
  final String photoEmoji;
  final double rating;
  final List<String> services;
  final String? hours;
  final String? offer;
  final List<BusinessReview> reviews;

  Business copyWith({List<BusinessReview>? reviews}) {
    return Business(
      id: id,
      name: name,
      ownerName: ownerName,
      category: category,
      city: city,
      district: district,
      phone: phone,
      whatsapp: whatsapp,
      photoEmoji: photoEmoji,
      rating: rating,
      services: services,
      hours: hours,
      offer: offer,
      reviews: reviews ?? this.reviews,
    );
  }
}
