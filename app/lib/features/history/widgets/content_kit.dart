import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';

/// Building blocks shared by the History & Culture information pages (ported
/// from the website). Every block sizes itself from its content, so pages fit
/// small phones and enlarged system fonts without fixed heights.

/// Colours used by the heritage pages, matching the website's maroon/saffron.
class HeritageColors {
  HeritageColors._();

  static const maroonDark = Color(0xFF3D0D0D);
  static const maroon = Color(0xFF5C1414);
  static const maroonText = Color(0xFF7A1C1C);
  static const saffron = Color(0xFFDD8A2E);
  static const saffronDeep = Color(0xFFC9701C);
  static const cream = Color(0xFFFDF3E6);
  static const line = Color(0xFFE6DDCE);
  static const body = Color(0xFF5C534B);
  static const navyDark = Color(0xFF0A192F);
  static const navy = Color(0xFF1E3A8A);

  static const maroonGradient = [maroonDark, maroon];
  static const navyGradient = [navyDark, navy, Color(0xFF0F172A)];
  static const solemnGradient = [
    Color(0xFF2A0709),
    Color(0xFF4A0E17),
    Color(0xFF1A0407),
  ];
}

/// Scaffold for an information page: a hero header followed by sections.
class ContentPage extends StatelessWidget {
  const ContentPage({super.key, required this.hero, required this.children});

  final ContentHero hero;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SingleChildScrollView(
        padding: EdgeInsets.only(
          bottom: 24 + MediaQuery.paddingOf(context).bottom,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [hero, ...children],
        ),
      ),
    );
  }
}

/// Dark gradient (or photo) header with a back button, badge, title, text,
/// optional quote, stats and an action widget.
class ContentHero extends StatelessWidget {
  const ContentHero({
    super.key,
    required this.title,
    this.badge,
    this.eyebrow,
    this.subtitle,
    this.quote,
    this.stats = const [],
    this.imageAsset,
    this.gradient = HeritageColors.maroonGradient,
    this.action,
  });

  final String title;
  final String? badge;
  final String? eyebrow;
  final String? subtitle;
  final String? quote;
  final List<(String, String)> stats;
  final String? imageAsset;
  final List<Color> gradient;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradient,
        ),
        image:
            imageAsset == null
                ? null
                : DecorationImage(
                  image: AssetImage(imageAsset!),
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(
                    Colors.black.withValues(alpha: 0.62),
                    BlendMode.darken,
                  ),
                ),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(16, top + 8, 16, 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton.filledTonal(
              tooltip: 'मागे',
              style: IconButton.styleFrom(
                backgroundColor: Colors.white.withValues(alpha: 0.15),
                foregroundColor: Colors.white,
              ),
              onPressed: () => _goBack(context),
              icon: const Icon(Icons.arrow_back_rounded),
            ),
          ),
          const SizedBox(height: 8),
          if (badge != null) _HeroBadge(text: badge!),
          if (eyebrow != null) ...[
            const SizedBox(height: 8),
            Text(
              eyebrow!,
              style: HomeTheme.marathiBody(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFFF0B866),
                height: 1.3,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Text(
            title,
            style: HomeTheme.marathiHeading(
              fontSize: 25,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              height: 1.25,
            ),
          ),
          if (quote != null) ...[
            const SizedBox(height: 8),
            Text(
              quote!,
              style: HomeTheme.marathiBody(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF93C5FD),
                height: 1.4,
              ),
            ),
          ],
          if (subtitle != null) ...[
            const SizedBox(height: 8),
            Text(
              subtitle!,
              style: HomeTheme.marathiBody(
                fontSize: 13.5,
                color: const Color(0xFFE6DDCE),
                height: 1.55,
              ),
            ),
          ],
          if (stats.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final s in stats) _HeroStat(value: s.$1, label: s.$2),
              ],
            ),
          ],
          if (action != null) ...[const SizedBox(height: 16), action!],
        ],
      ),
    );
  }
}

void _goBack(BuildContext context) {
  if (Navigator.of(context).canPop()) {
    Navigator.of(context).pop();
  } else {
    context.go('/home');
  }
}

class _HeroBadge extends StatelessWidget {
  const _HeroBadge({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: HeritageColors.saffron,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        text,
        style: HomeTheme.marathiBody(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: HeritageColors.maroonDark,
          height: 1.3,
        ),
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 96),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: HomeTheme.marathiHeading(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: const Color(0xFFF0B866),
              height: 1.2,
            ),
          ),
          Text(
            label,
            style: HomeTheme.marathiBody(
              fontSize: 11,
              color: Colors.white,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}

/// A titled block of content with standard page padding.
class ContentSection extends StatelessWidget {
  const ContentSection({
    super.key,
    required this.title,
    this.subtitle,
    this.titleColor = HeritageColors.maroonDark,
    required this.child,
  });

  final String title;
  final String? subtitle;
  final Color titleColor;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 22, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 4,
                height: 20,
                margin: const EdgeInsets.only(top: 3, right: 8),
                decoration: BoxDecoration(
                  color: HomeTheme.primaryOrange,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: Text(
                  title,
                  style: HomeTheme.marathiHeading(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: titleColor,
                    height: 1.3,
                  ),
                ),
              ),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle!,
              style: HomeTheme.marathiBody(
                fontSize: 12.5,
                color: HomeTheme.textMuted,
                height: 1.45,
              ),
            ),
          ],
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

/// Horizontally scrolling single-choice filter chips.
class FilterChipBar extends StatelessWidget {
  const FilterChipBar({
    super.key,
    required this.labels,
    required this.selected,
    required this.onSelected,
  });

  final List<String> labels;
  final int selected;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(labels[i]),
                selected: i == selected,
                onSelected: (_) => onSelected(i),
                showCheckmark: false,
                labelStyle: HomeTheme.marathiBody(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: i == selected ? Colors.white : HomeTheme.textDark,
                  height: 1.2,
                ),
                selectedColor: HeritageColors.maroon,
                backgroundColor: Colors.white,
                side: const BorderSide(color: HeritageColors.line),
                shape: const StadiumBorder(),
              ),
            ),
        ],
      ),
    );
  }
}

/// Text search box used to filter a list on the page.
class ContentSearchField extends StatelessWidget {
  const ContentSearchField({
    super.key,
    required this.hint,
    required this.onChanged,
  });

  final String hint;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: TextField(
        onChanged: onChanged,
        style: HomeTheme.marathiBody(fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: HomeTheme.marathiBody(
            fontSize: 13,
            color: HomeTheme.textMuted,
          ),
          prefixIcon: const Icon(Icons.search_rounded),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: HeritageColors.saffron),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: HeritageColors.saffron,
              width: 1.5,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
              color: HeritageColors.maroon,
              width: 2,
            ),
          ),
        ),
      ),
    );
  }
}

/// White card with an emoji, title, optional coloured subtitle/tag, body text,
/// optional label/value facts and an optional action button.
class InfoCard extends StatelessWidget {
  const InfoCard({
    super.key,
    required this.title,
    this.emoji,
    this.subtitle,
    this.highlight,
    this.tag,
    this.body,
    this.facts = const [],
    this.accent = HeritageColors.saffron,
    this.titleColor = HeritageColors.maroonDark,
    this.background = Colors.white,
    this.footer,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? emoji;
  final String? subtitle;
  final String? highlight;
  final String? tag;
  final String? body;
  final List<(String, String)> facts;
  final Color accent;
  final Color titleColor;
  final Color background;

  /// Extra content shown after the facts (lists, tags…).
  final Widget? footer;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    // Rounded borders must be one colour, so the accent is a separate strip.
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HeritageColors.line),
        boxShadow: HomeTheme.subtleShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(height: 3, color: accent),
          Padding(padding: const EdgeInsets.all(16), child: _body()),
        ],
      ),
    );
  }

  Widget _body() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (emoji != null) ...[
              Text(emoji!, style: const TextStyle(fontSize: 28, height: 1.1)),
              const SizedBox(width: 10),
            ],
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: HomeTheme.marathiHeading(
                      fontSize: 16.5,
                      fontWeight: FontWeight.w800,
                      color: titleColor,
                      height: 1.3,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: accent,
                        height: 1.35,
                      ),
                    ),
                ],
              ),
            ),
            if (tag != null) ...[
              const SizedBox(width: 8),
              // A long tag wraps instead of pushing the card off screen; it
              // never takes more than 2/5 of the row.
              Flexible(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1EBE3),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    tag!,
                    style: HomeTheme.marathiBody(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: HeritageColors.body,
                      height: 1.3,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
        if (highlight != null) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: HeritageColors.cream,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              highlight!,
              style: HomeTheme.marathiBody(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: HeritageColors.maroonText,
                height: 1.4,
              ),
            ),
          ),
        ],
        if (body != null) ...[
          const SizedBox(height: 10),
          Text(
            body!,
            style: HomeTheme.marathiBody(
              fontSize: 13.5,
              color: HeritageColors.body,
              height: 1.55,
            ),
          ),
        ],
        if (facts.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F1E8),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final f in facts)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: '${f.$1}: ',
                            style: const TextStyle(fontWeight: FontWeight.w800),
                          ),
                          TextSpan(text: f.$2),
                        ],
                      ),
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        color: HomeTheme.textDark,
                        height: 1.45,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
        if (footer != null) footer!,
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: 12),
          FilledButton(
            onPressed: onAction,
            style: FilledButton.styleFrom(
              backgroundColor: HeritageColors.maroon,
              padding: const EdgeInsets.symmetric(vertical: 10),
            ),
            child: Text(
              actionLabel!,
              style: HomeTheme.marathiBody(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                height: 1.2,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Vertical list of cards with consistent spacing.
class CardList extends StatelessWidget {
  const CardList({super.key, required this.children, this.emptyText});

  final List<Widget> children;
  final String? emptyText;

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Text(
          emptyText ?? 'काहीही सापडले नाही.',
          textAlign: TextAlign.center,
          style: HomeTheme.marathiBody(color: HomeTheme.textMuted),
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const SizedBox(height: 12),
          children[i],
        ],
      ],
    );
  }
}

/// A dated event: date block on the left, title/place/description on the right.
class DateEventCard extends StatelessWidget {
  const DateEventCard({
    super.key,
    required this.date,
    required this.title,
    this.place,
    this.body,
    this.tag,
  });

  final String date;
  final String title;
  final String? place;
  final String? body;
  final String? tag;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: HeritageColors.line),
        boxShadow: HomeTheme.subtleShadow,
      ),
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 92,
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
            decoration: BoxDecoration(
              color: HeritageColors.cream,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HeritageColors.saffron, width: 1.5),
            ),
            child: Column(
              children: [
                Text(
                  date,
                  textAlign: TextAlign.center,
                  style: HomeTheme.marathiHeading(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: HeritageColors.maroonDark,
                    height: 1.3,
                  ),
                ),
                if (tag != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: HeritageColors.saffron,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      tag!,
                      textAlign: TextAlign.center,
                      style: HomeTheme.marathiBody(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: HomeTheme.marathiHeading(
                    fontSize: 15.5,
                    fontWeight: FontWeight.w800,
                    color: HeritageColors.maroonDark,
                    height: 1.3,
                  ),
                ),
                if (place != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      '📍 $place',
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: HeritageColors.saffronDeep,
                        height: 1.35,
                      ),
                    ),
                  ),
                if (body != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      body!,
                      style: HomeTheme.marathiBody(
                        fontSize: 13,
                        color: HeritageColors.body,
                        height: 1.5,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Year + event rows with a saffron left rule (compact timeline).
class TimelineList extends StatelessWidget {
  const TimelineList({super.key, required this.items});

  final List<(String, String)> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: HeritageColors.line),
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++)
            // Rounded corners need a uniform border, so the saffron rule is
            // drawn as the container's left padding over a coloured backing.
            Container(
              margin: const EdgeInsets.symmetric(vertical: 4),
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: HomeTheme.primaryOrange,
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.only(left: 4),
              child: Container(
                color: i.isEven ? const Color(0xFFFAF6F0) : Colors.white,
                padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      items[i].$1,
                      style: HomeTheme.marathiHeading(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: HeritageColors.maroon,
                        height: 1.3,
                      ),
                    ),
                    Text(
                      items[i].$2,
                      style: HomeTheme.marathiBody(
                        fontSize: 13,
                        color: HeritageColors.body,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Centered verse/quote with its meaning, on a cream card with a gold border.
class QuoteBlock extends StatelessWidget {
  const QuoteBlock({super.key, required this.quote, this.meaning});

  final String quote;
  final String? meaning;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF8F2), Color(0xFFFFF3E8)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HomeTheme.gold, width: 2),
      ),
      child: Column(
        children: [
          Text(
            quote,
            textAlign: TextAlign.center,
            style: HomeTheme.marathiHeading(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: HeritageColors.maroonDark,
              height: 1.6,
            ),
          ),
          if (meaning != null) ...[
            const SizedBox(height: 10),
            Text(
              meaning!,
              textAlign: TextAlign.center,
              style: HomeTheme.marathiBody(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: HeritageColors.saffronDeep,
                height: 1.55,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Grid of navigation tiles (emoji, title, one-line description), two per row
/// on phones and three on wider screens.
class HubTileGrid extends StatelessWidget {
  const HubTileGrid({super.key, required this.tiles});

  final List<HubTile> tiles;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 600 ? 3 : 2;
        const gap = 10.0;
        final width = (constraints.maxWidth - gap * (columns - 1)) / columns;
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: [for (final t in tiles) SizedBox(width: width, child: t)],
        );
      },
    );
  }
}

class HubTile extends StatelessWidget {
  const HubTile({
    super.key,
    required this.emoji,
    required this.title,
    required this.description,
    required this.onTap,
  });

  final String emoji;
  final String title;
  final String description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          constraints: const BoxConstraints(minHeight: 118),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: HeritageColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(emoji, style: const TextStyle(fontSize: 24)),
                  const Spacer(),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 18,
                    color: HeritageColors.saffronDeep,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: HomeTheme.marathiHeading(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w800,
                  color: HeritageColors.maroonDark,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: HomeTheme.marathiBody(
                  fontSize: 11.5,
                  color: HomeTheme.textMuted,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Bulleted list of short lines.
class BulletList extends StatelessWidget {
  const BulletList({
    super.key,
    required this.items,
    this.bullet = '•',
    this.color = HeritageColors.body,
  });

  final List<String> items;
  final String bullet;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 18,
                  child: Text(
                    bullet,
                    style: HomeTheme.marathiBody(fontSize: 13, color: color),
                  ),
                ),
                Expanded(
                  child: Text(
                    item,
                    style: HomeTheme.marathiBody(
                      fontSize: 13,
                      color: color,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Wrapping row of small rounded tags.
class TagWrap extends StatelessWidget {
  const TagWrap({
    super.key,
    required this.tags,
    this.background = const Color(0xFFF1E8DC),
    this.foreground = const Color(0xFF4E3E33),
  });

  final List<String> tags;
  final Color background;
  final Color foreground;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: [
        for (final t in tags)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              t,
              style: HomeTheme.marathiBody(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: foreground,
                height: 1.35,
              ),
            ),
          ),
      ],
    );
  }
}

/// Small bold heading inside a card or sheet.
class MiniHeading extends StatelessWidget {
  const MiniHeading(this.text, {super.key, this.color = HeritageColors.maroon});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 14, bottom: 6),
      child: Text(
        text,
        style: HomeTheme.marathiHeading(
          fontSize: 14.5,
          fontWeight: FontWeight.w800,
          color: color,
          height: 1.3,
        ),
      ),
    );
  }
}

/// Opens a scrollable detail panel from the bottom of the screen.
Future<void> showContentSheet(
  BuildContext context, {
  required String title,
  String? subtitle,
  required List<Widget> children,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: HomeTheme.bgWarmCream,
    builder:
        (context) => DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.85,
          maxChildSize: 0.95,
          builder:
              (context, controller) => ListView(
                controller: controller,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                children: [
                  Text(
                    title,
                    style: HomeTheme.marathiHeading(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: HeritageColors.maroonDark,
                      height: 1.3,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: HeritageColors.saffronDeep,
                        height: 1.4,
                      ),
                    ),
                  ...children,
                ],
              ),
        ),
  );
}

/// Plain paragraph in the standard body style.
class BodyText extends StatelessWidget {
  const BodyText(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: HomeTheme.marathiBody(
        fontSize: 13.5,
        color: HeritageColors.body,
        height: 1.6,
      ),
    );
  }
}
