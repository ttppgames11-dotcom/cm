import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';

/// Reusable section header with a title, optional subtitle, and "See All" action.
final _devanagari = RegExp('[ऀ-ॿ]');

class SectionHeader extends StatelessWidget {
  final String title;
  final String actionLabel;
  final VoidCallback? onAction;
  final EdgeInsetsGeometry padding;

  const SectionHeader({
    super.key,
    required this.title,
    this.actionLabel = 'See All',
    this.onAction,
    this.padding = const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  width: 3.5,
                  height: 18,
                  decoration: BoxDecoration(
                    color: HomeTheme.primaryOrange,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                // Shrink long titles to fit instead of cutting them off.
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      title,
                      maxLines: 1,
                      // The serif display font has no Devanagari glyphs, so
                      // Marathi titles use the Marathi heading font.
                      style:
                          _devanagari.hasMatch(title)
                              ? HomeTheme.marathiHeading(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: HomeTheme.textDark,
                                height: 1.3,
                              )
                              : HomeTheme.headerSerif(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.3,
                                color: HomeTheme.textDark,
                              ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (onAction != null || actionLabel.isNotEmpty) ...[
            const SizedBox(width: 8),
            InkWell(
              onTap: onAction,
              borderRadius: BorderRadius.circular(6),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      actionLabel,
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: HomeTheme.primaryOrange,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(
                      Icons.chevron_right_rounded,
                      size: 16,
                      color: HomeTheme.primaryOrange,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
