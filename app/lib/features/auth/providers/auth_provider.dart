import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth_controller.dart';
import '../data/auth_local_data_source.dart';
import '../repositories/auth_repository.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_token_store.dart';
import '../repositories/remote_auth_repository.dart';

/// Provider for local auth data source.
final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  return AuthLocalDataSource();
});

/// Provider for [AuthRepository], backed by the Express API via [RemoteAuthRepository].
final secureTokenStoreProvider = Provider<SecureTokenStore>(
  (ref) => SecureTokenStore(),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(secureTokenStoreProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return RemoteAuthRepository(
    ref.watch(authLocalDataSourceProvider),
    ref.watch(apiClientProvider),
    ref.watch(secureTokenStoreProvider),
  );
});

/// The single app-wide [AuthController] instance. It's created once in
/// `main.dart` and handed to both `AuthScope` (read directly by the auth
/// screens) and this provider (read by Riverpod consumers — router redirect,
/// current-user lookups) via `ProviderScope`'s `overrides`, so every part of
/// the app always sees the same session state instead of two independent
/// copies drifting apart.
final authControllerProvider = ChangeNotifierProvider<AuthController>((ref) {
  throw UnimplementedError(
    'authControllerProvider must be overridden in main.dart with the '
    'app-wide AuthController instance.',
  );
});
