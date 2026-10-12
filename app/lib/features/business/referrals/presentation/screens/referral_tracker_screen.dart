import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/models/referral_status.dart';
import '../providers/referral_providers.dart';
import '../widgets/referral_item_card.dart';
import '../widgets/referral_stats_card.dart';
import '../../../../../widgets/home/custom_bottom_nav_bar.dart';

class ReferralTrackerScreen extends ConsumerStatefulWidget {
  const ReferralTrackerScreen({super.key});

  @override
  ConsumerState<ReferralTrackerScreen> createState() => _ReferralTrackerScreenState();
}

class _ReferralTrackerScreenState extends ConsumerState<ReferralTrackerScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    final initialTab = ref.read(referralTabProvider);
    _tabController = TabController(length: 2, vsync: this, initialIndex: initialTab);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        ref.read(referralTabProvider.notifier).state = _tabController.index;
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref.read(referralsProvider.notifier).fetchReferrals();
  }

  @override
  Widget build(BuildContext context) {
    final activeTab = ref.watch(referralTabProvider);
    final stats = ref.watch(referralStatsProvider);
    final selectedFilter = ref.watch(referralStatusFilterProvider);
    final filteredAsync = ref.watch(filteredReferralsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF2B1B12)),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'रेफरल ट्रॅकर',
          style: GoogleFonts.mukta(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF8B1E1E),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFEADBCE), width: 1)),
            ),
            child: TabBar(
              controller: _tabController,
              labelColor: const Color(0xFF8B1E1E),
              unselectedLabelColor: const Color(0xFF7A6A5D),
              indicatorColor: const Color(0xFF8B1E1E),
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              unselectedLabelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
              tabs: const [
                Tab(text: 'दिलेले संदर्भ'),
                Tab(text: 'मिळालेले संदर्भ'),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/business/referrals/new'),
        backgroundColor: const Color(0xFF8B1E1E),
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, size: 22),
        label: const Text(
          'नवीन संदर्भ द्या',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: const Color(0xFF8B1E1E),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          slivers: [
            // 1. Stats Row Card
            SliverToBoxAdapter(
              child: ReferralStatsCard(stats: stats),
            ),

            // 2. Status Filter Chips
            SliverToBoxAdapter(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    _buildFilterChip(
                      label: 'सर्व',
                      isSelected: selectedFilter == null,
                      onTap: () =>
                          ref.read(referralStatusFilterProvider.notifier).state = null,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'नवीन',
                      isSelected: selectedFilter == ReferralStatusClass.newStatus,
                      onTap: () => ref
                          .read(referralStatusFilterProvider.notifier)
                          .state = ReferralStatusClass.newStatus,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'संपर्क साधला',
                      isSelected: selectedFilter == ReferralStatusClass.contacted,
                      onTap: () => ref
                          .read(referralStatusFilterProvider.notifier)
                          .state = ReferralStatusClass.contacted,
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      label: 'यशस्वी क्लोज',
                      isSelected: selectedFilter == ReferralStatusClass.closed,
                      onTap: () => ref
                          .read(referralStatusFilterProvider.notifier)
                          .state = ReferralStatusClass.closed,
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // 3. Referral List / Empty / Error / Loading States
            filteredAsync.when(
              loading: () => SliverToBoxAdapter(
                child: _buildLoadingSkeleton(),
              ),
              error: (err, _) => SliverToBoxAdapter(
                child: _buildErrorState(err.toString()),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return SliverToBoxAdapter(
                    child: _buildEmptyState(activeTab == 0),
                  );
                }

                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final referral = items[index];
                      return ReferralItemCard(
                        referral: referral,
                        isGivenTab: activeTab == 0,
                        onTap: () {
                          context.push(
                            '/business/referrals/${referral.id}',
                            extra: referral,
                          );
                        },
                      );
                    },
                    childCount: items.length,
                  ),
                );
              },
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
      bottomNavigationBar: const CustomBottomNavBar(currentIndex: 2),
    );
  }

  Widget _buildFilterChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF8B1E1E) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF8B1E1E) : const Color(0xFFEADBCE),
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF8B1E1E).withValues(alpha: 0.2),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF5D4037),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isGivenTab) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: const BoxDecoration(
              color: Color(0xFFFFF0E6),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isGivenTab ? Icons.arrow_outward_rounded : Icons.south_west_rounded,
              color: const Color(0xFFE65100),
              size: 36,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isGivenTab ? 'अद्याप कोणतेही संदर्भ दिले नाहीत' : 'कोणतेही संदर्भ मिळालेले नाहीत',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2B1B12),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            isGivenTab
                ? 'खालील बटणावर क्लिक करून आपल्या मराठा बांधवांना नवीन व्यवसाय संधी व ग्राहक रेफर करा.'
                : 'आपल्याला कोणी नवीन लीड किंवा संदर्भ पाठवल्यास तो येथे दिसेल.',
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF7A6A5D),
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
          if (isGivenTab) ...[
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: () => context.push('/business/referrals/new'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B1E1E),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text('संदर्भ तयार करा', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      alignment: Alignment.center,
      child: Column(
        children: [
          const Icon(Icons.error_outline_rounded, color: Color(0xFFC62828), size: 48),
          const SizedBox(height: 12),
          const Text(
            'संदर्भ लोड करताना अडचण आली',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2B1B12),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            message,
            style: const TextStyle(fontSize: 12, color: Color(0xFF7A6A5D)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: _refresh,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('पुन्हा प्रयत्न करा'),
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFF8B1E1E),
              side: const BorderSide(color: Color(0xFF8B1E1E)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: List.generate(3, (index) => _buildSkeletonCard()),
      ),
    );
  }

  Widget _buildSkeletonCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E4D7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(width: 80, height: 20, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(6))),
              Container(width: 70, height: 20, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12))),
            ],
          ),
          const SizedBox(height: 12),
          Container(width: double.infinity, height: 16, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 8),
          Container(width: 140, height: 12, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(width: 100, height: 14, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4))),
              Container(width: 70, height: 14, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4))),
            ],
          ),
        ],
      ),
    );
  }
}
