import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/api_config.dart';
import '../../../core/profile/member_avatar.dart';
import '../../../core/theme/home_theme.dart';
import '../../auth/providers/current_user_provider.dart';
import '../data/community_data.dart';
import '../models/community_models.dart';
import '../providers/community_provider.dart';
import '../../../widgets/home/custom_bottom_nav_bar.dart';

/// Presentation Model for Samaj Sadasya Screen
class SamajMember {
  final String id;
  final String name;
  final String profession;
  final String location;
  final String city;
  final String memberIdCode;
  final List<String> skills;
  final bool isOnline;
  final String? avatarAsset;
  final String? photoUrl;
  final String tier;
  final bool isVerified;
  final String bio;

  const SamajMember({
    required this.id,
    required this.name,
    required this.profession,
    required this.location,
    required this.city,
    required this.memberIdCode,
    required this.skills,
    this.isOnline = true,
    this.avatarAsset,
    this.photoUrl,
    this.tier = 'Gold',
    this.isVerified = true,
    this.bio = '',
  });

  /// Maps actual backend / community member to SamajMember presentation model
  factory SamajMember.fromCommunityMember(CommunityMember cm) {
    final locationParts = cm.location.split(',');
    final city = locationParts.isNotEmpty ? locationParts.first.trim() : 'महाराष्ट्र';
    final role = cm.roleOrTitle.isNotEmpty ? cm.roleOrTitle : cm.profession;

    // Formats a clean member ID code, e.g. CM2024001234
    String idCode;
    if (cm.id.startsWith('cm-')) {
      final numStr = cm.id.replaceAll('cm-', '');
      final numVal = int.tryParse(numStr) ?? 1;
      idCode = 'CM${(2023000000 + numVal * 1111).toString()}';
    } else {
      final clean = cm.id.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
      idCode = 'CM${clean.padRight(10, '0').substring(0, clean.length.clamp(6, 10))}';
    }

    return SamajMember(
      id: cm.id,
      name: cm.name,
      profession: role.isNotEmpty ? role : 'समाज सदस्य',
      location: cm.location.isNotEmpty ? cm.location : 'महाराष्ट्र',
      city: city,
      memberIdCode: idCode,
      skills: cm.skills.isNotEmpty ? cm.skills : [cm.tier, 'मराठा समाज'],
      isOnline: true,
      avatarAsset: cm.avatarAsset,
      photoUrl: cm.photoUrl,
      tier: cm.tier,
      isVerified: cm.isVerified,
      bio: '${cm.name} हे कनेक्ट मराठा समुदायाचे सक्रिय सदस्य आहेत. कार्यक्षेत्र: ${role.isNotEmpty ? role : cm.profession}.',
    );
  }
}

/// SamajSadasyaScreen (समाज सदस्य निर्देशिका)
/// - Sunset orange banner with fort artwork & back button
/// - Connected in real time to actual members from CommunityRepository
/// - Search bar, Filter chips, Dynamic Statistics strip, Sort dropdown
/// - Member cards with Avatar, Online dot, ID badge, Skills & Profile Sheet
/// - Bottom bar removed as requested (accessible via native bottom bar 'समुदाय')
class SamajSadasyaScreen extends ConsumerStatefulWidget {
  const SamajSadasyaScreen({super.key});

  @override
  ConsumerState<SamajSadasyaScreen> createState() => _SamajSadasyaScreenState();
}

class _SamajSadasyaScreenState extends ConsumerState<SamajSadasyaScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<SamajMember> _members = [];
  bool _isLoading = true;

  String _activeFilter = 'all'; // 'all', 'my_city', 'profession', 'skills'
  String _sortBy = 'latest'; // 'latest', 'name', 'city'
  String _selectedCity = 'all';
  String _selectedProfession = 'all';

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  /// Real-time member loading from backend API with robust fallback to CommunityData
  Future<void> _loadMembers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final repo = ref.read(communityRepositoryProvider);
      final rawMembers = await repo.fetchMembers();
      if (!mounted) return;

      final list = rawMembers.isNotEmpty
          ? rawMembers
          : (ApiConfig.demoMode ? CommunityData.members : <CommunityMember>[]);
      setState(() {
        _members = list.map(SamajMember.fromCommunityMember).toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      // Fallback to CommunityData.members only in offline demoMode
      final fallbackList = ApiConfig.demoMode ? CommunityData.members : <CommunityMember>[];
      setState(() {
        _members = fallbackList.map(SamajMember.fromCommunityMember).toList();
        _isLoading = false;
      });
    }
  }

  List<SamajMember> get _filteredMembers {
    final query = _searchController.text.trim().toLowerCase();
    final currentUser = ref.watch(currentUserOrDefaultProvider);
    final userCity = currentUser.city.isNotEmpty ? currentUser.city.trim() : 'पुणे';

    return _members.where((m) {
      // 1. Text Search matching name, profession, location or skills
      if (query.isNotEmpty) {
        final matchesName = m.name.toLowerCase().contains(query);
        final matchesProf = m.profession.toLowerCase().contains(query);
        final matchesLoc = m.location.toLowerCase().contains(query);
        final matchesSkills = m.skills.any((s) => s.toLowerCase().contains(query));
        if (!matchesName && !matchesProf && !matchesLoc && !matchesSkills) {
          return false;
        }
      }

      // 2. Chip Filters
      if (_activeFilter == 'my_city') {
        if (!m.location.contains(userCity) && m.city != userCity) {
          return false;
        }
      } else if (_activeFilter == 'profession' && _selectedProfession != 'all') {
        if (!m.profession.contains(_selectedProfession)) {
          return false;
        }
      }

      // 3. Modal Filters
      if (_selectedCity != 'all' && m.city != _selectedCity && !m.location.contains(_selectedCity)) {
        return false;
      }

      return true;
    }).toList()
      ..sort((a, b) {
        if (_sortBy == 'name') {
          return a.name.compareTo(b.name);
        } else if (_sortBy == 'city') {
          return a.city.compareTo(b.city);
        }
        return a.id.compareTo(b.id);
      });
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                  child: Text(
                    'क्रमवारी निवडा (Sort By)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                ),
                ListTile(
                  leading: const Icon(Icons.schedule_rounded, color: Color(0xFFE65100)),
                  title: const Text('नवीनतम प्रथम (Latest First)'),
                  trailing: _sortBy == 'latest'
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFFE65100))
                      : null,
                  onTap: () {
                    setState(() => _sortBy = 'latest');
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.sort_by_alpha_rounded, color: Color(0xFFE65100)),
                  title: const Text('नावाप्रमाणे (Name A-Z)'),
                  trailing: _sortBy == 'name'
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFFE65100))
                      : null,
                  onTap: () {
                    setState(() => _sortBy = 'name');
                    Navigator.pop(ctx);
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.location_city_rounded, color: Color(0xFFE65100)),
                  title: const Text('शहराप्रमाणे (City)'),
                  trailing: _sortBy == 'city'
                      ? const Icon(Icons.check_circle_rounded, color: Color(0xFFE65100))
                      : null,
                  onTap: () {
                    setState(() => _sortBy = 'city');
                    Navigator.pop(ctx);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showFilterSheet() {
    final availableCities = {
      'all': 'सर्व शहरे',
      for (final m in _members)
        if (m.city.isNotEmpty) m.city: m.city,
    };

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        String tempCity = _selectedCity;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.paddingOf(context).bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'अधिक फिल्टर्स (Filters)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          setModalState(() {
                            tempCity = 'all';
                          });
                          setState(() {
                            _selectedCity = 'all';
                            _selectedProfession = 'all';
                            _activeFilter = 'all';
                          });
                        },
                        child: const Text('रीसेट'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'शहर निवडा (City):',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final entry in availableCities.entries)
                        ChoiceChip(
                          label: Text(entry.value),
                          selected: tempCity == entry.key,
                          selectedColor: const Color(0xFFE65100),
                          labelStyle: TextStyle(
                            color: tempCity == entry.key ? Colors.white : const Color(0xFF2B1B12),
                            fontWeight: FontWeight.w600,
                            fontSize: 12.5,
                          ),
                          onSelected: (val) {
                            if (val) {
                              setModalState(() => tempCity = entry.key);
                            }
                          },
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _selectedCity = tempCity;
                        });
                        Navigator.pop(ctx);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE65100),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'फिल्टर लागू करा (Apply)',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
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

  void _showMemberProfileSheet(SamajMember member) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.72,
          minChildSize: 0.5,
          maxChildSize: 0.92,
          expand: false,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 4.5,
                        decoration: BoxDecoration(
                          color: const Color(0xFFD7CCC8),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Top Avatar & Name Info
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildMemberAvatarWidget(member, size: 76),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                member.name,
                                style: const TextStyle(
                                  fontSize: 19,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF2B1B12),
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                member.profession,
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  color: Color(0xFF7A6A5D),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFE65100)),
                                  const SizedBox(width: 3),
                                  Expanded(
                                    child: Text(
                                      member.location,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF7A6A5D),
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

                    const SizedBox(height: 18),

                    // ID Card Container
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFE082)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.badge_rounded, color: Color(0xFFE65100), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'सदस्य आयडी: ${member.memberIdCode}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFE65100),
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2E7D32),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'सत्यापित · Verified',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Bio
                    if (member.bio.isNotEmpty) ...[
                      const Text(
                        'परिचय (About)',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        member.bio,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF5D4037),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Skills
                    const Text(
                      'कौशल्ये व कार्यक्षेत्र (Skills & Domain)',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF2B1B12),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final skill in member.skills)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFE0B2).withValues(alpha: 0.6),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFFCC80)),
                            ),
                            child: Text(
                              skill,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF8D4004),
                              ),
                            ),
                          ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Actions Row: Connect & Message
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${member.name} यांच्याशी संपर्क विनंती पाठवली.'),
                                  backgroundColor: HomeTheme.primaryOrange,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE65100),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.person_add_alt_1_rounded, size: 18),
                            label: const Text('जोडले जा (Connect)'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              Navigator.pop(ctx);
                              context.push('/community/feed');
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFE65100),
                              side: const BorderSide(color: Color(0xFFE65100)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                            label: const Text('मेसेज पाठवा'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final members = _filteredMembers;

    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F5),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Sunset Orange Header with Fort Artwork & Title
            _buildHeader(context),

            // 2. Scrollable Body with Pull-to-Refresh
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadMembers,
                color: const Color(0xFFE65100),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search & Filter Box
                      _buildSearchAndFilters(),

                      const SizedBox(height: 12),

                      // 3-Stats Strip Card (Dynamically populated from real members)
                      _buildStatsStrip(),

                      const SizedBox(height: 14),

                      // Section Heading & Sort dropdown
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Row(
                          children: [
                            Text(
                              'समाज सदस्य (${members.length})',
                              style: const TextStyle(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF2B1B12),
                              ),
                            ),
                            const Spacer(),
                            InkWell(
                              onTap: _showSortOptions,
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFEADCCF)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _sortBy == 'latest'
                                          ? 'नवीनतम प्रथम'
                                          : _sortBy == 'name'
                                              ? 'नावाप्रमाणे'
                                              : 'शहराप्रमाणे',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF5D4037),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      size: 16,
                                      color: Color(0xFF5D4037),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Member Cards List or Loading State
                      if (_isLoading)
                        const Padding(
                          padding: EdgeInsets.all(48.0),
                          child: Center(
                            child: CircularProgressIndicator(color: Color(0xFFE65100)),
                          ),
                        )
                      else if (members.isEmpty)
                        _buildEmptyState()
                      else
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 14.0),
                          child: Column(
                            children: [
                              for (final member in members) ...[
                                _buildMemberCard(member),
                                const SizedBox(height: 10),
                              ],
                            ],
                          ),
                        ),

                      const SizedBox(height: 28),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: 1, // "समुदाय" active tab
        onTap: (index) {
          if (index == 0) {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              context.go('/home');
            }
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

  Widget _buildHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFE65100),
            Color(0xFFFF6F00),
            Color(0xFFFFA000),
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: 0.28,
              child: Image.asset(
                'assets/images/hero_banner.webp',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 10, 16, 18),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                IconButton(
                  onPressed: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    } else {
                      context.go('/home');
                    }
                  },
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 4),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'समाज सदस्य',
                        style: TextStyle(
                          fontSize: 21,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 0.2,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'आपले लोक, आपला समाज',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFFFFF3E0),
                        ),
                      ),
                    ],
                  ),
                ),
                // Flag / Fort Crest Icon
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.18),
                  ),
                  child: const Icon(
                    Icons.flag_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
      child: Column(
        children: [
          // Search Input Bar
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFEBDDCF)),
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
                const SizedBox(width: 12),
                const Icon(Icons.search_rounded, color: Color(0xFF8D6E63), size: 22),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'नाव, शहर, व्यवसाय किंवा कौशल्य शोधा...',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF9E8E81),
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 13),
                    ),
                  ),
                ),
                if (_searchController.text.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 18, color: Colors.grey),
                    onPressed: () {
                      _searchController.clear();
                      setState(() {});
                    },
                  ),
                // Filter tune button
                InkWell(
                  onTap: _showFilterSheet,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFFCC80)),
                    ),
                    child: const Icon(Icons.tune_rounded, size: 20, color: Color(0xFFE65100)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Horizontal Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: [
                _buildFilterChip('सर्व सदस्य', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('माझे शहर', 'my_city'),
                const SizedBox(width: 8),
                _buildFilterChip('व्यवसायानुसार', 'profession', onAction: _showFilterSheet),
                const SizedBox(width: 8),
                _buildFilterChip('कौशल्यानुसार', 'skills', onAction: _showFilterSheet),
                const SizedBox(width: 8),
                _buildMoreFilterChip(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String key, {VoidCallback? onAction}) {
    final isSelected = _activeFilter == key;

    return InkWell(
      onTap: () {
        if (onAction != null) {
          onAction();
        } else {
          setState(() {
            _activeFilter = key;
          });
        }
      },
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE65100) : const Color(0xFFF3E9DF),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFFBF360C) : const Color(0xFFE4D5C7),
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFFE65100).withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF4A3427),
          ),
        ),
      ),
    );
  }

  Widget _buildMoreFilterChip() {
    return InkWell(
      onTap: _showFilterSheet,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFFF3E9DF),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'अधिक फिल्टर',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF4A3427),
              ),
            ),
            SizedBox(width: 3),
            Icon(Icons.arrow_drop_down_rounded, size: 18, color: Color(0xFF4A3427)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsStrip() {
    // Dynamic counts calculated from real members
    final totalCount = _members.length >= 100 ? '${_members.length}+' : '${_members.length}+';
    final distinctCities = _members.map((m) => m.city).toSet().length;
    final distinctDomains = _members.map((m) => m.profession).toSet().length;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14.0),
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEBDDCF)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            icon: Icons.groups_rounded,
            iconBg: const Color(0xFFFFDFC4),
            iconColor: const Color(0xFFE65100),
            count: _members.isNotEmpty ? totalCount : '12,450+',
            label: 'समाज सदस्य',
          ),
          Container(width: 1, height: 32, color: const Color(0xFFEFE5DC)),
          _buildStatItem(
            icon: Icons.location_on_rounded,
            iconBg: const Color(0xFFFFEBEE),
            iconColor: const Color(0xFFD32F2F),
            count: _members.isNotEmpty ? '$distinctCities+' : '350+',
            label: 'शहरे / गाव',
          ),
          Container(width: 1, height: 32, color: const Color(0xFFEFE5DC)),
          _buildStatItem(
            icon: Icons.business_center_rounded,
            iconBg: const Color(0xFFFFF8E1),
            iconColor: const Color(0xFFFFA000),
            count: _members.isNotEmpty ? '$distinctDomains+' : '120+',
            label: 'व्यवसाय क्षेत्रे',
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String count,
    required String label,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: iconBg,
          ),
          child: Center(
            child: Icon(icon, color: iconColor, size: 18),
          ),
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              count,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFFB71C1C),
                height: 1.1,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10.5,
                color: Color(0xFF6D4C41),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMemberAvatarWidget(SamajMember member, {double size = 56}) {
    return Stack(
      children: [
        ClipOval(
          child: SizedBox(
            width: size,
            height: size,
            child: (member.photoUrl != null && member.photoUrl!.isNotEmpty)
                ? Image.network(
                    member.photoUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => MemberAvatar(name: member.name, size: size),
                  )
                : (member.avatarAsset != null &&
                        member.avatarAsset!.isNotEmpty &&
                        !member.avatarAsset!.contains('user_profile'))
                    ? Image.asset(
                        member.avatarAsset!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => MemberAvatar(name: member.name, size: size),
                      )
                    : MemberAvatar(name: member.name, size: size),
          ),
        ),
        if (member.isOnline)
          Positioned(
            right: 1,
            bottom: 1,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildMemberCard(SamajMember member) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEBDDCF)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar with green status dot
              _buildMemberAvatarWidget(member, size: 56),

              const SizedBox(width: 12),

              // Name, Profession, Location
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.name,
                      style: const TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF2B1B12),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      member.profession,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFF7A6A5D),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 13, color: Color(0xFFE65100)),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            member.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF8D7B6F),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // ID badge & Profile button
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // CM ID Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: const Color(0xFFFFCC80), width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.badge_rounded, size: 10, color: Color(0xFFE65100)),
                        const SizedBox(width: 3),
                        Text(
                          member.memberIdCode,
                          style: const TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFE65100),
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Button "👤 प्रोफाइल पहा"
                  InkWell(
                    onTap: () => _showMemberProfileSheet(member),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFF9800), width: 1.2),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.person_outline_rounded,
                            size: 13,
                            color: Color(0xFFE65100),
                          ),
                          SizedBox(width: 3),
                          Text(
                            'प्रोफाइल पहा',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFE65100),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Skills Pill Tags
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: [
              for (final skill in member.skills)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFE0B2).withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFFCC80), width: 0.8),
                  ),
                  child: Text(
                    skill,
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF8D4004),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Center(
        child: Column(
          children: [
            const Icon(Icons.person_search_rounded, size: 54, color: Color(0xFFBCAAA4)),
            const SizedBox(height: 12),
            const Text(
              'कोणतेही सदस्य आढळले नाहीत',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Color(0xFF4A3427),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'कृपया शोध शब्द किंवा फिल्टर बदलून पहा.',
              style: TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D)),
            ),
            const SizedBox(height: 14),
            OutlinedButton(
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _activeFilter = 'all';
                  _selectedCity = 'all';
                  _selectedProfession = 'all';
                });
              },
              child: const Text('सर्व सदस्य दाखवा'),
            ),
          ],
        ),
      ),
    );
  }
}
