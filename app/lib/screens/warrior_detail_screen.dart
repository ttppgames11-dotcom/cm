import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/favorites/favorites_store.dart';
import '../core/share/copy_share.dart';
import '../core/theme/home_theme.dart';
import '../data/warriors_data.dart';

const Color _saffron = Color(0xFFD35411);
const Color _saffronLight = Color(0xFFFFF7ED);

/// Dynamic Universal Warrior Detail Screen for all Maratha Warriors.
/// Supports shivaji, sambhaji, tarabai, bajirao, tanaji, hambirrao.
class WarriorDetailScreen extends StatefulWidget {
  final String warriorId;

  const WarriorDetailScreen({super.key, this.warriorId = 'shivaji'});

  @override
  State<WarriorDetailScreen> createState() => _WarriorDetailScreenState();
}

class _WarriorDetailScreenState extends State<WarriorDetailScreen> {
  int _selectedTabIndex = 0;
  late WarriorDetailModel _warrior;

  // The heart reflects the saved favourites (kept on the phone).
  final FavoritesStore _favorites = FavoritesStore.instance;
  bool get _isFavorite => _favorites.isWarrior(widget.warriorId);

  void _onFavoritesChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _favorites.removeListener(_onFavoritesChanged);
    super.dispose();
  }

  final List<Map<String, dynamic>> _tabs = const [
    {'title': 'आढावा', 'icon': Icons.menu_book_rounded},
    {'title': 'प्रमुख लढाया', 'icon': Icons.shield_rounded},
    {'title': 'जीवनप्रवास', 'icon': Icons.timeline_rounded},
    {'title': 'प्रेरणादायी प्रसंग', 'icon': Icons.auto_stories_rounded},
  ];

  @override
  void initState() {
    super.initState();
    _warrior = WarriorsData.getWarriorById(widget.warriorId);
    _favorites.addListener(_onFavoritesChanged);
    _favorites.load();
  }

  @override
  void didUpdateWidget(covariant WarriorDetailScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.warriorId != widget.warriorId) {
      setState(() {
        _warrior = WarriorsData.getWarriorById(widget.warriorId);
        _selectedTabIndex = 0;
      });
    }
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

  void _showBattleDetailBottomSheet(WarriorBattleModel battle) {
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
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _saffron.withAlpha(25),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.shield_rounded,
                      color: _saffron,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          battle.name,
                          style: HomeTheme.marathiHeading(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: HomeTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: _saffron,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                battle.year,
                                style: HomeTheme.marathiBody(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                battle.location,
                                style: HomeTheme.marathiBody(
                                  fontSize: 12,
                                  color: HomeTheme.textMuted,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              _buildBattleDetailRow(
                icon: Icons.person_outline_rounded,
                title: 'शत्रू सेनापती / सत्ता',
                value: battle.opponent,
              ),
              const SizedBox(height: 12),
              _buildBattleDetailRow(
                icon: Icons.psychology_outlined,
                title: 'मराठा रणनीती व डावपेच',
                value: battle.strategy,
              ),
              const SizedBox(height: 12),
              _buildBattleDetailRow(
                icon: Icons.emoji_events_outlined,
                title: 'युद्धाचा ऐतिहासिक परिणाम',
                value: battle.outcome,
                highlight: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _saffron,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'बंद करा',
                    style: HomeTheme.marathiHeading(
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

  Widget _buildBattleDetailRow({
    required IconData icon,
    required String title,
    required String value,
    bool highlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: highlight ? _saffronLight : const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: highlight ? _saffron.withAlpha(60) : const Color(0xFFEEEEEE),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 18,
            color: highlight ? _saffron : HomeTheme.textMuted,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: HomeTheme.marathiHeading(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: highlight ? _saffron : HomeTheme.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: HomeTheme.marathiBody(
                    fontSize: 13,
                    color: HomeTheme.textDark,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDFBF7),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeaderInfoCard(),
                  const SizedBox(height: 16),
                  _buildQuoteCard(),
                  const SizedBox(height: 16),
                  _buildSpecsCard(),
                  const SizedBox(height: 20),
                  _buildTabsSelector(),
                  const SizedBox(height: 16),
                  _buildActiveTabContent(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 340,
      pinned: true,
      backgroundColor: const Color(0xFF1F2937),
      leading: Padding(
        padding: const EdgeInsets.all(8),
        child: CircleAvatar(
          backgroundColor: Colors.black.withAlpha(120),
          child: IconButton(
            icon: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: Colors.white,
              size: 18,
            ),
            onPressed: () {
              if (context.canPop()) {
                context.pop();
              } else {
                context.go('/heritage');
              }
            },
          ),
        ),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: CircleAvatar(
            backgroundColor: Colors.black.withAlpha(120),
            child: IconButton(
              icon: Icon(
                _isFavorite
                    ? Icons.favorite_rounded
                    : Icons.favorite_border_rounded,
                color: _isFavorite ? Colors.redAccent : Colors.white,
                size: 20,
              ),
              onPressed: () async {
                final added = await _favorites.toggleWarrior(widget.warriorId);
                _showMessage(
                  added
                      ? '${_warrior.name} आवडीमध्ये जोडले'
                      : '${_warrior.name} आवडीमधून काढले',
                );
              },
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: CircleAvatar(
            backgroundColor: Colors.black.withAlpha(120),
            child: IconButton(
              icon: const Icon(
                Icons.share_rounded,
                color: Colors.white,
                size: 18,
              ),
              onPressed: () async {
                final shared = await shareText(
                  withAppLink(
                    '⚔️ ${_warrior.name}\n${_warrior.fullTitle} (${_warrior.era})',
                  ),
                  subject: _warrior.name,
                );
                if (!shared) _showMessage(copiedForSharingMessage);
              },
            ),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2C1810), Color(0xFF1A1A1A)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            Center(
              child: Hero(
                tag: 'warrior_${_warrior.id}',
                child: Container(
                  width: 240,
                  height: 270,
                  margin: const EdgeInsets.only(top: 30),
                  child: Image.asset(
                    _warrior.imagePath,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.person_rounded,
                        size: 90,
                        color: Colors.white54,
                      );
                    },
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      Colors.black.withAlpha(180),
                      const Color(0xFFFDFBF7),
                    ],
                    stops: const [0.0, 0.6, 1.0],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderInfoCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF2EAE0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _saffron.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _warrior.roleTag,
                    style: HomeTheme.marathiBody(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _saffron,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _warrior.era,
                  style: HomeTheme.marathiBody(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: HomeTheme.textMuted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _warrior.name,
            style: HomeTheme.marathiHeading(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: HomeTheme.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _warrior.fullTitle,
            style: HomeTheme.marathiBody(
              fontSize: 13,
              color: HomeTheme.textMuted,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuoteCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF7ED), Color(0xFFFFFBF5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _saffron.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.format_quote_rounded, color: _saffron, size: 28),
          const SizedBox(height: 6),
          Text(
            _warrior.quote,
            style: HomeTheme.marathiHeading(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF8C2D00),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              _warrior.quoteAttribution,
              style: HomeTheme.marathiBody(
                fontSize: 12,
                color: HomeTheme.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecsCard() {
    final entries = _warrior.specs.entries.toList();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF2EAE0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.fact_check_outlined, color: _saffron, size: 20),
              const SizedBox(width: 8),
              Text(
                'महत्वाचे ऐतिहासिक तपशील',
                style: HomeTheme.marathiHeading(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: HomeTheme.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF2EAE0)),
          const SizedBox(height: 12),
          ...entries.map((entry) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 110,
                    child: Text(
                      entry.key,
                      style: HomeTheme.marathiBody(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: HomeTheme.textMuted,
                      ),
                    ),
                  ),
                  const Text(' :  '),
                  Expanded(
                    child: Text(
                      entry.value,
                      style: HomeTheme.marathiBody(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: HomeTheme.textDark,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTabsSelector() {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          final tab = _tabs[index];
          return GestureDetector(
            onTap: () => setState(() => _selectedTabIndex = index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? _saffron : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? _saffron : const Color(0xFFE5E7EB),
                ),
                boxShadow:
                    isSelected
                        ? [
                          BoxShadow(
                            color: _saffron.withAlpha(60),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ]
                        : null,
              ),
              child: Row(
                children: [
                  Icon(
                    tab['icon'] as IconData,
                    size: 16,
                    color: isSelected ? Colors.white : HomeTheme.textMuted,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    tab['title'] as String,
                    style: HomeTheme.marathiHeading(
                      fontSize: 12,
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.w600,
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

  Widget _buildActiveTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return _buildOverviewTab();
      case 1:
        return _buildBattlesTab();
      case 2:
        return _buildTimelineTab();
      case 3:
        return _buildLegendsTab();
      default:
        return _buildOverviewTab();
    }
  }

  Widget _buildOverviewTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFF2EAE0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.auto_stories_outlined,
                    color: _saffron,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'सविस्तर जीवनगाथा व योगदान',
                    style: HomeTheme.marathiHeading(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: HomeTheme.textDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                _warrior.biography,
                style: HomeTheme.marathiBody(
                  fontSize: 14,
                  height: 1.6,
                  color: HomeTheme.textDark,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBattlesTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.military_tech_rounded, color: _saffron, size: 20),
            const SizedBox(width: 8),
            Text(
              'ऐतिहासिक लढाया व मोहिमा',
              style: HomeTheme.marathiHeading(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: HomeTheme.textDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._warrior.battles.map((battle) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF2EAE0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: _saffron,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        battle.year,
                        style: HomeTheme.marathiBody(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        battle.name,
                        style: HomeTheme.marathiHeading(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: HomeTheme.textDark,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 14,
                      color: HomeTheme.textMuted,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        battle.location,
                        style: HomeTheme.marathiBody(
                          fontSize: 12,
                          color: HomeTheme.textMuted,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(
                      Icons.sports_kabaddi_rounded,
                      size: 14,
                      color: HomeTheme.textMuted,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        'शत्रू : ${battle.opponent}',
                        style: HomeTheme.marathiBody(
                          fontSize: 12,
                          color: const Color(0xFFB45309),
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => _showBattleDetailBottomSheet(battle),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _saffron,
                      side: BorderSide(color: _saffron.withAlpha(120)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    child: Text(
                      'सविस्तर रणनीती व परिणाम पहा',
                      style: HomeTheme.marathiBody(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _saffron,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildTimelineTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.access_time_rounded, color: _saffron, size: 20),
            const SizedBox(width: 8),
            Text(
              'जीवनक्रम व महत्वाचे टप्पे',
              style: HomeTheme.marathiHeading(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: HomeTheme.textDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        ..._warrior.timeline.map((item) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFF2EAE0)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _saffron.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _saffron.withAlpha(80)),
                  ),
                  child: Text(
                    item.year,
                    style: HomeTheme.marathiBody(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _saffron,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: HomeTheme.marathiHeading(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: HomeTheme.textDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.description,
                        style: HomeTheme.marathiBody(
                          fontSize: 13,
                          height: 1.4,
                          color: HomeTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildLegendsTab() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF2EAE0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.military_tech_outlined,
                color: Color(0xFFD97706),
                size: 22,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _warrior.legend.title,
                  style: HomeTheme.marathiHeading(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: HomeTheme.textDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF2EAE0)),
          const SizedBox(height: 12),
          Text(
            _warrior.legend.narrative,
            style: HomeTheme.marathiBody(
              fontSize: 14,
              height: 1.6,
              color: HomeTheme.textDark,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.lightbulb_outline_rounded,
                  color: Color(0xFFD97706),
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'प्रेरणादायी संदेश',
                        style: HomeTheme.marathiHeading(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF92400E),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _warrior.legend.takeaway,
                        style: HomeTheme.marathiBody(
                          fontSize: 13,
                          height: 1.4,
                          color: const Color(0xFF78350F),
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
}
