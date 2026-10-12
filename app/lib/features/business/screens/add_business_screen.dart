import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../config/business_categories_config.dart';
import '../data/business_data.dart';
import '../models/business_models.dart';
import '../repositories/business_repository.dart';

/// SCREEN B: Add / Edit Your Business Screen (/business/add)
/// Login required.
/// - POST /businesses (or PUT /businesses/:id in edit mode)
/// - Required: name (min 2 chars) and phone (Indian mobile: 10 digits starting 6-9, optional +91/91/0 prefix)
/// - Fields:
///     - owner (default to member's name)
///     - category dropdown from one fixed list in a config file
///     - city
///     - district dropdown (default to member's district)
///     - whatsapp (defaults to phone)
///     - website
///     - services as a tag input sent as an array
///     - offers (multi-line)
///     - gstNumber
///     - udyamNo
/// - Client-side validation + server validationErrors (VALIDATION_ERROR) under fields
/// - Disabled submit button while submitting
/// - On HTTP 201: success message, open new business detail, refresh directory list
/// - Keeps a local draft of the form in SharedPreferences (for create mode)
/// - Never logs tokens or phone numbers
class AddBusinessScreen extends ConsumerStatefulWidget {
  const AddBusinessScreen({
    super.key,
    this.initialBusiness,
  });

  final Business? initialBusiness;

  bool get isEditMode => initialBusiness != null;

  @override
  ConsumerState<AddBusinessScreen> createState() => _AddBusinessScreenState();
}

class _AddBusinessScreenState extends ConsumerState<AddBusinessScreen> {
  static const String _draftKey = 'business_form_draft_v1';

  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _nameController;
  late final TextEditingController _ownerController;
  late final TextEditingController _phoneController;
  late final TextEditingController _whatsappController;
  late final TextEditingController _cityController;
  late final TextEditingController _websiteController;
  late final TextEditingController _offersController;
  late final TextEditingController _gstController;
  late final TextEditingController _udyamController;
  late final TextEditingController _serviceTagController;

  String _selectedCategory = kBusinessCategoryOptions.first.id;
  String _selectedDistrict = 'पुणे';
  final List<String> _services = [];

  bool _isSubmitting = false;
  Map<String, String> _serverErrors = {};
  bool _draftRestored = false;

  @override
  void initState() {
    super.initState();
    final init = widget.initialBusiness;

    _nameController = TextEditingController(text: init?.name ?? '');
    _ownerController = TextEditingController(text: init?.ownerName ?? '');
    _phoneController = TextEditingController(text: init?.phone ?? '');
    _whatsappController = TextEditingController(text: init?.whatsapp ?? '');
    _cityController = TextEditingController(text: init?.city ?? '');
    _websiteController = TextEditingController(text: init?.website ?? '');
    _offersController = TextEditingController(text: init?.offer ?? '');
    _gstController = TextEditingController(text: init?.gstNumber ?? '');
    _udyamController = TextEditingController(text: init?.udyamNo ?? '');
    _serviceTagController = TextEditingController();

    if (init != null) {
      _selectedCategory = init.category.id;
      if (!kBusinessCategoryOptions.any((c) => c.id == _selectedCategory)) {
        _selectedCategory = kBusinessCategoryOptions.first.id;
      }
      _selectedDistrict = init.district.isNotEmpty ? init.district : 'पुणे';
      _services.addAll(init.services);
    } else {
      // Create mode: load defaults from logged-in user and saved draft
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _applyMemberDefaults();
        _loadLocalDraft();
      });
    }

    _nameController.addListener(_autoSaveDraft);
    _phoneController.addListener(_autoSaveDraft);
    _whatsappController.addListener(_autoSaveDraft);
    _cityController.addListener(_autoSaveDraft);
    _websiteController.addListener(_autoSaveDraft);
    _offersController.addListener(_autoSaveDraft);
    _gstController.addListener(_autoSaveDraft);
    _udyamController.addListener(_autoSaveDraft);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _ownerController.dispose();
    _phoneController.dispose();
    _whatsappController.dispose();
    _cityController.dispose();
    _websiteController.dispose();
    _offersController.dispose();
    _gstController.dispose();
    _udyamController.dispose();
    _serviceTagController.dispose();
    super.dispose();
  }

  void _applyMemberDefaults() {
    final profile = ref.read(authControllerProvider).state.profile;
    if (profile == null) return;

    if (_ownerController.text.isEmpty && profile.name.isNotEmpty) {
      _ownerController.text = profile.name;
    }
    if (_cityController.text.isEmpty && profile.city.isNotEmpty) {
      _cityController.text = profile.city;
    }
    if (profile.city.isNotEmpty && _districtsList.contains(profile.city)) {
      setState(() => _selectedDistrict = profile.city);
    }
  }

  List<String> get _districtsList {
    return BusinessData.districts.where((d) => d != 'सर्व').toList();
  }

  Future<void> _loadLocalDraft() async {
    if (widget.isEditMode) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final draftStr = prefs.getString(_draftKey);
      if (draftStr == null || draftStr.isEmpty) return;

      final draft = jsonDecode(draftStr);
      if (draft is Map<String, dynamic>) {
        setState(() {
          if ((draft['name'] as String?)?.isNotEmpty == true) {
            _nameController.text = draft['name'] as String;
          }
          if ((draft['owner'] as String?)?.isNotEmpty == true) {
            _ownerController.text = draft['owner'] as String;
          }
          if ((draft['phone'] as String?)?.isNotEmpty == true) {
            _phoneController.text = draft['phone'] as String;
          }
          if ((draft['whatsapp'] as String?)?.isNotEmpty == true) {
            _whatsappController.text = draft['whatsapp'] as String;
          }
          if ((draft['city'] as String?)?.isNotEmpty == true) {
            _cityController.text = draft['city'] as String;
          }
          if ((draft['category'] as String?)?.isNotEmpty == true) {
            final cat = draft['category'] as String;
            if (kBusinessCategoryOptions.any((c) => c.id == cat)) {
              _selectedCategory = cat;
            }
          }
          if ((draft['district'] as String?)?.isNotEmpty == true) {
            final dist = draft['district'] as String;
            if (_districtsList.contains(dist)) {
              _selectedDistrict = dist;
            }
          }
          if ((draft['website'] as String?)?.isNotEmpty == true) {
            _websiteController.text = draft['website'] as String;
          }
          if ((draft['offers'] as String?)?.isNotEmpty == true) {
            _offersController.text = draft['offers'] as String;
          }
          if ((draft['gstNumber'] as String?)?.isNotEmpty == true) {
            _gstController.text = draft['gstNumber'] as String;
          }
          if ((draft['udyamNo'] as String?)?.isNotEmpty == true) {
            _udyamController.text = draft['udyamNo'] as String;
          }
          if (draft['services'] is List) {
            _services.clear();
            _services.addAll((draft['services'] as List).map((e) => e.toString()));
          }
          _draftRestored = true;
        });
      }
    } catch (_) {
      // Non-critical if draft read fails
    }
  }

  Future<void> _autoSaveDraft() async {
    if (widget.isEditMode) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final draft = {
        'name': _nameController.text,
        'owner': _ownerController.text,
        'phone': _phoneController.text,
        'whatsapp': _whatsappController.text,
        'city': _cityController.text,
        'district': _selectedDistrict,
        'category': _selectedCategory,
        'website': _websiteController.text,
        'offers': _offersController.text,
        'gstNumber': _gstController.text,
        'udyamNo': _udyamController.text,
        'services': _services,
      };
      await prefs.setString(_draftKey, jsonEncode(draft));
    } catch (_) {}
  }

  Future<void> _clearDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_draftKey);
    } catch (_) {}
  }

  void _addServiceTag() {
    final text = _serviceTagController.text.trim();
    if (text.isEmpty) return;
    if (!_services.contains(text)) {
      setState(() {
        _services.add(text);
        _serviceTagController.clear();
      });
      _autoSaveDraft();
    } else {
      _serviceTagController.clear();
    }
  }

  void _removeServiceTag(String tag) {
    setState(() {
      _services.remove(tag);
    });
    _autoSaveDraft();
  }

  bool _isValidIndianMobile(String value) {
    final clean = value.replaceAll(RegExp(r'[\s\-]'), '');
    final regex = RegExp(r'^(?:\+91|91|0)?[6-9]\d{9}$');
    return regex.hasMatch(clean);
  }

  Future<void> _submitForm() async {
    setState(() => _serverErrors = {});

    // Trigger client validations
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    var whatsapp = _whatsappController.text.trim();
    if (whatsapp.isEmpty) {
      whatsapp = phone;
    }

    final owner = _ownerController.text.trim();
    final city = _cityController.text.trim();
    final website = _websiteController.text.trim();
    final offers = _offersController.text.trim();
    final gstNumber = _gstController.text.trim();
    final udyamNo = _udyamController.text.trim();

    final data = <String, dynamic>{
      'name': name,
      'phone': phone,
      'owner': owner,
      'ownerName': owner,
      'category': _selectedCategory,
      'city': city,
      'district': _selectedDistrict,
      'whatsapp': whatsapp,
      if (website.isNotEmpty) 'website': website,
      'services': _services,
      if (offers.isNotEmpty) 'offers': offers,
      if (gstNumber.isNotEmpty) 'gstNumber': gstNumber,
      if (udyamNo.isNotEmpty) 'udyamNo': udyamNo,
    };

    setState(() => _isSubmitting = true);

    try {
      final repo = ref.read(businessRepositoryProvider);

      if (widget.isEditMode) {
        final updated = await repo.updateBusiness(widget.initialBusiness!.id, data);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('व्यवसाय माहिती यशस्वीरित्या अद्ययावत केली!'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
        Navigator.pop(context, updated);
      } else {
        // Create mode: POST /businesses
        final created = await repo.createBusiness(data);
        await _clearDraft();

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('आपला व्यवसाय यशस्वीरित्या नोंदवला गेला!'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );

        // Open newly created business detail & replace or pop
        if (Navigator.canPop(context)) {
          Navigator.pop(context, created);
        }
        context.push('/business/${created.id}');
      }
    } on ApiException catch (e) {
      setState(() {
        _isSubmitting = false;
        if (e.validationErrors != null && e.validationErrors!.isNotEmpty) {
          _serverErrors = e.validationErrors!.map(
            (k, v) => MapEntry(k, v.toString()),
          );
        }
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    } catch (_) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('व्यवसाय नोंदणी सबमिट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'),
            backgroundColor: Color(0xFFD32F2F),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider).state;

    // Login required
    if (!authState.isAuthenticated) {
      return Scaffold(
        backgroundColor: const Color(0xFFFAF7F2),
        appBar: AppBar(
          title: Text(widget.isEditMode ? 'व्यवसाय संपादित करा' : 'आपला व्यवसाय जोडा'),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF2B1B12),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_outline_rounded, size: 64, color: Color(0xFF8B1E1E)),
                const SizedBox(height: 16),
                const Text(
                  'लॉगिन आवश्यक आहे',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF2B1B12)),
                ),
                const SizedBox(height: 8),
                const Text(
                  'व्यवसाय नोंदणी करण्यासाठी कृपया आपल्या मराठा सदस्य खात्यात लॉगिन करा.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13.5, color: Color(0xFF7A6A5D)),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () => context.push('/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('लॉगिन करा', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2B1B12),
        elevation: 0.5,
        title: Text(
          widget.isEditMode ? 'व्यवसाय संपादित करा' : 'आपला व्यवसाय जोडा',
          style: const TextStyle(fontSize: 17.5, fontWeight: FontWeight.w800),
        ),
        actions: [
          if (!widget.isEditMode && _draftRestored)
            TextButton(
              onPressed: () async {
                await _clearDraft();
                setState(() {
                  _nameController.clear();
                  _phoneController.clear();
                  _whatsappController.clear();
                  _websiteController.clear();
                  _offersController.clear();
                  _gstController.clear();
                  _udyamController.clear();
                  _services.clear();
                  _draftRestored = false;
                });
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('मसुदा हटवला.')),
                  );
                }
              },
              child: const Text('मसुदा हटवा', style: TextStyle(color: Color(0xFFD84315), fontSize: 12.5)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info Banner
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3E0),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFCC80)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.stars_rounded, color: Color(0xFFE65100), size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'मराठा समाजाच्या अधिकृत बिझनेस डिरेक्टरीमध्ये मोफत नोंदणी करा आणि आपल्या उद्योगाचा विस्तार करा.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF5D4037), height: 1.35),
                      ),
                    ),
                  ],
                ),
              ),

              if (_serverErrors.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFEBEE),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFCDD2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'सर्व्हर पडताळणी त्रुटी:',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFFC62828)),
                      ),
                      const SizedBox(height: 4),
                      for (final entry in _serverErrors.entries)
                        Text(
                          '• ${entry.key}: ${entry.value}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFFB71C1C)),
                        ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 18),

              // 1. Business Name (Required, min 2 chars)
              _buildFieldLabel('व्यवसायाचे नाव (Business Name) *'),
              TextFormField(
                controller: _nameController,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. शिवसाई फॅमिली रेस्टॉरंट',
                  serverError: _serverErrors['name'] ?? _serverErrors['businessName'],
                ),
                validator: (val) {
                  final text = val?.trim() ?? '';
                  if (text.length < 2) {
                    return 'व्यवसायाचे नाव किमान २ अक्षरे असणे आवश्यक आहे.';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 2. Owner Name (Default to member's name)
              _buildFieldLabel('मालकाचे नाव (Owner / Proprietor)'),
              TextFormField(
                controller: _ownerController,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. अमोल पाटील',
                  serverError: _serverErrors['owner'] ?? _serverErrors['ownerName'],
                ),
              ),

              const SizedBox(height: 16),

              // 3. Category Dropdown (From config file)
              _buildFieldLabel('व्यवसाय वर्गवारी (Category) *'),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                isExpanded: true,
                decoration: _buildInputDecoration(
                  serverError: _serverErrors['category'],
                ),
                items: kBusinessCategoryOptions.map((opt) {
                  return DropdownMenuItem<String>(
                    value: opt.id,
                    child: Text('${opt.emoji} ${opt.labelMr}', style: const TextStyle(fontSize: 13.5)),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _selectedCategory = val);
                    _autoSaveDraft();
                  }
                },
              ),

              const SizedBox(height: 16),

              // 4. Phone (Required Indian mobile)
              _buildFieldLabel('मोबाईल / फोन नंबर *'),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. 9876543210 किंवा +919876543210',
                  serverError: _serverErrors['phone'],
                ),
                validator: (val) {
                  final text = val?.trim() ?? '';
                  if (text.isEmpty) {
                    return 'फोन नंबर आवश्यक आहे.';
                  }
                  if (!_isValidIndianMobile(text)) {
                    return 'कृपया वैध भारतीय १० अंकी मोबाईल नंबर टाका (६ ते ९ ने सुरू होणारा).';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 5. WhatsApp (Defaults to phone)
              _buildFieldLabel('WhatsApp नंबर (ऐच्छिक - रिक्त असल्यास फोन नंबर वापरेल)'),
              TextFormField(
                controller: _whatsappController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'रिक्त ठेवल्यास वरील फोन नंबर वापरेल',
                  serverError: _serverErrors['whatsapp'],
                ),
              ),

              const SizedBox(height: 16),

              // 6. District & City
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('जिल्हा (District) *'),
                        DropdownButtonFormField<String>(
                          value: _selectedDistrict,
                          isExpanded: true,
                          decoration: _buildInputDecoration(
                            serverError: _serverErrors['district'],
                          ),
                          items: _districtsList.map((d) {
                            return DropdownMenuItem<String>(
                              value: d,
                              child: Text(d, style: const TextStyle(fontSize: 13.5)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() => _selectedDistrict = val);
                              _autoSaveDraft();
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel('शहर / गाव (City)'),
                        TextFormField(
                          controller: _cityController,
                          textInputAction: TextInputAction.next,
                          decoration: _buildInputDecoration(
                            hint: 'उदा. पुणे',
                            serverError: _serverErrors['city'],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // 7. Website
              _buildFieldLabel('संकेतस्थळ (Website)'),
              TextFormField(
                controller: _websiteController,
                keyboardType: TextInputType.url,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. https://mybusiness.com',
                  serverError: _serverErrors['website'],
                ),
              ),

              const SizedBox(height: 16),

              // 8. Services as Tag Input (sent as Array)
              _buildFieldLabel('प्रमुख सेवा व उत्पादने (Services / Tags)'),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _serviceTagController,
                      onSubmitted: (_) => _addServiceTag(),
                      decoration: InputDecoration(
                        hintText: 'उदा. मराठी थाळी, केटरिंग',
                        hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADCCF))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFEADCCF))),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _addServiceTag,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B1E1E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('जोडा'),
                  ),
                ],
              ),
              if (_services.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: _services.map((tag) {
                    return Chip(
                      label: Text(tag, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF5D4037))),
                      backgroundColor: const Color(0xFFFAF7F2),
                      side: const BorderSide(color: Color(0xFFEADCCF)),
                      deleteIcon: const Icon(Icons.close_rounded, size: 16, color: Color(0xFF8B1E1E)),
                      onDeleted: () => _removeServiceTag(tag),
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 16),

              // 9. Offers (Multi-line)
              _buildFieldLabel('विशेष ऑफर / सवलत (Offers for Community Members)'),
              TextFormField(
                controller: _offersController,
                maxLines: 2,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. समाज सदस्यांना १०% विशेष सवलत',
                  serverError: _serverErrors['offers'] ?? _serverErrors['offer'],
                ),
              ),

              const SizedBox(height: 16),

              // 10. GST Number & Udyam Number
              _buildFieldLabel('GST क्रमांक (ऐच्छिक)'),
              TextFormField(
                controller: _gstController,
                textInputAction: TextInputAction.next,
                decoration: _buildInputDecoration(
                  hint: 'उदा. 27AAAAA0000A1Z5',
                  serverError: _serverErrors['gstNumber'],
                ),
              ),

              const SizedBox(height: 16),

              _buildFieldLabel('उद्यम नोंदणी क्रमांक (Udyam Number - ऐच्छिक)'),
              TextFormField(
                controller: _udyamController,
                textInputAction: TextInputAction.done,
                decoration: _buildInputDecoration(
                  hint: 'उदा. UDYAM-MH-01-0000000',
                  serverError: _serverErrors['udyamNo'],
                ),
              ),

              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.shade400,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          widget.isEditMode ? 'बदल जतन करा' : 'व्यवसाय नोंदणी सबमिट करा',
                          style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: Color(0xFF2B1B12),
        ),
      ),
    );
  }

  InputDecoration _buildInputDecoration({
    String? hint,
    String? serverError,
  }) {
    return InputDecoration(
      hintText: hint,
      errorText: serverError,
      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEADCCF)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFEADCCF)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF8B1E1E), width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFD32F2F)),
      ),
    );
  }
}
