import 'package:flutter/material.dart';

/// Colors ported from the existing web app's `:root` CSS custom properties
/// in `assets/css/style.css` (single, non-themed palette — no dark mode
/// variant exists in the source site).
class AppColors {
  AppColors._();

  static const Color bg = Color(0xFFFDF8F2);
  static const Color bgWarmCream = Color(0xFFFDF8F2);
  static const Color cardWhite = Color(0xFFFFFFFF);
  static const Color cardCream = Color(0xFFFFF9F2);
  static const Color textDark = Color(0xFF2B1B12);
  static const Color textMutedWarm = Color(0xFF7A6A5D);
  static const Color primaryOrange = Color(0xFFE8631A);
  static const Color goldAccent = Color(0xFFD4A853);

  // Pastel tinted card backgrounds
  static const Color pastelPeach = Color(0xFFFFF1E6);
  static const Color pastelRed = Color(0xFFFDEBEC);
  static const Color pastelBlue = Color(0xFFEBF3FC);
  static const Color pastelGreen = Color(0xFFEAF5EE);

  static const Color paper = Color(0xFFFFFFFF);
  static const Color paper2 = Color(0xFFFFF9F2);
  static const Color paper3 = Color(0xFFFFF1E6);

  static const Color maroon950 = Color(0xFF2B1B12);
  static const Color maroon900 = Color(0xFFD84315);
  static const Color maroon800 = Color(0xFFE65100);
  static const Color maroon700 = Color(0xFFF4511E);

  static const Color ink = Color(0xFF2B1B12);
  static const Color inkSoft = Color(0xFF7A6A5D);
  static const Color ink2 = Color(0xFF2B1B12);
  static const Color textSecondary = Color(0xFF7A6A5D);

  static const Color gold500 = Color(0xFFD4A853);
  static const Color gold600 = Color(0xFFD4A853);
  static const Color gold700 = Color(0xFFBF360C);

  static const Color saffron100 = Color(0xFFFFE0B2);
  static const Color saffron400 = Color(0xFFFF7043);
  static const Color saffron500 = Color(0xFFE8631A);
  static const Color saffron600 = Color(0xFFE8631A);
  static const Color saffron700 = Color(0xFFBF360C);

  static const Color muted = Color(0xFF7A6A5D);
  static const Color line = Color(0xFFF2E6D8);
  static const Color success = Color(0xFF1E7044);
  static const Color danger = Color(0xFFD32F2F);

  /// Deep, near-black maroon/brown used for cinematic dark surfaces (splash
  /// background, vignette) — the source CSS has no token for this; its
  /// `--maroon-*` scale never goes this dark, so it's defined fresh here
  /// rather than reusing a mid-tone maroon meant for light-background text.
  static const Color nightMaroon = Color(0xFF2A0D05);
  static const Color nightMaroon2 = Color(0xFF4A140A);

  /// The real "golden-tan" accent used 30+ times in the source CSS via an
  /// undeclared `rgba(233,196,106,…)` (see FLUTTER_UI_UX_ANALYSIS.md §5.1) —
  /// finally given a name instead of being ported as a stray literal.
  static const Color trueGold = Color(0xFFD4A853);
}
