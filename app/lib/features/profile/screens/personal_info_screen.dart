import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../auth/providers/auth_provider.dart';
import '../providers/profile_provider.dart';
import '../widgets/profile_subpage_header.dart';

/// "वैयक्तिक माहिती" — the member edits their own name, mobile number and
/// city. "Save" sends the change to the server; the profile, Home card and
/// avatar initial update as soon as it is accepted. The email address is
/// shown but cannot be changed here (it is the account's login and
/// password-reset address).
class PersonalInfoScreen extends ConsumerStatefulWidget {
  const PersonalInfoScreen({super.key});

  @override
  ConsumerState<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends ConsumerState<PersonalInfoScreen> {
  static final _phonePattern = RegExp(r'^[+0-9][0-9\s-]{6,18}$');

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _cityController;
  String? _nameError;
  String? _phoneError;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(profileProvider).user;
    _nameController = TextEditingController(text: user.name);
    _phoneController = TextEditingController(text: user.phone);
    _cityController = TextEditingController(text: user.city);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    FocusScope.of(context).unfocus();
    final user = ref.read(profileProvider).user;
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final city = _cityController.text.trim();

    String? nameError;
    String? phoneError;
    if (name.isEmpty) {
      nameError = 'नाव रिकामे ठेवता येत नाही.';
    }
    if (phone.isEmpty) {
      if (user.phone.isNotEmpty) {
        phoneError = 'मोबाईल नंबर रिकामा ठेवता येत नाही.';
      }
    } else if (!_phonePattern.hasMatch(phone)) {
      phoneError = 'कृपया वैध मोबाईल नंबर टाका.';
    }
    setState(() {
      _nameError = nameError;
      _phoneError = phoneError;
    });
    if (nameError != null || phoneError != null) return;

    if (name == user.name && phone == user.phone && city == user.city) {
      showProfileMessage(context, 'कोणताही बदल केलेला नाही.');
      return;
    }

    setState(() => _saving = true);
    final auth = ref.read(authControllerProvider);
    final saved = await auth.updateProfile(
      name: name,
      phone: phone,
      city: city,
    );
    if (!mounted) return;
    setState(() => _saving = false);

    if (saved) {
      showProfileMessage(context, 'तुमची माहिती जतन केली गेली आहे ✓');
    } else {
      final message =
          auth.state.errorMessage ??
          'माहिती जतन करता आली नाही. कृपया पुन्हा प्रयत्न करा.';
      if (auth.state.errorCode == 'PHONE_IN_USE' ||
          auth.state.errorCode == 'INVALID_PHONE') {
        setState(() => _phoneError = message);
      } else {
        showProfileMessage(context, message);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileData = ref.watch(profileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'वैयक्तिक माहिती',
              subtitle: 'तुमची प्राथमिक माहिती पहा व संपादित करा',
              icon: Icons.person_outline_rounded,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  _field(
                    label: 'पूर्ण नाव',
                    icon: Icons.badge_outlined,
                    controller: _nameController,
                    errorText: _nameError,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 14),
                  _field(
                    label: 'मोबाईल नंबर',
                    icon: Icons.phone_outlined,
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    errorText: _phoneError,
                  ),
                  const SizedBox(height: 14),
                  _field(
                    label: 'शहर',
                    icon: Icons.location_on_outlined,
                    controller: _cityController,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 8),
                  if (profileData.email.isNotEmpty)
                    _readOnlyRow('ईमेल (बदलता येत नाही)', profileData.email),
                  _readOnlyRow('सदस्य ओळख क्रमांक', profileData.user.id),
                  _readOnlyRow(
                    'सदस्यत्व स्तर',
                    profileData.user.role.displayName,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE84C10),
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: const Color(0xFFF3B79E),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: _saving ? null : _save,
                      child:
                          _saving
                              ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                              : Text(
                                'बदल जतन करा',
                                style: GoogleFonts.mukta(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                ),
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

  Widget _field({
    required String label,
    required IconData icon,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.none,
    String? errorText,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      enabled: !_saving,
      style: GoogleFonts.mukta(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF1F2937),
      ),
      decoration: InputDecoration(
        labelText: label,
        errorText: errorText,
        errorMaxLines: 2,
        labelStyle: GoogleFonts.mukta(
          fontSize: 13,
          color: const Color(0xFF6B7280),
        ),
        prefixIcon: Icon(icon, size: 19, color: const Color(0xFFE84C10)),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE84C10), width: 1.4),
        ),
      ),
    );
  }

  Widget _readOnlyRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.mukta(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF6B7280),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.mukta(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1F2937),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
