import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_provider.dart';
import '../repositories/location_repository.dart';

/// Provider for [LocationRepository], backed by [RemoteLocationRepository].
final locationRepositoryProvider = Provider<LocationRepository>((ref) {
  return RemoteLocationRepository(ref.watch(apiClientProvider));
});
