import '../../../core/network/api_client.dart';
import '../models/location_item.dart';

abstract class LocationRepository {
  Future<List<LocationItem>> getCountries();
  Future<List<LocationItem>> getStates(String countryId);
  Future<List<LocationItem>> getDistricts(String stateId);
  Future<List<LocationItem>> getTalukas(String districtId);
  Future<List<LocationItem>> getVillages(String talukaId, {String? search, int? limit, int? page});
}

class RemoteLocationRepository implements LocationRepository {
  RemoteLocationRepository(this._api);

  final ApiClient _api;

  @override
  Future<List<LocationItem>> getCountries() async {
    final res = await _api.get('/api/locations/countries');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => LocationItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<LocationItem>> getStates(String countryId) async {
    final res = await _api.get('/api/locations/states?countryId=$countryId');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => LocationItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<LocationItem>> getDistricts(String stateId) async {
    final res = await _api.get('/api/locations/districts?stateId=$stateId');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => LocationItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<LocationItem>> getTalukas(String districtId) async {
    final res = await _api.get('/api/locations/talukas?districtId=$districtId');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => LocationItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<List<LocationItem>> getVillages(
    String talukaId, {
    String? search,
    int? limit,
    int? page,
  }) async {
    final params = <String>['talukaId=$talukaId'];
    if (search != null && search.trim().isNotEmpty) {
      params.add('search=${Uri.encodeQueryComponent(search.trim())}');
    }
    if (limit != null) params.add('limit=$limit');
    if (page != null) params.add('page=$page');

    final path = '/api/locations/villages?${params.join('&')}';
    final res = await _api.get(path);
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => LocationItem.fromJson(e as Map<String, dynamic>)).toList();
  }
}
