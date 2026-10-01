import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/favorites/favorites_store.dart';
import '../core/theme/home_theme.dart';
import '../features/history/widgets/content_kit.dart';
import '../widgets/home/custom_bottom_nav_bar.dart';
import '../widgets/home/home_models.dart';

/// Screen displaying Maratha Heritage, Forts, and Warriors list.
/// Reached when a user taps "इतिहास" from Quick Actions or "वाचा अधिक" on Heritage cards.
class HeritageListScreen extends StatefulWidget {
  final List<Fort>? initialForts;
  final List<Warrior>? initialWarriors;

  const HeritageListScreen({
    super.key,
    this.initialForts,
    this.initialWarriors,
  });

  @override
  State<HeritageListScreen> createState() => _HeritageListScreenState();
}

class _HeritageListScreenState extends State<HeritageListScreen> {
  int _activeCategoryIndex = 0;
  late List<Fort> _forts;
  late List<Warrior> _warriors;
  String _selectedSort = 'लोकप्रियतेनुसार';

  final List<Map<String, dynamic>> _categories = const [
    {
      'titleMr': 'किल्ले',
      'subtitleEn': 'Forts',
      'icon': Icons.castle_rounded,
      'sectionTitle': 'महाराष्ट्रातील किल्ले',
      'sectionSubtitle': 'स्वराज्याचे साक्षीदार, शौर्याची प्रतिके',
    },
    {
      'titleMr': 'वीर',
      'subtitleEn': 'Warriors',
      'icon': Icons.shield_rounded,
      'sectionTitle': 'महाराष्ट्रातील वीर योद्धे',
      'sectionSubtitle': 'पराक्रमाची गाथा, शौर्याचा वारसा',
    },
    {
      'titleMr': 'इतिहास',
      'subtitleEn': 'History',
      'icon': Icons.menu_book_rounded,
      'sectionTitle': 'मराठा साम्राज्य इतिहास',
      'sectionSubtitle': 'सुवर्णकाळाचा प्रेरणादायी प्रवास',
    },
    {
      'titleMr': 'संस्कृती',
      'subtitleEn': 'Culture',
      'icon': Icons.account_balance_rounded,
      'sectionTitle': 'मराठी संस्कृती व परंपरा',
      'sectionSubtitle': 'वारसा, सण आणि लोककला',
    },
  ];

  @override
  void initState() {
    super.initState();
    _forts = List.from(widget.initialForts ?? Fort.defaultForts);
    _warriors = List.from(widget.initialWarriors ?? Warrior.defaultWarriors);
    // Hearts come from the saved favourites, so they survive leaving the
    // screen and match the fort / warrior pages and Profile → जतन केलेले.
    _favorites.addListener(_onFavoritesChanged);
    _favorites.load();
  }

  final FavoritesStore _favorites = FavoritesStore.instance;

  bool get _alphabetical => _selectedSort != 'लोकप्रियतेनुसार';

  /// Forts in the order chosen with the sort control.
  List<Fort> get _visibleForts =>
      _alphabetical
          ? ([..._forts]..sort((a, b) => a.name.compareTo(b.name)))
          : _forts;

  /// Warriors in the order chosen with the sort control.
  List<Warrior> get _visibleWarriors =>
      _alphabetical
          ? ([..._warriors]..sort((a, b) => a.name.compareTo(b.name)))
          : _warriors;

  void _onFavoritesChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _favorites.removeListener(_onFavoritesChanged);
    super.dispose();
  }

  Future<void> _toggleFortFavorite(Fort fort) async {
    final added = await _favorites.toggleFort(fort.id);
    _showMessage(
      added
          ? '${fort.name} आवडीमध्ये जोडले (Added to favorites)'
          : '${fort.name} आवडीमधून काढले (Removed from favorites)',
    );
  }

  Future<void> _toggleWarriorFavorite(Warrior warrior) async {
    final added = await _favorites.toggleWarrior(warrior.id);
    _showMessage(
      added
          ? '${warrior.name} आवडीमध्ये जोडले (Added to favorites)'
          : '${warrior.name} आवडीमधून काढले (Removed from favorites)',
    );
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

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final heroHeight = (screenHeight * 0.43).clamp(320.0, 420.0);
    final activeCat = _categories[_activeCategoryIndex];

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. HeritageHeroHeader (Fixed at top)
            HeritageHeroHeader(
              height: heroHeight,
              onBack: () {
                if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                } else {
                  context.go('/home');
                }
              },
              onSearch: () => context.push('/search'),
            ),

            // 2. CategoryTabBar (Overlaps the bottom edge of hero image)
            Transform.translate(
              offset: const Offset(0, -22),
              child: CategoryTabBar(
                categories: _categories,
                selectedIndex: _activeCategoryIndex,
                onSelect: (index) {
                  setState(() => _activeCategoryIndex = index);
                  _showMessage('${_categories[index]['titleMr']} विभाग निवडला');
                },
              ),
            ),

            // Negative offset compensation
            const SizedBox(height: 2),

            // 3. Section Header Row (Swaps title & subtitle dynamically)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activeCat['sectionTitle'] as String,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: HomeTheme.marathiHeading(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: HomeTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          activeCat['sectionSubtitle'] as String,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: HomeTheme.marathiBody(
                            fontSize: 12,
                            color: HomeTheme.textMuted,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Dropdown-style text button for sorting
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedSort =
                            _selectedSort == 'लोकप्रियतेनुसार'
                                ? 'अकारविल्हे (A-Z)'
                                : 'लोकप्रियतेनुसार';
                      });
                      _showMessage('क्रमवारी: $_selectedSort');
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: HomeTheme.subtleShadow,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '$_selectedSort ▾',
                            style: HomeTheme.marathiBody(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: HomeTheme.textDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // 4. Grid Content (Swaps between FortGrid, WarriorGrid, or History content)
            _buildGridContent(),

            const SizedBox(height: 14),

            // 5. FeaturedBanner (Swaps banner according to active tab)
            _buildFeaturedBanner(),

            // Bottom scroll clearance
            const SizedBox(height: 24),
          ],
        ),
      ),

      // 6. CustomBottomNavBar (none of the 5 tabs marked active)
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: -1,
        onTap: (index) {
          if (index == 0) {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              context.go('/home');
            }
          } else if (index == 1) {
            context.push('/community');
          } else if (index == 2) {
            context.push('/business');
          } else if (index == 3) {
            context.push('/search');
          } else if (index == 4) {
            context.push('/profile');
          }
        },
      ),
    );
  }

  Widget _buildGridContent() {
    if (_activeCategoryIndex == 2) {
      // History tab: the History pages ported from the website.
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            HubTileGrid(
              tiles: [
                HubTile(
                  emoji: '⚔️',
                  title: 'युद्धे व रणव्यूह',
                  description: 'पावनखिंड ते पानिपत',
                  onTap: () => context.push('/history/battles'),
                ),
                HubTile(
                  emoji: '🛡️',
                  title: 'अमर वीर व मावळे',
                  description: 'तानाजी, बाजीप्रभू, मुरारबाजी',
                  onTap: () => context.push('/history/warriors'),
                ),
                HubTile(
                  emoji: '⚓',
                  title: 'मराठा आरमार',
                  description: 'युद्धनौका व जलदुर्ग',
                  onTap: () => context.push('/history/navy'),
                ),
                HubTile(
                  emoji: '🕯️',
                  title: 'बलिदान मास',
                  description: 'धर्मवीर संभाजी महाराज',
                  onTap: () => context.push('/history/balidan-maas'),
                ),
                HubTile(
                  emoji: '📅',
                  title: 'ऐतिहासिक दिनविशेष',
                  description: 'महत्त्वाचे ऐतिहासिक दिवस',
                  onTap: () => context.push('/history/dates'),
                ),
                HubTile(
                  emoji: '⚖️',
                  title: 'स्वराज्य प्रशासन',
                  description: 'अष्टप्रधान व महसूल गणक',
                  onTap: () => context.push('/history/swarajya-administration'),
                ),
                HubTile(
                  emoji: '🏆',
                  title: 'इतिहास क्विझ',
                  description: 'आपली जाण तपासा',
                  onTap: () => context.push('/history/quiz'),
                ),
                HubTile(
                  emoji: '📜',
                  title: 'इतिहास महाग्रंथालय',
                  description: 'युगपुरुष, राजमुद्रा व कालपट',
                  onTap: () => context.push('/history'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    if (_activeCategoryIndex == 3) {
      // Culture tab: the Culture pages ported from the website.
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: HubTileGrid(
          tiles: [
            HubTile(
              emoji: '🚩',
              title: 'शिवकालीन उत्सव',
              description: '१३ सण — पुरावे व परंपरा',
              onTap: () => context.push('/culture/shivkal-festivals'),
            ),
            HubTile(
              emoji: '🛕',
              title: 'ग्रामदैवत व जत्रा',
              description: 'कुलदैवते, नाट्य व देशी खेळ',
              onTap: () => context.push('/culture/gramdevat'),
            ),
            HubTile(
              emoji: '🍲',
              title: 'खाद्यसंस्कृती',
              description: 'प्रदेशनिहाय पारंपरिक पदार्थ',
              onTap: () => context.push('/culture/food'),
            ),
            HubTile(
              emoji: '🗣️',
              title: 'बोली व भाषा',
              description: 'एका वाक्याची प्रादेशिक रूपे',
              onTap: () => context.push('/culture/dialects'),
            ),
            HubTile(
              emoji: '🙏',
              title: 'मंदिरे',
              description: 'कुलदैवते व तीर्थक्षेत्रे',
              onTap: () => context.push('/culture/temples'),
            ),
            HubTile(
              emoji: '🏛️',
              title: 'संस्कृती दालन',
              description: 'प्रदेश, वारसा मार्ग व सर्व दालने',
              onTap: () => context.push('/culture'),
            ),
          ],
        ),
      );
    }

    if (_activeCategoryIndex == 1) {
      // Warriors tab active
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _visibleWarriors.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 14,
            childAspectRatio: 0.62,
          ),
          itemBuilder: (context, index) {
            final warrior = _visibleWarriors[index];
            return WarriorCard(
              warrior: warrior.copyWith(
                isFavorite: _favorites.isWarrior(warrior.id),
              ),
              onFavoriteToggle: () => _toggleWarriorFavorite(warrior),
              onTap: () {
                context.push('/warrior/${warrior.id}');
              },
            );
          },
        ),
      );
    }

    // Default to Forts tab (or Fallback)
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _visibleForts.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 14,
          childAspectRatio: 0.63,
        ),
        itemBuilder: (context, index) {
          final fort = _visibleForts[index];
          return FortCard(
            fort: fort.copyWith(isFavorite: _favorites.isFort(fort.id)),
            onFavoriteToggle: () => _toggleFortFavorite(fort),
            onTap: () {
              context.push('/fort/${fort.id}');
            },
          );
        },
      ),
    );
  }

  Widget _buildFeaturedBanner() {
    if (_activeCategoryIndex == 1) {
      // Featured banner for Warriors tab
      return FeaturedBanner(
        title: 'नरवीर तानाजी मालुसरे',
        subtitle: 'सिंहगडाचे अमर सेनानी',
        buttonText: 'चरित्र पहा',
        imageAsset: 'assets/images/warrior_tanaji.webp',
        onTap: () {
          context.push('/warrior/tanaji');
        },
      );
    }

    // Default featured banner for Forts & other tabs
    return FeaturedBanner(
      title: 'छत्रपती शिवाजी महाराज',
      subtitle: 'एक प्रेरणास्थान',
      buttonText: 'माहिती पहा',
      imageAsset: 'assets/images/hero_banner.webp',
      onTap: () {
        context.push('/warrior/shivaji');
      },
    );
  }
}

/// 1. HeritageHeroHeader
class HeritageHeroHeader extends StatelessWidget {
  final double height;
  final VoidCallback? onBack;
  final VoidCallback? onSearch;
  final String heroAsset;

  const HeritageHeroHeader({
    super.key,
    required this.height,
    this.onBack,
    this.onSearch,
    this.heroAsset = 'assets/images/heritage_hero.webp',
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return SizedBox(
      height: height,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Image.asset(
            heroAsset,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Image.asset(
                'assets/images/heritage_rajgad.webp',
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
                        Icons.castle_rounded,
                        size: 64,
                        color: HomeTheme.primaryOrange,
                      ),
                    ),
                  );
                },
              );
            },
          ),

          // Dark Gradient Overlay for readability
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.35),
                    Colors.black.withValues(alpha: 0.15),
                    Colors.black.withValues(alpha: 0.65),
                    Colors.black.withValues(alpha: 0.90),
                  ],
                  stops: const [0.0, 0.35, 0.70, 1.0],
                ),
              ),
            ),
          ),

          // Safe-area-aware Top Action Buttons
          Positioned(
            top: topPadding + 8,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Circular Semi-transparent Dark Back Button
                _buildHeroCircularButton(
                  icon: Icons.arrow_back_rounded,
                  tooltip: 'मागे जा / Back',
                  onTap: onBack,
                ),

                // Circular Semi-transparent Dark Search Button
                _buildHeroCircularButton(
                  icon: Icons.search_rounded,
                  tooltip: 'शोधा / Search',
                  onTap: onSearch,
                ),
              ],
            ),
          ),

          // Bottom Content Overlay (Text & Location Chip)
          Positioned(
            left: 16,
            right: 16,
            bottom: 30, // Clearance for overlapping CategoryTabBar
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Left: Two-line Title, Marathi Tagline, Quote & Attribution
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // "Maratha" in white serif
                      Text(
                        'Maratha',
                        style: HomeTheme.headerSerif(
                          fontSize: 25,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          height: 1.05,
                          letterSpacing: 0.8,
                        ),
                      ),
                      // "Heritage" in gold/orange serif
                      Text(
                        'Heritage',
                        style: HomeTheme.headerSerif(
                          fontSize: 25,
                          fontWeight: FontWeight.w800,
                          color: HomeTheme.primaryOrange,
                          height: 1.05,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 4),

                      // "स्वराज्याची अमर परंपरा" in orange Marathi text
                      Text(
                        'स्वराज्याची अमर परंपरा',
                        style: HomeTheme.marathiHeading(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: HomeTheme.primaryOrange,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 3),

                      // Italic quote & attribution
                      Text(
                        '“ हे राज्य व्हावे, हे तो श्रींची इच्छा! ”',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w500,
                          color: Colors.white.withValues(alpha: 0.95),
                          height: 1.3,
                        ),
                      ),
                      Text(
                        '— छत्रपती शिवाजी महाराज',
                        style: HomeTheme.marathiBody(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                          color: HomeTheme.goldLight,
                          height: 1.25,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // Right: Location Chip (semi-transparent dark background)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.60),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.20),
                      width: 0.8,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.location_on_rounded,
                            size: 13,
                            color: HomeTheme.primaryOrange,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            'राजगड किल्ला',
                            style: HomeTheme.marathiHeading(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'पुणे / Rajgad Fort',
                        style: HomeTheme.headerSerif(
                          fontSize: 9.0,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.75),
                          height: 1.15,
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

  Widget _buildHeroCircularButton({
    required IconData icon,
    required String tooltip,
    required VoidCallback? onTap,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.black.withValues(alpha: 0.45),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.25),
          width: 0.8,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}

/// 2. CategoryTabBar & HeritageTabItem
class CategoryTabBar extends StatelessWidget {
  final List<Map<String, dynamic>> categories;
  final int selectedIndex;
  final ValueChanged<int> onSelect;

  const CategoryTabBar({
    super.key,
    required this.categories,
    required this.selectedIndex,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 6.0),
      decoration: HomeTheme.cardDecoration(
        radius: 16,
        backgroundColor: Colors.white,
        shadows: HomeTheme.softShadow,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          for (int i = 0; i < categories.length; i++) ...[
            Expanded(
              child: HeritageTabItem(
                titleMr: categories[i]['titleMr'] as String,
                subtitleEn: categories[i]['subtitleEn'] as String,
                icon: categories[i]['icon'] as IconData,
                isSelected: selectedIndex == i,
                onTap: () => onSelect(i),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Reusable HeritageTabItem
class HeritageTabItem extends StatelessWidget {
  final String titleMr;
  final String subtitleEn;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const HeritageTabItem({
    super.key,
    required this.titleMr,
    required this.subtitleEn,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 7.0),
        decoration: BoxDecoration(
          color: isSelected ? HomeTheme.primaryOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? Colors.white : HomeTheme.textDark,
            ),
            const SizedBox(height: 3),
            Text(
              titleMr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: HomeTheme.marathiHeading(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? Colors.white : HomeTheme.textDark,
                height: 1.15,
              ),
            ),
            Text(
              subtitleEn,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: HomeTheme.headerSerif(
                fontSize: 8.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color:
                    isSelected
                        ? Colors.white.withValues(alpha: 0.9)
                        : HomeTheme.textMuted,
                letterSpacing: 0.2,
                height: 1.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 4. FortCard
class FortCard extends StatelessWidget {
  final Fort fort;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onTap;

  const FortCard({
    super.key,
    required this.fort,
    this.onFavoriteToggle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: HomeTheme.cardDecoration(
          radius: 16,
          backgroundColor: Colors.white,
          shadows: HomeTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image on Top with Favorite Button Overlay
              SizedBox(
                height: 112,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      fort.imagePath,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: HomeTheme.bgCardSecondary,
                          child: const Center(
                            child: Icon(
                              Icons.castle_rounded,
                              color: HomeTheme.primaryOrange,
                              size: 36,
                            ),
                          ),
                        );
                      },
                    ),

                    // White Circular Heart / Favorite Button (top-right)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: onFavoriteToggle,
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: HomeTheme.subtleShadow,
                          ),
                          child: Center(
                            child: Icon(
                              fort.isFavorite
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_border_rounded,
                              size: 16,
                              color:
                                  fort.isFavorite
                                      ? HomeTheme.primaryOrange
                                      : HomeTheme.textMuted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom White Section
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10.0,
                    vertical: 8.0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Location Pin + District Name
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_rounded,
                                size: 12,
                                color: HomeTheme.primaryOrange,
                              ),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  fort.district,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: HomeTheme.marathiBody(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w600,
                                    color: HomeTheme.textMuted,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),

                          // Fort Name in bold dark text
                          Text(
                            fort.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiHeading(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: HomeTheme.textDark,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 2),

                          // Short subtitle in muted text
                          Text(
                            fort.subtitle,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiBody(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w500,
                              color: HomeTheme.textMuted,
                              height: 1.25,
                            ),
                          ),
                        ],
                      ),

                      // "वाचा अधिक →" Link in Orange
                      Text(
                        'वाचा अधिक →',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.0,
                          fontWeight: FontWeight.w700,
                          color: HomeTheme.primaryOrange,
                          height: 1.2,
                        ),
                      ),
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

/// 4b. WarriorCard
/// - Same shape/shadow/heart-favorite style as FortCard
/// - Portrait image with rounded corners
/// - Name in bold dark text
/// - Role / title tag chip below the name
/// - Era / year range in small muted text
/// - "वाचा अधिक →" link in orange
class WarriorCard extends StatelessWidget {
  final Warrior warrior;
  final VoidCallback? onFavoriteToggle;
  final VoidCallback? onTap;

  const WarriorCard({
    super.key,
    required this.warrior,
    this.onFavoriteToggle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: HomeTheme.cardDecoration(
          radius: 16,
          backgroundColor: Colors.white,
          shadows: HomeTheme.softShadow,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Portrait Image on Top with Favorite Button Overlay
              SizedBox(
                height: 112,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(
                      warrior.imagePath,
                      fit: BoxFit.cover,
                      alignment: Alignment.topCenter,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: HomeTheme.bgCardSecondary,
                          child: const Center(
                            child: Icon(
                              Icons.shield_rounded,
                              color: HomeTheme.primaryOrange,
                              size: 36,
                            ),
                          ),
                        );
                      },
                    ),

                    // White Circular Heart / Favorite Button (top-right)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: onFavoriteToggle,
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: HomeTheme.subtleShadow,
                          ),
                          child: Center(
                            child: Icon(
                              warrior.isFavorite
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_border_rounded,
                              size: 16,
                              color:
                                  warrior.isFavorite
                                      ? HomeTheme.primaryOrange
                                      : HomeTheme.textMuted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Bottom White Section
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10.0,
                    vertical: 8.0,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Warrior Name in bold dark text
                          Text(
                            warrior.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiHeading(
                              fontSize: 13.0,
                              fontWeight: FontWeight.w800,
                              color: HomeTheme.textDark,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 3),

                          // Role / Title Tag
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6.0,
                              vertical: 2.0,
                            ),
                            decoration: BoxDecoration(
                              color: HomeTheme.pastelPeach,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              warrior.roleTag,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: HomeTheme.marathiBody(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                                color: HomeTheme.primaryOrange,
                                height: 1.15,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),

                          // Era / Year range in small muted text
                          Text(
                            warrior.era,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: HomeTheme.marathiBody(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w500,
                              color: HomeTheme.textMuted,
                              height: 1.2,
                            ),
                          ),
                        ],
                      ),

                      // "वाचा अधिक →" Link in Orange
                      Text(
                        'वाचा अधिक →',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.0,
                          fontWeight: FontWeight.w700,
                          color: HomeTheme.primaryOrange,
                          height: 1.2,
                        ),
                      ),
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

/// 5. FeaturedBanner
/// - Full-width rounded card with custom portrait/scenery
/// - Gradient overlay for text readability
/// - Custom title, subtitle, button text, and action
class FeaturedBanner extends StatelessWidget {
  final VoidCallback? onTap;
  final String title;
  final String subtitle;
  final String buttonText;
  final String imageAsset;

  const FeaturedBanner({
    super.key,
    this.onTap,
    this.title = 'छत्रपती शिवाजी महाराज',
    this.subtitle = 'एक प्रेरणास्थान',
    this.buttonText = 'माहिती पहा',
    this.imageAsset = 'assets/images/hero_banner.webp',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 130,
      margin: const EdgeInsets.symmetric(horizontal: 16.0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        boxShadow: HomeTheme.softShadow,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background Image
            Image.asset(
              imageAsset,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF2A1208), Color(0xFF140804)],
                    ),
                  ),
                );
              },
            ),

            // Gradient Overlay for readability
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.black.withValues(alpha: 0.3),
                    Colors.black.withValues(alpha: 0.82),
                  ],
                  stops: const [0.2, 0.75],
                ),
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 14.0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Text on left
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: HomeTheme.marathiHeading(
                            fontSize: 16.0,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: HomeTheme.marathiBody(
                            fontSize: 12.0,
                            fontWeight: FontWeight.w500,
                            color: HomeTheme.goldLight,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Orange filled button with arrow
                  FilledButton(
                    onPressed: onTap,
                    style: FilledButton.styleFrom(
                      backgroundColor: HomeTheme.primaryOrange,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      elevation: 0,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          buttonText,
                          style: HomeTheme.marathiHeading(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          size: 14,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
