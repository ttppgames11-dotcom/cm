import 'dart:io';
import 'dart:ui' show ImageByteFormat;

import 'package:app/core/auth/auth_scope.dart';
import 'package:app/core/routing/app_router.dart';
import 'package:app/core/theme/app_theme.dart';
import 'package:app/features/auth/auth_controller.dart';
import 'package:app/features/auth/data/auth_local_data_source.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import 'package:app/features/community/providers/community_provider.dart';
import 'package:app/features/community/repositories/demo_community_repository.dart';
import 'package:app/core/network/api_client.dart';
import 'package:app/core/storage/secure_token_store.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/local_auth_repository.dart';

/// Opens every screen on a range of phone sizes (and with the system font
/// enlarged) and fails on any layout overflow, naming the widget and source
/// line that caused it. Real fonts are loaded so text widths match a device.
void main() {
  const devices = <String, (Size, double)>{
    'small 320x640': (Size(320, 640), 1.0),
    'budget 360x740': (Size(360, 740), 1.0),
    'standard 393x851': (Size(393, 851), 1.0),
    'large 430x932': (Size(430, 932), 1.0),
    'big-font 360x740 @130%': (Size(360, 740), 1.3),
  };

  const guestRoutes = [
    '/splash',
    '/login',
    '/register',
    '/forgot-password',
    '/guest',
  ];
  const memberRoutes = [
    '/home',
    '/community',
    '/business',
    '/business/directory',
    '/business/sangam',
    '/business/dairy',
    '/business/builders',
    '/business/manufacturers',
    '/profile',
    '/profile/personal-info',
    '/profile/security',
    '/profile/events',
    '/profile/saved',
    '/profile/notifications',
    '/profile/help',
    '/profile/about',
    '/heritage',
    '/history',
    '/history/battles',
    '/history/warriors',
    '/history/navy',
    '/history/balidan-maas',
    '/history/dates',
    '/history/dnyankosh',
    '/history/granthalaya',
    '/history/swarajya-administration',
    '/history/movements',
    '/history/knowledge-graph',
    '/history/trails',
    '/history/quiz',
    '/about',
    '/guidelines',
    '/culture',
    '/culture/shivkal-festivals',
    '/culture/agri-koli',
    '/culture/food',
    '/culture/dialects',
    '/culture/gramdevat',
    '/culture/heritage-places',
    '/culture/temples',
    '/culture/symbols',
    '/culture/books',
    '/culture/films',
    '/fort/rajgad',
    '/warrior/shivaji',
    '/search',
    '/network',
    '/post/demo-p1',
  ];

  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    await _loadDeviceFonts();
    const weights = [
      FontWeight.w400,
      FontWeight.w500,
      FontWeight.w600,
      FontWeight.w700,
      FontWeight.w800,
      FontWeight.w900,
    ];
    await GoogleFonts.pendingFonts([
      for (final w in weights) ...[
        GoogleFonts.mukta(fontWeight: w),
        GoogleFonts.playfairDisplay(fontWeight: w),
        GoogleFonts.playfairDisplay(fontWeight: w, fontStyle: FontStyle.italic),
        GoogleFonts.cinzel(fontWeight: w),
        GoogleFonts.notoSansDevanagari(fontWeight: w),
      ],
    ]);
  });

  for (final device in devices.entries) {
    for (final route in [...guestRoutes, ...memberRoutes]) {
      testWidgets('${device.key} $route', (tester) async {
        final (size, textScale) = device.value;
        await _checkScreen(
          tester,
          route: route,
          size: size,
          textScale: textScale,
          signedIn: memberRoutes.contains(route),
        );
      });
    }
  }
}

Future<void> _checkScreen(
  WidgetTester tester, {
  required String route,
  required Size size,
  required double textScale,
  required bool signedIn,
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1.0;
  tester.platformDispatcher.textScaleFactorTestValue = textScale;
  addTearDown(tester.view.reset);
  addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);

  SharedPreferences.setMockInitialValues({});
  final repository = LocalAuthRepository(AuthLocalDataSource());
  final controller = AuthController(repository);
  if (signedIn) {
    await tester.runAsync(controller.loginWithDemoAccount);
  } else {
    await tester.runAsync(controller.restoreSession);
  }
  final router = buildAppRouter(controller);
  final apiClient = ApiClient(SecureTokenStore());

  final problems = <String>[];
  final previousOnError = FlutterError.onError;
  FlutterError.onError = (details) => problems.add(_describe(details));

  try {
    final theme = AppTheme.light;
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authRepositoryProvider.overrideWithValue(repository),
          authControllerProvider.overrideWith((ref) => controller),
          communityRepositoryProvider.overrideWithValue(
            DemoCommunityRepository(apiClient),
          ),
        ],
        child: AuthScope(
          controller: controller,
          child: RepaintBoundary(
            key: _shotKey,
            child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            // Android falls back to Noto Sans Devanagari for Marathi text in Roboto.
            theme: theme.copyWith(
              textTheme: theme.textTheme.apply(
                fontFamilyFallback: const ['NotoSansDevanagari'],
              ),
            ),
            routerConfig: router,
            ),
          ),
        ),
      ),
    );
    router.go(route);
    await _settle(tester);
    await _screenshot(tester, route, size, textScale, 0);

    // Scroll the main (largest vertical) list to build content further down.
    for (var i = 0; i < 8; i++) {
      final scrollable = _mainScrollable(tester);
      if (scrollable == null) break;
      await tester.drag(scrollable, Offset(0, -size.height * 0.7), warnIfMissed: false);
      await _settle(tester);
      await _screenshot(tester, route, size, textScale, i + 1);
    }
  } finally {
    FlutterError.onError = previousOnError;
    // Let splash/animation timers finish so the test can end cleanly.
    await tester.pumpWidget(const SizedBox());
    await tester.pump(const Duration(seconds: 10));
  }

  final unique = problems.toSet().toList();
  for (final p in unique) {
    // ignore: avoid_print
    print('LAYOUT|$route|${size.width.toInt()}x${size.height.toInt()}@$textScale|$p');
  }
  expect(unique, isEmpty, reason: unique.join('\n'));
}

/// Set LAYOUT_SHOTS=`dir` to also save PNG screenshots of every screen for
/// visual review (not needed for the pass/fail check).
Future<void> _screenshot(
  WidgetTester tester,
  String route,
  Size size,
  double textScale,
  int page,
) async {
  final dir = Platform.environment['LAYOUT_SHOTS'];
  if (dir == null || page > 3) return;
  // Give asset images a real-time moment to decode before capturing.
  await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 300)));
  await tester.pump();
  final boundary = tester.renderObject<RenderRepaintBoundary>(
    find.byKey(_shotKey),
  );
  final name = '${route.replaceAll('/', '_')}_${size.width.toInt()}'
      '${textScale == 1.0 ? '' : '_bigfont'}_$page.png';
  await tester.runAsync(() async {
    final image = await boundary.toImage();
    final bytes = await image.toByteData(format: ImageByteFormat.png);
    File('$dir/$name')
      ..createSync(recursive: true)
      ..writeAsBytesSync(bytes!.buffer.asUint8List());
  });
}

const _shotKey = ValueKey('layout-shot');

Future<void> _settle(WidgetTester tester) async {
  for (var i = 0; i < 6; i++) {
    await tester.pump(const Duration(milliseconds: 250));
  }
}

Finder? _mainScrollable(WidgetTester tester) {
  Element? best;
  var bestArea = 0.0;
  for (final e in find.byType(Scrollable).evaluate()) {
    final s = e.widget as Scrollable;
    if (axisDirectionToAxis(s.axisDirection) != Axis.vertical) continue;
    final box = e.renderObject as RenderBox?;
    if (box == null || !box.hasSize) continue;
    final area = box.size.width * box.size.height;
    if (area > bestArea) {
      bestArea = area;
      best = e;
    }
  }
  return best == null ? null : find.byElementPredicate((e) => e == best);
}

/// "overflowed by 12 pixels on the right @ lib/widgets/x.dart:42:9 (Row)"
String _describe(FlutterErrorDetails details) {
  final text = details.toString();
  final message = details.exceptionAsString().split('\n').first.trim();
  final location = RegExp(r'(lib/[\w/]+\.dart):(\d+):(\d+)').firstMatch(text);
  final widget = RegExp(r'error-causing widget was:\s*\n?\s*(\w+)').firstMatch(text);
  return '$message @ ${location?.group(0) ?? 'unknown'} (${widget?.group(1) ?? '?'})';
}

/// Roboto + Material Icons from the Flutter SDK (the device defaults), and
/// Noto Sans Devanagari from the app's bundled fonts (Android's Marathi fallback).
Future<void> _loadDeviceFonts() async {
  final sdk = Platform.environment['FLUTTER_ROOT'];
  if (sdk != null) {
    final dir = Directory('$sdk/bin/cache/artifacts/material_fonts');
    final roboto = FontLoader('Roboto');
    for (final f in dir.listSync().whereType<File>()) {
      final name = f.uri.pathSegments.last.toLowerCase();
      if (name.startsWith('roboto-') && name.endsWith('.ttf')) {
        roboto.addFont(Future.value(ByteData.sublistView(f.readAsBytesSync())));
      }
    }
    await roboto.load();
    final icons = FontLoader('MaterialIcons')
      ..addFont(Future.value(ByteData.sublistView(
        File('${dir.path}/materialicons-regular.otf').readAsBytesSync(),
      )));
    await icons.load();
  }
  final noto = FontLoader('NotoSansDevanagari');
  for (final f in Directory('google_fonts').listSync().whereType<File>()) {
    if (f.path.contains('NotoSansDevanagari-')) {
      noto.addFont(Future.value(ByteData.sublistView(f.readAsBytesSync())));
    }
  }
  await noto.load();
}
