import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:app/core/network/api_client.dart';
import '../../config/referral_categories_config.dart';
import '../../domain/models/referral_member_recipient.dart';
import '../../domain/models/referral_status.dart';
import '../providers/referral_providers.dart';
import '../widgets/member_search_picker.dart';

class CreateReferralScreen extends ConsumerStatefulWidget {
  const CreateReferralScreen({super.key});

  @override
  ConsumerState<CreateReferralScreen> createState() => _CreateReferralScreenState();
}

class _CreateReferralScreenState extends ConsumerState<CreateReferralScreen> {
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController();
  final _clientNameController = TextEditingController();
  final _clientPhoneController = TextEditingController();
  final _clientEmailController = TextEditingController();
  final _valueController = TextEditingController();
  final _notesController = TextEditingController();

  String? _selectedCategory;
  ReferralMemberRecipient? _selectedRecipient;
  bool _isAnyMember = true; // Default: Any member
  ReferralUrgency _selectedUrgency = ReferralUrgency.medium;
  bool _consentChecked = false;
  bool _isSubmitting = false;

  // Server-side validation errors mapping: field -> error message
  Map<String, String> _serverErrors = {};

  @override
  void initState() {
    super.initState();
    if (kReferralCategories.isNotEmpty) {
      _selectedCategory = kReferralCategories.first;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _clientNameController.dispose();
    _clientPhoneController.dispose();
    _clientEmailController.dispose();
    _valueController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Map<String, String> _extractValidationErrors(ApiException e) {
    final result = <String, String>{};
    final raw = e.data?['validationErrors'];
    if (raw is List) {
      for (final item in raw) {
        if (item is Map) {
          final field = item['field']?.toString();
          final err = item['error']?.toString() ?? item['message']?.toString();
          if (field != null && err != null) {
            result[field] = err;
          }
        }
      }
    } else if (raw is Map) {
      raw.forEach((k, v) {
        result[k.toString()] = v.toString();
      });
    }
    return result;
  }

  Future<void> _submit() async {
    setState(() => _serverErrors = {});

    if (!_consentChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया ग्राहकाची संमती मान्य करा.'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
      return;
    }

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final repo = ref.read(referralRepositoryProvider);
      final double? parsedVal = double.tryParse(_valueController.text.trim());

      final newReferral = await repo.createReferral(
        title: _titleController.text.trim(),
        clientName: _clientNameController.text.trim(),
        clientPhone: _clientPhoneController.text.trim(),
        category: _selectedCategory,
        recipientId: _isAnyMember ? null : _selectedRecipient?.id,
        recipientName: _isAnyMember ? null : _selectedRecipient?.name,
        clientEmail: _clientEmailController.text.trim().isNotEmpty
            ? _clientEmailController.text.trim()
            : null,
        urgency: getUrgencyApiValue(_selectedUrgency),
        value: parsedVal,
        notes: _notesController.text.trim().isNotEmpty
            ? _notesController.text.trim()
            : null,
      );

      // Prepend to top of tracker list
      ref.read(referralsProvider.notifier).prependReferral(newReferral);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Expanded(child: Text('संदर्भ यशस्वीरीत्या नोंदवला गेला!')),
              ],
            ),
            backgroundColor: Color(0xFF2E7D32),
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.pop();
      }
    } on ApiException catch (e) {
      if (mounted) {
        final serverErrors = _extractValidationErrors(e);
        setState(() {
          _serverErrors = serverErrors;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: const Color(0xFFC62828),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('त्रुटी आली: $e'),
            backgroundColor: const Color(0xFFC62828),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitEnabled = _consentChecked && !_isSubmitting;

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
          'नवीन व्यवसाय संदर्भ',
          style: GoogleFonts.mukta(
            fontSize: 21,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF8B1E1E),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Lead Info Header Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7F2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFFCCBC)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.lightbulb_outline_rounded, color: Color(0xFFE65100), size: 24),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'आपल्या ग्राहकाची माहिती भरून आपल्या मराठा बांधवांना व्यवसाय मिळवून द्या.',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF5D4037),
                          height: 1.35,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 1. Title (Required)
              _buildFieldLabel('संबंधित व्यवसाय / लीड शीर्षक', isRequired: true),
              TextFormField(
                controller: _titleController,
                decoration: _inputDecoration(
                  hintText: 'उदा. हॉटेलसाठी किराणा माल पुरवठादार हवा',
                  icon: Icons.title_rounded,
                  serverError: _serverErrors['title'],
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'कृपया संदर्भाचे शीर्षक टाका.';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 2. Category Dropdown
              _buildFieldLabel('व्यवसाय वर्ग (Category)'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFEADBCE)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCategory,
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF8D7B6F)),
                    items: kReferralCategories.map((cat) {
                      return DropdownMenuItem<String>(
                        value: cat,
                        child: Text(
                          cat,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2B1B12),
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCategory = val);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // 3. Give to (Member Search Picker)
              _buildFieldLabel('हा संदर्भ कोणाला द्यायचा आहे?'),
              MemberSearchPicker(
                selectedMember: _selectedRecipient,
                isAnyMember: _isAnyMember,
                onSelected: (member, isAny) {
                  setState(() {
                    _selectedRecipient = member;
                    _isAnyMember = isAny;
                  });
                },
              ),

              const SizedBox(height: 20),
              const Divider(color: Color(0xFFEADBCE)),
              const SizedBox(height: 12),

              const Text(
                'ग्राहकाची माहिती (Client Details)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2B1B12),
                ),
              ),
              const SizedBox(height: 14),

              // 4. Client Name (Required)
              _buildFieldLabel('ग्राहकाचे नाव', isRequired: true),
              TextFormField(
                controller: _clientNameController,
                decoration: _inputDecoration(
                  hintText: 'उदा. राहुल सावंत',
                  icon: Icons.person_outline_rounded,
                  serverError: _serverErrors['clientName'],
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'ग्राहकाचे नाव आवश्यक आहे.';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 5. Client Phone (Required, Indian phone validation)
              _buildFieldLabel('ग्राहकाचा मोबाईल नंबर', isRequired: true),
              TextFormField(
                controller: _clientPhoneController,
                keyboardType: TextInputType.phone,
                decoration: _inputDecoration(
                  hintText: '१० अंकी मोबाईल (उदा. 9822012345)',
                  icon: Icons.phone_android_rounded,
                  serverError: _serverErrors['clientPhone'],
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'मोबाईल नंबर आवश्यक आहे.';
                  }
                  if (!isValidIndianPhone(val)) {
                    return 'कृपया वैध १० अंकी भारतीय मोबाईल नंबर टाका (६-९ ने सुरू होणारा).';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 6. Client Email (Optional)
              _buildFieldLabel('ग्राहकाचा ईमेल (पर्यायी)'),
              TextFormField(
                controller: _clientEmailController,
                keyboardType: TextInputType.emailAddress,
                decoration: _inputDecoration(
                  hintText: 'उदा. rahul@example.com',
                  icon: Icons.email_outlined,
                  serverError: _serverErrors['clientEmail'],
                ),
                validator: (val) {
                  if (val != null && val.trim().isNotEmpty) {
                    final emailRegex = RegExp(r'^[\w\.\-]+@[\w\-]+\.[\w\-]+$');
                    if (!emailRegex.hasMatch(val.trim())) {
                      return 'कृपया वैध ईमेल पत्ता टाका.';
                    }
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // 7. Urgency Chips
              _buildFieldLabel('प्राधान्य / तातडी (Urgency)'),
              Row(
                children: [
                  _buildUrgencyChip(ReferralUrgency.low, 'कमी'),
                  const SizedBox(width: 8),
                  _buildUrgencyChip(ReferralUrgency.medium, 'मध्यम'),
                  const SizedBox(width: 8),
                  _buildUrgencyChip(ReferralUrgency.high, 'जास्त'),
                ],
              ),

              const SizedBox(height: 16),

              // 8. Value (Optional number)
              _buildFieldLabel('अंदाजे मूल्य ₹ (पर्यायी)'),
              TextFormField(
                controller: _valueController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d*'))],
                decoration: _inputDecoration(
                  hintText: 'उदा. २५०००',
                  icon: Icons.currency_rupee_rounded,
                  serverError: _serverErrors['value'],
                ),
              ),

              const SizedBox(height: 16),

              // 9. Notes (Multi-line)
              _buildFieldLabel('अधिक माहिती / टीप (Notes)'),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: _inputDecoration(
                  hintText: 'ग्राहकाच्या गरजेबद्दल थोडक्यात सांगा...',
                  icon: Icons.notes_rounded,
                  serverError: _serverErrors['notes'],
                ),
              ),

              const SizedBox(height: 20),

              // 10. Consent Checkbox (REQUIRED)
              Container(
                decoration: BoxDecoration(
                  color: _consentChecked ? const Color(0xFFE8F5E9) : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _consentChecked ? const Color(0xFF81C784) : const Color(0xFFEADBCE),
                    width: 1.2,
                  ),
                ),
                child: CheckboxListTile(
                  value: _consentChecked,
                  onChanged: (val) {
                    setState(() => _consentChecked = val ?? false);
                  },
                  activeColor: const Color(0xFF2E7D32),
                  title: const Text(
                    'ग्राहकाने संपर्क करण्यास संमती दिली आहे',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                  subtitle: const Text(
                    'या सदस्याकडून फोन किंवा मेसेज आल्यास ग्राहकाची हरकत नाही.',
                    style: TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D)),
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                ),
              ),

              const SizedBox(height: 26),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: isSubmitEnabled ? _submit : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    disabledBackgroundColor: Colors.grey.shade300,
                    foregroundColor: Colors.white,
                    disabledForegroundColor: Colors.grey.shade500,
                    elevation: isSubmitEnabled ? 3 : 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'संदर्भ पाठवा',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
              color: Color(0xFF3E2723),
            ),
          ),
          if (isRequired)
            const Text(
              ' *',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
        ],
      ),
    );
  }

  Widget _buildUrgencyChip(ReferralUrgency urgency, String label) {
    final isSelected = _selectedUrgency == urgency;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedUrgency = urgency),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? getUrgencyBgColor(urgency) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? getUrgencyColor(urgency) : const Color(0xFFEADBCE),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? getUrgencyColor(urgency) : const Color(0xFF5D4037),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hintText,
    required IconData icon,
    String? serverError,
  }) {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      hintText: hintText,
      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
      prefixIcon: Icon(icon, color: const Color(0xFF8D7B6F), size: 20),
      errorText: serverError,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFEADBCE)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFEADBCE)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF8B1E1E), width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Colors.red),
      ),
    );
  }
}
