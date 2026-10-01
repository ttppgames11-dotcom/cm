import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../data/business_data.dart';
import '../models/business_models.dart';
import '../widgets/business_page_header.dart';

/// Business Directory screen — Maratha-owned business listings with search,
/// district/category filters, reviews and a "list your business" form.
/// Mirrors the website's `BusinessDirectoryPage.jsx` (cm-web), adapted to a
/// single-column mobile layout.
class BusinessDirectoryScreen extends StatefulWidget {
  const BusinessDirectoryScreen({super.key});

  @override
  State<BusinessDirectoryScreen> createState() =>
      _BusinessDirectoryScreenState();
}

class _BusinessDirectoryScreenState extends State<BusinessDirectoryScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedDistrict = 'सर्व';
  BusinessCategory _selectedCategory = BusinessCategory.all;

  late List<Business> _businesses;

  @override
  void initState() {
    super.initState();
    _businesses = List.from(BusinessData.businesses);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Business> get _filteredBusinesses {
    return _businesses.where((b) {
      if (_selectedCategory != BusinessCategory.all &&
          b.category != _selectedCategory) {
        return false;
      }
      if (_selectedDistrict != 'सर्व' && b.district != _selectedDistrict) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesName = b.name.toLowerCase().contains(q);
        final matchesServices = b.services.any(
          (s) => s.toLowerCase().contains(q),
        );
        if (!matchesName && !matchesServices) return false;
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
          style: HomeTheme.marathiBody(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _addReview(Business business, int rating, String text) {
    setState(() {
      final index = _businesses.indexWhere((b) => b.id == business.id);
      if (index == -1) return;
      final updatedReviews = [
        BusinessReview(
          memberName: 'तुम्ही (सदस्य)',
          rating: rating,
          text: text,
        ),
        ..._businesses[index].reviews,
      ];
      _businesses[index] = _businesses[index].copyWith(reviews: updatedReviews);
    });
    _showMessage('आपला अभिप्राय यशस्वीरित्या नोंदवला गेला!');
  }

  void _addBusiness(Business business) {
    setState(() => _businesses.insert(0, business));
    _showMessage('व्यवसाय यशस्वीरित्या जोडला गेला! 🚩');
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredBusinesses;

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: Column(
          children: [
            BusinessPageHeader(
              title: 'मराठा बिझनेस डिरेक्टरी',
              subtitle:
                  'महाराष्ट्रासह जगभरातील मराठा उद्योजकांची सत्यापित निर्देशिका.',
              icon: Icons.storefront_rounded,
              accentColor: HomeTheme.accentOrange,
              trailing: GestureDetector(
                onTap: () => _showAddBusinessSheet(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 9,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '+ व्यवसाय जोडा',
                    style: HomeTheme.marathiHeading(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w800,
                      color: HomeTheme.primaryOrange,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  _buildFilters(),
                  const SizedBox(height: 18),
                  if (results.isEmpty)
                    _buildEmptyState()
                  else
                    ...results.map(
                      (b) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _BusinessCard(
                          business: b,
                          onCall:
                              () => _showMessage(
                                '${b.name} ला कॉल करत आहे... 📞',
                              ),
                          onWhatsapp:
                              () => _showMessage(
                                '${b.name} शी व्हॉट्सअ‍ॅपवर संपर्क करत आहे...',
                              ),
                          onReview:
                              () => _showAddReviewSheet(context, business: b),
                        ),
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

  Widget _buildFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: HomeTheme.subtleShadow,
          ),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            style: HomeTheme.marathiBody(fontSize: 13.5),
            decoration: InputDecoration(
              hintText: 'व्यवसायाचे नाव, सेवा किंवा कीवर्ड शोधा...',
              hintStyle: HomeTheme.marathiBody(
                fontSize: 13,
                color: HomeTheme.textMuted,
              ),
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: HomeTheme.textMuted,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: HomeTheme.subtleShadow,
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedDistrict,
              isExpanded: true,
              icon: const Icon(
                Icons.expand_more_rounded,
                color: HomeTheme.textMuted,
              ),
              style: HomeTheme.marathiBody(
                fontSize: 13.5,
                color: HomeTheme.textDark,
              ),
              items:
                  BusinessData.districts
                      .map(
                        (d) => DropdownMenuItem(
                          value: d,
                          child: Text('📍 जिल्हा: $d'),
                        ),
                      )
                      .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _selectedDistrict = v);
              },
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: BusinessCategory.values.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final cat = BusinessCategory.values[i];
              final isSelected = _selectedCategory == cat;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = cat),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color:
                        isSelected
                            ? const Color(0xFFFFF3E0)
                            : const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color:
                          isSelected
                              ? const Color(0xFFC73800)
                              : const Color(0xFFE5E7EB),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(cat.emoji, style: const TextStyle(fontSize: 13)),
                      const SizedBox(width: 6),
                      Text(
                        cat.labelMr,
                        style: HomeTheme.marathiBody(
                          fontSize: 12,
                          fontWeight:
                              isSelected ? FontWeight.w800 : FontWeight.w500,
                          color:
                              isSelected
                                  ? const Color(0xFFC73800)
                                  : const Color(0xFF4B5563),
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
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Text('🏬', style: TextStyle(fontSize: 40)),
          const SizedBox(height: 10),
          Text(
            'कोणताही व्यवसाय आढळला नाही',
            style: HomeTheme.marathiHeading(fontSize: 15),
          ),
          const SizedBox(height: 6),
          Text(
            'कृपया वेगळा जिल्हा किंवा वर्गवारी निवडून पहा.',
            textAlign: TextAlign.center,
            style: HomeTheme.marathiBody(
              fontSize: 12.5,
              color: HomeTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  void _showAddReviewSheet(BuildContext context, {required Business business}) {
    int rating = 5;
    final textController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
              ),
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(22),
                    topRight: Radius.circular(22),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      '⭐ ${business.name} बद्दल अभिप्राय',
                      style: HomeTheme.marathiHeading(
                        fontSize: 16,
                        color: const Color(0xFFC73800),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'रेटिंग (Stars):',
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: List.generate(5, (i) {
                        final starIndex = i + 1;
                        return GestureDetector(
                          onTap: () => setSheetState(() => rating = starIndex),
                          child: Icon(
                            starIndex <= rating
                                ? Icons.star_rounded
                                : Icons.star_border_rounded,
                            color: const Color(0xFFE8631A),
                            size: 30,
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'आपला अनुभव लिहा:',
                      style: HomeTheme.marathiBody(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: textController,
                      maxLines: 3,
                      style: HomeTheme.marathiBody(fontSize: 13),
                      decoration: InputDecoration(
                        hintText:
                            'उत्कृष्ट काम, वेळेत सेवा आणि दर्जेदार गुणवत्ता...',
                        hintStyle: HomeTheme.marathiBody(
                          fontSize: 12.5,
                          color: HomeTheme.textMuted,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text('रद्द'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFC73800),
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () {
                              if (textController.text.trim().isEmpty) return;
                              Navigator.pop(ctx);
                              _addReview(
                                business,
                                rating,
                                textController.text.trim(),
                              );
                            },
                            child: const Text('नोंदवा'),
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

  void _showAddBusinessSheet(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final ownerController = TextEditingController();
    final cityController = TextEditingController();
    final phoneController = TextEditingController();
    final servicesController = TextEditingController();
    var category = BusinessCategory.it;
    var district = BusinessData.districts.firstWhere((d) => d != 'सर्व');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
              ),
              child: DraggableScrollableSheet(
                initialChildSize: 0.85,
                minChildSize: 0.5,
                maxChildSize: 0.95,
                expand: false,
                builder: (ctx, scrollController) {
                  return Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(22),
                        topRight: Radius.circular(22),
                      ),
                    ),
                    child: Form(
                      key: formKey,
                      child: ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '🚩 आपला व्यवसाय नोंदवा',
                                  style: HomeTheme.marathiHeading(
                                    fontSize: 16,
                                    color: const Color(0xFFC73800),
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed: () => Navigator.pop(ctx),
                                icon: const Icon(Icons.close_rounded),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          _formLabel('व्यवसायाचे नाव *'),
                          _formField(
                            controller: nameController,
                            hint: 'उदा. राजगड इंजिनिअरिंग',
                            validator:
                                (v) =>
                                    v == null || v.trim().isEmpty
                                        ? 'आवश्यक'
                                        : null,
                          ),
                          const SizedBox(height: 12),
                          _formLabel('मालक / प्रतिनिधी नाव *'),
                          _formField(
                            controller: ownerController,
                            hint: 'उदा. संजय पाटील',
                            validator:
                                (v) =>
                                    v == null || v.trim().isEmpty
                                        ? 'आवश्यक'
                                        : null,
                          ),
                          const SizedBox(height: 12),
                          _formLabel('वर्गवारी (Category)'),
                          DropdownButtonFormField<BusinessCategory>(
                            value: category,
                            decoration: _dropdownDecoration(),
                            items:
                                BusinessCategory.values
                                    .where((c) => c != BusinessCategory.all)
                                    .map(
                                      (c) => DropdownMenuItem(
                                        value: c,
                                        child: Text('${c.emoji} ${c.labelMr}'),
                                      ),
                                    )
                                    .toList(),
                            onChanged: (v) {
                              if (v != null) {
                                setSheetState(() => category = v);
                              }
                            },
                          ),
                          const SizedBox(height: 12),
                          _formLabel('शहर *'),
                          _formField(
                            controller: cityController,
                            hint: 'उदा. पुणे',
                            validator:
                                (v) =>
                                    v == null || v.trim().isEmpty
                                        ? 'आवश्यक'
                                        : null,
                          ),
                          const SizedBox(height: 12),
                          _formLabel('जिल्हा *'),
                          DropdownButtonFormField<String>(
                            value: district,
                            decoration: _dropdownDecoration(),
                            items:
                                BusinessData.districts
                                    .where((d) => d != 'सर्व')
                                    .map(
                                      (d) => DropdownMenuItem(
                                        value: d,
                                        child: Text(d),
                                      ),
                                    )
                                    .toList(),
                            onChanged: (v) {
                              if (v != null) setSheetState(() => district = v);
                            },
                          ),
                          const SizedBox(height: 12),
                          _formLabel('फोन नंबर *'),
                          _formField(
                            controller: phoneController,
                            hint: '9876500000',
                            keyboardType: TextInputType.phone,
                            validator:
                                (v) =>
                                    v == null || v.trim().isEmpty
                                        ? 'आवश्यक'
                                        : null,
                          ),
                          const SizedBox(height: 12),
                          _formLabel('उपलब्ध सेवा (कॉमा वापरून लिहा)'),
                          _formField(
                            controller: servicesController,
                            hint: 'उदा. वेब डिझाईन, SEO, मोबाइल अ‍ॅप',
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC73800),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              onPressed: () {
                                if (!(formKey.currentState?.validate() ??
                                    false)) {
                                  return;
                                }
                                final services =
                                    servicesController.text
                                        .split(',')
                                        .map((s) => s.trim())
                                        .where((s) => s.isNotEmpty)
                                        .toList();
                                Navigator.pop(ctx);
                                _addBusiness(
                                  Business(
                                    id:
                                        'biz-${DateTime.now().millisecondsSinceEpoch}',
                                    name: nameController.text.trim(),
                                    ownerName: ownerController.text.trim(),
                                    category: category,
                                    city: cityController.text.trim(),
                                    district: district,
                                    phone: phoneController.text.trim(),
                                    whatsapp: phoneController.text.trim(),
                                    services: services,
                                  ),
                                );
                              },
                              child: const Text(
                                'नोंदणी करा 🚀',
                                style: TextStyle(fontWeight: FontWeight.w800),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }

  Widget _formLabel(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(
      text,
      style: HomeTheme.marathiBody(fontSize: 12.5, fontWeight: FontWeight.w600),
    ),
  );

  Widget _formField({
    required TextEditingController controller,
    String? hint,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      style: HomeTheme.marathiBody(fontSize: 13.5),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: HomeTheme.marathiBody(
          fontSize: 12.5,
          color: HomeTheme.textMuted,
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
      ),
    );
  }

  InputDecoration _dropdownDecoration() {
    return InputDecoration(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    );
  }
}

class _BusinessCard extends StatelessWidget {
  const _BusinessCard({
    required this.business,
    required this.onCall,
    required this.onWhatsapp,
    required this.onReview,
  });

  final Business business;
  final VoidCallback onCall;
  final VoidCallback onWhatsapp;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: HomeTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8F2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  business.photoEmoji,
                  style: const TextStyle(fontSize: 26),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      business.name,
                      style: HomeTheme.marathiHeading(fontSize: 15.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'मालक: ${business.ownerName} | 📍 ${business.city} (${business.district})',
                      style: HomeTheme.marathiBody(
                        fontSize: 11.5,
                        color: HomeTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '⭐ ${business.rating.toStringAsFixed(1)}',
                  style: HomeTheme.marathiBody(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF92400E),
                  ),
                ),
              ),
            ],
          ),
          if (business.offer != null) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                border: Border.all(color: const Color(0xFFBBF7D0)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '🎁 सवलत: ${business.offer}',
                style: HomeTheme.marathiBody(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF166534),
                ),
              ),
            ),
          ],
          if (business.services.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'उपलब्ध सेवा:',
              style: HomeTheme.marathiBody(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF9CA3AF),
              ),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children:
                  business.services
                      .map(
                        (s) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            s,
                            style: HomeTheme.marathiBody(
                              fontSize: 11,
                              color: const Color(0xFF374151),
                            ),
                          ),
                        ),
                      )
                      .toList(),
            ),
          ],
          if (business.hours != null) ...[
            const SizedBox(height: 10),
            Text(
              '⏰ वेळ: ${business.hours}',
              style: HomeTheme.marathiBody(
                fontSize: 11.5,
                color: HomeTheme.textMuted,
              ),
            ),
          ],
          if (business.reviews.isNotEmpty) ...[
            const SizedBox(height: 10),
            const Divider(height: 1),
            const SizedBox(height: 10),
            ...business.reviews
                .take(2)
                .map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${'⭐' * r.rating}  ',
                            style: const TextStyle(fontSize: 11),
                          ),
                          TextSpan(
                            text: '${r.memberName}: ',
                            style: HomeTheme.marathiBody(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: HomeTheme.textDark,
                            ),
                          ),
                          TextSpan(
                            text: r.text,
                            style: HomeTheme.marathiBody(
                              fontSize: 11.5,
                              color: HomeTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              if (business.whatsapp != null)
                Expanded(
                  child: _ActionButton(
                    label: '💬 WhatsApp',
                    background: const Color(0xFF25D366),
                    onTap: onWhatsapp,
                  ),
                ),
              if (business.whatsapp != null) const SizedBox(width: 8),
              Expanded(
                child: _ActionButton(
                  label: '📞 कॉल करा',
                  background: const Color(0xFFC73800),
                  onTap: onCall,
                ),
              ),
              const SizedBox(width: 8),
              _ActionButton(
                label: '⭐ अभिप्राय',
                background: const Color(0xFFF3F4F6),
                textColor: const Color(0xFF4B5563),
                onTap: onReview,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.background,
    required this.onTap,
    this.textColor = Colors.white,
  });

  final String label;
  final Color background;
  final Color textColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: HomeTheme.marathiBody(
            fontSize: 11.5,
            fontWeight: FontWeight.w700,
            color: textColor,
          ),
        ),
      ),
    );
  }
}
