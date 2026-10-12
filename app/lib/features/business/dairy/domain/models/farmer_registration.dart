/// Request payload and response domain model for farmer registration at a centre.
class FarmerRegistration {
  final String? id;
  final String centreId;
  final String farmerName;
  final String phone;
  final String village;
  final int cattleCount;
  final String milkType; // "cow" | "buffalo" | "both"
  final double expectedDailyLitres;
  final String? status;
  final DateTime? createdAt;

  const FarmerRegistration({
    this.id,
    required this.centreId,
    required this.farmerName,
    required this.phone,
    required this.village,
    required this.cattleCount,
    required this.milkType,
    required this.expectedDailyLitres,
    this.status,
    this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'farmerName': farmerName,
      'phone': phone,
      'village': village,
      'cattleCount': cattleCount,
      'milkType': milkType,
      'expectedDailyLitres': expectedDailyLitres,
    };
  }

  factory FarmerRegistration.fromJson(Map<String, dynamic> json) {
    return FarmerRegistration(
      id: (json['id'] ?? '').toString(),
      centreId: (json['dairyId'] ?? json['centreId'] ?? '').toString(),
      farmerName: (json['farmerName'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      village: (json['village'] ?? '').toString(),
      cattleCount: (json['cattleCount'] is num)
          ? (json['cattleCount'] as num).toInt()
          : int.tryParse(json['cattleCount']?.toString() ?? '0') ?? 0,
      milkType: (json['milkType'] ?? 'cow').toString(),
      expectedDailyLitres: (json['expectedDailyLitres'] is num)
          ? (json['expectedDailyLitres'] as num).toDouble()
          : double.tryParse(json['expectedDailyLitres']?.toString() ?? '0') ?? 0,
      status: json['status']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }
}
