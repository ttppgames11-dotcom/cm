import 'package:app/core/config/api_config.dart';
import 'package:app/core/network/api_client.dart';
import '../domain/models/referral.dart';
import '../domain/models/referral_member_recipient.dart';
import '../domain/repositories/referral_repository.dart';
import 'referral_sample_data.dart';

class ReferralRepositoryImpl implements ReferralRepository {
  ReferralRepositoryImpl(this._api);

  final ApiClient _api;

  @override
  Future<List<Referral>> getReferrals({String? type}) async {
    try {
      final query = (type != null && type.isNotEmpty) ? '?type=$type' : '';
      final res = await _api.get('/api/sangam/referrals$query', auth: true);

      // Parse "data" first, then top level
      final dataObj = res['data'];
      dynamic rawList;
      if (dataObj is Map && dataObj['referrals'] != null) {
        rawList = dataObj['referrals'];
      } else if (res['referrals'] != null) {
        rawList = res['referrals'];
      } else if (dataObj is List) {
        rawList = dataObj;
      }

      if (rawList is List) {
        return rawList
            .whereType<Map>()
            .map((item) => Referral.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {
      if (ApiConfig.demoMode) {
        return getSampleReferrals();
      }
      rethrow;
    }

    if (ApiConfig.demoMode) {
      return getSampleReferrals();
    }
    return [];
  }

  @override
  Future<Referral> createReferral({
    required String title,
    required String clientName,
    required String clientPhone,
    String? category,
    String? recipientId,
    String? recipientName,
    String? clientEmail,
    String? urgency,
    double? value,
    String? notes,
  }) async {
    final body = <String, dynamic>{
      'title': title.trim(),
      'clientName': clientName.trim(),
      'client_name': clientName.trim(),
      'clientPhone': clientPhone.trim(),
      'client_phone': clientPhone.trim(),
      if (category != null && category.trim().isNotEmpty)
        'category': category.trim(),
      if (recipientId != null && recipientId.trim().isNotEmpty) ...{
        'recipientId': recipientId.trim(),
        'recipient_id': recipientId.trim(),
      },
      if (recipientName != null && recipientName.trim().isNotEmpty) ...{
        'recipientName': recipientName.trim(),
        'recipient_name': recipientName.trim(),
      },
      if (clientEmail != null && clientEmail.trim().isNotEmpty) ...{
        'clientEmail': clientEmail.trim(),
        'client_email': clientEmail.trim(),
      },
      if (urgency != null && urgency.trim().isNotEmpty)
        'urgency': urgency.trim(),
      if (value != null && value >= 0) 'value': value,
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };

    final res = await _api.post('/api/sangam/referrals', body: body, auth: true);

    final dataObj = res['data'];
    Map<String, dynamic> rawRef;
    if (dataObj is Map && dataObj['referral'] is Map) {
      rawRef = Map<String, dynamic>.from(dataObj['referral'] as Map);
    } else if (res['referral'] is Map) {
      rawRef = Map<String, dynamic>.from(res['referral'] as Map);
    } else if (dataObj is Map) {
      rawRef = Map<String, dynamic>.from(dataObj);
    } else {
      rawRef = res;
    }

    return Referral.fromJson(rawRef);
  }

  @override
  Future<Referral> updateReferralStatus({
    required String id,
    required String status,
    double? value,
  }) async {
    final body = <String, dynamic>{
      'status': status,
      if (value != null && value >= 0) 'value': value,
    };

    final res = await _api.put(
      '/api/sangam/referrals/$id/status',
      body: body,
      auth: true,
    );

    final dataObj = res['data'];
    Map<String, dynamic> rawRef;
    if (dataObj is Map && dataObj['referral'] is Map) {
      rawRef = Map<String, dynamic>.from(dataObj['referral'] as Map);
    } else if (res['referral'] is Map) {
      rawRef = Map<String, dynamic>.from(res['referral'] as Map);
    } else if (dataObj is Map) {
      rawRef = Map<String, dynamic>.from(dataObj);
    } else {
      rawRef = res;
    }

    return Referral.fromJson(rawRef);
  }

  @override
  Future<List<ReferralMemberRecipient>> searchMembers({
    required String query,
    int limit = 10,
  }) async {
    final trimmed = query.trim();
    final encoded = Uri.encodeQueryComponent(trimmed);
    final res = await _api.get('/api/members?search=$encoded&limit=$limit', auth: false);

    final dataObj = res['data'];
    dynamic rawList;
    if (dataObj is Map && dataObj['members'] != null) {
      rawList = dataObj['members'];
    } else if (res['members'] != null) {
      rawList = res['members'];
    } else if (dataObj is List) {
      rawList = dataObj;
    }

    if (rawList is List) {
      return rawList
          .whereType<Map>()
          .map(
            (item) => ReferralMemberRecipient.fromJson(
              Map<String, dynamic>.from(item),
            ),
          )
          .toList();
    }
    return [];
  }
}
