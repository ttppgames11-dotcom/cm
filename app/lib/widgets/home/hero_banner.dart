import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/home_theme.dart';
import 'home_models.dart';

/// Section 2: HeroBanner with auto-sliding multi-image carousel
/// - 3 to 4 rotating images with smooth slide animation
/// - Dark gradient overlay for readability
/// - Large Marathi quote on the left with attribution
/// - Stacked category tags on the right separated by a golden divider
/// - Subtle animated slide indicator dots at the bottom
class HeroBanner extends StatefulWidget {
  final HeroBannerData data;
  final double height;
  final VoidCallback? onTap;

  const HeroBanner({
    super.key,
    this.data = HeroBannerData.defaultBanner,
    this.height = 215.0,
    this.onTap,
  });

  @override
  State<HeroBanner> createState() => _HeroBannerState();
}

class _HeroBannerState extends State<HeroBanner> {
  late final PageController _pageController;
  Timer? _timer;
  int _currentPage = 0;

  List<String> get _imageList {
    if (widget.data.images.isNotEmpty) {
      return widget.data.images;
    }
    return [widget.data.imageAsset];
  }

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoSlide();
  }

  void _startAutoSlide() {
    _timer?.cancel();
    // Auto-slide every 4.5 seconds
    _timer = Timer.periodic(const Duration(milliseconds: 4500), (timer) {
      if (!mounted || !_pageController.hasClients) return;
      final images = _imageList;
      if (images.length <= 1) return;

      final nextPage = (_currentPage + 1) % images.length;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 750),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final images = _imageList;

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        width: double.infinity,
        height: widget.height,
        margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          boxShadow: HomeTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(17),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Sliding Images PageView
              PageView.builder(
                controller: _pageController,
                physics: const BouncingScrollPhysics(),
                itemCount: images.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemBuilder: (context, index) {
                  return Image.asset(
                    images[index],
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF2A1208), Color(0xFF140804)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.fort_rounded,
                            size: 60,
                            color: HomeTheme.gold,
                          ),
                        ),
                      );
                    },
                  );
                },
              ),

              // Gradient Overlay for text contrast
              IgnorePointer(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.25),
                        Colors.black.withValues(alpha: 0.60),
                        HomeTheme.bgNearBlack.withValues(alpha: 0.95),
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),

              // Content Layer
              IgnorePointer(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14.0, 10.0, 14.0, 18.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Left: Large Marathi Quote and Attribution
                      Expanded(
                        flex: 7,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '“ ',
                                  style: HomeTheme.headerSerif(
                                    fontSize: 22,
                                    color: HomeTheme.primaryOrange,
                                    height: 1.0,
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    widget.data.quote,
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: HomeTheme.marathiHeading(
                                      fontSize: 15.0,
                                      fontWeight: FontWeight.w700,
                                      color: HomeTheme.textWhite,
                                      height: 1.38,
                                    ),
                                  ),
                                ),
                                Text(
                                  ' ”',
                                  style: HomeTheme.headerSerif(
                                    fontSize: 22,
                                    color: HomeTheme.primaryOrange,
                                    height: 1.0,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Padding(
                              padding: const EdgeInsets.only(left: 14.0),
                              child: Text(
                                '— ${widget.data.attribution}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiBody(
                                  fontSize: 12.0,
                                  fontWeight: FontWeight.w600,
                                  color: HomeTheme.gold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Vertical Divider Line
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10.0),
                        width: 1.2,
                        height: 85,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              HomeTheme.gold.withValues(alpha: 0.1),
                              HomeTheme.gold.withValues(alpha: 0.8),
                              HomeTheme.gold.withValues(alpha: 0.1),
                            ],
                          ),
                        ),
                      ),

                      // Right: 4 Stacked Category Words
                      Expanded(
                        flex: 3,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: widget.data.categories.map((category) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 2.5,
                              ),
                              child: Text(
                                category,
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 12.0,
                                  fontWeight: FontWeight.w700,
                                  color: HomeTheme.goldLight,
                                  height: 1.25,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Slide Indicator Dots at bottom center
              if (images.length > 1)
                Positioned(
                  bottom: 8,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (index) {
                      final isSelected = _currentPage == index;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: isSelected ? 16 : 6,
                        height: 5,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? HomeTheme.primaryOrange
                              : Colors.white.withValues(alpha: 0.45),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
