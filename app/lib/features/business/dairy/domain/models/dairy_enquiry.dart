/// Domain model for Product Order/Enquiry submitted via POST /dairy/products/:id/enquiries.
class DairyEnquiry {
  final String? id;
  final String productId;
  final String name;
  final String phone;
  final String quantity;
  final String deliveryCity;
  final String message;
  final DateTime? createdAt;

  const DairyEnquiry({
    this.id,
    required this.productId,
    required this.name,
    required this.phone,
    required this.quantity,
    required this.deliveryCity,
    required this.message,
    this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'quantity': quantity,
      'deliveryCity': deliveryCity,
      'message': message,
    };
  }

  factory DairyEnquiry.fromJson(Map<String, dynamic> json) {
    return DairyEnquiry(
      id: json['id']?.toString(),
      productId: (json['productId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      quantity: (json['quantity'] ?? '').toString(),
      deliveryCity: (json['deliveryCity'] ?? '').toString(),
      message: (json['message'] ?? '').toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }
}
