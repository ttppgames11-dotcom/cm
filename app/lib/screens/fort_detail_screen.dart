import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/favorites/favorites_store.dart';
import '../core/share/copy_share.dart';
import '../core/theme/home_theme.dart';
import '../data/forts_data.dart';

/// Dynamic Universal Fort Detail Screen for all Maratha Forts.
/// Supports rajgad, pratapgad, sinhgad, shivneri, raigad, torna, and any other fort ID.
class FortDetailScreen extends StatefulWidget {
  final String fortId;

  const FortDetailScreen({super.key, this.fortId = 'rajgad'});

  @override
  State<FortDetailScreen> createState() => _FortDetailScreenState();
}

class _FortDetailScreenState extends State<FortDetailScreen> {
  int _currentImageIndex = 0;
  int _selectedTabIndex = 0;
  late final PageController _pageController;
  late FortDetailModel _fort;

  // The heart reflects the saved favourites (kept on the phone), not a flag
  // that is forgotten when this page closes.
  final FavoritesStore _favorites = FavoritesStore.instance;
  bool get _isFavorite => _favorites.isFort(widget.fortId);

  void _onFavoritesChanged() {
    if (mounted) setState(() {});
  }

  final List<Map<String, dynamic>> _tabs = const [
    {'title': 'आढावा', 'icon': Icons.description_outlined},
    {'title': 'इतिहास', 'icon': Icons.menu_book_outlined},
    {'title': 'कसे जायचे', 'icon': Icons.location_on_outlined},
    {'title': 'ट्रेक माहिती', 'icon': Icons.hiking_rounded},
    {'title': 'छायाचित्रे', 'icon': Icons.photo_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _fort = FortsData.getFortById(widget.fortId);
    _favorites.addListener(_onFavoritesChanged);
    _favorites.load();
  }

  @override
  void didUpdateWidget(covariant FortDetailScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.fortId != widget.fortId) {
      setState(() {
        _fort = FortsData.getFortById(widget.fortId);
        _currentImageIndex = 0;
        _selectedTabIndex = 0;
      });
    }
  }

  @override
  void dispose() {
    _favorites.removeListener(_onFavoritesChanged);
    _pageController.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.white,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFF2EAE0), width: 1),
        ),
        content: Text(
          message,
          style: HomeTheme.marathiBody(fontSize: 13, color: HomeTheme.textDark),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showAttractionDetailBottomSheet(Map<String, String> attraction) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  height: 180,
                  width: double.infinity,
                  child: Image.asset(attraction['image']!, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                attraction['title']!,
                style: HomeTheme.marathiHeading(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: HomeTheme.textDark,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                attraction['subtitle']!,
                style: HomeTheme.marathiBody(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: HomeTheme.primaryOrange,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                attraction['description'] ?? '',
                style: HomeTheme.marathiBody(
                  fontSize: 13.5,
                  color: const Color(0xFF4A3E36),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD35411),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(
                    'बंद करा',
                    style: HomeTheme.marathiBody(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAllAttractionsModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.75,
          maxChildSize: 0.92,
          minChildSize: 0.5,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    '${_fort.name} - मुख्य आकर्षणे',
                    style: HomeTheme.marathiHeading(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: HomeTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'एकूण ${_fort.attractions.length} प्रमुख ऐतिहासिक स्थळे',
                    style: HomeTheme.marathiBody(
                      fontSize: 12,
                      color: HomeTheme.textMuted,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: ListView.separated(
                      controller: scrollController,
                      itemCount: _fort.attractions.length,
                      separatorBuilder:
                          (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = _fort.attractions[index];
                        return GestureDetector(
                          onTap: () {
                            Navigator.of(context).pop();
                            _showAttractionDetailBottomSheet(item);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF9F5F0),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: const Color(0xFFEADBCE),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: const BorderRadius.horizontal(
                                    left: Radius.circular(14),
                                  ),
                                  child: SizedBox(
                                    width: 100,
                                    height: 90,
                                    child: Image.asset(
                                      item['image']!,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: 4,
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          item['title']!,
                                          style: HomeTheme.marathiHeading(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: HomeTheme.textDark,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          item['subtitle']!,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: HomeTheme.marathiBody(
                                            fontSize: 11,
                                            color: const Color(0xFF6B584B),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const Padding(
                                  padding: EdgeInsets.only(right: 12.0),
                                  child: Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 14,
                                    color: Color(0xFF9E541E),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showPhotoFullscreen(int index) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(12),
          child: Stack(
            alignment: Alignment.topRight,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  color: Colors.black,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Image.asset(
                        _fort.carouselImages[index %
                            _fort.carouselImages.length],
                        fit: BoxFit.contain,
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Text(
                          _fort.photoCaptions[index %
                              _fort.photoCaptions.length],
                          textAlign: TextAlign.center,
                          style: HomeTheme.marathiBody(
                            fontSize: 13,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(
                  Icons.close_rounded,
                  color: Colors.white,
                  size: 28,
                ),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final carouselHeight = (screenHeight * 0.40).clamp(320.0, 420.0);

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Top Image Carousel with Overlays
            _buildCarouselHeader(carouselHeight),

            const SizedBox(height: 12),

            // 2. Navigation Tab Bar (Segmented Pills)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14.0),
              child: _buildNavigationTabs(),
            ),

            const SizedBox(height: 16),

            // 3. Dynamic Tab Body Content
            _buildActiveTabContent(),

            const SizedBox(height: 20),

            // 4. Bottom Sticky / Call to Action Banner
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14.0),
              child: _buildPlanningBanner(),
            ),

            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveTabContent() {
    switch (_selectedTabIndex) {
      case 1:
        return _buildHistoryTab();
      case 2:
        return _buildReachTab();
      case 3:
        return _buildTrekInfoTab();
      case 4:
        return _buildGalleryTab();
      case 0:
      default:
        return _buildOverviewTab();
    }
  }

  /// --------------------------------------------------------------------------
  /// TAB 0: आढावा (Overview)
  /// --------------------------------------------------------------------------
  Widget _buildOverviewTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14.0),
          child: _buildOverviewAndSpecsSection(),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14.0),
          child: _buildAttractionsSection(),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14.0),
          child: _buildHistorySection(),
        ),
      ],
    );
  }

  /// --------------------------------------------------------------------------
  /// TAB 1: इतिहास (History)
  /// --------------------------------------------------------------------------
  Widget _buildHistoryTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2C1910), Color(0xFF421E0F)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.castle_rounded,
                      color: Color(0xFFFF9E66),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _fort.subtitle,
                        style: HomeTheme.marathiHeading(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  _fort.historySummary,
                  style: HomeTheme.marathiBody(
                    fontSize: 12.5,
                    color: const Color(0xFFECDAC6),
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Section Title
          Row(
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
              Expanded(
                child: Text(
                  'ऐतिहासिक घटनाक्रम (Historical Timeline)',
                  style: HomeTheme.marathiHeading(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: HomeTheme.textDark,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Timeline items
          ...List.generate(_fort.historyTimeline.length, (index) {
            final item = _fort.historyTimeline[index];
            final isLast = index == _fort.historyTimeline.length - 1;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0E6),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFD35411),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: const TextStyle(
                            color: Color(0xFFD35411),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 72,
                        color: const Color(0xFFEADBCE),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFF0E4D8),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item['year']!,
                              style: const TextStyle(
                                color: Color(0xFFD35411),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF0E6),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'ऐतिहासिक नोंद',
                                style: TextStyle(
                                  color: Color(0xFF8B3A0E),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['title']!,
                          style: HomeTheme.marathiHeading(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: HomeTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          item['desc']!,
                          style: HomeTheme.marathiBody(
                            fontSize: 12,
                            color: const Color(0xFF5A4A3D),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),

          const SizedBox(height: 10),

          // Architectural Note Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFFD8A8), width: 1),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.shield_rounded,
                  color: Color(0xFFD35411),
                  size: 24,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _fort.architectureNote['title']!,
                        style: HomeTheme.marathiHeading(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF8B3A0E),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        _fort.architectureNote['desc']!,
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          color: const Color(0xFF6B4A34),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// --------------------------------------------------------------------------
  /// TAB 2: कसे जायचे (How to Reach)
  /// --------------------------------------------------------------------------
  Widget _buildReachTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFECDAC6), width: 1),
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF0E6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.directions_car_rounded,
                    color: Color(0xFFD35411),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_fort.name} प्रवास मार्गदर्शिका',
                        style: HomeTheme.marathiHeading(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w800,
                          color: HomeTheme.textDark,
                        ),
                      ),
                      Text(
                        _fort.district,
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          color: HomeTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Route Cards
          ..._fort.reachRoutes.map((route) {
            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: (route['color'] as Color).withValues(
                            alpha: 0.12,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          route['badge'] as String,
                          style: TextStyle(
                            color: route['color'] as Color,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          route['distance'] as String,
                          textAlign: TextAlign.right,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF7A685B),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    route['title'] as String,
                    style: HomeTheme.marathiHeading(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: HomeTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.route_rounded,
                        size: 16,
                        color: Color(0xFFD35411),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          route['route'] as String,
                          style: HomeTheme.marathiBody(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF4A3E36),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    route['transport'] as String,
                    style: HomeTheme.marathiBody(
                      fontSize: 11.5,
                      color: const Color(0xFF6B584B),
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 6),

          // Facilities & Stay Info
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF7F1EB),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE5D5C5), width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'गडावरील सुविधा व मुक्काम',
                  style: HomeTheme.marathiHeading(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: HomeTheme.textDark,
                  ),
                ),
                const SizedBox(height: 8),
                ..._fort.stayFacilities.map((facility) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: _buildFacilityRow(
                      icon: Icons.check_circle_outline_rounded,
                      title: facility['title']!,
                      desc: facility['desc']!,
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityRow({
    required IconData icon,
    required String title,
    required String desc,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF9E541E)),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: HomeTheme.marathiBody(
                fontSize: 11.5,
                color: const Color(0xFF4A3E36),
                height: 1.3,
              ),
              children: [
                TextSpan(
                  text: '$title: ',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                TextSpan(text: desc),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// --------------------------------------------------------------------------
  /// TAB 3: ट्रेक माहिती (Trek Info)
  /// --------------------------------------------------------------------------
  Widget _buildTrekInfoTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildTrekStatItem(
                  _fort.trekStats['distance']!,
                  'चढाई अंतर',
                  Icons.straighten_rounded,
                ),
                Container(width: 1, height: 36, color: const Color(0xFFEADBCE)),
                _buildTrekStatItem(
                  _fort.trekStats['time']!,
                  'वेळ',
                  Icons.timer_outlined,
                ),
                Container(width: 1, height: 36, color: const Color(0xFFEADBCE)),
                _buildTrekStatItem(
                  _fort.trekStats['difficulty']!,
                  'काठिण्य',
                  Icons.trending_up_rounded,
                ),
                Container(width: 1, height: 36, color: const Color(0xFFEADBCE)),
                _buildTrekStatItem(
                  _fort.trekStats['altitude']!,
                  'उंची',
                  Icons.terrain_rounded,
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          Text(
            'ट्रेक मार्ग व माहिती',
            style: HomeTheme.marathiHeading(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: HomeTheme.textDark,
            ),
          ),
          const SizedBox(height: 10),

          ..._fort.trekRoutes.map((route) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE0E0E0), width: 1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          route['title'] as String,
                          style: HomeTheme.marathiHeading(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: HomeTheme.textDark,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF0E6),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          route['badge'] as String,
                          style: const TextStyle(
                            color: Color(0xFFD35411),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    route['desc'] as String,
                    style: HomeTheme.marathiBody(
                      fontSize: 12,
                      color: const Color(0xFF5A4A3D),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 4),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF4EB),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFFCCAA), width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      color: Color(0xFFD35411),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _fort.trekSummitChallenge['title']!,
                        style: HomeTheme.marathiHeading(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF8B3A0E),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  _fort.trekSummitChallenge['desc']!,
                  style: HomeTheme.marathiBody(
                    fontSize: 11.5,
                    color: const Color(0xFF6B4A34),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          Text(
            'ट्रेकिंगसाठी आवश्यक वस्तूंची यादी (Checklist)',
            style: HomeTheme.marathiHeading(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: HomeTheme.textDark,
            ),
          ),
          const SizedBox(height: 8),
          ..._fort.trekChecklist.map(_buildChecklistItem),
        ],
      ),
    );
  }

  Widget _buildTrekStatItem(String value, String label, IconData icon) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF9E541E)),
        const SizedBox(height: 4),
        Text(
          value,
          style: HomeTheme.marathiHeading(
            fontSize: 13.0,
            fontWeight: FontWeight.w800,
            color: HomeTheme.textDark,
          ),
        ),
        Text(
          label,
          style: HomeTheme.marathiBody(
            fontSize: 10,
            color: const Color(0xFF7A685B),
          ),
        ),
      ],
    );
  }

  Widget _buildChecklistItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle_rounded,
            size: 16,
            color: Color(0xFF2E7D32),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: HomeTheme.marathiBody(
                fontSize: 12,
                color: const Color(0xFF4A3E36),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// --------------------------------------------------------------------------
  /// TAB 4: छायाचित्रे (Photos / Gallery)
  /// --------------------------------------------------------------------------
  Widget _buildGalleryTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${_fort.name} छायाचित्र दालन',
                  style: HomeTheme.marathiHeading(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: HomeTheme.textDark,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0E6),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${_fort.carouselImages.length} छायाचित्रे',
                  style: const TextStyle(
                    color: Color(0xFFD35411),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'मोठ्या आकारात पाहण्यासाठी छायाचित्रावर टॅप करा.',
            style: HomeTheme.marathiBody(
              fontSize: 11.5,
              color: HomeTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _fort.carouselImages.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 12,
              childAspectRatio: 0.85,
            ),
            itemBuilder: (context, index) {
              final caption =
                  _fort.photoCaptions[index % _fort.photoCaptions.length];
              return GestureDetector(
                onTap: () => _showPhotoFullscreen(index),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(
                                _fort.carouselImages[index],
                                fit: BoxFit.cover,
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.45),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.fullscreen_rounded,
                                    size: 16,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text(
                            caption,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiBody(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: HomeTheme.textDark,
                              height: 1.25,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  /// --------------------------------------------------------------------------
  /// Carousel Header with back button, share, favorite, title and quote overlay
  /// --------------------------------------------------------------------------
  Widget _buildCarouselHeader(double height) {
    final topPadding = MediaQuery.of(context).padding.top;

    return SizedBox(
      height: height,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: _fort.carouselImages.length,
            onPageChanged: (index) {
              setState(() => _currentImageIndex = index);
            },
            itemBuilder: (context, index) {
              return Image.asset(
                _fort.carouselImages[index],
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF2A140B), Color(0xFF140804)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.fort_rounded,
                        color: HomeTheme.primaryOrange,
                        size: 60,
                      ),
                    ),
                  );
                },
              );
            },
          ),

          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.50),
                    Colors.black.withValues(alpha: 0.10),
                    Colors.black.withValues(alpha: 0.55),
                    Colors.black.withValues(alpha: 0.88),
                  ],
                  stops: const [0.0, 0.28, 0.65, 1.0],
                ),
              ),
            ),
          ),

          // Top Action Buttons Row (Back, Favorite, Share)
          Positioned(
            top: topPadding + 8,
            left: 14,
            right: 14,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCircleIconButton(
                  icon: Icons.arrow_back_rounded,
                  onTap: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    } else {
                      context.go('/home');
                    }
                  },
                ),
                Row(
                  children: [
                    _buildCircleIconButton(
                      icon:
                          _isFavorite
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                      iconColor: _isFavorite ? Colors.redAccent : Colors.white,
                      onTap: () async {
                        final added = await _favorites.toggleFort(
                          widget.fortId,
                        );
                        _showMessage(
                          added
                              ? '${_fort.name} आवडीमध्ये जोडला!'
                              : '${_fort.name} आवडीमधून काढला!',
                        );
                      },
                    ),
                    const SizedBox(width: 10),
                    _buildCircleIconButton(
                      icon: Icons.share_rounded,
                      onTap: () async {
                        final shared = await shareText(
                          withAppLink(
                            '🏰 ${_fort.name} (${_fort.district})\n${_fort.subtitle}',
                          ),
                          subject: _fort.name,
                        );
                        if (!shared) _showMessage(copiedForSharingMessage);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Upper-right quote callout
          Positioned(
            top: topPadding + 60,
            right: 14,
            child: Container(
              constraints: const BoxConstraints(maxWidth: 175),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.15),
                  width: 0.8,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _fort.topQuote,
                    style: HomeTheme.marathiBody(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFFFFD499),
                      height: 1.35,
                    ),
                    textAlign: TextAlign.right,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    _fort.topQuoteAuthor,
                    style: HomeTheme.marathiBody(
                      fontSize: 9.0,
                      fontWeight: FontWeight.w400,
                      color: Colors.white.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Left: Fort Title, Category, Tagline & Altitude
          Positioned(
            left: 14,
            right: 14,
            bottom: 12,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 16,
                            height: 2.5,
                            decoration: BoxDecoration(
                              color: HomeTheme.primaryOrange,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _fort.tagline,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: HomeTheme.marathiBody(
                                fontSize: 12.0,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFFF9E66),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),

                      // Main Title
                      Text(
                        _fort.name,
                        style: HomeTheme.marathiHeading(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          height: 1.2,
                        ),
                      ),

                      // Subtitle
                      Text(
                        _fort.subtitle,
                        style: HomeTheme.marathiBody(
                          fontSize: 14.0,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFFFFD499),
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Chips: Location, Altitude, and Tags
                      Wrap(
                        spacing: 12,
                        runSpacing: 4,
                        children: [
                          _buildHeaderMetaChip(
                            icon: Icons.location_on_rounded,
                            text: _fort.district,
                          ),
                          _buildHeaderMetaChip(
                            icon: Icons.terrain_rounded,
                            text: _fort.altitude,
                          ),
                          _buildHeaderMetaChip(
                            icon: Icons.star_rounded,
                            text: _fort.categoryTags,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Bottom Right: Carousel Pagination Dots & Index
                Container(
                  margin: const EdgeInsets.only(left: 6, bottom: 4),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ...List.generate(
                        _fort.carouselImages.length,
                        (index) => Container(
                          width: 5,
                          height: 5,
                          margin: const EdgeInsets.symmetric(horizontal: 2),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color:
                                _currentImageIndex == index
                                    ? HomeTheme.primaryOrange
                                    : Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${_currentImageIndex + 1}/${_fort.carouselImages.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircleIconButton({
    required IconData icon,
    Color iconColor = Colors.white,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.42),
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.20),
            width: 0.8,
          ),
        ),
        child: Center(child: Icon(icon, color: iconColor, size: 20)),
      ),
    );
  }

  Widget _buildHeaderMetaChip({required IconData icon, required String text}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xFFFFB380), size: 13),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: HomeTheme.marathiBody(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Colors.white.withValues(alpha: 0.92),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationTabs() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF3EAE0),
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: List.generate(_tabs.length, (index) {
          final tab = _tabs[index];
          final isSelected = _selectedTabIndex == index;

          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedTabIndex = index);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color:
                      isSelected ? const Color(0xFFD35411) : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      tab['icon'] as IconData,
                      size: 19,
                      color:
                          isSelected ? Colors.white : const Color(0xFF6B584B),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      tab['title'] as String,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: HomeTheme.marathiBody(
                        fontSize: 11,
                        fontWeight:
                            isSelected ? FontWeight.w800 : FontWeight.w600,
                        color:
                            isSelected ? Colors.white : const Color(0xFF6B584B),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  /// Side by side on wide screens; stacked on phones, where two columns leave
  /// each only ~130px and the text becomes a narrow strip.
  Widget _buildOverviewAndSpecsSection() {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 520) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildOverviewColumn(),
              const SizedBox(height: 12),
              _buildSpecsCard(),
            ],
          );
        }
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(flex: 12, child: _buildOverviewColumn()),
            const SizedBox(width: 10),
            Expanded(flex: 10, child: _buildSpecsCard()),
          ],
        );
      },
    );
  }

  Widget _buildOverviewColumn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 14,
              height: 3,
              decoration: BoxDecoration(
                color: HomeTheme.primaryOrange,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                '${_fort.name}बद्दल',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: HomeTheme.marathiHeading(
                  fontSize: 15.0,
                  fontWeight: FontWeight.w800,
                  color: HomeTheme.textDark,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        Text(
          _fort.aboutText,
          style: HomeTheme.marathiBody(
            fontSize: 12.0,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF4A3E36),
            height: 1.45,
          ),
        ),
        const SizedBox(height: 10),

        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF9EFE4),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFECDAC6), width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _fort.quoteBoxText,
                style: HomeTheme.marathiBody(
                  fontSize: 12.0,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF8B3A0E),
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 4),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  _fort.quoteBoxAuthor,
                  style: HomeTheme.marathiBody(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF6E5646),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSpecsCard() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F0E8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE9DCCF), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children:
            _fort.keyFacts.map((fact) {
              IconData iconData;
              switch (fact['icon']) {
                case 'castle':
                  iconData = Icons.fort_rounded;
                  break;
                case 'crown':
                  iconData = Icons.military_tech_rounded;
                  break;
                case 'terrain':
                  iconData = Icons.landscape_rounded;
                  break;
                case 'area':
                  iconData = Icons.all_inclusive_rounded;
                  break;
                case 'calendar':
                  iconData = Icons.calendar_month_rounded;
                  break;
                case 'difficulty':
                default:
                  iconData = Icons.bar_chart_rounded;
                  break;
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 9.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(iconData, size: 18, color: const Color(0xFF9E541E)),
                    const SizedBox(width: 7),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            fact['label']!,
                            style: HomeTheme.marathiBody(
                              fontSize: 10.0,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF7A685B),
                              height: 1.15,
                            ),
                          ),
                          Text(
                            fact['value']!,
                            style: HomeTheme.marathiBody(
                              fontSize: 11.0,
                              fontWeight: FontWeight.w700,
                              color: HomeTheme.textDark,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
      ),
    );
  }

  Widget _buildAttractionsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 3.5,
                  height: 17,
                  decoration: BoxDecoration(
                    color: HomeTheme.primaryOrange,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'मुख्य आकर्षणे',
                  style: HomeTheme.marathiHeading(
                    fontSize: 16.5,
                    fontWeight: FontWeight.w800,
                    color: HomeTheme.textDark,
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: _showAllAttractionsModal,
              child: Row(
                children: [
                  Text(
                    'सर्व पहा',
                    style: HomeTheme.marathiBody(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF6E5646),
                    ),
                  ),
                  const SizedBox(width: 3),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 14,
                    color: Color(0xFF6E5646),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 10),

        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _fort.attractions.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final attraction = _fort.attractions[index];
              return GestureDetector(
                onTap: () => _showAttractionDetailBottomSheet(attraction),
                child: Container(
                  width: 145,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          height: 85,
                          width: double.infinity,
                          child: Image.asset(
                            attraction['image']!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: const Color(0xFFF3EAE0),
                                child: const Icon(
                                  Icons.landscape_rounded,
                                  color: HomeTheme.primaryOrange,
                                ),
                              );
                            },
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8.0,
                            vertical: 6.0,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                attraction['title']!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiHeading(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w800,
                                  color: HomeTheme.textDark,
                                  height: 1.2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                attraction['subtitle']!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiBody(
                                  fontSize: 10.0,
                                  fontWeight: FontWeight.w400,
                                  color: const Color(0xFF7A685B),
                                  height: 1.25,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildHistorySection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 3.5,
                height: 17,
                decoration: BoxDecoration(
                  color: HomeTheme.primaryOrange,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                'इतिहास आणि महत्त्व',
                style: HomeTheme.marathiHeading(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w800,
                  color: HomeTheme.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          Text(
            _fort.historySummary,
            style: HomeTheme.marathiBody(
              fontSize: 12.5,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF4A3E36),
              height: 1.45,
            ),
          ),
          const SizedBox(height: 12),

          GestureDetector(
            onTap: () {
              setState(() => _selectedTabIndex = 1);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF0E6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFFFCCAA), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'संपूर्ण इतिहास वाचा',
                    style: HomeTheme.marathiBody(
                      fontSize: 12.0,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFD35411),
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 14,
                    color: Color(0xFFD35411),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanningBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF2C1910), Color(0xFF190C06)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.10),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.20),
                width: 1,
              ),
            ),
            child: const Center(
              child: Icon(Icons.hiking_rounded, color: Colors.white, size: 22),
            ),
          ),
          const SizedBox(width: 10),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'आपल्या भेटीचे नियोजन करा',
                  style: HomeTheme.marathiHeading(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),
                Text(
                  '${_fort.name} मार्ग, ट्रेक व सुविधा तपशील.',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: HomeTheme.marathiBody(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w400,
                    color: Colors.white.withValues(alpha: 0.75),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          GestureDetector(
            onTap: () {
              setState(() => _selectedTabIndex = 3);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFD35411),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'ट्रेक मार्गदर्शक पहा',
                    style: HomeTheme.marathiBody(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 13,
                    color: Colors.white,
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
