import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/builders_providers.dart';
import '../widgets/builder_card.dart';
import '../../../../../widgets/home/custom_bottom_nav_bar.dart';

class BuildersListScreen extends ConsumerStatefulWidget {
  const BuildersListScreen({super.key});

  @override
  ConsumerState<BuildersListScreen> createState() => _BuildersListScreenState();
}

class _BuildersListScreenState extends ConsumerState<BuildersListScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // Client-side pagination: 20 per page
  int _displayLimit = 20;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      final total = ref.read(filteredBuilderGroupsProvider).length;
      if (_displayLimit < total) {
        setState(() {
          _displayLimit = (_displayLimit + 20).clamp(0, total);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectsAsync = ref.watch(buildersProjectsProvider);
    final filteredGroups = ref.watch(filteredBuilderGroupsProvider);
    final allCities = ref.watch(allBuilderCitiesProvider);
    final selectedCity = ref.watch(buildersCityFilterProvider);
    final selectedType = ref.watch(buildersTypeFilterProvider);

    final paginatedGroups = filteredGroups.take(_displayLimit).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        title: const Text(
          'मराठा बिल्डर्स व डेव्हलपर्स',
          style: TextStyle(
            fontSize: 18.5,
            fontWeight: FontWeight.w800,
            color: Color(0xFF2B1B12),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF2B1B12), size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFFE65100)),
            tooltip: 'रिफ्रेश करा',
            onPressed: () => ref.read(buildersProjectsProvider.notifier).fetchProjects(),
          ),
        ],
      ),
      body: projectsAsync.when(
        loading: () => _buildSkeletonLoading(),
        error: (err, _) => _buildErrorState(err.toString()),
        data: (_) => RefreshIndicator(
          color: const Color(0xFF8B1E1E),
          onRefresh: () => ref.read(buildersProjectsProvider.notifier).fetchProjects(),
          child: CustomScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            slivers: [
              // 1. Search Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      ref.read(buildersSearchQueryProvider.notifier).state = val;
                      setState(() => _displayLimit = 20);
                    },
                    decoration: InputDecoration(
                      hintText: 'बिल्डर, प्रकल्प किंवा ठिकाण शोधा...',
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.5),
                      prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFE65100)),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                ref.read(buildersSearchQueryProvider.notifier).state = '';
                                setState(() => _displayLimit = 20);
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE65100), width: 1.5),
                      ),
                    ),
                  ),
                ),
              ),

              // 2. City Filter Chips
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 38,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildChip(
                        label: 'सर्व शहरे',
                        isSelected: selectedCity == null || selectedCity == 'सर्व',
                        onTap: () {
                          ref.read(buildersCityFilterProvider.notifier).state = null;
                          setState(() => _displayLimit = 20);
                        },
                      ),
                      ...allCities.map((city) {
                        return _buildChip(
                          label: city,
                          isSelected: selectedCity == city,
                          onTap: () {
                            ref.read(buildersCityFilterProvider.notifier).state =
                                selectedCity == city ? null : city;
                            setState(() => _displayLimit = 20);
                          },
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // 3. Project Type Filter Chips (flats, villas, plots)
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 38,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildTypeChip(
                        label: 'सर्व प्रकार',
                        icon: Icons.grid_view_rounded,
                        isSelected: selectedType == null || selectedType == 'all',
                        onTap: () {
                          ref.read(buildersTypeFilterProvider.notifier).state = null;
                          setState(() => _displayLimit = 20);
                        },
                      ),
                      _buildTypeChip(
                        label: 'फ्लॅट्स (Flats)',
                        icon: Icons.apartment_rounded,
                        isSelected: selectedType == 'flats',
                        onTap: () {
                          ref.read(buildersTypeFilterProvider.notifier).state =
                              selectedType == 'flats' ? null : 'flats';
                          setState(() => _displayLimit = 20);
                        },
                      ),
                      _buildTypeChip(
                        label: 'व्हिला (Villas)',
                        icon: Icons.villa_rounded,
                        isSelected: selectedType == 'villas',
                        onTap: () {
                          ref.read(buildersTypeFilterProvider.notifier).state =
                              selectedType == 'villas' ? null : 'villas';
                          setState(() => _displayLimit = 20);
                        },
                      ),
                      _buildTypeChip(
                        label: 'प्लॉट्स (Plots)',
                        icon: Icons.landscape_rounded,
                        isSelected: selectedType == 'plots',
                        onTap: () {
                          ref.read(buildersTypeFilterProvider.notifier).state =
                              selectedType == 'plots' ? null : 'plots';
                          setState(() => _displayLimit = 20);
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 8)),

              // 4. Count Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                  child: Text(
                    'एकूण ${filteredGroups.length} बांधकाम व्यावसायिक आढळले',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF7A6A5D),
                    ),
                  ),
                ),
              ),

              // 5. Builders List
              if (paginatedGroups.isEmpty) ...[
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildEmptyState(),
                ),
              ] else ...[
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return BuilderCard(group: paginatedGroups[index]);
                    },
                    childCount: paginatedGroups.length,
                  ),
                ),

                // Load More Button if pagination has remaining
                if (_displayLimit < filteredGroups.length)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Center(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() {
                              _displayLimit = (_displayLimit + 20).clamp(0, filteredGroups.length);
                            });
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF8B1E1E),
                            side: const BorderSide(color: Color(0xFF8B1E1E)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('अधिक बिल्डर्स पहा (Load More)'),
                        ),
                      ),
                    ),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 24)),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: const CustomBottomNavBar(currentIndex: 2),
    );
  }

  Widget _buildChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: const Color(0xFF8B1E1E),
        backgroundColor: Colors.white,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : const Color(0xFF5D4037),
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
          fontSize: 12,
        ),
        side: BorderSide(
          color: isSelected ? const Color(0xFF8B1E1E) : const Color(0xFFE0D5C9),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
        onSelected: (_) => onTap(),
      ),
    );
  }

  Widget _buildTypeChip({
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE65100) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? const Color(0xFFE65100) : const Color(0xFFE0D5C9),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected ? Colors.white : const Color(0xFF7A6A5D),
              ),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFF5D4037),
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSkeletonLoading() {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFEDE3D8)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(width: 140, height: 16, color: Colors.grey.shade200),
                      const SizedBox(height: 6),
                      Container(width: 90, height: 12, color: Colors.grey.shade200),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(width: 180, height: 14, color: Colors.grey.shade200),
            ],
          ),
        );
      },
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFFFEBEE),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded, size: 48, color: Color(0xFFD32F2F)),
            ),
            const SizedBox(height: 16),
            const Text(
              'बिल्डर्स माहिती लोड करताना अडचण आली',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Color(0xFF7A6A5D)),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => ref.read(buildersProjectsProvider.notifier).fetchProjects(),
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('पुन्हा प्रयत्न करा'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B1E1E),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3E0),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFFE0B2), width: 1.5),
              ),
              child: const Icon(Icons.apartment_rounded, size: 48, color: Color(0xFFE65100)),
            ),
            const SizedBox(height: 18),
            const Text(
              'कोणताही बिल्डर आढळला नाही',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
            ),
            const SizedBox(height: 8),
            const Text(
              'कृपया आपले शोध निकष किंवा फिल्टर्स बदलून पुन्हा तपासा.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF7A6A5D)),
            ),
            const SizedBox(height: 18),
            TextButton(
              onPressed: () {
                _searchController.clear();
                ref.read(buildersSearchQueryProvider.notifier).state = '';
                ref.read(buildersCityFilterProvider.notifier).state = null;
                ref.read(buildersTypeFilterProvider.notifier).state = null;
                setState(() => _displayLimit = 20);
              },
              child: const Text('सर्व फिल्टर्स रीसेट करा', style: TextStyle(color: Color(0xFF8B1E1E), fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}
