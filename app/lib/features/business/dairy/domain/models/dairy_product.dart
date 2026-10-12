/// Domain model representing a Dairy product from GET /dairy/products.
class DairyProductItem {
  final String id;
  final String name;
  final String category; // दूध, दही, पनीर, तूप, ताक, श्रीखंड, इतर
  final String packSize;
  final double? price;
  final String? description;
  final String? sellerId;
  final bool available;
  final DateTime? createdAt;

  const DairyProductItem({
    required this.id,
    required this.name,
    required this.category,
    required this.packSize,
    this.price,
    this.description,
    this.sellerId,
    this.available = true,
    this.createdAt,
  });

  factory DairyProductItem.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? '').toString();
    final name = (json['name'] ?? 'दुग्ध उत्पादन').toString();
    final category = (json['category'] ?? 'इतर').toString();
    final size = (json['packSize'] ?? json['size'] ?? 'मानक पॅक').toString();

    // Defensive price parsing (num or string)
    double? parsedPrice;
    final rawPrice = json['price'];
    if (rawPrice is num) {
      parsedPrice = rawPrice.toDouble();
    } else if (rawPrice is String) {
      // Strip currency signs or Marathi text if present
      final clean = rawPrice.replaceAll(RegExp(r'[^\d.]'), '');
      parsedPrice = double.tryParse(clean);
    }

    bool isAvailable = true;
    if (json['available'] is bool) {
      isAvailable = json['available'];
    } else if (json['available'] is String) {
      isAvailable = json['available'].toLowerCase() != 'false';
    }

    DateTime? created;
    if (json['createdAt'] is String) {
      created = DateTime.tryParse(json['createdAt']);
    }

    return DairyProductItem(
      id: id,
      name: name,
      category: category,
      packSize: size,
      price: parsedPrice,
      description: json['description']?.toString(),
      sellerId: json['sellerId']?.toString(),
      available: isAvailable,
      createdAt: created,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'packSize': packSize,
      if (price != null) 'price': price,
      if (description != null) 'description': description,
      if (sellerId != null) 'sellerId': sellerId,
      'available': available,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}
