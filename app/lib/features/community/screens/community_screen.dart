import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../../widgets/home/custom_bottom_nav_bar.dart';
import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/profile/member_avatar.dart';
import '../../../core/share/copy_share.dart';
import '../../auth/providers/current_user_provider.dart';
import '../data/community_data.dart';
import '../models/community_models.dart';
import '../providers/community_provider.dart';
import '../repositories/community_repository.dart';
import '../widgets/create_post_sheet.dart';
import '../widgets/post_comments_sheet.dart';
import '../widgets/post_image.dart';

/// Modern Native-feel Community Screen
class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});

  @override
  ConsumerState<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends ConsumerState<CommunityScreen> {
  final TextEditingController _searchController = TextEditingController();
  MemberRegionFilter _selectedFilter = MemberRegionFilter.all;
  String _searchQuery = '';
  int _selectedGroupTab = 0; // 0 = शहर गट, 1 = आवड गट
  final Set<String> _connectedMemberIds = {};

  // Feed and member directory come from the secured backend.
  List<CommunityFeedPost> _feedPosts = [];
  bool _feedLoading = true;
  String? _feedError;
  List<CommunityMember> _allMembers = [];
  bool _membersLoading = true;
  String? _membersError;

  late List<CommunityGroup> _locationGroups;
  late List<CommunityGroup> _interestGroups;

  @override
  void initState() {
    super.initState();
    _locationGroups = List.from(CommunityData.locationGroups);
    _interestGroups = List.from(CommunityData.interestGroups);
    _loadFeed();
    _loadMembers();
  }

  CommunityRepository get _repo => ref.read(communityRepositoryProvider);
  String get _myId => ref.read(currentUserOrDefaultProvider).id;
  String _errorText(Object e) =>
      e is ApiException
          ? e.message
          : 'काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.';

  Future<void> _loadFeed() async {
    setState(() {
      _feedLoading = true;
      _feedError = null;
    });
    try {
      final posts = await _repo.fetchFeed(myMemberId: _myId);
      if (!mounted) return;
      setState(() {
        _feedPosts = posts;
        _feedLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _feedLoading = false;
        _feedError = _errorText(e);
      });
    }
  }

  Future<void> _loadMembers() async {
    setState(() {
      _membersLoading = true;
      _membersError = null;
    });
    try {
      final members = await _repo.fetchMembers();
      if (!mounted) return;
      setState(() {
        _allMembers = members;
        _membersLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _membersLoading = false;
        _membersError = _errorText(e);
      });
    }
  }

  Future<void> _toggleLike(CommunityFeedPost post) async {
    final idx = _feedPosts.indexWhere((p) => p.id == post.id);
    if (idx == -1) return;
    final before = _feedPosts[idx];
    setState(() {
      _feedPosts[idx] = before.copyWith(
        isLikedByMe: !before.isLikedByMe,
        likesCount:
            before.isLikedByMe ? before.likesCount - 1 : before.likesCount + 1,
      );
    });
    try {
      final result = await _repo.toggleLike(post.id);
      if (!mounted) return;
      final i = _feedPosts.indexWhere((p) => p.id == post.id);
      if (i != -1) {
        setState(
          () =>
              _feedPosts[i] = _feedPosts[i].copyWith(
                isLikedByMe: result.liked,
                likesCount: result.count,
              ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      final i = _feedPosts.indexWhere((p) => p.id == post.id);
      if (i != -1) setState(() => _feedPosts[i] = before);
      _showMessage(_errorText(e));
    }
  }

  // ── Safety: report / block / delete (all enforced server-side) ────────────

  /// Comments of a post: read them, add one, report someone else's.
  void _openComments(CommunityFeedPost post) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (ctx) => PostCommentsSheet(
            post: post,
            errorText: _errorText,
            onSend: (text) async {
              final comments = await _repo.addComment(
                post.id,
                text,
                myMemberId: _myId,
              );
              if (mounted) {
                final i = _feedPosts.indexWhere((p) => p.id == post.id);
                if (i != -1) {
                  setState(() {
                    _feedPosts[i] = _feedPosts[i].copyWith(comments: comments);
                  });
                }
              }
              return comments;
            },
            onReport: (comment) {
              Navigator.pop(ctx);
              _pickReportReason(targetType: 'comment', targetId: comment.id);
            },
          ),
    );
  }

  void _showPostOptions(CommunityFeedPost post) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (ctx) => SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (post.isMine)
                  ListTile(
                    leading: const Icon(
                      Icons.delete_outline_rounded,
                      color: Color(0xFFB91C1C),
                    ),
                    title: const Text('माझी पोस्ट हटवा'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _deleteOwnPost(post);
                    },
                  )
                else ...[
                  ListTile(
                    leading: const Icon(Icons.flag_outlined),
                    title: const Text('पोस्टची तक्रार करा'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _pickReportReason(targetType: 'post', targetId: post.id);
                    },
                  ),
                  if (post.authorId.isNotEmpty)
                    ListTile(
                      leading: const Icon(
                        Icons.block_rounded,
                        color: Color(0xFFB91C1C),
                      ),
                      title: Text('${post.authorName} यांना ब्लॉक करा'),
                      onTap: () {
                        Navigator.pop(ctx);
                        _confirmBlock(post.authorId, post.authorName);
                      },
                    ),
                ],
              ],
            ),
          ),
    );
  }

  void _showMemberOptions(CommunityMember member) {
    if (member.id == _myId) {
      _showMessage('ही आपली स्वतःची प्रोफाईल आहे.');
      return;
    }
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (ctx) => SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.flag_outlined),
                  title: const Text('सदस्याची तक्रार करा'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickReportReason(
                      targetType: 'member',
                      targetId: member.id,
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(
                    Icons.block_rounded,
                    color: Color(0xFFB91C1C),
                  ),
                  title: Text('${member.name} यांना ब्लॉक करा'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _confirmBlock(member.id, member.name);
                  },
                ),
              ],
            ),
          ),
    );
  }

  Future<void> _pickReportReason({
    required String targetType,
    required String targetId,
  }) async {
    final reason = await showModalBottomSheet<ReportReason>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (ctx) => SafeArea(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      'तक्रारीचे कारण निवडा',
                      style: GoogleFonts.mukta(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  for (final r in ReportReason.values)
                    ListTile(
                      title: Text(r.label),
                      onTap: () => Navigator.pop(ctx, r),
                    ),
                ],
              ),
            ),
          ),
    );
    if (reason == null || !mounted) return;
    try {
      await _repo.report(
        targetType: targetType,
        targetId: targetId,
        reason: reason,
      );
      _showMessage('तक्रार नोंदवली गेली. आमची टीम ती तपासेल.');
    } catch (e) {
      _showMessage(_errorText(e));
    }
  }

  Future<void> _confirmBlock(String memberId, String name) async {
    final ok = await showDialog<bool>(
      context: context,
      builder:
          (ctx) => AlertDialog(
            title: Text('$name यांना ब्लॉक करायचे?'),
            content: const Text(
              'त्यांच्या पोस्ट व प्रोफाईल तुम्हाला दिसणार नाहीत. हे तुम्ही नंतर बदलू शकता.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('रद्द करा'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('ब्लॉक करा'),
              ),
            ],
          ),
    );
    if (ok != true || !mounted) return;
    try {
      await _repo.blockMember(memberId);
      if (!mounted) return;
      setState(() {
        _feedPosts = _feedPosts.where((p) => p.authorId != memberId).toList();
        _allMembers = _allMembers.where((m) => m.id != memberId).toList();
      });
      _showMessage('$name यांना ब्लॉक केले.');
    } catch (e) {
      _showMessage(_errorText(e));
    }
  }

  Future<void> _deleteOwnPost(CommunityFeedPost post) async {
    try {
      await _repo.deletePost(post.id);
      if (!mounted) return;
      setState(
        () => _feedPosts = _feedPosts.where((p) => p.id != post.id).toList(),
      );
      _showMessage('पोस्ट हटवली.');
    } catch (e) {
      _showMessage(_errorText(e));
    }
  }

  Widget _buildErrorBox(String message, VoidCallback onRetry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFCDD2)),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.cloud_off_rounded,
            size: 36,
            color: Color(0xFF9CA3AF),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(
              fontSize: 13.5,
              color: const Color(0xFF4B5563),
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('पुन्हा प्रयत्न करा'),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildFeedBody() {
    if (_feedLoading) {
      return const [
        Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: CircularProgressIndicator()),
        ),
      ];
    }
    if (_feedError != null) return [_buildErrorBox(_feedError!, _loadFeed)];
    if (_feedPosts.isEmpty) {
      return [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Text(
            'अजून कोणतीही पोस्ट नाही. पहिली पोस्ट तुम्ही करा!',
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(
              fontSize: 14,
              color: const Color(0xFF6B7280),
            ),
          ),
        ),
      ];
    }
    return _feedPosts.map(_buildFeedPostCard).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<CommunityMember> get _filteredMembers {
    return _allMembers.where((m) {
      if (_selectedFilter != MemberRegionFilter.all &&
          m.regionKey != _selectedFilter.key) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesName = m.name.toLowerCase().contains(q);
        final matchesRole = m.roleOrTitle.toLowerCase().contains(q);
        final matchesLoc = m.location.toLowerCase().contains(q);
        final matchesProf = m.profession.toLowerCase().contains(q);
        final matchesSkills = m.skills.any((s) => s.toLowerCase().contains(q));
        if (!matchesName &&
            !matchesRole &&
            !matchesLoc &&
            !matchesProf &&
            !matchesSkills) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.white,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFF2EAE0)),
        ),
        content: Text(
          message,
          style: GoogleFonts.mukta(
            color: const Color(0xFF2B1B12),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _openCreatePostModal() async {
    final currentUser = ref.read(currentUserOrDefaultProvider);
    final created = await showModalBottomSheet<CommunityFeedPost>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (ctx) => CreatePostSheet(
            repository: _repo,
            myMemberId: _myId,
            authorName: currentUser.name,
            authorTier: currentUser.tier,
          ),
    );
    if (created == null || !mounted) return;
    setState(() => _feedPosts.insert(0, created));
    _showMessage('आपली पोस्ट समाजात प्रकाशित झाली! 🚩');
  }

  /// A member's picture: the photo they uploaded, or their initial. Stock
  /// photos belong to the offline demo's sample people only — a real member
  /// must never be shown with someone else's face.
  Widget _memberPicture({
    required String name,
    required String asset,
    required double radius,
    bool isMine = false,
    String? photoUrl,
  }) {
    if (ApiConfig.demoMode && asset.isNotEmpty) {
      return CircleAvatar(radius: radius, backgroundImage: AssetImage(asset));
    }
    if (isMine) return MyAvatar(size: radius * 2);
    return MemberAvatar(name: name, photoUrl: photoUrl, size: radius * 2);
  }

  void _showMemberProfile(CommunityMember member) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final isConnected = _connectedMemberIds.contains(member.id);
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(28),
              topRight: Radius.circular(28),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5E7EB),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              _memberPicture(
                name: member.name,
                asset: member.avatarAsset,
                photoUrl: member.photoUrl,
                radius: 42,
                isMine: member.id == _myId,
              ),
              const SizedBox(height: 10),
              Text(
                member.name,
                style: GoogleFonts.mukta(
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF1F2937),
                ),
              ),
              Text(
                member.roleOrTitle,
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFE84C10),
                ),
              ),
              Text(
                '📍 ${member.location}',
                style: GoogleFonts.mukta(
                  fontSize: 12,
                  color: const Color(0xFF6B7280),
                ),
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                alignment: WrapAlignment.center,
                children:
                    member.skills.map((skill) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          skill,
                          style: GoogleFonts.mukta(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF4B5563),
                          ),
                        ),
                      );
                    }).toList(),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Color(0xFFE5E7EB)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showMemberOptions(member);
                      },
                      child: Text(
                        'तक्रार / ब्लॉक',
                        style: GoogleFonts.mukta(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF374151),
                        ),
                      ),
                    ),
                  ),
                  if (ApiConfig.demoMode) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              isConnected
                                  ? const Color(0xFFF3F4F6)
                                  : const Color(0xFFE84C10),
                          foregroundColor:
                              isConnected
                                  ? const Color(0xFF15803D)
                                  : Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: () {
                          setState(() {
                            if (isConnected) {
                              _connectedMemberIds.remove(member.id);
                            } else {
                              _connectedMemberIds.add(member.id);
                            }
                          });
                          Navigator.pop(ctx);
                          _showMessage(
                            isConnected
                                ? 'कनेक्शन विनंती मागे घेतली'
                                : '${member.name} यांना कनेक्ट विनंती पाठवली (नेटवर्क API पुढील आवृत्तीत सुरू होईल)',
                          );
                        },
                        child: Text(
                          isConnected ? '✓ जोडले आहात' : 'कनेक्ट करा',
                          style: GoogleFonts.mukta(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Sleek Mobile Hero with Integrated Helpline & Back Button
            _buildNativeHero(),

            // 2. Quick Post Bar (Create Engagement)
            _buildQuickPostBar(),

            // 3. Samaj Gat Section with Segmented Toggle [शहर गट | आवड गट].
            // Groups are not on the server yet: the sample ones (with sample
            // member counts and a local-only "join") are for the demo build.
            if (ApiConfig.demoMode) _buildSegmentedGroupsSection(),

            // 4. Community Feed Section
            _buildFeedSection(),

            // 5. Member Directory (Search + Filter Chips + 2-Col Grid)
            _buildMembersSection(),

            // 6. Trust Notice
            _buildTrustNotice(),

            // 7. Clean Native Mobile Footer
            _buildMinimalMobileFooter(),

            const SizedBox(height: 24),
          ],
        ),
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: 1, // "समुदाय" tab active
        onTap: (index) {
          if (index == 0) {
            context.go('/home');
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

  // ─── 1. Native Sleek Hero ───────────────────────────────────────────────────
  Widget _buildNativeHero() {
    return Stack(
      children: [
        // Fort Scenic Image
        SizedBox(
          height: 180,
          width: double.infinity,
          child: Image.asset(
            'assets/images/heritage_hero.webp',
            fit: BoxFit.cover,
            errorBuilder:
                (_, __, ___) => Container(color: const Color(0xFF2C1810)),
          ),
        ),
        // Dark gradient
        Container(
          height: 180,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.black.withAlpha(90),
                const Color(0xFF1E140F).withAlpha(225),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
        // Content
        SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top App Bar row
                Row(
                  children: [
                    Material(
                      color: Colors.white.withAlpha(40),
                      shape: const CircleBorder(),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: () {
                          if (Navigator.of(context).canPop()) {
                            Navigator.of(context).pop();
                          } else {
                            context.go('/home');
                          }
                        },
                        child: const Padding(
                          padding: EdgeInsets.all(8),
                          child: Icon(
                            Icons.arrow_back_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'समुदाय दालन',
                      style: GoogleFonts.mukta(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    // Emergency Helpline Pill
                    GestureDetector(
                      // No verified helpline number exists yet; open the
                      // Help screen (email support) instead of a made-up one.
                      onTap: () => context.push('/profile/help'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE84C10).withAlpha(220),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withAlpha(50)),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.phone_in_talk_rounded,
                              size: 12,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'मदत',
                              style: GoogleFonts.mukta(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'मराठा बांधवांशी जोडा, समाज सशक्त करा',
                  style: GoogleFonts.mukta(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    height: 1.25,
                  ),
                ),
                Text(
                  '🚩 जय जिजाऊ · जय शिवराय · जय शंभूराजे | शक ३५१',
                  style: GoogleFonts.mukta(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFFFDE68A),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── 2. Quick Post Creator Bar ─────────────────────────────────────────────
  Widget _buildQuickPostBar() {
    final currentUser = ref.watch(currentUserOrDefaultProvider);
    return Transform.translate(
      offset: const Offset(0, -14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF0E8DF)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2B1B12).withAlpha(15),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFFE84C10),
                child: Text(
                  currentUser.name.isNotEmpty
                      ? currentUser.name.characters.first.toUpperCase()
                      : 'स',
                  style: GoogleFonts.mukta(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: GestureDetector(
                  onTap: _openCreatePostModal,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Text(
                      'आपले विचार किंवा उपक्रम शेअर करा...',
                      style: GoogleFonts.mukta(
                        fontSize: 12.5,
                        color: const Color(0xFF9CA3AF),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: const Icon(
                  Icons.add_photo_alternate_rounded,
                  color: Color(0xFFE84C10),
                ),
                onPressed: _openCreatePostModal,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── 3. Segmented Samaj Gat Section ────────────────────────────────────────
  Widget _buildSegmentedGroupsSection() {
    final isLocation = _selectedGroupTab == 0;
    final currentList = isLocation ? _locationGroups : _interestGroups;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('👥', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    'समाज गट',
                    style: GoogleFonts.mukta(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '(${currentList.length})',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: () => _showMessage('सर्व समाज गट सूची'),
                child: Text(
                  'सर्व पहा →',
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFFE84C10),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Modern Segmented Control: [ 📍 शहर गट (8) ] | [ 🎯 आवड गट (11) ]
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFEFE9E2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGroupTab = 0),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      decoration: BoxDecoration(
                        color: isLocation ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow:
                            isLocation
                                ? [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(12),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                ]
                                : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '📍 शहरनिहाय गट (${_locationGroups.length})',
                        style: GoogleFonts.mukta(
                          fontSize: 12.5,
                          fontWeight:
                              isLocation ? FontWeight.w800 : FontWeight.w600,
                          color:
                              isLocation
                                  ? const Color(0xFFC2410C)
                                  : const Color(0xFF6B7280),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedGroupTab = 1),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      decoration: BoxDecoration(
                        color: !isLocation ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow:
                            !isLocation
                                ? [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(12),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                ]
                                : null,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '🎯 आवडीनिहाय गट (${_interestGroups.length})',
                        style: GoogleFonts.mukta(
                          fontSize: 12.5,
                          fontWeight:
                              !isLocation ? FontWeight.w800 : FontWeight.w600,
                          color:
                              !isLocation
                                  ? const Color(0xFFC2410C)
                                  : const Color(0xFF6B7280),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Horizontal Group Slider with Elegant Soft Cards
          SizedBox(
            height: 178,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: currentList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final group = currentList[index];
                return _buildRefinedGroupCard(
                  group,
                  isLocation: isLocation,
                  index: index,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRefinedGroupCard(
    CommunityGroup group, {
    required bool isLocation,
    required int index,
  }) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color:
              group.isJoined
                  ? const Color(0xFFBBF7D0)
                  : const Color(0xFFF2ECE4),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 3),
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
                  horizontal: 7,
                  vertical: 2.5,
                ),
                decoration: BoxDecoration(
                  color:
                      isLocation
                          ? const Color(0xFFFFF7ED)
                          : const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color:
                        isLocation
                            ? const Color(0xFFFFEDD5)
                            : const Color(0xFFDBEAFE),
                  ),
                ),
                child: Text(
                  group.category.badgeLabel,
                  style: GoogleFonts.mukta(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color:
                        isLocation
                            ? const Color(0xFFC2410C)
                            : const Color(0xFF1D4ED8),
                  ),
                ),
              ),
              Text(
                group.membersCountText,
                style: GoogleFonts.mukta(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(group.emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  group.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.mukta(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1F2937),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Expanded(
            child: Text(
              group.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.mukta(
                fontSize: 11,
                color: const Color(0xFF6B7280),
                height: 1.3,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.zero,
                    side: const BorderSide(color: Color(0xFFE5E7EB)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    minimumSize: const Size(0, 30),
                  ),
                  onPressed: () => _showMessage('${group.name} सविस्तर माहिती'),
                  child: Text(
                    'पहा',
                    style: GoogleFonts.mukta(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF4B5563),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        group.isJoined
                            ? const Color(0xFFDCFCE7)
                            : const Color(0xFFE84C10),
                    foregroundColor:
                        group.isJoined ? const Color(0xFF15803D) : Colors.white,
                    elevation: 0,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    minimumSize: const Size(0, 30),
                  ),
                  onPressed: () {
                    setState(() {
                      if (isLocation) {
                        _locationGroups[index] = group.copyWith(
                          isJoined: !group.isJoined,
                        );
                      } else {
                        _interestGroups[index] = group.copyWith(
                          isJoined: !group.isJoined,
                        );
                      }
                    });
                    _showMessage(
                      group.isJoined
                          ? 'गटातून बाहेर पडलात'
                          : '${group.name} मध्ये सामील झालात (ग्रुप चर्चा लवकरच सुरू होईल)',
                    );
                  },
                  child: Text(
                    group.isJoined ? '✓ सामील' : 'सामील व्हा',
                    style: GoogleFonts.mukta(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── 4. Community Feed Section ─────────────────────────────────────────────
  Widget _buildFeedSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('💬', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    'समाज फीड',
                    style: GoogleFonts.mukta(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: _loadFeed,
                child: Row(
                  children: [
                    Text(
                      'रिफ्रेश',
                      style: GoogleFonts.mukta(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFFE84C10),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.refresh_rounded,
                      size: 15,
                      color: Color(0xFFE84C10),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ..._buildFeedBody(),
        ],
      ),
    );
  }

  Widget _buildFeedPostCard(CommunityFeedPost post) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0E8DF)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _memberPicture(
                name: post.authorName,
                asset: post.authorAvatar,
                radius: 20,
                isMine: post.isMine,
                photoUrl: post.authorPhotoUrl,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.authorName,
                      style: GoogleFonts.mukta(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      '${post.authorTitle} • ${post.timeAgo}',
                      style: GoogleFonts.mukta(
                        fontSize: 11.5,
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(
                  Icons.more_horiz_rounded,
                  color: Color(0xFF9CA3AF),
                ),
                onPressed: () => _showPostOptions(post),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (post.content.isNotEmpty)
            Text(
              post.content,
              style: GoogleFonts.mukta(
                fontSize: 13,
                color: const Color(0xFF374151),
                height: 1.45,
              ),
            ),
          if (post.imageUrl != null) ...[
            const SizedBox(height: 10),
            PostImage(url: post.imageUrl!),
          ],
          if (post.imageAsset != null) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                post.imageAsset!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          ],
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 8),
          Row(
            children: [
              InkWell(
                onTap: () => _toggleLike(post),
                child: Row(
                  children: [
                    Icon(
                      post.isLikedByMe
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      size: 18,
                      color:
                          post.isLikedByMe
                              ? const Color(0xFFE84C10)
                              : const Color(0xFF6B7280),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${post.likesCount}',
                      style: GoogleFonts.mukta(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color:
                            post.isLikedByMe
                                ? const Color(0xFFE84C10)
                                : const Color(0xFF4B5563),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 20),
              InkWell(
                onTap: () => _openComments(post),
                child: Row(
                  children: [
                    const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 16,
                      color: Color(0xFF6B7280),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${post.commentsCount} टिप्पण्या',
                      style: GoogleFonts.mukta(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF4B5563),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(
                  Icons.share_outlined,
                  size: 18,
                  color: Color(0xFF6B7280),
                ),
                tooltip: 'शेअर करा',
                onPressed: () async {
                  final shared = await shareText(
                    postShareText(
                      postId: post.id,
                      author: post.authorName,
                      content: post.content,
                    ),
                  );
                  if (!shared) _showMessage(copiedForSharingMessage);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── 5. Member Directory Section with Contextual Filter Tabs ────────────────
  Widget _buildMembersSection() {
    final members = _filteredMembers;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('👤', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    'सदस्य निर्देशिका',
                    style: GoogleFonts.mukta(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '(${members.length})',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
              if (_searchQuery.isNotEmpty ||
                  _selectedFilter != MemberRegionFilter.all)
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _searchController.clear();
                      _searchQuery = '';
                      _selectedFilter = MemberRegionFilter.all;
                    });
                  },
                  child: Text(
                    'फिल्टर हटवा',
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFDC2626),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Search Field directly above the members grid
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE5E7EB)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
            child: Row(
              children: [
                const Icon(
                  Icons.search_rounded,
                  color: Color(0xFFE84C10),
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged:
                        (val) => setState(() => _searchQuery = val.trim()),
                    style: GoogleFonts.mukta(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1F2937),
                    ),
                    decoration: InputDecoration(
                      hintText: 'नाव, कौशल्य किंवा शहरानुसार शोधा...',
                      hintStyle: GoogleFonts.mukta(
                        fontSize: 12.5,
                        color: const Color(0xFF9CA3AF),
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                if (_searchQuery.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 16),
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _searchQuery = '');
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Contextual Region Chips right here above the members
          SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: MemberRegionFilter.values.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final filter = MemberRegionFilter.values[index];
                final isSelected = _selectedFilter == filter;
                return GestureDetector(
                  onTap: () => setState(() => _selectedFilter = filter),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color:
                          isSelected ? const Color(0xFFE84C10) : Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color:
                            isSelected
                                ? const Color(0xFFE84C10)
                                : const Color(0xFFE5E7EB),
                      ),
                      boxShadow:
                          isSelected
                              ? [
                                BoxShadow(
                                  color: const Color(0xFFE84C10).withAlpha(40),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                              : null,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      filter.labelMr,
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        fontWeight:
                            isSelected ? FontWeight.w800 : FontWeight.w600,
                        color:
                            isSelected ? Colors.white : const Color(0xFF4B5563),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 14),

          // 2-Column Grid
          if (_membersLoading)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_membersError != null)
            _buildErrorBox(_membersError!, _loadMembers)
          else if (members.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.person_search_rounded,
                    size: 44,
                    color: Color(0xFF9CA3AF),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'कोणतेही सदस्य सापडले नाहीत.',
                    style: GoogleFonts.mukta(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF4B5563),
                    ),
                  ),
                  Text(
                    'कृपया वेगळा शब्द किंवा शहर निवडून पहा.',
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      color: const Color(0xFF9CA3AF),
                    ),
                  ),
                ],
              ),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: members.length,
              // Fixed height that grows with the system font size: an aspect
              // ratio made the cards too short on narrow phones.
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                mainAxisExtent: MediaQuery.textScalerOf(context).scale(214),
              ),
              itemBuilder: (context, index) {
                final member = members[index];
                return _buildMemberCard(member);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildMemberCard(CommunityMember member) {
    final isConnected = _connectedMemberIds.contains(member.id);

    return GestureDetector(
      onTap: () => _showMemberProfile(member),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF0E8DF)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Stack(
              children: [
                _memberPicture(
                  name: member.name,
                  asset: member.avatarAsset,
                  photoUrl: member.photoUrl,
                  radius: 28,
                  isMine: member.id == _myId,
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 5,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE84C10),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                    child: Text(
                      member.tier,
                      style: GoogleFonts.mukta(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              member.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.mukta(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1F2937),
              ),
            ),
            Text(
              member.roleOrTitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.mukta(
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: const Color(0xFFE84C10),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.location_on_rounded,
                  size: 10,
                  color: Color(0xFF6B7280),
                ),
                const SizedBox(width: 2),
                Flexible(
                  child: Text(
                    member.location,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.mukta(
                      fontSize: 10,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            if (member.skills.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  member.skills.first,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.mukta(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF4B5563),
                  ),
                ),
              ),
            const Spacer(),
            if (ApiConfig.demoMode)
              SizedBox(
                width: double.infinity,
                height: 28,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        isConnected
                            ? const Color(0xFFF3F4F6)
                            : const Color(0xFFFFF7ED),
                    foregroundColor:
                        isConnected
                            ? const Color(0xFF15803D)
                            : const Color(0xFFE84C10),
                    elevation: 0,
                    side: BorderSide(
                      color:
                          isConnected
                              ? const Color(0xFFE5E7EB)
                              : const Color(0xFFFFD5C0),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.zero,
                  ),
                  onPressed: () {
                    setState(() {
                      if (isConnected) {
                        _connectedMemberIds.remove(member.id);
                      } else {
                        _connectedMemberIds.add(member.id);
                      }
                    });
                    _showMessage(
                      isConnected
                          ? 'विनंती मागे घेतली'
                          : '${member.name} यांना कनेक्ट विनंती पाठवली (लवकरच उपलब्ध)',
                    );
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isConnected
                            ? Icons.check_circle_rounded
                            : Icons.person_add_rounded,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isConnected ? 'जोडले ✓' : 'जोडा',
                        style: GoogleFonts.mukta(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ─── 6. Trust Notice ───────────────────────────────────────────────────────
  Widget _buildTrustNotice() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFFDE68A)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🛡️', style: TextStyle(fontSize: 18)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Connect Maratha सदस्यत्व स्वयं-ओळखीवर व संस्कृतीच्या प्रेमावर आधारित आहे. कोणत्याही जात प्रमाणपत्राची सक्ती नाही.',
                style: GoogleFonts.mukta(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF92400E),
                  height: 1.35,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── 7. Sleek Mobile Footer ────────────────────────────────────────────────
  Widget _buildMinimalMobileFooter() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/logo.webp',
                width: 24,
                height: 24,
                errorBuilder:
                    (_, __, ___) => const Icon(
                      Icons.shield_rounded,
                      color: Color(0xFFE84C10),
                      size: 20,
                    ),
              ),
              const SizedBox(width: 8),
              Text(
                'CONNECT मराठा',
                style: GoogleFonts.mukta(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF8B6A52),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '॥ जय भवानी, जय शिवाजी ॥',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: const Color(0xFFE84C10),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'आधुनिक युगातील आधुनिक संघटन',
            style: GoogleFonts.mukta(
              fontSize: 10.5,
              color: const Color(0xFF9CA3AF),
            ),
          ),
        ],
      ),
    );
  }
}
