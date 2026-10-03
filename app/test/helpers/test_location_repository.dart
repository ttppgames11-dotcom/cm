import 'package:app/features/auth/models/location_item.dart';
import 'package:app/features/auth/repositories/location_repository.dart';

/// Test implementation of [LocationRepository] for widget & unit tests.
class TestLocationRepository implements LocationRepository {
  TestLocationRepository({
    this.shouldFail = false,
    this.emptyVillages = false,
  });

  bool shouldFail;
  bool emptyVillages;

  static const countryIndia = LocationItem(id: 'IN', name: 'India / भारत', code: 'IN');
  static const stateMaharashtra = LocationItem(id: '27', name: 'Maharashtra / महाराष्ट्र', code: '27');
  static const stateKarnataka = LocationItem(id: '29', name: 'Karnataka / कर्नाटक', code: '29');
  static const districtPune = LocationItem(id: '490', name: 'Pune / पुणे', code: '490');
  static const districtSatara = LocationItem(id: '494', name: 'Satara / सातारा', code: '494');
  static const talukaHaveli = LocationItem(id: '4193', name: 'Haveli / हवेली', code: '4193');
  static const talukaBaramati = LocationItem(id: '4194', name: 'Baramati / बारामती', code: '4194');
  static const talukaKarad = LocationItem(id: '4220', name: 'Karad / कराड', code: '4220');
  static const villageManjari = LocationItem(id: '556300', name: 'Manjari / मांजरी', code: '556300');
  static const villageAmbegaon = LocationItem(id: '556242', name: 'Ambegaon Bk. / आंबेगाव बुद्रुक', code: '556242');

  @override
  Future<List<LocationItem>> getCountries() async {
    if (shouldFail) throw Exception('Network error');
    return [countryIndia];
  }

  @override
  Future<List<LocationItem>> getStates(String countryId) async {
    if (shouldFail) throw Exception('Network error');
    if (countryId == 'IN') {
      return [stateMaharashtra, stateKarnataka];
    }
    return [];
  }

  @override
  Future<List<LocationItem>> getDistricts(String stateId) async {
    if (shouldFail) throw Exception('Network error');
    if (stateId == '27') {
      return [districtPune, districtSatara];
    }
    return [];
  }

  @override
  Future<List<LocationItem>> getTalukas(String districtId) async {
    if (shouldFail) throw Exception('Network error');
    if (districtId == '490') {
      return [talukaHaveli, talukaBaramati];
    }
    if (districtId == '494') {
      return [talukaKarad];
    }
    return [];
  }

  @override
  Future<List<LocationItem>> getVillages(
    String talukaId, {
    String? search,
    int? limit,
    int? page,
  }) async {
    if (shouldFail) throw Exception('Network error');
    if (emptyVillages) return [];
    if (talukaId == '4193') {
      final list = [villageManjari, villageAmbegaon];
      if (search != null && search.isNotEmpty) {
        return list.where((v) => v.name.toLowerCase().contains(search.toLowerCase())).toList();
      }
      return list;
    }
    return [];
  }
}
