import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/auth/auth_scope.dart';
import 'core/config/api_config.dart';
import 'core/diagnostics/error_reporter.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_token_store.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/data/auth_local_data_source.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/repositories/auth_repository.dart';
import 'features/auth/repositories/demo_auth_repository.dart';
import 'features/auth/repositories/remote_auth_repository.dart';
import 'features/community/providers/community_provider.dart';
import 'features/community/repositories/demo_community_repository.dart';

/// Starts crash reporting (when this build has a Sentry DSN), then the app.
Future<void> main() => startCrashReporting(_startApp);

/// Uncaught errors — Flutter framework errors and anything else reaching the
/// platform dispatcher — go to [reportError] instead of failing silently.
Future<void> _startApp() async {
  WidgetsFlutterBinding.ensureInitialized();
  ApiConfig.validate(); // release builds must use a public HTTPS API
  // Fonts ship inside the app (google_fonts/ assets): never download them at runtime
  // (privacy: it would send every user's IP address to Google).
  GoogleFonts.config.allowRuntimeFetching = false;

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    reportError(details.exception, details.stack);
  };
  PlatformDispatcher.instance.onError = (error, stack) {
    reportError(error, stack);
    return true;
  };

  final tokenStore = SecureTokenStore();
  final apiClient = ApiClient(tokenStore);
  final AuthRepository repository =
      ApiConfig.demoMode
          ? DemoAuthRepository(AuthLocalDataSource())
          : RemoteAuthRepository(AuthLocalDataSource(), apiClient, tokenStore);
  final authController = AuthController(repository);
  repository.onSessionExpired = authController.handleSessionExpired;
  authController.restoreSession();

  runApp(
    ProviderScope(
      overrides: [
        secureTokenStoreProvider.overrideWithValue(tokenStore),
        apiClientProvider.overrideWithValue(apiClient),
        authRepositoryProvider.overrideWithValue(repository),
        authControllerProvider.overrideWith((ref) => authController),
        if (ApiConfig.demoMode)
          communityRepositoryProvider.overrideWithValue(
            DemoCommunityRepository(apiClient),
          ),
      ],
      child: MainApp(authController: authController),
    ),
  );
}

class MainApp extends ConsumerWidget {
  const MainApp({super.key, required this.authController, this.router});

  final AuthController authController;
  final GoRouter? router;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appRouter = router ?? ref.watch(routerProvider);

    return AuthScope(
      controller: authController,
      child: MaterialApp.router(
        title: 'Connect Maratha',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: appRouter,
        builder:
            ApiConfig.demoMode
                ? (context, child) => Banner(
                  message: 'DEMO',
                  location: BannerLocation.topEnd,
                  child: child!,
                )
                : null,
      ),
    );
  }
}
