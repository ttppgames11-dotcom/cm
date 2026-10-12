import '../models/dairy_item.dart';
import '../models/dairy_product.dart';
import '../models/farmer_registration.dart';
import '../models/dairy_enquiry.dart';

abstract class DairyRepository {
  /// Fetches collection centres and/or brands with optional query filters.
  Future<List<DairyItem>> getDairyItems({String? kind, String? district});

  /// Fetches a single dairy record by ID.
  Future<DairyItem> getDairyById(String id);

  /// Fetches retail product catalogue.
  Future<List<DairyProductItem>> getProducts({String? category, String? sellerId});

  /// Submits farmer registration at a collection centre.
  Future<FarmerRegistration> registerFarmer(FarmerRegistration registration);

  /// Submits enquiry for a product.
  Future<DairyEnquiry> submitProductEnquiry(DairyEnquiry enquiry);

  /// Whether the backend supports farmer registrations (set to false if 404/405 encountered).
  bool get isRegistrationSupported;

  /// Whether the backend supports product enquiries (set to false if 404/405 encountered).
  bool get isEnquirySupported;
}
