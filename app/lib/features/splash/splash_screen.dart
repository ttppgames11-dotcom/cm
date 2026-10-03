import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../core/auth/auth_scope.dart';
import '../../core/theme/app_colors.dart';
import '../auth/auth_controller.dart';
import '../auth/data/registration_draft.dart';

/// Launch screen for Connect Maratha.
///
/// NOTE on navigation: unlike the rest of this app (which routes through
/// `go_router` with a real session/auth check — see `app_router.dart`),
/// this screen was explicitly requested to navigate on a flat timer
/// regardless of login state. It calls `context.go('/home')` — go_router's
/// own imperative API — rather than a raw `Navigator.push`, because
/// `/splash` is a page-based route owned by go_router's Navigator, and
/// only go_router's own navigation methods can complete/replace that kind
/// of route (a raw `Navigator.pushReplacement` throws
/// `!pageBased || isWaitingForExitingDecision`). `app_router.dart`'s
/// redirect logic no longer gates `/home` behind auth, to match: every
/// cold launch now lands on the authenticated shell even without a
/// session, and Login/Register are only reachable by navigating to them
/// directly. If that's not the intended long-term behavior, this is the
/// seam to revert (swap the timer callback back to letting go_router's
/// redirect decide the destination, and restore `/home`'s auth gate).
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  static const _animDuration = Duration(milliseconds: 1200);
  static const _maxTimeout = Duration(milliseconds: 2500);

  late final AnimationController _controller;
  late final Animation<double> _textFade;
  late final Animation<double> _progress;
  Timer? _safetyTimer;
  bool _navigated = false;

  bool get _reduceMotion =>
      WidgetsBinding
          .instance
          .platformDispatcher
          .accessibilityFeatures
          .disableAnimations;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: _animDuration);

    _textFade = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
    );
    _progress = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
    );

    if (_reduceMotion) {
      _controller.value = 1;
    } else {
      _controller.forward();
    }

    // Safety fallback: guarantees the app NEVER remains on splash indefinitely
    _safetyTimer = Timer(_maxTimeout, () {
      if (!mounted || _navigated) return;
      _attemptNavigation(force: true);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final status = AuthScope.of(context).state.status;
    if (status != AuthStatus.unknown && !_navigated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _attemptNavigation();
      });
    }
  }

  Future<void> _attemptNavigation({bool force = false}) async {
    if (!mounted || _navigated) return;
    final status = AuthScope.of(context).state.status;
    if (status == AuthStatus.unknown && !force) return;

    _navigated = true;
    _safetyTimer?.cancel();

    if (status == AuthStatus.authenticated) {
      context.go('/home');
      return;
    }

    var draftPending = false;
    try {
      draftPending = await RegistrationDraft.isPending();
    } catch (_) {}
    if (!mounted) return;
    context.go(draftPending ? '/register' : '/login');
  }

  @override
  void dispose() {
    _safetyTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Scales the splash's own text sizes with the user's font-size setting
    // without letting it blow past a sane ceiling on the fixed-height
    // layout below (SafeArea already keeps content clear of notches/bars).
    final textScale = MediaQuery.textScalerOf(
      context,
    ).clamp(maxScaleFactor: 1.25);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: textScale),
        child: Scaffold(
          backgroundColor: AppColors.nightMaroon,
          body: Stack(
            fit: StackFit.expand,
            children: [
              Image.asset(
                'assets/images/splash_background.webp',
                fit: BoxFit.cover,
              ),
              // Top scrim: the source photo's sky is bright, so the header
              // text needs a dark base to stay readable against it.
              const _EdgeScrim(
                alignment: Alignment.topCenter,
                heightFraction: 0.28,
              ),
              // Bottom scrim: fades from transparent to dark so the brand
              // block, feature row and loading text stay legible against
              // the midtone hillside in the photo.
              const _EdgeScrim(
                alignment: Alignment.bottomCenter,
                heightFraction: 0.55,
              ),
              SafeArea(
                child: FadeTransition(
                  opacity: _textFade,
                  child: Column(
                    children: [
                      const SizedBox(height: 12),
                      const _TopHeritageText(),
                      const Spacer(),
                      const _BrandBlock(),
                      const SizedBox(height: 18),
                      const _DecorativeDivider(),
                      const SizedBox(height: 18),
                      const _FeatureRow(),
                      const SizedBox(height: 22),
                      AnimatedBuilder(
                        animation: _progress,
                        builder:
                            (context, _) =>
                                _GradientProgressBar(value: _progress.value),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'आपल्या समुदायाशी जोडत आहोत...',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const _FooterLine(),
                      const SizedBox(height: 14),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A soft dark gradient anchored to one edge of the screen, used twice (top
/// and bottom) so text stays readable over the photographic background
/// without flattening the whole image under one uniform overlay.
class _EdgeScrim extends StatelessWidget {
  const _EdgeScrim({required this.alignment, required this.heightFraction});

  final Alignment alignment;
  final double heightFraction;

  @override
  Widget build(BuildContext context) {
    final isTop = alignment == Alignment.topCenter;
    return Align(
      alignment: alignment,
      child: FractionallySizedBox(
        heightFactor: heightFraction,
        widthFactor: 1,
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: isTop ? Alignment.topCenter : Alignment.bottomCenter,
              end: isTop ? Alignment.bottomCenter : Alignment.topCenter,
              colors: [
                AppColors.nightMaroon.withValues(alpha: isTop ? 0.55 : 0.92),
                AppColors.nightMaroon.withValues(alpha: 0.0),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Header line + the source website's own honorific verse for Chhatrapati
/// Shivaji Maharaj (`cm-shivaji-maharaj.html`'s `.war-cry-strip`). The site
/// never attributes this verse to a named author in its markup, so no
/// "— [name]" attribution line is added here rather than inventing one.
class _TopHeritageText extends StatelessWidget {
  const _TopHeritageText();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Text(
            '|| स्वराज्य | संस्कार | समाजाची शक्ती ||',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.92),
              fontSize: 14,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '|| निश्चयाचा महामेरू, बहुत जनांसी आधारू,\nअखंड स्थितीचा निर्धारू, श्रीमंत योगी छत्रपती शिवाजी महाराज! ||',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.8),
              fontSize: 12,
              fontStyle: FontStyle.italic,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

/// The official Connect मराठा logo. It already carries the name and the
/// slogan ("आधुनिक युगातील आधुनिक संघटन"), so no separate wordmark is shown.
class _BrandBlock extends StatelessWidget {
  const _BrandBlock();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 190,
          height: 190,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.45),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Image.asset(
            'assets/images/connect_maratha_logo.webp',
            fit: BoxFit.contain,
            semanticLabel: 'Connect मराठा — आधुनिक युगातील आधुनिक संघटन',
          ),
        ),
      ],
    );
  }
}

class _DecorativeDivider extends StatelessWidget {
  const _DecorativeDivider();

  @override
  Widget build(BuildContext context) {
    final line = Container(
      height: 1,
      color: AppColors.trueGold.withValues(alpha: 0.45),
    );
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 56),
      child: Row(
        children: [
          Expanded(child: line),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Transform.rotate(
              angle: 0.785398, // 45deg — square rendered as a diamond.
              child: Container(width: 6, height: 6, color: AppColors.trueGold),
            ),
          ),
          Expanded(child: line),
        ],
      ),
    );
  }
}

class _SplashFeature {
  const _SplashFeature(this.icon, this.label);
  final IconData icon;
  final String label;
}

/// Four community concepts with vertical dividers between them, per the
/// requested layout. Labels use the source site's own vocabulary where it
/// has a direct match (इतिहास, संधी) and plain, non-invented generic terms
/// for the other two (लोक, समाजसेवा).
class _FeatureRow extends StatelessWidget {
  const _FeatureRow();

  static const _features = [
    _SplashFeature(Icons.groups_rounded, 'लोक'),
    _SplashFeature(Icons.menu_book_rounded, 'इतिहास'),
    _SplashFeature(Icons.trending_up_rounded, 'संधी'),
    _SplashFeature(Icons.volunteer_activism_rounded, 'समाजसेवा'),
  ];

  @override
  Widget build(BuildContext context) {
    final items = <Widget>[];
    for (var i = 0; i < _features.length; i++) {
      if (i > 0) {
        items.add(
          Container(
            width: 1,
            height: 32,
            color: Colors.white.withValues(alpha: 0.25),
          ),
        );
      }
      final feature = _features[i];
      items.add(
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                feature.icon,
                color: AppColors.trueGold.withValues(alpha: 0.9),
                size: 22,
              ),
              const SizedBox(height: 6),
              Text(
                feature.label,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.82),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      );
    }
    return Row(mainAxisAlignment: MainAxisAlignment.center, children: items);
  }
}

/// A horizontal orange-to-transparent bar whose fill fraction is driven by
/// the entrance [AnimationController], so it visibly fills over the full
/// splash duration rather than showing an indeterminate/native indicator.
class _GradientProgressBar extends StatelessWidget {
  const _GradientProgressBar({required this.value});

  final double value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      height: 4,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(99),
        child: Stack(
          children: [
            Container(color: Colors.white.withValues(alpha: 0.2)),
            FractionallySizedBox(
              widthFactor: value.clamp(0.0, 1.0),
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.saffron600,
                      AppColors.trueGold,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterLine extends StatelessWidget {
  const _FooterLine();

  @override
  Widget build(BuildContext context) {
    return Text(
      'PEOPLE  |  HERITAGE  |  OPPORTUNITIES',
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.45),
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.5,
      ),
    );
  }
}
