import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/business_data.dart';
import '../models/business_models.dart';

/// Provider for [BusinessRepository].
final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  return BusinessRepository(ref.watch(apiClientProvider));
});

class BusinessRepository {
  BusinessRepository(this._api);

  final ApiClient _api;

  /// Fetches business details and reviews via GET /businesses/:id
  Future<Business> fetchBusiness(String id) async {
    try {
      final res = await _api.get('/api/businesses/$id', auth: true);
      Map<String, dynamic> bizMap = {};
      if (res['business'] is Map) {
        bizMap = Map<String, dynamic>.from(res['business'] as Map);
      } else if (res['data'] is Map && (res['data'] as Map)['business'] is Map) {
        bizMap = Map<String, dynamic>.from((res['data'] as Map)['business'] as Map);
      } else if (res['data'] is Map) {
        bizMap = Map<String, dynamic>.from(res['data'] as Map);
      } else {
        bizMap = res;
      }

      final rawReviews = res['reviews'] ?? (res['data'] is Map ? (res['data'] as Map)['reviews'] : null) ?? bizMap['reviews'];
      final reviews = <BusinessReview>[];
      if (rawReviews is List) {
        for (final r in rawReviews) {
          if (r is Map) {
            reviews.add(BusinessReview.fromJson(Map<String, dynamic>.from(r)));
          }
        }
      }

      final parsed = Business.fromJson(bizMap);
      return parsed.copyWith(
        reviews: reviews.isNotEmpty ? reviews : parsed.reviews,
      );
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.code == 'BUSINESS_NOT_FOUND') {
        // Check demo/local dataset before giving up in demo mode
        if (ApiConfig.demoMode) {
          final local = _findLocalBusiness(id);
          if (local != null) return local;
        }
        throw ApiException(
          'व्यवसाय आढळला नाही. हा व्यवसाय काढून टाकला असावा.',
          statusCode: 404,
          code: 'BUSINESS_NOT_FOUND',
        );
      }

      if (ApiConfig.demoMode) {
        final local = _findLocalBusiness(id);
        if (local != null) return local;
      }
      rethrow;
    } catch (_) {
      if (ApiConfig.demoMode) {
        final local = _findLocalBusiness(id);
        if (local != null) return local;
      }
      rethrow;
    }
  }

  Business? _findLocalBusiness(String id) {
    try {
      return BusinessData.businesses.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Adds a review via POST /api/businesses/:id/reviews
  /// Returns review and updated new rating.
  Future<({BusinessReview review, double newRating})> addReview(
    String id, {
    required int rating,
    required String text,
  }) async {
    final body = {
      'rating': rating,
      'text': text,
    };
    final res = await _api.post('/api/businesses/$id/reviews', body: body, auth: true);

    Map<String, dynamic> reviewMap = {};
    if (res['review'] is Map) {
      reviewMap = Map<String, dynamic>.from(res['review'] as Map);
    } else if (res['data'] is Map && (res['data'] as Map)['review'] is Map) {
      reviewMap = Map<String, dynamic>.from((res['data'] as Map)['review'] as Map);
    } else if (res['data'] is Map) {
      reviewMap = Map<String, dynamic>.from(res['data'] as Map);
    }

    double newRating = 5.0;
    final nr = res['newRating'] ?? (res['data'] is Map ? (res['data'] as Map)['newRating'] : null);
    if (nr != null) {
      if (nr is num) {
        newRating = nr.toDouble();
      } else {
        newRating = double.tryParse(nr.toString()) ?? 5.0;
      }
    }

    final review = BusinessReview.fromJson(
      reviewMap.isNotEmpty
          ? reviewMap
          : {
              'rating': rating,
              'text': text,
              'date': 'आत्ताच',
            },
    );

    return (review: review, newRating: newRating);
  }

  /// Creates a new business via POST /api/businesses
  Future<Business> createBusiness(Map<String, dynamic> data) async {
    final res = await _api.post('/api/businesses', body: data, auth: true);

    Map<String, dynamic> bizMap = {};
    if (res['business'] is Map) {
      bizMap = Map<String, dynamic>.from(res['business'] as Map);
    } else if (res['data'] is Map && (res['data'] as Map)['business'] is Map) {
      bizMap = Map<String, dynamic>.from((res['data'] as Map)['business'] as Map);
    } else if (res['data'] is Map) {
      bizMap = Map<String, dynamic>.from(res['data'] as Map);
    } else {
      bizMap = res;
    }

    if (bizMap['id'] == null && res['id'] != null) {
      bizMap['id'] = res['id'];
    }

    return Business.fromJson(bizMap);
  }

  /// Updates an existing business via PUT /api/businesses/:id
  Future<Business> updateBusiness(String id, Map<String, dynamic> data) async {
    final res = await _api.put('/api/businesses/$id', body: data, auth: true);

    Map<String, dynamic> bizMap = {};
    if (res['business'] is Map) {
      bizMap = Map<String, dynamic>.from(res['business'] as Map);
    } else if (res['data'] is Map && (res['data'] as Map)['business'] is Map) {
      bizMap = Map<String, dynamic>.from((res['data'] as Map)['business'] as Map);
    } else if (res['data'] is Map) {
      bizMap = Map<String, dynamic>.from(res['data'] as Map);
    } else {
      bizMap = res;
    }

    if (bizMap['id'] == null) {
      bizMap['id'] = id;
    }

    return Business.fromJson(bizMap);
  }
}
