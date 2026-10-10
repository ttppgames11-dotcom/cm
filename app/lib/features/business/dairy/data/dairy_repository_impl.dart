import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import '../domain/models/dairy_item.dart';
import '../domain/models/dairy_product.dart';
import '../domain/models/farmer_registration.dart';
import '../domain/models/dairy_enquiry.dart';
import '../domain/repositories/dairy_repository.dart';
import 'dairy_sample_data.dart';

class DairyRepositoryImpl implements DairyRepository {
  DairyRepositoryImpl(this._api);

  final ApiClient _api;

  bool _isRegistrationSupported = true;
  bool _isEnquirySupported = true;

  @override
  bool get isRegistrationSupported => _isRegistrationSupported;

  @override
  bool get isEnquirySupported => _isEnquirySupported;

  @override
  Future<List<DairyItem>> getDairyItems({String? kind, String? district}) async {
    try {
      final queryParams = <String, String>{};
      if (kind != null && kind.isNotEmpty) queryParams['kind'] = kind;
      if (district != null && district.isNotEmpty) queryParams['district'] = district;

      final path = queryParams.isNotEmpty
          ? Uri(path: '/dairy', queryParameters: queryParams).toString()
          : '/dairy';

      final res = await _api.get(path, auth: false);

      final dataObj = res['data'];
      dynamic rawList;
      if (dataObj is Map && dataObj['dairy'] != null) {
        rawList = dataObj['dairy'];
      } else if (res['dairy'] != null) {
        rawList = res['dairy'];
      } else if (dataObj is List) {
        rawList = dataObj;
      } else if (res is List) {
        rawList = res;
      }

      if (rawList is List && rawList.isNotEmpty) {
        return rawList
            .whereType<Map>()
            .map((item) => DairyItem.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {
      if (ApiConfig.demoMode) {
        return _filterSampleItems(kind: kind, district: district);
      }
      rethrow;
    }

    if (ApiConfig.demoMode) {
      return _filterSampleItems(kind: kind, district: district);
    }
    return [];
  }

  @override
  Future<DairyItem> getDairyById(String id) async {
    try {
      final res = await _api.get('/dairy/$id', auth: false);

      final dataObj = res['data'];
      Map<String, dynamic> raw;
      if (dataObj is Map && dataObj['dairy'] is Map) {
        raw = Map<String, dynamic>.from(dataObj['dairy'] as Map);
      } else if (res['dairy'] is Map) {
        raw = Map<String, dynamic>.from(res['dairy'] as Map);
      } else if (dataObj is Map) {
        raw = Map<String, dynamic>.from(dataObj);
      } else {
        raw = res;
      }

      return DairyItem.fromJson(raw);
    } catch (_) {
      final sample = DairySampleData.sampleDairyItems.firstWhere(
        (d) => d.id == id,
        orElse: () => DairySampleData.sampleDairyItems.first,
      );
      return sample;
    }
  }

  @override
  Future<List<DairyProductItem>> getProducts({String? category, String? sellerId}) async {
    try {
      final queryParams = <String, String>{};
      if (category != null && category.isNotEmpty) queryParams['category'] = category;
      if (sellerId != null && sellerId.isNotEmpty) queryParams['sellerId'] = sellerId;

      final path = queryParams.isNotEmpty
          ? Uri(path: '/dairy/products', queryParameters: queryParams).toString()
          : '/dairy/products';

      final res = await _api.get(path, auth: false);

      final dataObj = res['data'];
      dynamic rawList;
      if (dataObj is Map && dataObj['products'] != null) {
        rawList = dataObj['products'];
      } else if (res['products'] != null) {
        rawList = res['products'];
      } else if (dataObj is List) {
        rawList = dataObj;
      } else if (res is List) {
        rawList = res;
      }

      if (rawList is List && rawList.isNotEmpty) {
        return rawList
            .whereType<Map>()
            .map((item) => DairyProductItem.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {
      if (ApiConfig.demoMode) {
        return _filterSampleProducts(category: category, sellerId: sellerId);
      }
      rethrow;
    }

    if (ApiConfig.demoMode) {
      return _filterSampleProducts(category: category, sellerId: sellerId);
    }
    return [];
  }

  @override
  Future<FarmerRegistration> registerFarmer(FarmerRegistration registration) async {
    try {
      final res = await _api.post(
        '/dairy/${registration.centreId}/registrations',
        body: registration.toJson(),
        auth: true,
      );

      final dataObj = res['data'];
      Map<String, dynamic> raw;
      if (dataObj is Map && dataObj['registration'] is Map) {
        raw = Map<String, dynamic>.from(dataObj['registration'] as Map);
      } else if (res['registration'] is Map) {
        raw = Map<String, dynamic>.from(res['registration'] as Map);
      } else if (dataObj is Map) {
        raw = Map<String, dynamic>.from(dataObj);
      } else {
        raw = res;
      }

      return FarmerRegistration.fromJson(raw);
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        _isRegistrationSupported = false;
      }
      rethrow;
    } catch (e) {
      final errStr = e.toString();
      if (errStr.contains('404') || errStr.contains('405')) {
        _isRegistrationSupported = false;
      }
      rethrow;
    }
  }

  @override
  Future<DairyEnquiry> submitProductEnquiry(DairyEnquiry enquiry) async {
    try {
      final res = await _api.post(
        '/dairy/products/${enquiry.productId}/enquiries',
        body: enquiry.toJson(),
        auth: false,
      );

      final dataObj = res['data'];
      Map<String, dynamic> raw;
      if (dataObj is Map && dataObj['enquiry'] is Map) {
        raw = Map<String, dynamic>.from(dataObj['enquiry'] as Map);
      } else if (res['enquiry'] is Map) {
        raw = Map<String, dynamic>.from(res['enquiry'] as Map);
      } else if (dataObj is Map) {
        raw = Map<String, dynamic>.from(dataObj);
      } else {
        raw = res;
      }

      return DairyEnquiry.fromJson(raw);
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        _isEnquirySupported = false;
      }
      rethrow;
    } catch (e) {
      final errStr = e.toString();
      if (errStr.contains('404') || errStr.contains('405')) {
        _isEnquirySupported = false;
      }
      rethrow;
    }
  }

  List<DairyItem> _filterSampleItems({String? kind, String? district}) {
    var items = DairySampleData.sampleDairyItems;
    if (kind != null && kind.isNotEmpty && kind != 'all' && kind != 'सर्व') {
      items = items.where((d) => (d.isBrand ? 'brand' : 'centre') == kind.toLowerCase()).toList();
    }
    if (district != null && district.isNotEmpty && district != 'all' && district != 'सर्व') {
      items = items.where((d) => (d.district ?? '').contains(district)).toList();
    }
    return items;
  }

  List<DairyProductItem> _filterSampleProducts({String? category, String? sellerId}) {
    var prods = DairySampleData.sampleProducts;
    if (category != null && category.isNotEmpty && category != 'all' && category != 'सर्व') {
      prods = prods.where((p) => p.category == category).toList();
    }
    if (sellerId != null && sellerId.isNotEmpty) {
      prods = prods.where((p) => p.sellerId == sellerId).toList();
    }
    return prods;
  }
}
