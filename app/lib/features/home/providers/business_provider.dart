import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Data model representing a Maratha business directory entry.
class BusinessItem {
  const BusinessItem({
    required this.id,
    required this.name,
    required this.category,
    required this.ownerName,
    required this.city,
    required this.phone,
    this.rating = '4.8',
    this.isVerified = true,
  });

  final String id;
  final String name;
  final String category;
  final String ownerName;
  final String city;
  final String phone;
  final String rating;
  final bool isVerified;

  static const defaultBusinesses = [
    BusinessItem(
      id: 'biz-1',
      name: 'स्वराज्य ॲग्रो प्रॉडक्ट्स',
      category: 'कृषी व प्रक्रिया',
      ownerName: 'संजय पाटील',
      city: 'पुणे',
      phone: '9876543210',
    ),
    BusinessItem(
      id: 'biz-2',
      name: 'सह्याद्री टूर्स & ट्रेक्स',
      category: 'पर्यटन व दुर्गभ्रमण',
      ownerName: 'तानाजी सावंत',
      city: 'सातारा',
      phone: '9822004455',
    ),
    BusinessItem(
      id: 'biz-3',
      name: 'शिवमुद्रा वस्त्रदालन',
      category: 'कापड व पारंपरिक पोशाख',
      ownerName: 'प्रिया देशमुख',
      city: 'कोल्हापूर',
      phone: '9766112233',
    ),
  ];
}

/// Provider for Maratha business directory listings.
final businessProvider = Provider<List<BusinessItem>>((ref) {
  return BusinessItem.defaultBusinesses;
});
