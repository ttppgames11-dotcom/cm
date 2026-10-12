import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../../widgets/home/custom_bottom_nav_bar.dart';
import '../providers/dairy_providers.dart';
import '../widgets/farmer_registration_sheet.dart';
import '../widgets/product_enquiry_sheet.dart';
import '../../domain/models/dairy_item.dart';
import '../../domain/models/dairy_product.dart';

/// "दूध व कृषी संकलन केंद्र" Screen
/// Matches the exact Connect Maratha visual language:
/// - Sunrise banner header (warm gradient + silhouette + back button + title + subtitle)
/// - Cream rounded sheet (rounded top card layer over warm cream backdrop)
/// - Search bar with filter button ("केंद्र, गाव किंवा तालुका शोधा..." + "फिल्टर")
/// - Two tabs styled like category tiles: "संकलन केंद्रे" and "उत्पादने"
/// - When "उत्पादने" is selected (orange gradient):
///   - Section header "प्रमुख दुग्ध संघ व ब्रँड्स" + horizontal row of small white cards
///     (round letter avatar, "ब्रँडचे नाव", grey text "मुख्यालय: शहर")
///   - Row of category chips: "सर्व", "दूध", "दही", "पनीर", "तूप", "ताक", "श्रीखंड"
///   - 2-column grid of 4 product cards (white, rounded, soft shadow, peach square tile
///     with simple line icon, title "उत्पादनाचे नाव", grey "पॅक: ००० ग्रॅ", price "₹ ००",
///     and full-width filled orange pill "ऑर्डर / चौकशी")
///   - Small grey note under grid: "किंमत व उपलब्धता विक्रेत्याकडून तपासा."
/// - Native CustomBottomNavBar with index 2 (व्यवसाय) active.
class DairyScreen extends ConsumerStatefulWidget {
  const DairyScreen({super.key});

  @override
  ConsumerState<DairyScreen> createState() => _DairyScreenState();
}

class _DairyScreenState extends ConsumerState<DairyScreen> {
  final TextEditingController _searchController = TextEditingController();
  int _selectedTabIndex =
      1; // 1 = उत्पादने (selected by default as requested), 0 = संकलन केंद्रे
  String _selectedDistrict = 'सर्व';
  String _selectedCategory = 'सर्व';

  final List<String> _districts = const [
    'सर्व',
    'पुणे',
    'सातारा',
    'कोल्हापूर',
    'नाशिक',
    'इतर',
  ];

  final List<String> _productCategories = const [
    'सर्व',
    'दूध',
    'दही',
    'पनीर',
    'तूप',
    'ताक',
    'श्रीखंड',
  ];

  // Placeholder sample brands for the horizontal row
  final List<Map<String, String>> _sampleBrands = const [
    {'avatar': 'क', 'name': 'ब्रँडचे नाव', 'city': 'शहर'},
    {'avatar': 'ग', 'name': 'ब्रँडचे नाव', 'city': 'शहर'},
    {'avatar': 'व', 'name': 'ब्रँडचे नाव', 'city': 'शहर'},
    {'avatar': 'म', 'name': 'ब्रँडचे नाव', 'city': 'शहर'},
  ];

  // Placeholder line icons for 4 products
  final List<IconData> _productIcons = const [
    Icons.water_drop_outlined,
    Icons.egg_alt_outlined,
    Icons.crop_square_rounded,
    Icons.local_drink_outlined,
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    ref.invalidate(dairyItemsProvider);
    ref.invalidate(dairyProductsProvider);
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (ctx) => Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'जिल्हा व विभाग फिल्टर',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF2B1B12),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children:
                      _districts.map((d) {
                        final isSelected = _selectedDistrict == d;
                        return ChoiceChip(
                          label: Text(d),
                          selected: isSelected,
                          selectedColor: const Color(0xFFE65100),
                          backgroundColor: const Color(0xFFFAF7F2),
                          labelStyle: TextStyle(
                            color:
                                isSelected
                                    ? Colors.white
                                    : const Color(0xFF5D4037),
                            fontWeight:
                                isSelected ? FontWeight.w700 : FontWeight.w600,
                          ),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _selectedDistrict = d);
                              ref
                                  .read(dairyDistrictFilterProvider.notifier)
                                  .state = d == 'सर्व' ? null : d;
                              Navigator.pop(ctx);
                            }
                          },
                        );
                      }).toList(),
                ),
              ],
            ),
          ),
    );
  }

  void _openRegistrationModal(BuildContext context, DairyItem centre) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FarmerRegistrationSheet(centre: centre),
    );
  }

  void _openProductEnquiry(BuildContext context) {
    const mockProduct = DairyProductItem(
      id: 'mock_prod_1',
      name: 'उत्पादनाचे नाव',
      category: 'दूध',
      packSize: '००० ग्रॅ',
      price: 0,
      description: 'उत्पादनाची माहिती',
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const ProductEnquirySheet(product: mockProduct),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFFE65100),
          onRefresh: _refresh,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            slivers: [
              // 1. Sunrise Banner Header
              SliverToBoxAdapter(child: _buildSunriseBannerHeader(context)),

              // 2. Cream Rounded Sheet body container
              SliverToBoxAdapter(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFAF7F2),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(24),
                      topRight: Radius.circular(24),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 12),

                      // Search bar with "फिल्टर" button
                      _buildSearchBar(),

                      const SizedBox(height: 14),

                      // Two tabs under it styled like category tiles
                      _buildCategoryTilesTab(),

                      const SizedBox(height: 14),

                      // Tab 0: संकलन केंद्रे
                      if (_selectedTabIndex == 0) ...[
                        _buildCentresTabContent(),
                      ] else ...[
                        // Tab 1: उत्पादने (Selected by default)
                        _buildProductsTabContent(),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const CustomBottomNavBar(
        currentIndex: 2, // "व्यवसाय" selected
      ),
    );
  }

  // ===========================================================================
  // 1. SUNRISE BANNER HEADER
  // ===========================================================================
  Widget _buildSunriseBannerHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5), Color(0xFFFFE0B2)],
        ),
      ),
      child: Stack(
        children: [
          // Sunrise Fort / Silhouette overlay on the right
          Positioned(
            right: 0,
            top: 0,
            bottom: 0,
            width: 200,
            child: ShaderMask(
              shaderCallback: (rect) {
                return const LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [Colors.transparent, Colors.black],
                  stops: [0.0, 0.45],
                ).createShader(rect);
              },
              blendMode: BlendMode.dstIn,
              child: Image.asset(
                'assets/images/hero_banner.webp',
                fit: BoxFit.cover,
                alignment: Alignment.centerRight,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(10, 12, 16, 20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.arrow_back_rounded,
                    color: Color(0xFF1E1E1E),
                    size: 24,
                  ),
                  onPressed: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.pop(context);
                    } else {
                      context.go('/home');
                    }
                  },
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'दूध व कृषी संकलन केंद्र',
                          style: GoogleFonts.mukta(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFFD32F2F),
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'शेतकरी आणि दुग्ध व्यवसायासाठी',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF8B1E1E),
                          ),
                        ),
                      ],
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

  // ===========================================================================
  // 2. SEARCH BAR
  // ===========================================================================
  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFEADCCF), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(
              Icons.search_rounded,
              color: Color(0xFF8D7B6F),
              size: 22,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: (val) {
                  ref.read(dairySearchQueryProvider.notifier).state =
                      val.trim();
                },
                style: const TextStyle(fontSize: 13.5),
                decoration: const InputDecoration(
                  hintText: 'केंद्र, गाव किंवा तालुका शोधा...',
                  hintStyle: TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            if (_searchController.text.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.clear_rounded, size: 18),
                onPressed: () {
                  _searchController.clear();
                  ref.read(dairySearchQueryProvider.notifier).state = '';
                  setState(() {});
                },
              ),
            Container(width: 1, height: 24, color: const Color(0xFFEADCCF)),
            TextButton.icon(
              onPressed: _showFilterModal,
              icon: const Icon(
                Icons.tune_rounded,
                size: 18,
                color: Color(0xFF8B1E1E),
              ),
              label: const Text(
                'फिल्टर',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF8B1E1E),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // 3. CATEGORY TILE TABS ("संकलन केंद्रे" & "उत्पादने")
  // ===========================================================================
  Widget _buildCategoryTilesTab() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          // Tab 0: संकलन केंद्रे
          Expanded(
            child: _buildCategoryTabTile(
              index: 0,
              icon: Icons.storefront_rounded,
              label: 'संकलन केंद्रे',
              isSelected: _selectedTabIndex == 0,
            ),
          ),
          const SizedBox(width: 10),
          // Tab 1: उत्पादने (Orange gradient when selected)
          Expanded(
            child: _buildCategoryTabTile(
              index: 1,
              icon: Icons.inventory_2_rounded,
              label: 'उत्पादने',
              isSelected: _selectedTabIndex == 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryTabTile({
    required int index,
    required IconData icon,
    required String label,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () => setState(() => _selectedTabIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient:
              isSelected
                  ? const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFE65100), Color(0xFFFF6D00)],
                  )
                  : null,
          color: isSelected ? null : Colors.white,
          border: Border.all(
            color:
                isSelected ? const Color(0xFFE65100) : const Color(0xFFEADCCF),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color:
                  isSelected
                      ? const Color(0xFFE65100).withValues(alpha: 0.28)
                      : Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? Colors.white : const Color(0xFF8B1E1E),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: isSelected ? Colors.white : const Color(0xFF2B1B12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // TAB 1: उत्पादने (PRODUCTS CONTENT AS REQUESTED)
  // ===========================================================================
  Widget _buildProductsTabContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Section Header: "प्रमुख दुग्ध संघ व ब्रँड्स"
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'प्रमुख दुग्ध संघ व ब्रँड्स',
                style: TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2B1B12),
                ),
              ),
              Text(
                'सर्व पहा >',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFE65100),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 10),

        // 2. Horizontal row of small white cards
        // Each card: round letter avatar, "ब्रँडचे नाव", small grey text "मुख्यालय: शहर"
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Row(
            children:
                _sampleBrands.map((brand) {
                  return Container(
                    width: 160,
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: const Color(0xFFF1E5D8),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(
                            0xFF2B1B12,
                          ).withValues(alpha: 0.04),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Round letter avatar
                        Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFF0E6),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              brand['avatar']!,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFFE65100),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Brand Name & Headquarters city
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                brand['name']!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF2B1B12),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'मुख्यालय: ${brand['city']}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  color: Color(0xFF7A6A5D),
                                  fontWeight: FontWeight.w500,
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
        ),

        const SizedBox(height: 16),

        // 3. Row of category chips: "सर्व", "दूध", "दही", "पनीर", "तूप", "ताक", "श्रीखंड"
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Row(
            children:
                _productCategories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () {
                        setState(() => _selectedCategory = cat);
                        ref.read(dairyCategoryFilterProvider.notifier).state =
                            cat == 'सर्व' ? null : cat;
                      },
                      borderRadius: BorderRadius.circular(14),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color:
                              isSelected
                                  ? const Color(0xFFE65100)
                                  : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color:
                                isSelected
                                    ? const Color(0xFFE65100)
                                    : const Color(0xFFEADCCF),
                            width: 1.0,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color:
                                  isSelected
                                      ? const Color(
                                        0xFFE65100,
                                      ).withValues(alpha: 0.25)
                                      : Colors.black.withValues(alpha: 0.02),
                              blurRadius: 5,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Text(
                          cat,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color:
                                isSelected
                                    ? Colors.white
                                    : const Color(0xFF2B1B12),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
          ),
        ),

        const SizedBox(height: 16),

        // 4. Two-column grid of 4 product cards (white, rounded, soft shadow)
        // Each has:
        // - Peach square tile with a simple line icon (not a photo)
        // - Title "उत्पादनाचे नाव"
        // - Grey text "पॅक: ००० ग्रॅ"
        // - Price "₹ ००"
        // - Full-width filled orange pill "ऑर्डर / चौकशी"
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 4,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemBuilder: (context, index) {
              final lineIcon = _productIcons[index % _productIcons.length];
              return _buildProductCard(lineIcon: lineIcon);
            },
          ),
        ),

        const SizedBox(height: 14),

        // 5. Under the grid, the small grey note:
        // "किंमत व उपलब्धता विक्रेत्याकडून तपासा."
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          child: Row(
            children: const [
              Icon(
                Icons.info_outline_rounded,
                size: 14,
                color: Color(0xFF8D7B6F),
              ),
              SizedBox(width: 6),
              Expanded(
                child: Text(
                  'किंमत व उपलब्धता विक्रेत्याकडून तपासा.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFF8D7B6F),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildProductCard({required IconData lineIcon}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1E5D8), width: 1.0),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Peach square tile with a simple line icon (not a photo)
          Container(
            height: 96,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF0E6), // Peach square tile
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFFFD8BF), width: 1.0),
            ),
            child: Center(
              child: Icon(lineIcon, size: 40, color: const Color(0xFFE65100)),
            ),
          ),

          const SizedBox(height: 10),

          // Title "उत्पादनाचे नाव"
          const Text(
            'उत्पादनाचे नाव',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2B1B12),
            ),
          ),

          const SizedBox(height: 3),

          // Grey text "पॅक: ००० ग्रॅ"
          const Text(
            'पॅक: ००० ग्रॅ',
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w500,
              color: Color(0xFF7A6A5D),
            ),
          ),

          const SizedBox(height: 6),

          // Price "₹ ००"
          const Text(
            '₹ ००',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w900,
              color: Color(0xFFD32F2F),
            ),
          ),

          const Spacer(),

          // Full-width filled orange pill "ऑर्डर / चौकशी"
          SizedBox(
            width: double.infinity,
            child: InkWell(
              onTap: () => _openProductEnquiry(context),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFE65100),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE65100).withValues(alpha: 0.28),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    'ऑर्डर / चौकशी',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // TAB 0: संकलन केंद्रे (COLLECTION CENTRES)
  // ===========================================================================
  Widget _buildCentresTabContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // District Chips Row
        _buildDistrictChips(),

        const SizedBox(height: 14),

        // Section header: "संकलन केंद्रे" with "सर्व पहा >"
        _buildSectionHeader(),

        const SizedBox(height: 10),

        // Two centre cards with generic placeholder text
        _buildCentreCard(index: 1),
        const SizedBox(height: 14),
        _buildCentreCard(index: 2),

        // Under the card note
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
          child: Row(
            children: const [
              Icon(
                Icons.info_outline_rounded,
                size: 14,
                color: Color(0xFF8D7B6F),
              ),
              SizedBox(width: 6),
              Expanded(
                child: Text(
                  'दर केंद्राकडून बदलू शकतात. कृपया केंद्राशी संपर्क करा.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFF8D7B6F),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDistrictChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children:
            _districts.map((district) {
              final isSelected = _selectedDistrict == district;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: InkWell(
                  onTap: () {
                    setState(() => _selectedDistrict = district);
                    ref.read(dairyDistrictFilterProvider.notifier).state =
                        district == 'सर्व' ? null : district;
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color:
                          isSelected ? const Color(0xFFE65100) : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color:
                            isSelected
                                ? const Color(0xFFE65100)
                                : const Color(0xFFEADCCF),
                        width: 1.0,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color:
                              isSelected
                                  ? const Color(
                                    0xFFE65100,
                                  ).withValues(alpha: 0.25)
                                  : Colors.black.withValues(alpha: 0.02),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      district,
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color:
                            isSelected ? Colors.white : const Color(0xFF2B1B12),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
      ),
    );
  }

  Widget _buildSectionHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'संकलन केंद्रे',
            style: TextStyle(
              fontSize: 16.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF2B1B12),
            ),
          ),
          InkWell(
            onTap: () {
              setState(() => _selectedDistrict = 'सर्व');
              ref.read(dairyDistrictFilterProvider.notifier).state = null;
            },
            borderRadius: BorderRadius.circular(6),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Text(
                'सर्व पहा >',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFE65100),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCentreCard({required int index}) {
    final centres = ref.watch(filteredCollectionCentresProvider);
    final DairyItem targetItem =
        (centres.isNotEmpty && (index - 1) < centres.length)
            ? centres[index - 1]
            : const DairyItem(
              id: 'mock_centre',
              kind: DairyKind.centre,
              dairyName: 'केंद्राचे नाव',
              taluka: 'तालुका',
              village: 'गाव',
              district: 'जिल्हा',
              contact: '0000000000',
              centerHead: 'नाव',
              facilities: ['मिल्क ॲनालायझर', 'चिलिंग युनिट'],
              registeredFarmers: 0,
            );

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1E5D8), width: 1.0),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0E6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFFFFD8BF),
                    width: 1.0,
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.water_drop_rounded,
                    size: 34,
                    color: Color(0xFFE65100),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'केंद्राचे नाव',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 16.5,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2B1B12),
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      'प्रमुख: नाव',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF7A6A5D),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Icon(
                          Icons.location_on_rounded,
                          size: 14,
                          color: Color(0xFFD32F2F),
                        ),
                        SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            'गाव, ता. तालुका, जि. जिल्हा',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF7A6A5D),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: const [
                    Icon(
                      Icons.access_time_rounded,
                      size: 13,
                      color: Color(0xFF8D7B6F),
                    ),
                    SizedBox(width: 4),
                    Text(
                      'सकाळ: ००:०० - ००:००',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF5D4037),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  children: const [
                    Icon(
                      Icons.access_time_rounded,
                      size: 13,
                      color: Color(0xFF8D7B6F),
                    ),
                    SizedBox(width: 4),
                    Text(
                      'संध्याकाळ: ००:०० - ००:००',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF5D4037),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _buildFacilityPill('मिल्क ॲनालायझर'),
              _buildFacilityPill('चिलिंग युनिट'),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'नोंदणीकृत शेतकरी: ००',
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2B1B12),
            ),
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFF1E5D8), thickness: 1),
          const SizedBox(height: 10),
          Row(
            children: [
              InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      behavior: SnackBarBehavior.floating,
                      content: Text('केंद्राशी संपर्क साधत आहे...'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  child: Row(
                    children: [
                      Icon(
                        Icons.call_rounded,
                        size: 15,
                        color: Color(0xFF5D4037),
                      ),
                      SizedBox(width: 4),
                      Text(
                        'कॉल करा',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF5D4037),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Container(width: 1, height: 20, color: const Color(0xFFF1E5D8)),
              const Spacer(),
              InkWell(
                onTap: () => _openRegistrationModal(context, targetItem),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 7,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE65100),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFE65100).withValues(alpha: 0.28),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'नोंदणी करा',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(
                        Icons.arrow_forward_rounded,
                        size: 14,
                        color: Colors.white,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityPill(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFFFE0B2), width: 0.8),
      ),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w600,
          color: Color(0xFFD84315),
        ),
      ),
    );
  }
}
