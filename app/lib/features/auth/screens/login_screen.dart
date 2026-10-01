import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../../core/auth/auth_scope.dart';
import '../../../core/routing/route_state.dart';
import '../../../core/config/api_config.dart';
import '../models/user_role.dart';

/// UX-redesigned Maratha-themed Login Screen.
/// Key UX improvements applied:
/// - Simplified hero header (centered logo, no 3-column clutter)
/// - Removed role dropdown (defaults to member; no user friction)
/// - Removed pre-filled credentials (builds trust)
/// - Animated orange border on field focus
/// - Inline validation errors under fields (not just SnackBar)
/// - Removed "Remember Me" (mobile sessions always persist)
/// - textInputAction.next / done between fields
/// - Demo login styled as a proper Guest Preview CTA
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _loginIdController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpPhoneController = TextEditingController();
  final _otpCodeController = TextEditingController();

  final _loginIdFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _otpPhoneFocus = FocusNode();
  final _otpCodeFocus = FocusNode();

  final bool _isOtpMode =
      false; // OTP login is not offered until the backend supports it
  bool _otpSent = false;
  bool _isSendingOtp = false;
  String? _sentOtpCode;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  bool _obscurePassword = true;
  bool _isSubmitting = false;
  bool _isGoogleSigningIn = false;
  String? _loginIdError;
  String? _passwordError;
  String? _otpPhoneError;
  String? _otpCodeError;

  // Google Sign-In instance — scopes kept minimal (profile + email only).
  final _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    // Web client ID: makes Google return an ID token the backend can verify.
    serverClientId:
        ApiConfig.googleWebClientId.isEmpty
            ? null
            : ApiConfig.googleWebClientId,
  );

  // Animate the card sliding up on entry
  late final AnimationController _entryAnim;
  late final Animation<double> _fadeAnim;
  late final Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _entryAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 540),
    );
    _fadeAnim = CurvedAnimation(parent: _entryAnim, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entryAnim, curve: Curves.easeOutCubic));
    _entryAnim.forward();

    _loginIdFocus.addListener(() => setState(() {}));
    _passwordFocus.addListener(() => setState(() {}));
    _otpPhoneFocus.addListener(() => setState(() {}));
    _otpCodeFocus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _entryAnim.dispose();
    _loginIdController.dispose();
    _passwordController.dispose();
    _otpPhoneController.dispose();
    _otpCodeController.dispose();
    _loginIdFocus.dispose();
    _passwordFocus.dispose();
    _otpPhoneFocus.dispose();
    _otpCodeFocus.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    setState(() {
      _otpPhoneError = null;
      _otpCodeError = null;
    });

    final phone = _otpPhoneController.text.trim();
    if (phone.isEmpty) {
      setState(() => _otpPhoneError = 'कृपया १०-अंकी मोबाईल नंबर टाका');
      return;
    }
    final digitsOnly = phone.replaceAll(RegExp(r'\D'), '');
    if (digitsOnly.length < 10) {
      setState(() => _otpPhoneError = 'कृपया वैध १०-अंकी मोबाईल नंबर टाका');
      return;
    }

    setState(() => _isSendingOtp = true);
    try {
      final auth = AuthScope.of(context);
      final otp = await auth.requestPasswordResetOtp(phone);
      if (!mounted) return;
      setState(() {
        _isSendingOtp = false;
        _otpSent = true;
        _sentOtpCode = otp;
        _otpCodeController.text = otp;
        _resendCooldown = 30;
      });

      _startResendTimer();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_outline, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(child: Text('सुरक्षा OTP $phone वर पाठवला: $otp')),
            ],
          ),
          backgroundColor: const Color(0xFF16A34A),
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
        ),
      );

      _otpCodeFocus.requestFocus();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isSendingOtp = false;
        _otpPhoneError = 'OTP पाठवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      });
    }
  }

  void _startResendTimer() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_resendCooldown > 0) {
        setState(() => _resendCooldown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _submit() async {
    if (_isOtpMode) {
      await _submitOtp();
      return;
    }

    // Clear inline errors
    setState(() {
      _loginIdError = null;
      _passwordError = null;
    });

    // Inline validation
    bool valid = true;
    final loginId = _loginIdController.text.trim();
    final password = _passwordController.text;

    if (loginId.isEmpty) {
      setState(() => _loginIdError = 'कृपया मोबाईल, ईमेल किंवा सदस्य ID टाका');
      valid = false;
    }
    if (password.isEmpty) {
      setState(() => _passwordError = 'कृपया पासवर्ड टाका');
      valid = false;
    }
    if (!valid) return;

    setState(() => _isSubmitting = true);
    try {
      final auth = AuthScope.of(context);
      final success = await auth.login(
        loginId: loginId,
        password: password,
        role: UserRole.member, // Role auto-assigned; not asked from user
      );
      if (!mounted) return;
      if (success) {
        context.go(takePendingDeepLink('/home'));
      } else {
        final err = auth.state.errorMessage ?? '';
        final code = auth.state.errorCode;
        if (code == 'USER_NOT_FOUND' ||
            code == 'USER_NOT_REGISTERED' ||
            err.contains('नोंदणी करा') ||
            err.contains('आढळला नाही') ||
            err.contains('not fetch')) {
          _showNotRegisteredDialog();
        } else {
          setState(() => _passwordError = err);
        }
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _submitOtp() async {
    setState(() {
      _otpPhoneError = null;
      _otpCodeError = null;
    });

    final phone = _otpPhoneController.text.trim();
    final otp = _otpCodeController.text.trim();
    bool valid = true;

    if (phone.isEmpty) {
      setState(() => _otpPhoneError = 'कृपया १०-अंकी मोबाईल नंबर टाका');
      valid = false;
    }
    if (!_otpSent) {
      setState(() => _otpCodeError = 'कृपया प्रथम "OTP मिळवा" वर टॅप करा');
      valid = false;
    } else if (otp.isEmpty) {
      setState(() => _otpCodeError = 'कृपया ६-अंकी OTP टाका');
      valid = false;
    } else if (otp.length < 4) {
      setState(() => _otpCodeError = 'कृपया वैध OTP टाका');
      valid = false;
    }

    if (!valid) return;

    setState(() => _isSubmitting = true);
    try {
      final auth = AuthScope.of(context);
      final success = await auth.login(
        loginId: phone,
        password: otp,
        role: UserRole.member,
      );
      if (!mounted) return;
      if (success) {
        context.go(takePendingDeepLink('/home'));
      } else {
        final err = auth.state.errorMessage ?? '';
        final code = auth.state.errorCode;
        if (code == 'USER_NOT_FOUND' ||
            code == 'USER_NOT_REGISTERED' ||
            err.contains('नोंदणी करा') ||
            err.contains('आढळला नाही') ||
            err.contains('not fetch')) {
          _showNotRegisteredDialog();
        } else {
          setState(() => _otpCodeError = err);
        }
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  _buildHeroHeader(),
                  const SizedBox(height: 12),
                  _buildLoginCard(),
                  const SizedBox(height: 16),
                  // Shown only when the build has a Google OAuth client ID;
                  // without one the button cannot work (reviewers test it).
                  if (ApiConfig.googleWebClientId.isNotEmpty) ...[
                    _buildGoogleSignInButton(),
                    const SizedBox(height: 16),
                    _buildOrDivider(),
                    const SizedBox(height: 16),
                  ],
                  _buildGuestPreviewButton(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ─── Hero Header ────────────────────────────────────────────────────────────

  Widget _buildHeroHeader() {
    return Column(
      children: [
        // Crest / Logo
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF2C1810),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFE84C10).withAlpha(55),
                blurRadius: 24,
                spreadRadius: 2,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/connect_maratha_crest.webp',
              fit: BoxFit.cover,
              errorBuilder:
                  (_, __, ___) => const Icon(
                    Icons.shield_rounded,
                    color: Color(0xFFE5C07B),
                    size: 44,
                  ),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // App Name
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Connect ',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF2B1B12),
                  letterSpacing: 0.3,
                ),
              ),
              TextSpan(
                text: 'मराठा',
                style: GoogleFonts.mukta(
                  fontSize: 27,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFFE84C10),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 6),

        // Tagline
        Text(
          'आधुनिक युगातील आधुनिक संघटन',
          textAlign: TextAlign.center,
          style: GoogleFonts.mukta(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF7A6A5D),
            letterSpacing: 0.2,
          ),
        ),

        const SizedBox(height: 8),

        // Motto pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFFBEFE3),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFF5DFC9)),
          ),
          child: Text(
            '" स्वराज्य हेच आमची ओळख "',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF9E360B),
            ),
          ),
        ),
      ],
    );
  }

  // ─── Login Card ─────────────────────────────────────────────────────────────

  Widget _buildLoginCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 28,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Fort watermark
            Positioned(
              top: -8,
              right: -8,
              width: 140,
              height: 130,
              child: Opacity(
                opacity: 0.10,
                child: Image.asset(
                  'assets/images/login_card_fort_watermark.webp',
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const SizedBox(),
                ),
              ),
            ),

            // Card content
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Red accent bar
                  Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE84C10),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Headline
                  Wrap(
                    children: [
                      Text(
                        'आपल्या खात्यात ',
                        style: GoogleFonts.mukta(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      Text(
                        'प्रवेश करा',
                        style: GoogleFonts.mukta(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFE84C10),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'समाजाचे अधिकृत डिजिटल व्यासपीठ',
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                  const SizedBox(height: 18),

                  if (!_isOtpMode) ...[
                    // Mobile / Member ID field
                    _buildFieldLabel('मोबाईल, ईमेल किंवा सदस्य ID'),
                    const SizedBox(height: 7),
                    _buildTextField(
                      controller: _loginIdController,
                      focusNode: _loginIdFocus,
                      hint: 'मोबाईल / ईमेल / सदस्य ID (M1001)',
                      icon: Icons.person_outline_rounded,
                      keyboardType: TextInputType.text,
                      textInputAction: TextInputAction.next,
                      inputFormatters: [
                        FilteringTextInputFormatter.deny(RegExp(r'^\s+')),
                      ],
                      onFieldSubmitted: (_) => _passwordFocus.requestFocus(),
                      errorText: _loginIdError,
                      onChanged: (_) {
                        if (_loginIdError != null) {
                          setState(() => _loginIdError = null);
                        }
                      },
                    ),
                    const SizedBox(height: 18),

                    // Password field
                    _buildFieldLabel('पासवर्ड'),
                    const SizedBox(height: 7),
                    _buildPasswordField(),
                    const SizedBox(height: 14),

                    // Forgot password (right aligned)
                    Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: _isSubmitting ? null : _showForgotPasswordInfo,
                        child: Text(
                          'पासवर्ड विसरलात?',
                          style: GoogleFonts.mukta(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFFE84C10),
                          ),
                        ),
                      ),
                    ),
                  ] else ...[
                    // OTP Mode Form
                    _buildOtpForm(),
                  ],

                  const SizedBox(height: 20),

                  // Primary Login Button
                  _buildLoginButton(),
                  const SizedBox(height: 20),

                  // Divider
                  _buildDivider(),
                  const SizedBox(height: 18),

                  // Register row
                  _buildRegisterRow(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── OTP Mode Form ──────────────────────────────────────────────────────────

  Widget _buildOtpForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Phone number field
        _buildFieldLabel('नोंदणीकृत मोबाईल नंबर'),
        const SizedBox(height: 7),
        _buildTextField(
          controller: _otpPhoneController,
          focusNode: _otpPhoneFocus,
          hint: '१०-अंकी मोबाईल नंबर (उदा. 9876543210)',
          icon: Icons.phone_iphone_rounded,
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
          errorText: _otpPhoneError,
          onChanged: (_) {
            if (_otpPhoneError != null) {
              setState(() => _otpPhoneError = null);
            }
          },
        ),
        const SizedBox(height: 12),

        // OTP Action Bar (Send / Resend OTP button)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                _otpSent ? 'OTP मोबाईलवर पाठवला आहे' : 'लॉगिनसाठी OTP मागवा',
                style: GoogleFonts.mukta(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF7A6A5D),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            InkWell(
              onTap: _isSendingOtp || _resendCooldown > 0 ? null : _sendOtp,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color:
                      _resendCooldown > 0
                          ? const Color(0xFFF3ECE4)
                          : const Color(0xFFFFF2EC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color:
                        _resendCooldown > 0
                            ? const Color(0xFFE6DCD1)
                            : const Color(0xFFFFD4C0),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isSendingOtp)
                      const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 1.8,
                          color: Color(0xFFE84C10),
                        ),
                      )
                    else
                      Icon(
                        _otpSent ? Icons.refresh_rounded : Icons.send_rounded,
                        size: 14,
                        color:
                            _resendCooldown > 0
                                ? const Color(0xFF9CA3AF)
                                : const Color(0xFFE84C10),
                      ),
                    const SizedBox(width: 5),
                    Text(
                      _resendCooldown > 0
                          ? 'पुन्हा पाठवा (${_resendCooldown}s)'
                          : _otpSent
                          ? 'OTP पुन्हा पाठवा'
                          : 'OTP मिळवा',
                      style: GoogleFonts.mukta(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color:
                            _resendCooldown > 0
                                ? const Color(0xFF9CA3AF)
                                : const Color(0xFFE84C10),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // OTP Code field
        _buildFieldLabel('सुरक्षा OTP प्रविष्ट करा'),
        const SizedBox(height: 7),
        _buildTextField(
          controller: _otpCodeController,
          focusNode: _otpCodeFocus,
          hint: '६-अंकी सुरक्षा OTP',
          icon: Icons.pin_rounded,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          onFieldSubmitted: (_) => _submit(),
          errorText: _otpCodeError,
          onChanged: (_) {
            if (_otpCodeError != null) {
              setState(() => _otpCodeError = null);
            }
          },
        ),

        if (_sentOtpCode != null) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF16A34A),
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'चाचणी OTP: $_sentOtpCode (स्वयंचलित भरला आहे)',
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF15803D),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  // ─── Field Widgets ───────────────────────────────────────────────────────────

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.mukta(
        fontSize: 13,
        fontWeight: FontWeight.w800,
        color: const Color(0xFFE84C10),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    TextInputAction textInputAction = TextInputAction.done,
    List<TextInputFormatter>? inputFormatters,
    void Function(String)? onFieldSubmitted,
    void Function(String)? onChanged,
    String? errorText,
  }) {
    final isFocused = focusNode.hasFocus;
    final hasError = errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(13),
            border: Border.all(
              color:
                  hasError
                      ? const Color(0xFFDC2626)
                      : isFocused
                      ? const Color(0xFFE84C10)
                      : const Color(0xFFE5E7EB),
              width: isFocused || hasError ? 1.8 : 1.2,
            ),
            boxShadow:
                isFocused
                    ? [
                      BoxShadow(
                        color: const Color(0xFFE84C10).withAlpha(28),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ]
                    : [],
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                margin: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color:
                      isFocused
                          ? const Color(0xFFFEECE5)
                          : const Color(0xFFF5EFE9),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(
                  icon,
                  color:
                      isFocused
                          ? const Color(0xFFE84C10)
                          : const Color(0xFF8B6A52),
                  size: 20,
                ),
              ),
              Expanded(
                child: TextFormField(
                  controller: controller,
                  focusNode: focusNode,
                  keyboardType: keyboardType,
                  textInputAction: textInputAction,
                  inputFormatters: inputFormatters,
                  onFieldSubmitted: onFieldSubmitted,
                  onChanged: onChanged,
                  style: GoogleFonts.mukta(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1F2937),
                  ),
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFFBBB3AD),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 13,
                    ),
                    errorStyle: const TextStyle(height: 0),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Inline error
        if (hasError)
          Padding(
            padding: const EdgeInsets.only(top: 5, left: 4),
            child: Text(
              errorText,
              style: GoogleFonts.mukta(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFFDC2626),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPasswordField() {
    final isFocused = _passwordFocus.hasFocus;
    final hasError = _passwordError != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(13),
            border: Border.all(
              color:
                  hasError
                      ? const Color(0xFFDC2626)
                      : isFocused
                      ? const Color(0xFFE84C10)
                      : const Color(0xFFE5E7EB),
              width: isFocused || hasError ? 1.8 : 1.2,
            ),
            boxShadow:
                isFocused
                    ? [
                      BoxShadow(
                        color: const Color(0xFFE84C10).withAlpha(28),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ]
                    : [],
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                margin: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color:
                      isFocused
                          ? const Color(0xFFFEECE5)
                          : const Color(0xFFF5EFE9),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(
                  Icons.lock_outline_rounded,
                  color:
                      isFocused
                          ? const Color(0xFFE84C10)
                          : const Color(0xFF8B6A52),
                  size: 20,
                ),
              ),
              Expanded(
                child: TextFormField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  onChanged: (_) {
                    if (_passwordError != null) {
                      setState(() => _passwordError = null);
                    }
                  },
                  style: GoogleFonts.mukta(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1F2937),
                  ),
                  decoration: InputDecoration(
                    hintText: 'पासवर्ड प्रविष्ट करा',
                    hintStyle: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFFBBB3AD),
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 13,
                    ),
                    errorStyle: const TextStyle(height: 0),
                  ),
                ),
              ),
              // Visibility toggle — always visible
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap:
                      () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Icon(
                      _obscurePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color:
                          isFocused
                              ? const Color(0xFFE84C10)
                              : const Color(0xFF9CA3AF),
                      size: 20,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Inline error
        if (hasError)
          Padding(
            padding: const EdgeInsets.only(top: 5, left: 4),
            child: Text(
              _passwordError!,
              style: GoogleFonts.mukta(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFFDC2626),
              ),
            ),
          ),
      ],
    );
  }

  // ─── Login Button ────────────────────────────────────────────────────────────

  Widget _buildLoginButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFFF5C1A), Color(0xFFD63B08)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFE84C10).withAlpha(90),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child:
              _isSubmitting
                  ? const SizedBox(
                    height: 22,
                    width: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: Colors.white,
                    ),
                  )
                  : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isOtpMode ? 'OTP सह लॉगिन करा' : 'लॉगिन करा',
                        style: GoogleFonts.mukta(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ],
                  ),
        ),
      ),
    );
  }

  // ─── Divider ─────────────────────────────────────────────────────────────────

  Widget _buildDivider() {
    return Row(
      children: [
        const Expanded(child: Divider(color: Color(0xFFEEE8E2), thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            'किंवा',
            style: GoogleFonts.mukta(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF9CA3AF),
            ),
          ),
        ),
        const Expanded(child: Divider(color: Color(0xFFEEE8E2), thickness: 1)),
      ],
    );
  }

  // ─── Register Row ────────────────────────────────────────────────────────────

  Widget _buildRegisterRow() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF9F5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFDE8DA)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFFBEFE6),
              borderRadius: BorderRadius.circular(9),
            ),
            child: const Icon(
              Icons.person_add_alt_1_rounded,
              color: Color(0xFFD63B08),
              size: 20,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'नवीन सदस्य आहात?',
              style: GoogleFonts.mukta(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF374151),
              ),
            ),
          ),
          InkWell(
            onTap: _isSubmitting ? null : () => context.push('/register'),
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFD63B08), width: 1.3),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'नोंदणी करा',
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFD63B08),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    size: 14,
                    color: Color(0xFFD63B08),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── OR Divider ─────────────────────────────────────────────────────────────

  Widget _buildOrDivider() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.transparent, const Color(0xFFD5C9BC)],
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'किंवा',
                style: GoogleFonts.mukta(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF9CA3AF),
                  height: 1.1,
                ),
              ),
              Text(
                'or',
                style: GoogleFonts.mukta(
                  fontSize: 10,
                  color: const Color(0xFFBFB8B0),
                  height: 1.1,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFFD5C9BC), Colors.transparent],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ─── Google Sign-In Button ───────────────────────────────────────────────────

  Widget _buildGoogleSignInButton() {
    return GestureDetector(
      onTap: (_isSubmitting || _isGoogleSigningIn) ? null : _handleGoogleSignIn,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE0D5CC), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Google 'G' logo drawn with coloured RichText — no package needed
            _googleGLogo(),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Google ने सुरू ठेवा',
                  style: GoogleFonts.mukta(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1F2937),
                    height: 1.1,
                  ),
                ),
                Text(
                  'Continue with Google',
                  style: GoogleFonts.mukta(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF6B7280),
                    height: 1.1,
                  ),
                ),
              ],
            ),
            const Spacer(),
            _isGoogleSigningIn
                ? const SizedBox(
                  width: 26,
                  height: 26,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFF4285F4),
                    ),
                  ),
                )
                : Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F3F4),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 13,
                    color: Color(0xFF5F6368),
                  ),
                ),
          ],
        ),
      ),
    );
  }

  /// Hand-drawn Google 'G' logo using a CustomPainter — no image asset required.
  Widget _googleGLogo() {
    return SizedBox(
      width: 32,
      height: 32,
      child: CustomPaint(painter: _GoogleGPainter()),
    );
  }

  void _handleGoogleSignIn() async {
    if (_isGoogleSigningIn) return;
    setState(() => _isGoogleSigningIn = true);
    try {
      // Opens the native Google account picker.
      final account = await _googleSignIn.signIn();

      // User cancelled the picker.
      if (account == null || !mounted) {
        setState(() => _isGoogleSigningIn = false);
        return;
      }

      final idToken = (await account.authentication).idToken;
      if (!mounted) return;
      if (idToken == null || idToken.isEmpty) {
        await _googleSignIn.signOut();
        _showErrorSnackbar(
          'Google साइन-इन सध्या कॉन्फिगर केलेले नाही. कृपया ID व पासवर्डने लॉगिन करा.',
        );
        return;
      }

      final auth = AuthScope.of(context);
      final success = await auth.loginWithGoogle(
        googleId: account.id,
        name: account.displayName ?? account.email,
        email: account.email,
        photoUrl: account.photoUrl,
        idToken: idToken,
      );

      if (!mounted) return;

      if (success) {
        context.go(takePendingDeepLink('/home'));
      } else {
        final err = auth.state.errorMessage ?? '';
        final code = auth.state.errorCode;
        if (code == 'USER_NOT_FOUND' ||
            code == 'USER_NOT_REGISTERED' ||
            err.contains('नोंदणी करा') ||
            err.contains('आढळला नाही') ||
            err.contains('not fetch')) {
          _showNotRegisteredDialog(
            onRegister: () async {
              final registerAuth = AuthScope.of(context);
              final ok = await registerAuth.loginWithGoogle(
                googleId: account.id,
                name: account.displayName ?? account.email,
                email: account.email,
                photoUrl: account.photoUrl,
                idToken: idToken,
                register: true,
              );
              if (!mounted) return;
              if (ok) {
                context.go(takePendingDeepLink('/home'));
              } else {
                _showErrorSnackbar(
                  registerAuth.state.errorMessage ?? 'नोंदणी अयशस्वी झाली.',
                );
              }
            },
            customMessage:
                'या Google खात्याचे तपशील DB मध्ये आढळले नाहीत.\nकृपया प्रथम नोंदणी करा.',
            prefilledName: account.displayName,
            prefilledEmail: account.email,
          );
        } else {
          _showErrorSnackbar(
            auth.state.errorMessage ?? 'Google लॉगिन अयशस्वी झाले.',
          );
        }
      }
    } on PlatformException catch (e) {
      if (!mounted) return;
      _showErrorSnackbar(
        e.code == 'network_error'
            ? 'इंटरनेट कनेक्शन नाही. कृपया पुन्हा प्रयत्न करा.'
            : 'Google साइन-इन पूर्ण करता आले नाही. कृपया पुन्हा प्रयत्न करा.',
      );
    } catch (_) {
      if (!mounted) return;
      _showErrorSnackbar('Google लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      if (mounted) setState(() => _isGoogleSigningIn = false);
    }
  }

  void _showForgotPasswordInfo() {
    context.push('/forgot-password');
  }

  void _showNotRegisteredDialog({
    VoidCallback? onRegister,
    String? customMessage,
    String? prefilledName,
    String? prefilledEmail,
  }) {
    showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogCtx) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            elevation: 10,
            backgroundColor: Colors.white,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3EE),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFFFD5C0),
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.person_search_rounded,
                      color: Color(0xFFE84C10),
                      size: 34,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'वापरकर्ता आढळला नाही',
                    style: GoogleFonts.mukta(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF2B1B12),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFDBA74)),
                    ),
                    child: Text(
                      customMessage ??
                          'या माहितीसह खाते आढळले नाही. कृपया आधी नोंदणी करा.\nNo account found with these details. Please register first.',
                      style: GoogleFonts.mukta(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFC2410C),
                        height: 1.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'डेटाबेसमध्ये तुमची माहिती उपलब्ध नाही. कनेक्ट मराठा परिवारात सामील होण्यासाठी कृपया नवीन सदस्य नोंदणी पूर्ण करा.',
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      color: const Color(0xFF6B7280),
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            side: const BorderSide(color: Color(0xFFD1D5DB)),
                          ),
                          onPressed: () => Navigator.of(dialogCtx).pop(),
                          child: Text(
                            'रद्द करा',
                            style: GoogleFonts.mukta(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF4B5563),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE84C10),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () {
                            Navigator.of(dialogCtx).pop();
                            if (onRegister != null) {
                              onRegister();
                            } else {
                              context.push('/register');
                            }
                          },
                          child: Text(
                            'नोंदणी करा →',
                            style: GoogleFonts.mukta(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
    );
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.white,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: Color(0xFFFFCDD2)),
        ),
        content: Row(
          children: [
            const Icon(
              Icons.error_outline_rounded,
              color: Color(0xFFD32F2F),
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF1F2937),
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  // ─── Guest Preview Button ────────────────────────────────────────────────────

  Widget _buildGuestPreviewButton() {
    return GestureDetector(
      // Navigate to the dedicated Guest Preview screen — no login required.
      onTap: _isSubmitting ? null : () => context.push('/guest'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5DCD0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(7),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFFBEFE6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.preview_rounded,
                color: Color(0xFFE84C10),
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'पाहुणे म्हणून पाहा',
                  style: GoogleFonts.mukta(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF2B1B12),
                  ),
                ),
                Text(
                  'Guest Preview — नोंदणीशिवाय',
                  style: GoogleFonts.mukta(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF9CA3AF),
                  ),
                ),
              ],
            ),
            const Spacer(),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              size: 14,
              color: Color(0xFFE84C10),
            ),
          ],
        ),
      ),
    );
  }
}

/// Draws the Google 'G' logo using the official brand colours.
/// Built with [Canvas] arcs + rectangles — no image asset required.
class _GoogleGPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width * 0.46;

    // ── Background circle ──────────────────────────────────────────────────
    canvas.drawCircle(
      Offset(cx, cy),
      size.width / 2,
      Paint()..color = Colors.white,
    );

    final rect = Rect.fromCircle(center: Offset(cx, cy), radius: r);

    // ── Red arc  (top, 315° → 65° ≈ 110°) ────────────────────────────────
    _arc(canvas, rect, -110 * _deg, 110 * _deg, const Color(0xFFEA4335));
    // ── Yellow arc (bottom-right, 65° → 175° ≈ 110°) ─────────────────────
    _arc(canvas, rect, 0 * _deg, 110 * _deg, const Color(0xFFFBBC05));
    // ── Green arc  (bottom-left, 175° → 225° ≈ 50°) ──────────────────────
    _arc(canvas, rect, 110 * _deg, 85 * _deg, const Color(0xFF34A853));
    // ── Blue arc   (left, 225° → 315° ≈ 90°) ─────────────────────────────
    _arc(canvas, rect, 195 * _deg, 125 * _deg, const Color(0xFF4285F4));

    // ── Blue horizontal bar (the cross-bar of the G) ──────────────────────
    final barPaint = Paint()..color = const Color(0xFF4285F4);
    final barW = r * 0.85;
    final barH = r * 0.42;
    final barLeft = cx; // starts at centre
    final barTop = cy - barH / 2;
    canvas.drawRect(Rect.fromLTWH(barLeft, barTop, barW, barH), barPaint);

    // ── White circle to carve out centre ──────────────────────────────────
    canvas.drawCircle(Offset(cx, cy), r * 0.6, Paint()..color = Colors.white);
  }

  void _arc(Canvas canvas, Rect rect, double start, double sweep, Color color) {
    canvas.drawArc(rect, start, sweep, true, Paint()..color = color);
  }

  static const double _deg = 3.14159265358979 / 180;

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
