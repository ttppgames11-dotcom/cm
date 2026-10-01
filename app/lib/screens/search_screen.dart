import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/home_theme.dart';
import '../data/forts_data.dart';
import '../data/warriors_data.dart';
import '../features/business/data/builders_data.dart';
import '../features/business/data/manufacturers_data.dart';
import '../features/business/models/directory_models.dart';
import '../core/config/api_config.dart';
import '../features/community/data/community_data.dart';
import '../features/community/models/community_models.dart';
import '../widgets/home/home_models.dart';

enum SearchCategory {
  all('सर्व', 'All', Icons.auto_awesome_rounded),
  forts('किल्ले', 'Forts', Icons.castle_rounded),
  warriors('वीर योद्धे', 'Warriors', Icons.shield_rounded),
  business('व्यवसाय', 'Business', Icons.storefront_rounded),
  community('समुदाय', 'Community', Icons.groups_rounded),
  events('कार्यक्रम', 'Events', Icons.event_rounded);

  final String labelMr;
  final String labelEn;
  final IconData icon;
  const SearchCategory(this.labelMr, this.labelEn, this.icon);
}

class SearchResultItem {
  final String title;
  final String subtitle;
  final String categoryTag;
  final SearchCategory type;
  final String? imageAsset;
  final IconData icon;
  final String? extraBadge;
  final VoidCallback onTap;

  const SearchResultItem({
    required this.title,
    required this.subtitle,
    required this.categoryTag,
    required this.type,
    this.imageAsset,
    required this.icon,
    this.extraBadge,
    required this.onTap,
  });
}

class SearchScreen extends StatefulWidget {
  final String initialQuery;
  final SearchCategory initialCategory;

  const SearchScreen({
    super.key,
    this.initialQuery = '',
    this.initialCategory = SearchCategory.all,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;
  late SearchCategory _selectedCategory;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery;
    _selectedCategory = widget.initialCategory;
    _controller = TextEditingController(text: widget.initialQuery);
    _focusNode = FocusNode();

    // Auto-focus keyboard on opening
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _focusNode.requestFocus();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  List<SearchResultItem> _getAllItems() {
    final List<SearchResultItem> items = [];

    // 1. Forts
    for (final fort in Fort.defaultForts) {
      items.add(
        SearchResultItem(
          title: fort.name,
          subtitle: '${fort.district} • ${fort.subtitle}',
          categoryTag: 'किल्ला / Fort',
          type: SearchCategory.forts,
          imageAsset: fort.imagePath,
          icon: Icons.castle_rounded,
          extraBadge: fort.district,
          onTap: () => context.push('/fort/${fort.id}'),
        ),
      );
    }

    // Additional detailed catalog forts if not in defaultForts
    for (final entry in FortsData.catalog.entries) {
      if (!Fort.defaultForts.any((f) => f.id == entry.key)) {
        items.add(
          SearchResultItem(
            title: entry.value.name,
            subtitle: '${entry.value.district} • ${entry.value.altitude}',
            categoryTag: 'किल्ला / Fort',
            type: SearchCategory.forts,
            imageAsset:
                entry.value.carouselImages.isNotEmpty
                    ? entry.value.carouselImages.first
                    : null,
            icon: Icons.castle_rounded,
            extraBadge: entry.value.categoryTags,
            onTap: () => context.push('/fort/${entry.key}'),
          ),
        );
      }
    }

    // 2. Warriors
    for (final warrior in Warrior.defaultWarriors) {
      items.add(
        SearchResultItem(
          title: warrior.name,
          subtitle: '${warrior.roleTag} • ${warrior.era}',
          categoryTag: 'वीर योद्धा / Warrior',
          type: SearchCategory.warriors,
          imageAsset: warrior.imagePath,
          icon: Icons.shield_rounded,
          extraBadge: warrior.roleTag,
          onTap: () => context.push('/warrior/${warrior.id}'),
        ),
      );
    }

    // Additional detailed warriors catalog
    for (final entry in WarriorsData.catalog.entries) {
      if (!Warrior.defaultWarriors.any((w) => w.id == entry.key)) {
        items.add(
          SearchResultItem(
            title: entry.value.name,
            subtitle: '${entry.value.fullTitle} • ${entry.value.era}',
            categoryTag: 'वीर योद्धा / Warrior',
            type: SearchCategory.warriors,
            imageAsset: entry.value.imagePath,
            icon: Icons.shield_rounded,
            extraBadge: entry.value.roleTag,
            onTap: () => context.push('/warrior/${entry.key}'),
          ),
        );
      }
    }

    // 3. Businesses (Builders & Manufacturers) — sample listings exist only in
    // the offline demo build, like the sample members below.
    for (final b
        in ApiConfig.demoMode
            ? buildersDirectoryConfig.entries
            : const <DirectoryEntry>[]) {
      items.add(
        SearchResultItem(
          title: b.name,
          subtitle: '${b.tagline} • ${b.city}',
          categoryTag: 'बिल्डर्स / Real Estate',
          type: SearchCategory.business,
          icon: Icons.apartment_rounded,
          extraBadge: b.category,
          onTap: () => context.push('/business/builders'),
        ),
      );
    }

    for (final m
        in ApiConfig.demoMode
            ? manufacturersDirectoryConfig.entries
            : const <DirectoryEntry>[]) {
      items.add(
        SearchResultItem(
          title: m.name,
          subtitle: '${m.tagline} • ${m.city}',
          categoryTag: 'उत्पादन / Manufacturing',
          type: SearchCategory.business,
          icon: Icons.precision_manufacturing_rounded,
          extraBadge: m.category,
          onTap: () => context.push('/business/manufacturers'),
        ),
      );
    }

    // 4. Community Members — sample people exist only in the offline demo
    // build; real members must never be mixed with invented ones.
    for (final member
        in ApiConfig.demoMode
            ? CommunityData.members
            : const <CommunityMember>[]) {
      items.add(
        SearchResultItem(
          title: member.name,
          subtitle: '${member.roleOrTitle} • ${member.location}',
          categoryTag: 'सदस्य / Community',
          type: SearchCategory.community,
          imageAsset: member.avatarAsset,
          icon: Icons.person_rounded,
          extraBadge: member.tier,
          onTap: () => context.push('/community'),
        ),
      );
    }

    // Community Groups
    for (final group
        in ApiConfig.demoMode
            ? CommunityData.locationGroups
            : const <CommunityGroup>[]) {
      items.add(
        SearchResultItem(
          title: group.name,
          subtitle: group.description,
          categoryTag: 'समाज गट / City Group',
          type: SearchCategory.community,
          icon: Icons.location_city_rounded,
          // Sample member counts are shown only in the demo build.
          extraBadge: ApiConfig.demoMode ? group.membersCountText : null,
          onTap: () => context.push('/community'),
        ),
      );
    }

    // 5. Events — no real events are published yet; the sample one is for the
    // demo build only.
    final defaultEvent = UpcomingEventData.defaultEvent;
    if (ApiConfig.demoMode) {
      items.add(
        SearchResultItem(
          title: defaultEvent.titleMr,
          subtitle: '${defaultEvent.location} • ${defaultEvent.time}',
          categoryTag: 'कार्यक्रम / Event',
          type: SearchCategory.events,
          icon: Icons.event_available_rounded,
          extraBadge: '${defaultEvent.dateDay} ${defaultEvent.dateMonth}',
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                behavior: SnackBarBehavior.floating,
                backgroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFFF2EAE0)),
                ),
                content: Text(
                  'कार्यक्रम: ${defaultEvent.titleMr}',
                  style: HomeTheme.marathiBody(
                    fontSize: 13,
                    color: HomeTheme.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            );
          },
        ),
      );
    }

    return items;
  }

  List<SearchResultItem> _filterItems(List<SearchResultItem> allItems) {
    final cleanQuery = _query.trim().toLowerCase();

    return allItems.where((item) {
      // Category filter
      if (_selectedCategory != SearchCategory.all &&
          item.type != _selectedCategory) {
        return false;
      }

      // Query filter
      if (cleanQuery.isEmpty) return true;

      final matchTitle = item.title.toLowerCase().contains(cleanQuery);
      final matchSubtitle = item.subtitle.toLowerCase().contains(cleanQuery);
      final matchCategory = item.categoryTag.toLowerCase().contains(cleanQuery);
      final matchBadge =
          item.extraBadge?.toLowerCase().contains(cleanQuery) ?? false;

      return matchTitle || matchSubtitle || matchCategory || matchBadge;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final allItems = _getAllItems();
    final filteredResults = _filterItems(allItems);

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: Column(
          children: [
            // Top Search Bar Row
            _buildSearchHeader(context),

            // Category Filter Pills
            _buildCategorySelector(),

            const SizedBox(height: 4),

            // Results count & indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
              child: Row(
                children: [
                  Text(
                    _query.isEmpty
                        ? 'लोकप्रिय शोध आणि शिफारसी (${filteredResults.length})'
                        : 'शोध निकाल: "$_query" (${filteredResults.length})',
                    style: HomeTheme.marathiBody(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: HomeTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),

            // Results List / Empty State
            Expanded(
              child:
                  filteredResults.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                        itemCount: filteredResults.length,
                        itemBuilder: (context, index) {
                          return _buildResultCard(filteredResults[index]);
                        },
                      ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 8),
      decoration: const BoxDecoration(color: HomeTheme.bgWarmCream),
      child: Row(
        children: [
          // Back Button
          IconButton(
            icon: const Icon(
              Icons.arrow_back_rounded,
              color: HomeTheme.textDark,
            ),
            tooltip: 'मागे जा / Back',
            onPressed: () {
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                context.go('/home');
              }
            },
          ),

          // Search Field Box
          Expanded(
            child: Container(
              height: 46,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color:
                      _query.isNotEmpty
                          ? HomeTheme.primaryOrange
                          : const Color(0xFFE8DFD5),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2B1B12).withValues(alpha: 0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                children: [
                  const Icon(
                    Icons.search_rounded,
                    color: HomeTheme.primaryOrange,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      style: HomeTheme.marathiBody(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                        color: HomeTheme.textDark,
                      ),
                      textInputAction: TextInputAction.search,
                      decoration: InputDecoration(
                        hintText: 'किल्ले, वीर, व्यवसाय, समुदाय शोधा...',
                        hintStyle: HomeTheme.marathiBody(
                          fontSize: 13,
                          color: HomeTheme.textMuted.withValues(alpha: 0.75),
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (val) {
                        setState(() {
                          _query = val;
                        });
                      },
                    ),
                  ),
                  if (_query.isNotEmpty)
                    GestureDetector(
                      onTap: () {
                        _controller.clear();
                        setState(() {
                          _query = '';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFFEFE9E2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close_rounded,
                          size: 14,
                          color: HomeTheme.textDark,
                        ),
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

  Widget _buildCategorySelector() {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: SearchCategory.values.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final cat = SearchCategory.values[index];
          final isSelected = _selectedCategory == cat;

          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategory = cat;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: isSelected ? HomeTheme.primaryOrange : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color:
                      isSelected
                          ? HomeTheme.primaryOrange
                          : const Color(0xFFEFE6DC),
                  width: 1.1,
                ),
                boxShadow:
                    isSelected
                        ? [
                          BoxShadow(
                            color: HomeTheme.primaryOrange.withValues(
                              alpha: 0.28,
                            ),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                        : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    cat.icon,
                    size: 15,
                    color: isSelected ? Colors.white : HomeTheme.textMuted,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    cat.labelMr,
                    style: HomeTheme.marathiBody(
                      fontSize: 12.5,
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? Colors.white : HomeTheme.textDark,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildResultCard(SearchResultItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF2ECE4), width: 1.1),
        boxShadow: HomeTheme.subtleShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: item.onTap,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Thumbnail / Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF2EB),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child:
                        item.imageAsset != null
                            ? Image.asset(
                              item.imageAsset!,
                              fit: BoxFit.cover,
                              errorBuilder:
                                  (_, __, ___) => Icon(
                                    item.icon,
                                    color: HomeTheme.primaryOrange,
                                    size: 24,
                                  ),
                            )
                            : Icon(
                              item.icon,
                              color: HomeTheme.primaryOrange,
                              size: 24,
                            ),
                  ),
                ),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 1.5,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDF0E6),
                              borderRadius: BorderRadius.circular(5),
                            ),
                            child: Text(
                              item.categoryTag,
                              style: HomeTheme.marathiBody(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: HomeTheme.primaryOrange,
                              ),
                            ),
                          ),
                          if (item.extraBadge != null) ...[
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                item.extraBadge!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: HomeTheme.marathiBody(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: HomeTheme.textMuted,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiHeading(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: HomeTheme.textDark,
                        ),
                      ),
                      Text(
                        item.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: HomeTheme.marathiBody(
                          fontSize: 12,
                          color: HomeTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: Color(0xFFC4B8AB),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: Color(0xFFFFF2EB),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 36,
                color: HomeTheme.primaryOrange,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'काहीही आढळले नाही',
              style: HomeTheme.marathiHeading(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: HomeTheme.textDark,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '"$_query" साठी कोणताही निकाल सापडला नाही. कृपया वेगळा शब्द वापरून पहा.',
              textAlign: TextAlign.center,
              style: HomeTheme.marathiBody(
                fontSize: 13,
                color: HomeTheme.textMuted,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children:
                  ['राजगड', 'शिवनेरी', 'तानाजी', 'पुणे', 'बांधकाम']
                      .map(
                        (tag) => ActionChip(
                          backgroundColor: Colors.white,
                          label: Text(
                            tag,
                            style: HomeTheme.marathiBody(fontSize: 12),
                          ),
                          onPressed: () {
                            _controller.text = tag;
                            setState(() {
                              _query = tag;
                            });
                          },
                        ),
                      )
                      .toList(),
            ),
          ],
        ),
      ),
    );
  }
}
