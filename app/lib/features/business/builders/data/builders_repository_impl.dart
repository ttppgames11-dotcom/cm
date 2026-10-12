import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import '../domain/models/builder_project.dart';
import '../domain/repositories/builders_repository.dart';
import 'builders_sample_data.dart';

class BuildersRepositoryImpl implements BuildersRepository {
  BuildersRepositoryImpl(this._api);

  final ApiClient _api;

  @override
  Future<List<BuilderProject>> getProjects() async {
    try {
      final res = await _api.get('/api/builders', auth: false);

      final dataObj = res['data'];
      dynamic rawList;
      if (dataObj is Map && dataObj['builders'] != null) {
        rawList = dataObj['builders'];
      } else if (res['builders'] != null) {
        rawList = res['builders'];
      } else if (dataObj is List) {
        rawList = dataObj;
      } else if (res is List) {
        rawList = res;
      }

      if (rawList is List && rawList.isNotEmpty) {
        return rawList
            .whereType<Map>()
            .map((item) => BuilderProject.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {
      if (ApiConfig.demoMode) {
        return getSampleBuilderProjects();
      }
      rethrow;
    }

    if (ApiConfig.demoMode) {
      return getSampleBuilderProjects();
    }
    return getSampleBuilderProjects();
  }

  @override
  Future<BuilderProject> getProjectById(String id) async {
    try {
      final res = await _api.get('/api/builders/$id', auth: false);

      final dataObj = res['data'];
      Map<String, dynamic> raw;
      if (dataObj is Map && dataObj['builder'] is Map) {
        raw = Map<String, dynamic>.from(dataObj['builder'] as Map);
      } else if (res['builder'] is Map) {
        raw = Map<String, dynamic>.from(res['builder'] as Map);
      } else if (dataObj is Map) {
        raw = Map<String, dynamic>.from(dataObj);
      } else {
        raw = res;
      }

      return BuilderProject.fromJson(raw);
    } catch (_) {
      // In demo mode or offline, find from sample data
      final sample = getSampleBuilderProjects().firstWhere(
        (p) => p.id == id,
        orElse: () => getSampleBuilderProjects().first,
      );
      return sample;
    }
  }

  @override
  Future<Map<String, dynamic>> submitEnquiry(
    String projectId, {
    required String name,
    required String phone,
    String? budget,
    String? preferredCity,
    String? message,
  }) async {
    final body = <String, dynamic>{
      'name': name.trim(),
      'phone': phone.trim(),
      if (budget != null && budget.trim().isNotEmpty) 'budget': budget.trim(),
      if (preferredCity != null && preferredCity.trim().isNotEmpty)
        'preferredCity': preferredCity.trim(),
      if (message != null && message.trim().isNotEmpty) 'message': message.trim(),
    };

    final res = await _api.post(
      '/api/builders/$projectId/enquiries',
      body: body,
      auth: true,
    );

    return res;
  }
}
