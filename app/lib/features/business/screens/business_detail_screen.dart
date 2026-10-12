import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/network/api_client.dart';
import '../../../core/share/copy_share.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/business_models.dart';
import '../repositories/business_repository.dart';

/// SCREEN A: Business Detail Screen (/business/:id)
/// Opened from "तपशील पहा"
/// - Data: GET /businesses/:id returns { business, reviews }
/// - First-letter banner (no photo upload exists)
/// - Name, owner, city & district, category, verified badge (only if verified == true), star rating & review count
/// - Action buttons: Call, WhatsApp, Share. Bookmark is hidden.
/// - Sections: offers, services as tags, website, contact details, reviews list (empty sections hidden).
/// - GST (gstNumber) & Udyam (udyamNo): visible when logged in; locked row with login button when logged out.
/// - "रिव्ह्यू लिहा": bottom sheet with 1 to 5 star selector and text; POST /businesses/:id/reviews. Owner cannot review.
/// - If logged-in member is owner: show Edit button, saving with PUT /businesses/:id.
/// - Handles loading, error with retry, and BUSINESS_NOT_FOUND.
class BusinessDetailScreen extends ConsumerStatefulWidget {
  const BusinessDetailScreen({
    super.key,
    required this.businessId,
    this.initialBusiness,
  });

  final String businessId;
  final Business? initialBusiness;

  @override
  ConsumerState<BusinessDetailScreen> createState() => _BusinessDetailScreenState();
}

class _BusinessDetailScreenState extends ConsumerState<BusinessDetailScreen> {
  Business? _business;
  bool _isLoading = true;
  String? _errorMessage;
  bool _isNotFound = false;

  @override
  void initState() {
    super.initState();
    _business = widget.initialBusiness;
    _loadBusiness();
  }

  Future<void> _loadBusiness() async {
    setState(() {
      _isLoading = _business == null;
      _errorMessage = null;
      _isNotFound = false;
    });

    try {
      final repo = ref.read(businessRepositoryProvider);
      final fetched = await repo.fetchBusiness(widget.businessId);
      if (!mounted) return;
      setState(() {
        _business = fetched;
        _isLoading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        if (e.statusCode == 404 || e.code == 'BUSINESS_NOT_FOUND') {
          _isNotFound = true;
        } else {
          _errorMessage = e.message;
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.';
      });
    }
  }

  Future<void> _callBusiness(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कॉल करता आला नाही.')),
      );
    }
  }

  Future<void> _whatsappBusiness(String phone) async {
    var digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 10) {
      digits = '91$digits';
    } else if (digits.length == 11 && digits.startsWith('0')) {
      digits = '91${digits.substring(1)}';
    }
    final url = 'https://wa.me/$digits?text=${Uri.encodeComponent('नमस्कार, मी कनेक्ट मराठा अ‍ॅपवरून संपर्क करत आहे.')}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('WhatsApp उघडता आले नाही.')),
      );
    }
  }

  Future<void> _openWebsite(String url) async {
    var target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://$target';
    }
    final uri = Uri.parse(target);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('संकेतस्थळ उघडता आले नाही.')),
      );
    }
  }

  Future<void> _shareBusiness(Business b) async {
    final text = '🏢 *${b.name}*\n'
        '👤 प्रो. ${b.ownerName}\n'
        '📍 ${b.city}, ${b.district}\n'
        '⭐ रेटिंग: ${b.rating.toStringAsFixed(1)} (${b.reviewsCount} रिव्ह्यूज)\n\n'
        'कनेक्ट मराठा व्यवसाय निर्देशिका वर अधिक माहिती पहा!';
    await shareText(text, subject: b.name);
  }

  void _showAddReviewSheet(Business b) {
    int selectedRating = 5;
    final textController = TextEditingController();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 18,
                bottom: MediaQuery.viewInsetsOf(context).bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'रिव्ह्यू लिहा — ${b.name}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF2B1B12),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'तुमचा अनुभव समाजातील इतर बांधवांसोबत शेअर करा.',
                      style: TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D)),
                    ),
                    const SizedBox(height: 16),

                    // Star selector 1 to 5
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        final star = index + 1;
                        final isSelected = star <= selectedRating;
                        return IconButton(
                          iconSize: 34,
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          icon: Icon(
                            isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: isSelected ? const Color(0xFFFFA000) : Colors.grey.shade400,
                          ),
                          onPressed: isSubmitting
                              ? null
                              : () {
                                  setModalState(() => selectedRating = star);
                                },
                        );
                      }),
                    ),
                    Center(
                      child: Text(
                        '$selectedRating / ५ तारे',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF8B1E1E),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    TextField(
                      controller: textController,
                      maxLines: 3,
                      enabled: !isSubmitting,
                      decoration: InputDecoration(
                        hintText: 'तुमचा प्रामाणिक अभिप्राय येथे लिहा...',
                        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                        filled: true,
                        fillColor: const Color(0xFFFAF7F2),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFEADCCF)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFFEADCCF)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                final text = textController.text.trim();
                                if (text.isEmpty) {
                                  if (ctx.mounted) {
                                    ScaffoldMessenger.of(ctx).showSnackBar(
                                      const SnackBar(content: Text('कृपया अभिप्राय लिहा.')),
                                    );
                                  }
                                  return;
                                }

                                setModalState(() => isSubmitting = true);
                                try {
                                  final repo = ref.read(businessRepositoryProvider);
                                  final result = await repo.addReview(
                                    b.id,
                                    rating: selectedRating,
                                    text: text,
                                  );

                                  if (!ctx.mounted) return;
                                  Navigator.pop(ctx);
                                  if (mounted) {
                                    setState(() {
                                      _business = _business?.copyWith(
                                        rating: result.newRating,
                                        reviewsCount: (_business?.reviewsCount ?? 0) + 1,
                                        reviews: [result.review, ...?_business?.reviews],
                                      );
                                    });
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('तुमचा रिव्ह्यू यशस्वीरित्या जोडला गेला!'),
                                        backgroundColor: Color(0xFF2E7D32),
                                      ),
                                    );
                                  }
                                } on ApiException catch (e) {
                                  setModalState(() => isSubmitting = false);
                                  if (ctx.mounted) {
                                    ScaffoldMessenger.of(ctx).showSnackBar(
                                      SnackBar(content: Text(e.message)),
                                    );
                                  }
                                } catch (_) {
                                  setModalState(() => isSubmitting = false);
                                  if (ctx.mounted) {
                                    ScaffoldMessenger.of(ctx).showSnackBar(
                                      const SnackBar(content: Text('रिव्ह्यू सबमिट करण्यात त्रुटी आली.')),
                                    );
                                  }
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B1E1E),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text(
                                'रिव्ह्यू सबमिट करा',
                                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                              ),
                      ),
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
    final authState = ref.watch(authControllerProvider).state;
    final isLoggedIn = authState.isAuthenticated;
    final loggedInUserId = authState.profile?.id;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFFAF7F2),
        appBar: AppBar(
          title: const Text('व्यवसाय माहिती', style: TextStyle(fontWeight: FontWeight.w700)),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF2B1B12),
          elevation: 0,
        ),
        body: const Center(
          child: CircularProgressIndicator(color: Color(0xFFE65100)),
        ),
      );
    }

    if (_isNotFound) {
      return Scaffold(
        backgroundColor: const Color(0xFFFAF7F2),
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF2B1B12),
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.storefront_outlined, size: 72, color: Color(0xFF8D7B6F)),
                const SizedBox(height: 16),
                const Text(
                  'व्यवसाय आढळला नाही',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                ),
                const SizedBox(height: 8),
                const Text(
                  'हा व्यवसाय काढून टाकला असावा किंवा लिंक अवैध आहे.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13.5, color: Color(0xFF7A6A5D)),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    } else {
                      context.go('/business/directory');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.arrow_back_rounded),
                  label: const Text('परत जा'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_errorMessage != null || _business == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFFAF7F2),
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF2B1B12),
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline_rounded, size: 56, color: Color(0xFFD32F2F)),
                const SizedBox(height: 12),
                Text(
                  _errorMessage ?? 'काहीतरी त्रुटी आली.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF2B1B12)),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: _loadBusiness,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE65100),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('पुन्हा प्रयत्न करा'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final b = _business!;
    final isOwner = isLoggedIn && b.ownerId != null && b.ownerId == loggedInUserId;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. App Bar with Back, Share, and Owner Edit Button
          SliverAppBar(
            backgroundColor: Colors.white,
            foregroundColor: const Color(0xFF2B1B12),
            elevation: 0.5,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  context.go('/business/directory');
                }
              },
            ),
            title: Text(
              b.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_rounded),
                onPressed: () => _shareBusiness(b),
                tooltip: 'शेअर करा',
              ),
              if (isOwner)
                TextButton.icon(
                  onPressed: () async {
                    final updated = await context.push<Business?>(
                      '/business/add',
                      extra: b,
                    );
                    if (updated != null && mounted) {
                      setState(() => _business = updated);
                    } else {
                      _loadBusiness();
                    }
                  },
                  icon: const Icon(Icons.edit_rounded, size: 18, color: Color(0xFF8B1E1E)),
                  label: const Text(
                    'संपादित करा',
                    style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF8B1E1E)),
                  ),
                ),
            ],
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 2. Stylized First-Letter Banner (No photo upload exists)
                _buildFirstLetterBanner(b),

                // 3. Header Card: Name, Owner, Category, Verified, Rating
                _buildHeaderCard(b),

                // 4. Action Buttons: Call, WhatsApp, Share (Bookmark hidden)
                _buildActionButtons(b),

                const SizedBox(height: 12),

                // 5. Offers Section (hidden if empty)
                if (b.offer != null && b.offer!.trim().isNotEmpty) ...[
                  _buildOfferCard(b.offer!.trim()),
                  const SizedBox(height: 12),
                ],

                // 6. Services Section (hidden if empty)
                if (b.services.isNotEmpty) ...[
                  _buildServicesSection(b.services),
                  const SizedBox(height: 12),
                ],

                // 7. Website Section (hidden if empty)
                if (b.website != null && b.website!.trim().isNotEmpty) ...[
                  _buildWebsiteSection(b.website!.trim()),
                  const SizedBox(height: 12),
                ],

                // 8. Contact Details Section
                _buildContactSection(b),

                const SizedBox(height: 12),

                // 9. GST & Udyam Section (Locked when logged out)
                _buildGstUdyamSection(b, isLoggedIn: isLoggedIn),

                const SizedBox(height: 12),

                // 10. Reviews Section
                _buildReviewsSection(b, isLoggedIn: isLoggedIn, isOwner: isOwner),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Stylized first-letter banner with vibrant gradient, letter initial, and category badge
  Widget _buildFirstLetterBanner(Business b) {
    final initial = b.name.trim().isNotEmpty ? b.name.trim().characters.first : '🏢';

    return Container(
      width: double.infinity,
      height: 160,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF8B1E1E),
            Color(0xFFB71C1C),
            Color(0xFFE65100),
          ],
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background decorative rings
          Positioned(
            right: -20,
            bottom: -20,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ),
          ),
          Positioned(
            left: -30,
            top: -30,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.06),
              ),
            ),
          ),

          // Central Large First Letter Initial
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 74,
                height: 74,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF8B1E1E),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${b.category.emoji} ${b.category.labelMr}',
                  style: const TextStyle(fontSize: 11.5, color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Header Card with Name, Owner, City, Verified Badge, and Rating
  Widget _buildHeaderCard(Business b) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 8),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
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
                Expanded(
                  child: Text(
                    b.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                      letterSpacing: -0.3,
                    ),
                  ),
                ),
                // Verified badge ONLY if verified is true
                if (b.verified)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFC8E6C9)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 14, color: Color(0xFF2E7D32)),
                        SizedBox(width: 4),
                        Text(
                          'सत्यापित',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'प्रो. ${b.ownerName}',
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF8B1E1E),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.location_on_rounded, size: 15, color: Color(0xFFE65100)),
                const SizedBox(width: 4),
                Text(
                  '${b.city}, ${b.district}',
                  style: const TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D)),
                ),
                const Spacer(),
                // Star rating & review count
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF8E1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFFECB3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 16, color: Color(0xFFFFA000)),
                      const SizedBox(width: 3),
                      Text(
                        '${b.rating.toStringAsFixed(1)} (${b.reviewsCount})',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF8D4004),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (b.description != null && b.description!.isNotEmpty) ...[
              const SizedBox(height: 10),
              const Divider(height: 1, color: Color(0xFFF1E5D8)),
              const SizedBox(height: 10),
              Text(
                b.description!,
                style: const TextStyle(fontSize: 13, height: 1.45, color: Color(0xFF5D4037)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Action Buttons: Call, WhatsApp, Share (Bookmark is hidden as backend has no save feature)
  Widget _buildActionButtons(Business b) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          // Call Dialer
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _callBusiness(b.phone),
              icon: const Icon(Icons.call_rounded, size: 18),
              label: const Text('कॉल करा', style: TextStyle(fontWeight: FontWeight.w700)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B1E1E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // WhatsApp Link
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => _whatsappBusiness(b.whatsapp ?? b.phone),
              icon: const Icon(Icons.chat_bubble_rounded, size: 18),
              label: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.w700)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Share
          IconButton.filled(
            onPressed: () => _shareBusiness(b),
            icon: const Icon(Icons.share_rounded, size: 20),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFFFFF0E6),
              foregroundColor: const Color(0xFFE65100),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.all(12),
            ),
          ),
        ],
      ),
    );
  }

  /// Offers Section
  Widget _buildOfferCard(String offer) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF3E0),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFFFCC80)),
        ),
        child: Row(
          children: [
            const Icon(Icons.local_offer_rounded, color: Color(0xFFD84315), size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'विशेष ऑफर / सवलत',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFD84315),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    offer,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B1B12),
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

  /// Services as Tags
  Widget _buildServicesSection(List<String> services) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'प्रमुख सेवा व उत्पादने',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF2B1B12),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: services.map((s) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFAF7F2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEADCCF)),
                  ),
                  child: Text(
                    s,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF5D4037),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  /// Website Section
  Widget _buildWebsiteSection(String website) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFF1E5D8)),
        ),
        child: Row(
          children: [
            const Icon(Icons.language_rounded, color: Color(0xFF0288D1), size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('अधिकृत संकेतस्थळ', style: TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D))),
                  InkWell(
                    onTap: () => _openWebsite(website),
                    child: Text(
                      website,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0288D1),
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.open_in_new_rounded, size: 18, color: Color(0xFF0288D1)),
              onPressed: () => _openWebsite(website),
            ),
          ],
        ),
      ),
    );
  }

  /// Contact Details Section
  Widget _buildContactSection(Business b) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'संपर्क तपशील',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
            ),
            const SizedBox(height: 12),
            _buildContactRow(
              icon: Icons.phone_rounded,
              label: 'मोबाईल फोन',
              value: b.phone,
              onTap: () => _callBusiness(b.phone),
            ),
            if (b.whatsapp != null && b.whatsapp!.isNotEmpty) ...[
              const SizedBox(height: 10),
              _buildContactRow(
                icon: Icons.chat_bubble_rounded,
                label: 'WhatsApp',
                value: b.whatsapp!,
                iconColor: const Color(0xFF25D366),
                onTap: () => _whatsappBusiness(b.whatsapp!),
              ),
            ],
            if (b.hours != null && b.hours!.isNotEmpty) ...[
              const SizedBox(height: 10),
              _buildContactRow(
                icon: Icons.access_time_rounded,
                label: 'कामाची वेळ',
                value: b.hours!,
              ),
            ],
            const SizedBox(height: 10),
            _buildContactRow(
              icon: Icons.location_city_rounded,
              label: 'पत्ता / शहर',
              value: '${b.city}, ${b.district}, महाराष्ट्र',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactRow({
    required IconData icon,
    required String label,
    required String value,
    Color iconColor = const Color(0xFFE65100),
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 18, color: iconColor),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF7A6A5D))),
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: onTap != null ? const Color(0xFF8B1E1E) : const Color(0xFF2B1B12),
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

  /// GST and Udyam Section:
  /// - ONLY when logged in!
  /// - When logged out: shows locked row with login button.
  Widget _buildGstUdyamSection(Business b, {required bool isLoggedIn}) {
    final hasGst = b.gstNumber != null && b.gstNumber!.trim().isNotEmpty;
    final hasUdyam = b.udyamNo != null && b.udyamNo!.trim().isNotEmpty;

    // If both are empty even on server, hide section when logged in
    if (isLoggedIn && !hasGst && !hasUdyam) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.verified_user_rounded, color: Color(0xFF8B1E1E), size: 20),
                const SizedBox(width: 8),
                const Text(
                  'शासकीय व कर नोंदणी (GST व उद्यम)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (!isLoggedIn) ...[
              // Locked Row when logged out
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFECB3)),
                ),
                child: Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.lock_rounded, color: Color(0xFFD84315), size: 22),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'GST आणि उद्यम नोंदणी तपशील पाहण्यासाठी लॉगिन करा.',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF5D4037),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => context.push('/login'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B1E1E),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('लॉगिन करा', style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Logged in: show available numbers
              if (hasGst)
                _buildGovtIdRow('GST Number', b.gstNumber!),
              if (hasGst && hasUdyam)
                const Divider(height: 16, color: Color(0xFFF1E5D8)),
              if (hasUdyam)
                _buildGovtIdRow('उद्यम नोंदणी (Udyam)', b.udyamNo!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildGovtIdRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF7A6A5D), fontWeight: FontWeight.w500)),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFFAF7F2),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFFEADCCF)),
          ),
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Color(0xFF2B1B12),
              letterSpacing: 0.5,
            ),
          ),
        ),
      ],
    );
  }

  /// Reviews Section
  Widget _buildReviewsSection(
    Business b, {
    required bool isLoggedIn,
    required bool isOwner,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'सदस्य रिव्ह्यू व अनुभव',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'एकूण ${b.reviewsCount} रिव्ह्यूज · ⭐ ${b.rating.toStringAsFixed(1)}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF7A6A5D)),
                    ),
                  ],
                ),

                // Review button: Owner cannot review their own business
                if (!isOwner)
                  ElevatedButton.icon(
                    onPressed: () {
                      if (!isLoggedIn) {
                        context.push('/login');
                      } else {
                        _showAddReviewSheet(b);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B1E1E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.rate_review_rounded, size: 16),
                    label: const Text('रिव्ह्यू लिहा', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
              ],
            ),

            if (isOwner) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFFD84315)),
                    SizedBox(width: 6),
                    Text(
                      'तुम्ही स्वतःच्या व्यवसायावर रिव्ह्यू लिहू शकत नाही.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFFD84315), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 14),

            if (b.reviews.isEmpty) ...[
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'अद्याप कोणतेही रिव्ह्यू नाहीत.\nपहिला रिव्ह्यू लिहून प्रोत्साहन द्या!',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: Colors.grey.shade500),
                  ),
                ),
              ),
            ] else ...[
              for (int i = 0; i < b.reviews.length; i++) ...[
                if (i > 0) const Divider(height: 20, color: Color(0xFFF1E5D8)),
                _buildReviewItem(b.reviews[i]),
              ],
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(BusinessReview r) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              r.memberName,
              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF2B1B12)),
            ),
            Row(
              children: List.generate(5, (index) {
                return Icon(
                  index < r.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                  size: 15,
                  color: index < r.rating ? const Color(0xFFFFA000) : Colors.grey.shade300,
                );
              }),
            ),
          ],
        ),
        if (r.date != null && r.date!.isNotEmpty) ...[
          const SizedBox(height: 2),
          Text(r.date!, style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
        ],
        const SizedBox(height: 6),
        Text(
          r.text,
          style: const TextStyle(fontSize: 12.5, height: 1.4, color: Color(0xFF4E342E)),
        ),
      ],
    );
  }
}
