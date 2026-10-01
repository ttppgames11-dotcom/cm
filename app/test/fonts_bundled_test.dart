import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

/// With runtime downloads switched off, every family/weight the app uses must be
/// resolvable from the bundled `google_fonts/` assets (otherwise release builds
/// would silently fall back to a system font, or try to reach Google).
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const weights = <FontWeight>[
    FontWeight.w400,
    FontWeight.w500,
    FontWeight.w600,
    FontWeight.w700,
    FontWeight.w800,
    FontWeight.w900,
  ];

  setUpAll(() => GoogleFonts.config.allowRuntimeFetching = false);
  tearDownAll(() => GoogleFonts.config.allowRuntimeFetching = true);

  test('Mukta (Marathi body) loads from assets for every weight', () async {
    await GoogleFonts.pendingFonts([
      for (final w in weights) GoogleFonts.mukta(fontWeight: w),
    ]);
  });

  test('Playfair Display (incl. italic) loads from assets', () async {
    await GoogleFonts.pendingFonts([
      for (final w in weights) GoogleFonts.playfairDisplay(fontWeight: w),
      GoogleFonts.playfairDisplay(
        fontWeight: FontWeight.w800,
        fontStyle: FontStyle.italic,
      ),
    ]);
  });

  test('Cinzel loads from assets for every weight', () async {
    await GoogleFonts.pendingFonts([
      for (final w in weights) GoogleFonts.cinzel(fontWeight: w),
    ]);
  });

  test('Noto Sans Devanagari loads from assets for every weight', () async {
    await GoogleFonts.pendingFonts([
      for (final w in weights) GoogleFonts.notoSansDevanagari(fontWeight: w),
    ]);
  });

  test('control: a font that is NOT bundled is refused (no downloads)', () async {
    final errors = <Object>[];
    await runZonedGuarded(() async {
      GoogleFonts.lato(fontWeight: FontWeight.w400);
      await Future<void>.delayed(const Duration(milliseconds: 50));
    }, (error, stack) {
      errors.add(error);
    });

    expect(errors, isNotEmpty);
    expect(errors.first.toString(), contains('allowRuntimeFetching is false'));
  });
}
