import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design system tokens specifically defined for the warm light-themed Home screen
/// of Connect Maratha.
class HomeTheme {
  HomeTheme._();

  // Background colors
  static const Color bgWarmCream = Color(0xFFFDF8F2);
  static const Color bgNearBlack = Color(
    0xFFFDF8F2,
  ); // Backwards-compatible alias for light scaffold
  static const Color bgDark = Color(
    0xFFFFFFFF,
  ); // Backwards-compatible alias for light nav bar
  static const Color bgCard = Color(0xFFFFFFFF); // White card background
  static const Color bgCardSecondary = Color(
    0xFFFFF9F2,
  ); // Subtle cream secondary card

  // Accents
  static const Color primaryOrange = Color(0xFFE8631A);
  static const Color saffronLight = Color(0xFFFF8038);
  static const Color gold = Color(0xFFD4A853);
  static const Color goldLight = Color(0xFFE5C07B);
  static const Color goldBorder =
      Colors.transparent; // No gold borders in light theme
  static const Color goldBorderSubtle = Colors.transparent;
  static const Color goldBorderActive = Color(0x33E8631A);

  // Status & Quick Action Pastel Backgrounds
  static const Color pastelPeach = Color(0xFFFFF1E6);
  static const Color pastelRed = Color(0xFFFDEBEC);
  static const Color pastelBlue = Color(0xFFEBF3FC);
  static const Color pastelGreen = Color(0xFFEAF5EE);
  static const Color pastelAmber = Color(0xFFFEF3C7);

  // Status & Quick Action Accents
  static const Color accentOrange = Color(0xFFE8631A);
  static const Color accentRed = Color(0xFFD32F2F);
  static const Color accentMaroon = Color(0xFFD32F2F);
  static const Color accentBlue = Color(0xFF1976D2);
  static const Color accentGreen = Color(0xFF2E7D32);
  static const Color accentAmber = Color(0xFFD97706);
  static const Color badgeRed = Color(0xFFE53935);

  // Typography Colors
  static const Color textDark = Color(
    0xFF2B1B12,
  ); // Primary text: dark brown-black
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textCream = Color(
    0xFF2B1B12,
  ); // Backwards-compatible primary text
  static const Color textMuted = Color(
    0xFF7A6A5D,
  ); // Secondary/muted text: warm gray-brown
  static const Color textMutedDark = Color(0xFF5A4A3D);

  // Soft Drop Shadows for Light Mode
  static List<BoxShadow> get softShadow => [
    BoxShadow(
      color: const Color(0xFF2B1B12).withValues(alpha: 0.07),
      blurRadius: 14,
      offset: const Offset(0, 4),
      spreadRadius: 0,
    ),
  ];

  static List<BoxShadow> get subtleShadow => [
    BoxShadow(
      color: const Color(0xFF2B1B12).withValues(alpha: 0.05),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  // Card Decoration
  static BoxDecoration cardDecoration({
    double radius = 18.0,
    Color backgroundColor = bgCard,
    Color? borderColor,
    double borderWidth = 0.0,
    List<BoxShadow>? shadows,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(radius),
      border:
          borderColor != null && borderWidth > 0
              ? Border.all(color: borderColor, width: borderWidth)
              : null,
      boxShadow: shadows ?? softShadow,
    );
  }

  // Header Serif Typography (Playfair Display / Cinzel)
  static TextStyle headerSerif({
    double fontSize = 20,
    FontWeight fontWeight = FontWeight.w700,
    Color color = textDark,
    double height = 1.25,
    double? letterSpacing,
  }) {
    return GoogleFonts.cinzel(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing ?? 0.5,
    );
  }

  static TextStyle headerPlayfair({
    double fontSize = 20,
    FontWeight fontWeight = FontWeight.w700,
    Color color = textDark,
    double height = 1.3,
  }) {
    return GoogleFonts.playfairDisplay(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
    );
  }

  // Body & Devanagari Typography (Mukta / Noto Sans Devanagari)
  static TextStyle marathiBody({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    Color color = textDark,
    double height = 1.48,
    double? letterSpacing,
  }) {
    return GoogleFonts.mukta(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  static TextStyle marathiHeading({
    double fontSize = 17,
    FontWeight fontWeight = FontWeight.w700,
    Color color = textDark,
    double height = 1.42,
    double? letterSpacing,
  }) {
    return GoogleFonts.mukta(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  static TextStyle marathiNoto({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    Color color = textDark,
    double height = 1.5,
  }) {
    return GoogleFonts.notoSansDevanagari(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
    );
  }
}
