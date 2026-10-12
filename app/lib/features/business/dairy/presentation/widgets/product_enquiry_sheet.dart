import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import '../../domain/models/dairy_product.dart';
import '../../domain/models/dairy_enquiry.dart';
import '../../domain/utils/dairy_utils.dart';
import '../providers/dairy_providers.dart';

/// Product Enquiry Bottom Sheet
/// Matches the exact design language:
/// - White bottom sheet with large rounded top corners (Radius.circular(24))
/// - Drag handle
/// - Title "ऑर्डर / चौकशी", Subtitle "उत्पादनाचे नाव"
/// - Fields with labels in bold orange:
///   - "तुमचे नाव"
///   - "मोबाईल क्रमांक"
///   - "प्रमाण"
///   - "डिलिव्हरीचे शहर"
///   - "संदेश (पर्यायी)"
/// - Full-width orange gradient button "चौकशी पाठवा"
/// - Small underlined link "रद्द करा"
class ProductEnquirySheet extends ConsumerStatefulWidget {
  final DairyProductItem product;

  const ProductEnquirySheet({
    super.key,
    required this.product,
  });

  @override
  ConsumerState<ProductEnquirySheet> createState() => _ProductEnquirySheetState();
}

class _ProductEnquirySheetState extends ConsumerState<ProductEnquirySheet> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _quantityController;
  late TextEditingController _cityController;
  late TextEditingController _messageController;

  final FocusNode _nameFocus = FocusNode();
  final FocusNode _phoneFocus = FocusNode();
  final FocusNode _quantityFocus = FocusNode();
  final FocusNode _cityFocus = FocusNode();
  final FocusNode _messageFocus = FocusNode();

  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final draft = ref.read(dairyProductEnquiryDraftProvider);
    String initialName = draft.name;
    String initialCity = draft.deliveryCity;
    try {
      final auth = ref.read(authControllerProvider);
      final profile = auth.state.profile;
      if (initialName.isEmpty && profile?.name != null) {
        initialName = profile!.name;
      }
      if (initialCity.isEmpty && profile?.city != null) {
        initialCity = profile!.city;
      }
    } catch (_) {}

    _nameController = TextEditingController(text: initialName);
    _phoneController = TextEditingController(text: draft.phone);
    _quantityController = TextEditingController(
      text: draft.quantity.isNotEmpty ? draft.quantity : '१',
    );
    _cityController = TextEditingController(text: initialCity);
    _messageController = TextEditingController(text: draft.message);

    _nameController.addListener(_saveDraft);
    _phoneController.addListener(_saveDraft);
    _quantityController.addListener(_saveDraft);
    _cityController.addListener(_saveDraft);
    _messageController.addListener(_saveDraft);

    _nameFocus.addListener(() => setState(() {}));
    _phoneFocus.addListener(() => setState(() {}));
    _quantityFocus.addListener(() => setState(() {}));
    _cityFocus.addListener(() => setState(() {}));
    _messageFocus.addListener(() => setState(() {}));
  }

  void _saveDraft() {
    ref.read(dairyProductEnquiryDraftProvider.notifier).state =
        ref.read(dairyProductEnquiryDraftProvider).copyWith(
              name: _nameController.text,
              phone: _phoneController.text,
              quantity: _quantityController.text,
              deliveryCity: _cityController.text,
              message: _messageController.text,
            );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _quantityController.dispose();
    _cityController.dispose();
    _messageController.dispose();

    _nameFocus.dispose();
    _phoneFocus.dispose();
    _quantityFocus.dispose();
    _cityFocus.dispose();
    _messageFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final repo = ref.read(dairyRepositoryProvider);
    final enquiry = DairyEnquiry(
      productId: widget.product.id,
      name: _nameController.text.trim(),
      phone: DairyUtils.normalizeIndianPhone(_phoneController.text.trim()) ??
          _phoneController.text.trim(),
      quantity: _quantityController.text.trim(),
      deliveryCity: _cityController.text.trim(),
      message: _messageController.text.trim(),
    );

    try {
      await repo.submitProductEnquiry(enquiry);

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF1B5E20),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${widget.product.name} साठी चौकशी यशस्वीरीत्या नोंदवली गेली!',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'चौकशी नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      });
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Drag Handle
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // 2. Sheet Header: Title "ऑर्डर / चौकशी", Subtitle "उत्पादनाचे नाव"
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFF0E6),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.shopping_bag_outlined,
                          color: Color(0xFFE65100),
                          size: 24,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ऑर्डर / चौकशी',
                            style: GoogleFonts.mukta(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF2B1B12),
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            widget.product.name.isNotEmpty
                                ? widget.product.name
                                : 'उत्पादनाचे नाव',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF7A6A5D),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Color(0xFF7A6A5D)),
                      onPressed: () => Navigator.of(context).pop(),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Error Message if any
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFFCDD2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded,
                            color: Color(0xFFD32F2F), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: Color(0xFFC62828),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                // 3. Field: "तुमचे नाव"
                _buildOrangeFieldLabel('तुमचे नाव *'),
                const SizedBox(height: 6),
                _buildStyledTextFormField(
                  controller: _nameController,
                  focusNode: _nameFocus,
                  hint: 'उदा. सागर मोहिते',
                  icon: Icons.person_outline_rounded,
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'कृपया तुमचे नाव प्रविष्ट करा'
                      : null,
                ),
                const SizedBox(height: 14),

                // 4. Field: "मोबाईल क्रमांक"
                _buildOrangeFieldLabel('मोबाईल क्रमांक *'),
                const SizedBox(height: 6),
                _buildStyledTextFormField(
                  controller: _phoneController,
                  focusNode: _phoneFocus,
                  hint: '१० अंकी मोबाईल नंबर',
                  icon: Icons.phone_android_rounded,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'कृपया मोबाईल नंबर प्रविष्ट करा';
                    }
                    if (!DairyUtils.isValidIndianPhone(v.trim())) {
                      return 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),

                // 5. Row: "प्रमाण" and "डिलिव्हरीचे शहर"
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildOrangeFieldLabel('प्रमाण'),
                          const SizedBox(height: 6),
                          _buildStyledTextFormField(
                            controller: _quantityController,
                            focusNode: _quantityFocus,
                            hint: 'उदा. २ पाकिटे',
                            icon: Icons.layers_outlined,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildOrangeFieldLabel('डिलिव्हरीचे शहर'),
                          const SizedBox(height: 6),
                          _buildStyledTextFormField(
                            controller: _cityController,
                            focusNode: _cityFocus,
                            hint: 'उदा. पुणे / सांगली',
                            icon: Icons.location_city_rounded,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // 6. Field: "संदेश (पर्यायी)"
                _buildOrangeFieldLabel('संदेश (पर्यायी)'),
                const SizedBox(height: 6),
                _buildStyledTextFormField(
                  controller: _messageController,
                  focusNode: _messageFocus,
                  hint: 'घरपोच वितरण किंवा अधिक माहिती विचारा...',
                  icon: Icons.chat_bubble_outline_rounded,
                  maxLines: 2,
                ),

                const SizedBox(height: 22),

                // 7. Full-width orange gradient button "चौकशी पाठवा"
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.zero,
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFFE65100),
                            Color(0xFFFF6D00),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFE65100).withValues(alpha: 0.32),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'चौकशी पाठवा',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 0.3,
                                ),
                              ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // 8. Small underlined link "रद्द करा"
                Center(
                  child: InkWell(
                    onTap: () => Navigator.of(context).pop(),
                    borderRadius: BorderRadius.circular(6),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      child: Text(
                        'रद्द करा',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF7A6A5D),
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOrangeFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.mukta(
        fontSize: 13.5,
        fontWeight: FontWeight.w800,
        color: const Color(0xFFE65100),
      ),
    );
  }

  Widget _buildStyledTextFormField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    final isFocused = focusNode.hasFocus;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isFocused
              ? const Color(0xFFE65100)
              : const Color(0xFFEADCCF),
          width: isFocused ? 1.6 : 1.2,
        ),
        boxShadow: isFocused
            ? [
                BoxShadow(
                  color: const Color(0xFFE65100).withValues(alpha: 0.14),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
      ),
      child: Row(
        crossAxisAlignment:
            maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          Container(
            width: 38,
            height: 38,
            margin: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: isFocused
                  ? const Color(0xFFFFF0E6)
                  : const Color(0xFFFAF7F2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 19,
              color: isFocused
                  ? const Color(0xFFE65100)
                  : const Color(0xFF8D7B6F),
            ),
          ),
          Expanded(
            child: TextFormField(
              controller: controller,
              focusNode: focusNode,
              keyboardType: keyboardType,
              inputFormatters: inputFormatters,
              validator: validator,
              maxLines: maxLines,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF2B1B12),
              ),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                  color: Color(0xFF9E8E81),
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 12,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
