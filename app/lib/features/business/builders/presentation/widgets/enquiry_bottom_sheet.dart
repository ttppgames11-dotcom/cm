import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/core/network/api_client.dart';
import '../../domain/models/builder_group.dart';
import '../../domain/utils/builder_utils.dart';
import '../providers/builders_providers.dart';

class EnquiryBottomSheet extends ConsumerStatefulWidget {
  const EnquiryBottomSheet({
    super.key,
    required this.group,
  });

  final BuilderGroup group;

  static Future<void> show(BuildContext context, BuilderGroup group) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EnquiryBottomSheet(group: group),
    );
  }

  @override
  ConsumerState<EnquiryBottomSheet> createState() => _EnquiryBottomSheetState();
}

class _EnquiryBottomSheetState extends ConsumerState<EnquiryBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _budgetController;
  late TextEditingController _cityController;
  late TextEditingController _messageController;

  bool _isSubmitting = false;
  String? _serverError;

  @override
  void initState() {
    super.initState();
    final draft = ref.read(builderEnquiryDraftProvider);
    _nameController = TextEditingController(text: draft.name);
    _phoneController = TextEditingController(text: draft.phone);
    _budgetController = TextEditingController(text: draft.budget);
    _cityController = TextEditingController(text: draft.preferredCity);
    _messageController = TextEditingController(text: draft.message);
  }

  @override
  void dispose() {
    _saveDraft();
    _nameController.dispose();
    _phoneController.dispose();
    _budgetController.dispose();
    _cityController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _saveDraft() {
    ref.read(builderEnquiryDraftProvider.notifier).state = EnquiryDraft(
      name: _nameController.text,
      phone: _phoneController.text,
      budget: _budgetController.text,
      preferredCity: _cityController.text,
      message: _messageController.text,
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isSubmitting) return;

    setState(() {
      _isSubmitting = true;
      _serverError = null;
    });

    final name = _nameController.text.trim();
    final phone = BuilderUtils.normalizeIndianPhone(_phoneController.text.trim()) ?? _phoneController.text.trim();
    final budget = _budgetController.text.trim();
    final preferredCity = _cityController.text.trim();
    final message = _messageController.text.trim();

    try {
      final repo = ref.read(buildersRepositoryProvider);
      await repo.submitEnquiry(
        widget.group.primaryProjectId,
        name: name,
        phone: phone,
        budget: budget.isNotEmpty ? budget : null,
        preferredCity: preferredCity.isNotEmpty ? preferredCity : null,
        message: message.isNotEmpty ? message : null,
      );

      // Reset draft on successful submission
      ref.read(builderEnquiryDraftProvider.notifier).state = const EnquiryDraft();

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('चौकशी यशस्वीरीत्या पाठवली गेली! बिल्डर आपल्याशी लवकरच संपर्क साधेल.'),
            backgroundColor: Color(0xFF2E7D32),
            duration: Duration(seconds: 3),
          ),
        );
      }
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        ref.read(builderEnquiryUnsupportedProvider.notifier).state = true;
        if (mounted) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('चौकशी फॉर्म सध्या अनुपलब्ध आहे. कृपया थेट कॉल किंवा व्हॉट्सॲप करा.'),
              backgroundColor: Color(0xFFD84315),
            ),
          );
        }
        return;
      }

      setState(() {
        _serverError = e.message;
      });
    } catch (e) {
      setState(() {
        _serverError = 'चौकशी पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      });
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Form(
        key: _formKey,
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

              // Title Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.mail_outline_rounded,
                      color: Color(0xFFE65100),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'प्रकल्प चौकशी (Project Enquiry)',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2B1B12),
                          ),
                        ),
                        Text(
                          widget.group.developer,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF8D6E63),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (_serverError != null) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFEBEE),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFEF9A9A)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFC62828), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _serverError!,
                          style: const TextStyle(color: Color(0xFFC62828), fontSize: 12.5),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Name Field
              const Text('आपले नाव *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF5D4037))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'कृपया आपले नाव प्रविष्ट करा.';
                  }
                  return null;
                },
                decoration: InputDecoration(
                  hintText: 'उदा. अमोल जाधव',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.5),
                  prefixIcon: const Icon(Icons.person_outline_rounded, size: 20, color: Color(0xFF7A6A5D)),
                  filled: true,
                  fillColor: const Color(0xFFFAF7F2),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Phone Field (required Indian mobile)
              const Text('मोबाईल नंबर *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF5D4037))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'मोबाईल नंबर आवश्यक आहे.';
                  }
                  if (!BuilderUtils.isValidIndianPhone(val.trim())) {
                    return 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा.';
                  }
                  return null;
                },
                decoration: InputDecoration(
                  hintText: 'उदा. 9822011223',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.5),
                  prefixIcon: const Icon(Icons.phone_outlined, size: 20, color: Color(0xFF7A6A5D)),
                  filled: true,
                  fillColor: const Color(0xFFFAF7F2),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Budget & Preferred City Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('बजेट (पर्यायी)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF5D4037))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _budgetController,
                          decoration: InputDecoration(
                            hintText: 'उदा. ₹६० लाख',
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                            prefixIcon: const Icon(Icons.currency_rupee_rounded, size: 18, color: Color(0xFF7A6A5D)),
                            filled: true,
                            fillColor: const Color(0xFFFAF7F2),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('पसंतीचे शहर', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF5D4037))),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _cityController,
                          decoration: InputDecoration(
                            hintText: 'उदा. पुणे / नाशिक',
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                            prefixIcon: const Icon(Icons.location_city_rounded, size: 18, color: Color(0xFF7A6A5D)),
                            filled: true,
                            fillColor: const Color(0xFFFAF7F2),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Message
              const Text('संदेश / आवश्यकता (पर्यायी)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF5D4037))),
              const SizedBox(height: 6),
              TextFormField(
                controller: _messageController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'आपल्याला कोणत्या प्रकारचा फ्लॅट/प्लॉट हवा आहे ते लिहा...',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  filled: true,
                  fillColor: const Color(0xFFFAF7F2),
                  contentPadding: const EdgeInsets.all(12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'चौकशी पाठवा (Send Enquiry)',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
