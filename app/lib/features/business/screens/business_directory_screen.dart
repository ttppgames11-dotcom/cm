import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../widgets/home/custom_bottom_nav_bar.dart';
import '../data/business_data.dart';
import '../models/business_models.dart';

/// Business Screen (व्यवसाय निर्देशिका)
/// Implements the comprehensive Maratha business directory mirroring the reference UI:
/// - Hero Header with sunset Shivaji Maharaj backdrop and Marathi tagline
/// - Search & Filter Bar
/// - Horizontal Categories (सर्व, हॉटेल्स, खरेदी, रिअल इस्टेट, आरोग्य सेवा, IT सेवा, इतर)
/// - Metrics Strip (320+ व्यवसाय, 25+ शहरे, 10K+ ग्राहक, + आपला व्यवसाय जोडा)
/// - Business Cards with visual thumbnails, ratings, tags, call/WhatsApp, and details sheet
/// - Native CustomBottomNavBar kept visible at bottom
class BusinessDirectoryScreen extends StatefulWidget {
  const BusinessDirectoryScreen({super.key});

  @override
  State<BusinessDirectoryScreen> createState() => _BusinessDirectoryScreenState();
}

class _BusinessDirectoryScreenState extends State<BusinessDirectoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  BusinessCategory _selectedCategory = BusinessCategory.all;
  String _selectedDistrict = 'सर्व';
  double _minRating = 0.0;
  bool _onlyWithOffers = false;

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
      // Category filter
      if (_selectedCategory != BusinessCategory.all && b.category != _selectedCategory) {
        return false;
      }
      // District filter
      if (_selectedDistrict != 'सर्व' && b.district != _selectedDistrict) {
        return false;
      }
      // Rating filter
      if (_minRating > 0 && b.rating < _minRating) {
        return false;
      }
      // Offers filter
      if (_onlyWithOffers && (b.offer == null || b.offer!.isEmpty)) {
        return false;
      }
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchName = b.name.toLowerCase().contains(q);
        final matchOwner = b.ownerName.toLowerCase().contains(q);
        final matchCity = b.city.toLowerCase().contains(q);
        final matchDesc = (b.description ?? '').toLowerCase().contains(q);
        final matchTags = b.tags.any((t) => t.toLowerCase().contains(q));
        final matchServices = b.services.any((s) => s.toLowerCase().contains(q));
        if (!matchName && !matchOwner && !matchCity && !matchDesc && !matchTags && !matchServices) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  void _showMessage(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(0xFFE65100),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showCallDialog(Business b) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.phone_in_talk_rounded, color: Color(0xFFE65100)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                b.name,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('मालक: ${b.ownerName}'),
            const SizedBox(height: 6),
            Text('स्थान: ${b.city}, ${b.district}'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3E0),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.phone_rounded, color: Color(0xFFE65100), size: 20),
                  const SizedBox(width: 10),
                  Text(
                    b.phone,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('रद्द करा', style: TextStyle(color: Color(0xFF7A6A5D))),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _showMessage('${b.phone} वर कॉल लावत आहे...');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE65100),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            icon: const Icon(Icons.call_rounded, size: 18),
            label: const Text('कॉल करा'),
          ),
        ],
      ),
    );
  }

  void _showWhatsappDialog(Business b) {
    final phone = b.whatsapp ?? b.phone;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.chat_rounded, color: Color(0xFF25D366)),
            SizedBox(width: 10),
            Text('WhatsApp संपर्क', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${b.name} (${b.ownerName}) यांच्याशी WhatsApp वर संवाद साधा:'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.phone_android_rounded, color: Color(0xFF2E7D32), size: 20),
                  const SizedBox(width: 10),
                  Text(
                    phone,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1B5E20)),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('बंद करा', style: TextStyle(color: Color(0xFF7A6A5D))),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              _showMessage('$phone वर WhatsApp चॅट सुरू करत आहे...');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF25D366),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            icon: const Icon(Icons.chat_bubble_rounded, size: 18),
            label: const Text('WhatsApp उघडा'),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        String tempDistrict = _selectedDistrict;
        double tempRating = _minRating;
        bool tempOffers = _onlyWithOffers;

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
                        'फिल्टर्स निवडा (Filters)',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF2B1B12)),
                      ),
                      TextButton(
                        onPressed: () {
                          setModalState(() {
                            tempDistrict = 'सर्व';
                            tempRating = 0.0;
                            tempOffers = false;
                          });
                          setState(() {
                            _selectedDistrict = 'सर्व';
                            _minRating = 0.0;
                            _onlyWithOffers = false;
                          });
                        },
                        child: const Text('रीसेट करा', style: TextStyle(color: Color(0xFFE65100))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // District dropdown
                  const Text('जिल्हा निवडा:', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFEADCCF)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: tempDistrict,
                        isExpanded: true,
                        items: BusinessData.districts
                            .map((d) => DropdownMenuItem(value: d, child: Text('📍 जिल्हा: $d')))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() => tempDistrict = val);
                          }
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Rating filter
                  const Text('किमान रेटिंग (Minimum Rating):', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      for (final r in [0.0, 4.0, 4.5, 4.8]) ...[
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: ChoiceChip(
                              label: Text(r == 0.0 ? 'सर्व' : '$r+ ⭐'),
                              selected: tempRating == r,
                              onSelected: (_) => setModalState(() => tempRating = r),
                              selectedColor: const Color(0xFFE65100),
                              labelStyle: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: tempRating == r ? Colors.white : const Color(0xFF5D4037),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Only with offers switch
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('फक्त विशेष सवलत असलेले (Special Offers)', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                    value: tempOffers,
                    activeColor: const Color(0xFFE65100),
                    onChanged: (val) => setModalState(() => tempOffers = val),
                  ),

                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _selectedDistrict = tempDistrict;
                          _minRating = tempRating;
                          _onlyWithOffers = tempOffers;
                        });
                        Navigator.pop(ctx);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE65100),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('फिल्टर लागू करा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
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

  void _showAddBusinessSheet() {
    final nameCtrl = TextEditingController();
    final ownerCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    BusinessCategory cat = BusinessCategory.restaurant;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
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
                top: 20,
                bottom: MediaQuery.paddingOf(context).bottom + 20,
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
                        decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'आपला व्यवसाय जोडा (List Your Business)',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                    ),
                    const SizedBox(height: 4),
                    const Text('मराठा समाजाच्या अधिकृत बिझनेस डिरेक्टरीमध्ये मोफत नोंदणी करा.', style: TextStyle(fontSize: 12, color: Color(0xFF7A6A5D))),
                    const SizedBox(height: 16),

                    TextField(
                      controller: nameCtrl,
                      decoration: InputDecoration(
                        labelText: 'व्यवसायाचे नाव *',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: ownerCtrl,
                      decoration: InputDecoration(
                        labelText: 'मालकाचे नाव *',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: phoneCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'मोबाईल क्रमांक *',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: cityCtrl,
                      decoration: InputDecoration(
                        labelText: 'शहर / जिल्हा *',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<BusinessCategory>(
                      value: cat,
                      decoration: InputDecoration(
                        labelText: 'वर्गवारी (Category)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: BusinessCategory.values
                          .where((c) => c != BusinessCategory.all)
                          .map((c) => DropdownMenuItem(value: c, child: Text('${c.labelMr} ${c.emoji}')))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) setModalState(() => cat = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: descCtrl,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'व्यवसायाची माहिती / सेवा',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 18),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          if (nameCtrl.text.trim().isEmpty || ownerCtrl.text.trim().isEmpty) {
                            _showMessage('कृपया नाव आणि मालकाचे नाव भरा.');
                            return;
                          }
                          final newBiz = Business(
                            id: 'biz-${DateTime.now().millisecondsSinceEpoch}',
                            name: nameCtrl.text.trim(),
                            ownerName: ownerCtrl.text.trim(),
                            category: cat,
                            city: cityCtrl.text.trim().isEmpty ? 'महाराष्ट्र' : cityCtrl.text.trim(),
                            district: cityCtrl.text.trim().isEmpty ? 'महाराष्ट्र' : cityCtrl.text.trim(),
                            phone: phoneCtrl.text.trim().isEmpty ? '९८७६५४३२१०' : phoneCtrl.text.trim(),
                            whatsapp: phoneCtrl.text.trim(),
                            photoEmoji: cat.emoji,
                            rating: 5.0,
                            reviewsCount: 1,
                            tags: [cat.labelMr],
                            description: descCtrl.text.trim().isEmpty ? 'मराठा उद्योजकांचा दर्जेदार व्यवसाय.' : descCtrl.text.trim(),
                          );
                          setState(() {
                            _businesses.insert(0, newBiz);
                          });
                          Navigator.pop(ctx);
                          _showMessage('व्यवसाय यशस्वीरित्या जोडला गेला! 🚩');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B1E1E),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('व्यवसाय नोंदणी सबमिट करा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
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

  void _showBusinessDetailsSheet(Business b) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollCtrl) {
            return SingleChildScrollView(
              controller: scrollCtrl,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header with thumbnail & title
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildThemedThumbnail(b, size: 76),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              b.name,
                              style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                            ),
                            const SizedBox(height: 4),
                            Text(b.ownerName, style: const TextStyle(fontSize: 13, color: Color(0xFF5D4037), fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on_rounded, size: 15, color: Color(0xFFE65100)),
                                const SizedBox(width: 4),
                                Text('${b.city}, महाराष्ट्र', style: const TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Rating and Reviews strip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF7F2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF1E5D8)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Color(0xFFFFA000), size: 20),
                            const SizedBox(width: 4),
                            Text('${b.rating}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                            Text(' (${b.reviewsCount} पुनरावलोकने)', style: const TextStyle(fontSize: 12, color: Color(0xFF7A6A5D))),
                          ],
                        ),
                        Container(width: 1, height: 20, color: const Color(0xFFE0D0C0)),
                        const Row(
                          children: [
                            Icon(Icons.verified_rounded, color: Color(0xFF2E7D32), size: 18),
                            SizedBox(width: 4),
                            Text('सत्यापित व्यवसाय', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF2E7D32))),
                          ],
                        ),
                      ],
                    ),
                  ),

                  if (b.offer != null && b.offer!.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFCC80)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.local_offer_rounded, color: Color(0xFFE65100), size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'विशेष सवलत: ${b.offer}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFFBF360C)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  const Text('व्यवसायाबद्दल माहिती:', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: Color(0xFF2B1B12))),
                  const SizedBox(height: 6),
                  Text(
                    b.description ?? 'मराठा समाजातील अग्रगण्य आणि विश्वासू व्यावसायिक सेवा.',
                    style: const TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF4E342E)),
                  ),

                  if (b.services.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text('प्रमुख सेवा व उत्पादने:', style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, color: Color(0xFF2B1B12))),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: b.services
                          .map((s) => Chip(
                                label: Text(s),
                                backgroundColor: const Color(0xFFFBF4EC),
                                labelStyle: const TextStyle(fontSize: 12, color: Color(0xFF5D4037), fontWeight: FontWeight.w600),
                                side: const BorderSide(color: Color(0xFFE8D7C8)),
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                              ))
                          .toList(),
                    ),
                  ],

                  if (b.hours != null) ...[
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, size: 18, color: Color(0xFF7A6A5D)),
                        const SizedBox(width: 8),
                        Text('वेळ: ${b.hours}', style: const TextStyle(fontSize: 13, color: Color(0xFF5D4037))),
                      ],
                    ),
                  ],

                  const SizedBox(height: 20),

                  // Action Buttons row inside sheet
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            _showCallDialog(b);
                          },
                          icon: const Icon(Icons.call_rounded, size: 18, color: Color(0xFFE65100)),
                          label: const Text('कॉल करा', style: TextStyle(color: Color(0xFFE65100), fontWeight: FontWeight.w700)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFE65100)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(ctx);
                            _showWhatsappDialog(b);
                          },
                          icon: const Icon(Icons.chat_rounded, size: 18),
                          label: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.w700)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildThemedThumbnail(Business b, {double size = 96}) {
    Color bgGradient1;
    Color bgGradient2;
    IconData defaultIcon;

    switch (b.category) {
      case BusinessCategory.restaurant:
        bgGradient1 = const Color(0xFFBF360C);
        bgGradient2 = const Color(0xFFE65100);
        defaultIcon = Icons.restaurant_rounded;
        break;
      case BusinessCategory.it:
        bgGradient1 = const Color(0xFF0D47A1);
        bgGradient2 = const Color(0xFF1976D2);
        defaultIcon = Icons.laptop_chromebook_rounded;
        break;
      case BusinessCategory.realEstate:
        bgGradient1 = const Color(0xFF3E2723);
        bgGradient2 = const Color(0xFF6D4C41);
        defaultIcon = Icons.apartment_rounded;
        break;
      case BusinessCategory.healthcare:
        bgGradient1 = const Color(0xFF006064);
        bgGradient2 = const Color(0xFF00838F);
        defaultIcon = Icons.medical_services_rounded;
        break;
      case BusinessCategory.shopping:
        bgGradient1 = const Color(0xFF880E4F);
        bgGradient2 = const Color(0xFFC2185B);
        defaultIcon = Icons.shopping_bag_rounded;
        break;
      default:
        bgGradient1 = const Color(0xFF4A148C);
        bgGradient2 = const Color(0xFF7B1FA2);
        defaultIcon = Icons.business_rounded;
        break;
    }

    return Container(
      width: size,
      height: size * 1.15,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [bgGradient1, bgGradient2],
        ),
        boxShadow: [
          BoxShadow(
            color: bgGradient1.withValues(alpha: 0.25),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(defaultIcon, size: size * 0.45, color: Colors.white.withValues(alpha: 0.85)),
          Positioned(
            bottom: 6,
            right: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: Text(b.photoEmoji, style: TextStyle(fontSize: size * 0.18)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final results = _filteredBusinesses;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _businesses = List.from(BusinessData.businesses);
            });
            _showMessage('व्यवसाय सूची ताजी केली.');
          },
          color: const Color(0xFFE65100),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            slivers: [
              // 1. Sleek Shivaji Maharaj Header matching reference UI
              SliverToBoxAdapter(
                child: _buildHeroHeader(context),
              ),

              // 2. Search & Filter Bar
              SliverToBoxAdapter(
                child: _buildSearchBar(),
              ),

              // 3. Category Horizontal Pills
              SliverToBoxAdapter(
                child: _buildCategoryPills(),
              ),

              // 4. Statistics & Add Business Strip
              SliverToBoxAdapter(
                child: _buildStatsStrip(),
              ),

              // 5. Section Heading
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'समाजातील व्यवसाय (${results.length})',
                        style: const TextStyle(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      InkWell(
                        onTap: () {
                          setState(() {
                            _selectedCategory = BusinessCategory.all;
                            _selectedDistrict = 'सर्व';
                            _searchQuery = '';
                            _searchController.clear();
                          });
                        },
                        child: const Row(
                          children: [
                            Text(
                              'सर्व पहा',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFFE65100),
                              ),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFFE65100)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 6. Business Listing Cards
              if (results.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(40.0),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          const Text(
                            'कोणताही व्यवसाय आढळला नाही.\nकृपया वेगळा शब्द किंवा वर्गवारी निवडा.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Color(0xFF7A6A5D), fontSize: 13.5),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final b = results[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: _buildBusinessCard(b),
                        );
                      },
                      childCount: results.length,
                    ),
                  ),
                ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 24),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const CustomBottomNavBar(
        currentIndex: 2, // "व्यवसाय" active tab
      ),
    );
  }

  Widget _buildHeroHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 12, 16, 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFFF3E0),
            Color(0xFFFFE0B2),
            Color(0xFFFFCC80),
          ],
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF2B1B12), size: 24),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Business',
                  style: GoogleFonts.merriweather(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF8B1E1E),
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'आपल्या समाजाचा, आपल्या उद्योगाचा अभिमान',
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF5D4037),
                  ),
                ),
              ],
            ),
          ),
          // Saffron flag / Fort icon graphic
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.8),
              shape: BoxShape.circle,
            ),
            child: const Text('🚩', style: TextStyle(fontSize: 22)),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
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
            const Icon(Icons.search_rounded, color: Color(0xFF8D7B6F), size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                style: const TextStyle(fontSize: 13.5),
                decoration: const InputDecoration(
                  hintText: 'व्यवसाय, दुकान किंवा सेवा शोधा...',
                  hintStyle: TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            if (_searchQuery.isNotEmpty)
              IconButton(
                icon: const Icon(Icons.clear_rounded, size: 18),
                onPressed: () {
                  _searchController.clear();
                  setState(() => _searchQuery = '');
                },
              ),
            Container(width: 1, height: 24, color: const Color(0xFFEADCCF)),
            TextButton.icon(
              onPressed: _showFilterSheet,
              icon: const Icon(Icons.tune_rounded, size: 18, color: Color(0xFF8B1E1E)),
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

  Widget _buildCategoryPills() {
    final categories = [
      BusinessCategory.all,
      BusinessCategory.restaurant,
      BusinessCategory.shopping,
      BusinessCategory.realEstate,
      BusinessCategory.healthcare,
      BusinessCategory.it,
      BusinessCategory.other,
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        child: Row(
          children: categories.map((cat) {
            final isSelected = _selectedCategory == cat;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: InkWell(
                onTap: () => setState(() => _selectedCategory = cat),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFE65100) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFFE65100) : const Color(0xFFEADCCF),
                      width: 1.0,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isSelected
                            ? const Color(0xFFE65100).withValues(alpha: 0.28)
                            : Colors.black.withValues(alpha: 0.03),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Icon(
                        cat.icon,
                        size: 18,
                        color: isSelected ? Colors.white : const Color(0xFF8B1E1E),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        cat.labelMr,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : const Color(0xFF2B1B12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildStatsStrip() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 4, 14, 6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFF1E5D8)),
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
            // Stat 1: 320+ व्यवसाय
            Expanded(
              child: _buildStatItem(
                icon: Icons.storefront_rounded,
                value: '320+',
                label: 'समाजातील व्यवसाय',
              ),
            ),
            Container(width: 1, height: 26, color: const Color(0xFFF0E4D7)),

            // Stat 2: 25+ शहरे
            Expanded(
              child: _buildStatItem(
                icon: Icons.location_on_rounded,
                value: '25+',
                label: 'शहरे',
              ),
            ),
            Container(width: 1, height: 26, color: const Color(0xFFF0E4D7)),

            // Stat 3: 10K+ ग्राहक
            Expanded(
              child: _buildStatItem(
                icon: Icons.groups_rounded,
                value: '10K+',
                label: 'ग्राहक जोडले',
              ),
            ),

            // Stat 4: + आपला व्यवसाय जोडा
            ElevatedButton(
              onPressed: () async {
                try {
                  final newBiz = await context.push<Business?>('/business/add');
                  if (newBiz != null && mounted) {
                    setState(() {
                      _businesses.insert(0, newBiz);
                    });
                  }
                } catch (_) {
                  _showAddBusinessSheet();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B1E1E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.add_rounded, size: 16),
                  SizedBox(width: 2),
                  Text(
                    'आपला व्यवसाय\nजोडा',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, height: 1.1),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: const Color(0xFFD32F2F), size: 16),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFF2B1B12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 9.5,
            fontWeight: FontWeight.w600,
            color: Color(0xFF7A6A5D),
          ),
        ),
      ],
    );
  }

  Widget _buildBusinessCard(Business b) {
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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left: Themed Visual Thumbnail
          _buildThemedThumbnail(b, size: 94),

          const SizedBox(width: 12),

          // Right: Content Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title & Bookmark row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        b.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B1B12),
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                  ],
                ),

                // Rating & Owner row
                const SizedBox(height: 3),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFFFFE082)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 13, color: Color(0xFFFFA000)),
                          const SizedBox(width: 3),
                          Text(
                            '${b.rating} (${b.reviewsCount})',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFB78103),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        b.ownerName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF5D4037), fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),

                // Location Pin
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFD32F2F)),
                    const SizedBox(width: 3),
                    Text(
                      '${b.city}, महाराष्ट्र',
                      style: const TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D)),
                    ),
                  ],
                ),

                // Tag Chips
                const SizedBox(height: 6),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: b.tags.take(3).map((tag) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tag,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFD84315),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                // Description
                const SizedBox(height: 6),
                Text(
                  b.description ?? 'शुद्ध, स्वादिष्ट आणि घरगुती जेवणाची अनुभूती.',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11.5,
                    height: 1.3,
                    color: Color(0xFF4E342E),
                  ),
                ),

                // Actions row: Call | WhatsApp | Details
                const SizedBox(height: 10),
                Row(
                  children: [
                    InkWell(
                      onTap: () => _showCallDialog(b),
                      borderRadius: BorderRadius.circular(8),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: Row(
                          children: [
                            Icon(Icons.call_rounded, size: 14, color: Color(0xFF5D4037)),
                            SizedBox(width: 3),
                            Text(
                              'कॉल करा',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF5D4037)),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () => _showWhatsappDialog(b),
                      borderRadius: BorderRadius.circular(8),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: Row(
                          children: [
                            Icon(Icons.chat_bubble_rounded, size: 14, color: Color(0xFF25D366)),
                            SizedBox(width: 3),
                            Text(
                              'WhatsApp',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF25D366)),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Spacer(),
                    InkWell(
                      onTap: () async {
                        try {
                          final updated = await context.push<Business?>(
                            '/business/${b.id}',
                            extra: b,
                          );
                          if (updated != null && mounted) {
                            setState(() {
                              final idx = _businesses.indexWhere((x) => x.id == updated.id);
                              if (idx != -1) {
                                _businesses[idx] = updated;
                              }
                            });
                          }
                        } catch (_) {
                          _showBusinessDetailsSheet(b);
                        }
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE65100),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'तपशील पहा',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.arrow_forward_rounded, size: 13, color: Colors.white),
                          ],
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
    );
  }
}
