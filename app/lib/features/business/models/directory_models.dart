import 'package:flutter/material.dart';

/// One listing in a simple, browsable directory (builders, manufacturers,
/// etc.) — a lighter-weight sibling to [Business] for pages that only need
/// a card grid with filters, not reviews/offers.
class DirectoryEntry {
  const DirectoryEntry({
    required this.name,
    required this.tagline,
    required this.category,
    required this.city,
    this.icon = '🏢',
    this.phone,
    this.infoLines = const [],
    this.description,
  });

  final String name;
  final String tagline;
  final String category;
  final String city;
  final String icon;
  final String? phone;
  final List<String> infoLines;
  final String? description;
}

/// Static configuration for a [SimpleDirectoryScreen] instance — lets one
/// reusable screen widget serve Builders, Manufacturers and similar
/// directory-shaped pages ported from the website. [accentColor] should
/// come from the app's shared brand palette (`HomeTheme`'s accent tokens)
/// rather than a one-off hue, so every business sub-page reads as the same
/// app instead of a different color scheme per page.
class DirectoryConfig {
  const DirectoryConfig({
    required this.titleMr,
    required this.subtitleMr,
    required this.headerIcon,
    required this.accentColor,
    required this.categories,
    required this.entries,
  });

  final String titleMr;
  final String subtitleMr;
  final IconData headerIcon;
  final Color accentColor;
  final List<String> categories; // first entry is the "all" option
  final List<DirectoryEntry> entries;
}
