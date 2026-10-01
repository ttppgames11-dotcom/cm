import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/auth/auth_scope.dart';
import '../repositories/auth_repository.dart';

enum ForgotPasswordStep { enterEmail, verifyOtp, resetPassword, success }

/// Maratha-themed 3-step Password Reset screen:
/// 1. Enter registered email address -> OTP dispatched from noreply@connectmaratha.com
/// 2. Validate 6-digit security OTP -> User is validated and granted resetToken
/// 3. Enter and confirm new password -> Password updated in database
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  ForgotPasswordStep _step = ForgotPasswordStep.enterEmail;

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _emailFocus = FocusNode();
  final _otpFocus = FocusNode();
  final _newPasswordFocus = FocusNode();
  final _confirmPasswordFocus = FocusNode();

  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;

  String? _errorMessage;
  String? _resetToken;

  int _resendCooldown = 0;
  Timer? _resendTimer;

  @override
  void initState() {
    super.initState();
    _emailFocus.addListener(() => setState(() {}));
    _otpFocus.addListener(() => setState(() {}));
    _newPasswordFocus.addListener(() => setState(() {}));
    _confirmPasswordFocus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _emailFocus.dispose();
    _otpFocus.dispose();
    _newPasswordFocus.dispose();
    _confirmPasswordFocus.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _resendTimer?.cancel();
    setState(() => _resendCooldown = 60);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_resendCooldown > 1) {
        setState(() => _resendCooldown--);
      } else {
        setState(() => _resendCooldown = 0);
        timer.cancel();
      }
    });
  }

  // ── Step 1: Send OTP to Email ──────────────────────────────────────────────
  Future<void> _handleSendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _errorMessage = 'कृपया आपला नोंदणीकृत ईमेल पत्ता टाका.');
      return;
    }

    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(email)) {
      setState(() => _errorMessage = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final auth = AuthScope.of(context);
      await auth.sendForgotPasswordOtp(email);

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _step = ForgotPasswordStep.verifyOtp;
      });
      _startResendTimer();
      _otpFocus.requestFocus();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.mark_email_read_outlined, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'सुरक्षा OTP $email वर पाठवला आहे.',
                  style: GoogleFonts.mukta(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage =
            e is AuthException
                ? e.message
                : 'OTP पाठवण्यात त्रुटी आली. कृपया ईमेल तपासा.';
      });
    }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  Future<void> _handleVerifyOtp() async {
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();

    if (otp.length != 6) {
      setState(() => _errorMessage = 'कृपया ईमेलवर आलेला ६-अंकी OTP टाका.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final auth = AuthScope.of(context);
      final token = await auth.verifyResetOtp(email: email, otp: otp);

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _resetToken = token;
        _step = ForgotPasswordStep.resetPassword;
      });
      _newPasswordFocus.requestFocus();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.verified_outlined, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'वापरकर्ता यशस्वीरीत्या सत्यापित झाला! नवीन पासवर्ड सेट करा.',
                  style: GoogleFonts.mukta(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF16A34A),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage =
            e is AuthException
                ? e.message
                : 'अवैध किंवा कालबाह्य OTP. कृपया पुन्हा तपासा.';
      });
    }
  }

  // ── Step 3: Save New Password ──────────────────────────────────────────────
  Future<void> _handleResetPassword() async {
    final email = _emailController.text.trim();
    final newPassword = _newPasswordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (newPassword.isEmpty) {
      setState(() => _errorMessage = 'कृपया नवीन पासवर्ड टाका.');
      return;
    }

    if (newPassword.length < 8) {
      setState(() => _errorMessage = 'पासवर्ड किमान ८ अक्षरांचा असावा.');
      return;
    }

    if (newPassword != confirmPassword) {
      setState(() => _errorMessage = 'दोन्ही पासवर्ड जुळत नाहीत.');
      return;
    }

    if (_resetToken == null) {
      setState(
        () => _errorMessage = 'सत्र अवैध झाले आहे. कृपया पुन्हा OTP मागवा.',
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final auth = AuthScope.of(context);
      await auth.resetPassword(
        email: email,
        resetToken: _resetToken!,
        newPassword: newPassword,
      );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _step = ForgotPasswordStep.success;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage =
            e is AuthException ? e.message : 'पासवर्ड रीसेट करताना त्रुटी आली.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF8F2),
      appBar: AppBar(
        title: Text(
          '🔐 पासवर्ड रीसेट करा',
          style: GoogleFonts.mukta(
            fontWeight: FontWeight.w800,
            fontSize: 18,
            color: const Color(0xFF1F2937),
          ),
        ),
        backgroundColor: const Color(0xFFFDF8F2),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          color: const Color(0xFF1F2937),
          onPressed: () {
            if (_step == ForgotPasswordStep.verifyOtp) {
              setState(() {
                _step = ForgotPasswordStep.enterEmail;
                _errorMessage = null;
              });
            } else if (_step == ForgotPasswordStep.resetPassword) {
              setState(() {
                _step = ForgotPasswordStep.verifyOtp;
                _errorMessage = null;
              });
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildProgressIndicator(),
              const SizedBox(height: 24),
              if (_step == ForgotPasswordStep.enterEmail) _buildEmailCard(),
              if (_step == ForgotPasswordStep.verifyOtp) _buildOtpCard(),
              if (_step == ForgotPasswordStep.resetPassword)
                _buildResetPasswordCard(),
              if (_step == ForgotPasswordStep.success) _buildSuccessCard(),
            ],
          ),
        ),
      ),
    );
  }

  // ── Step Progress Indicator ────────────────────────────────────────────────
  Widget _buildProgressIndicator() {
    int activeIndex = 0;
    if (_step == ForgotPasswordStep.verifyOtp) activeIndex = 1;
    if (_step == ForgotPasswordStep.resetPassword ||
        _step == ForgotPasswordStep.success) {
      activeIndex = 2;
    }

    final steps = ['ईमेल', 'OTP', 'पासवर्ड'];

    return Row(
      children: List.generate(steps.length * 2 - 1, (index) {
        if (index.isOdd) {
          final lineIdx = index ~/ 2;
          final isPassed = activeIndex > lineIdx;
          return Expanded(
            child: Container(
              height: 2,
              color:
                  isPassed ? const Color(0xFFE84C10) : const Color(0xFFE5DCD3),
            ),
          );
        }

        final stepIdx = index ~/ 2;
        final isActive = activeIndex >= stepIdx;

        return Column(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color:
                    isActive
                        ? const Color(0xFFE84C10)
                        : const Color(0xFFF1E8DF),
                shape: BoxShape.circle,
                border: Border.all(
                  color:
                      isActive
                          ? const Color(0xFFE84C10)
                          : const Color(0xFFD6C8BB),
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  '${stepIdx + 1}',
                  style: GoogleFonts.mukta(
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    color: isActive ? Colors.white : const Color(0xFF8B6A52),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              steps[stepIdx],
              style: GoogleFonts.mukta(
                fontSize: 11.5,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
                color:
                    isActive
                        ? const Color(0xFFE84C10)
                        : const Color(0xFF8B6A52),
              ),
            ),
          ],
        );
      }),
    );
  }

  // ── Step 1 View: Enter Registered Email ────────────────────────────────────
  Widget _buildEmailCard() {
    return _buildContainerWrapper(
      icon: Icons.mark_email_unread_rounded,
      title: 'नोंदणीकृत ईमेल प्रविष्ट करा',
      subtitle:
          'आपल्या खात्याचा सुरक्षा OTP ईमेलद्वारे (noreply@connectmaratha.com) पाठवला जाईल.',
      children: [
        _buildFieldLabel('नोंदणीकृत ईमेल पत्ता'),
        const SizedBox(height: 8),
        _buildTextField(
          controller: _emailController,
          focusNode: _emailFocus,
          hint: 'उदा. amol.jadhav@example.com',
          icon: Icons.alternate_email_rounded,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _handleSendOtp(),
        ),
        if (_errorMessage != null) _buildErrorMessage(_errorMessage!),
        const SizedBox(height: 24),
        _buildActionButton(
          label: 'सुरक्षा OTP पाठवा',
          icon: Icons.send_rounded,
          onPressed: _isLoading ? null : _handleSendOtp,
        ),
      ],
    );
  }

  // ── Step 2 View: Verify 6-digit OTP ───────────────────────────────────────
  Widget _buildOtpCard() {
    final email = _emailController.text.trim();

    return _buildContainerWrapper(
      icon: Icons.phonelink_lock_rounded,
      title: 'सुरक्षा OTP सत्यापित करा',
      subtitle: 'आम्ही $email वर ६-अंकी OTP पाठवला आहे.',
      children: [
        _buildFieldLabel('ईमेलवर आलेला ६-अंकी OTP'),
        const SizedBox(height: 8),
        _buildTextField(
          controller: _otpController,
          focusNode: _otpFocus,
          hint: '६-अंकी OTP प्रविष्ट करा',
          icon: Icons.pin_outlined,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _handleVerifyOtp(),
        ),
        if (_errorMessage != null) _buildErrorMessage(_errorMessage!),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'OTP आला नाही?',
              style: GoogleFonts.mukta(
                fontSize: 13,
                color: const Color(0xFF6B7280),
              ),
            ),
            TextButton(
              onPressed:
                  (_resendCooldown > 0 || _isLoading) ? null : _handleSendOtp,
              child: Text(
                _resendCooldown > 0
                    ? 'पुन्हा पाठवा ($_resendCooldown s)'
                    : 'पुन्हा OTP पाठवा',
                style: GoogleFonts.mukta(
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                  color:
                      _resendCooldown > 0
                          ? const Color(0xFF9CA3AF)
                          : const Color(0xFFE84C10),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildActionButton(
          label: 'वापरकर्ता सत्यापित करा',
          icon: Icons.verified_user_rounded,
          onPressed: _isLoading ? null : _handleVerifyOtp,
        ),
      ],
    );
  }

  // ── Step 3 View: Set New Password ──────────────────────────────────────────
  Widget _buildResetPasswordCard() {
    return _buildContainerWrapper(
      icon: Icons.lock_reset_rounded,
      title: 'नवीन पासवर्ड सेट करा',
      subtitle:
          'आपला वापरकर्ता सुरक्षितरीत्या सत्यापित झाला आहे. कृपया नवीन पासवर्ड तयार करा.',
      children: [
        _buildFieldLabel('नवीन पासवर्ड (किमान ८ अक्षरे)'),
        const SizedBox(height: 8),
        _buildPasswordField(
          controller: _newPasswordController,
          focusNode: _newPasswordFocus,
          obscureText: _obscureNewPassword,
          hint: 'नवीन पासवर्ड टाका',
          onToggleVisibility:
              () => setState(() => _obscureNewPassword = !_obscureNewPassword),
          textInputAction: TextInputAction.next,
          onFieldSubmitted: (_) => _confirmPasswordFocus.requestFocus(),
        ),
        const SizedBox(height: 16),
        _buildFieldLabel('पासवर्ड पुष्टी करा'),
        const SizedBox(height: 8),
        _buildPasswordField(
          controller: _confirmPasswordController,
          focusNode: _confirmPasswordFocus,
          obscureText: _obscureConfirmPassword,
          hint: 'पासवर्ड पुन्हा टाका',
          onToggleVisibility:
              () => setState(
                () => _obscureConfirmPassword = !_obscureConfirmPassword,
              ),
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _handleResetPassword(),
        ),
        if (_errorMessage != null) _buildErrorMessage(_errorMessage!),
        const SizedBox(height: 24),
        _buildActionButton(
          label: 'पासवर्ड जतन करा',
          icon: Icons.check_circle_rounded,
          onPressed: _isLoading ? null : _handleResetPassword,
        ),
      ],
    );
  }

  // ── Step 4 View: Success Screen ────────────────────────────────────────────
  Widget _buildSuccessCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF2EAE0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFB85018).withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF86EFAC), width: 2),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: Color(0xFF16A34A),
              size: 46,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'पासवर्ड यशस्वीरीत्या बदलला!',
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'आपला नवीन पासवर्ड सक्रिय झाला आहे. आता आपण नवीन पासवर्डने लॉगिन करू शकता.',
            textAlign: TextAlign.center,
            style: GoogleFonts.mukta(
              fontSize: 14,
              color: const Color(0xFF6B7280),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => context.go('/login'),
              icon: const Icon(Icons.login_rounded),
              label: Text(
                'लॉगिन पृष्ठावर जा',
                style: GoogleFonts.mukta(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFFE84C10),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Helper Widgets ────────────────────────────────────────────────────────
  Widget _buildContainerWrapper({
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF2EAE0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFB85018).withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1EB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFD5C0)),
                ),
                child: Icon(icon, color: const Color(0xFFE84C10), size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.mukta(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      subtitle,
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        color: const Color(0xFF6B7280),
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Divider(color: Color(0xFFF5EFE9), height: 1),
          const SizedBox(height: 20),
          ...children,
        ],
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.mukta(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: const Color(0xFF4B5563),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hint,
    required IconData icon,
    required TextInputType keyboardType,
    TextInputAction? textInputAction,
    List<TextInputFormatter>? inputFormatters,
    ValueChanged<String>? onFieldSubmitted,
  }) {
    final isFocused = focusNode.hasFocus;
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isFocused ? const Color(0xFFE84C10) : const Color(0xFFE8DFD8),
          width: isFocused ? 1.8 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Icon(
              icon,
              color:
                  isFocused ? const Color(0xFFE84C10) : const Color(0xFF8B6A52),
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
              onChanged: (_) {
                if (_errorMessage != null) {
                  setState(() => _errorMessage = null);
                }
              },
              style: GoogleFonts.mukta(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1F2937),
              ),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: GoogleFonts.mukta(
                  fontSize: 13.5,
                  color: const Color(0xFFB0A49A),
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required bool obscureText,
    required String hint,
    required VoidCallback onToggleVisibility,
    TextInputAction? textInputAction,
    ValueChanged<String>? onFieldSubmitted,
  }) {
    final isFocused = focusNode.hasFocus;
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isFocused ? const Color(0xFFE84C10) : const Color(0xFFE8DFD8),
          width: isFocused ? 1.8 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Icon(
              Icons.lock_outline_rounded,
              color:
                  isFocused ? const Color(0xFFE84C10) : const Color(0xFF8B6A52),
              size: 20,
            ),
          ),
          Expanded(
            child: TextFormField(
              controller: controller,
              focusNode: focusNode,
              obscureText: obscureText,
              textInputAction: textInputAction,
              onFieldSubmitted: onFieldSubmitted,
              onChanged: (_) {
                if (_errorMessage != null) {
                  setState(() => _errorMessage = null);
                }
              },
              style: GoogleFonts.mukta(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1F2937),
              ),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: GoogleFonts.mukta(
                  fontSize: 13.5,
                  color: const Color(0xFFB0A49A),
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          IconButton(
            icon: Icon(
              obscureText
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              color: const Color(0xFF8B6A52),
              size: 20,
            ),
            onPressed: onToggleVisibility,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorMessage(String message) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFCA5A5)),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: Color(0xFFDC2626),
            size: 16,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.mukta(
                color: const Color(0xFFB91C1C),
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required VoidCallback? onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: const Color(0xFFE84C10),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 2,
        ),
        child:
            _isLoading
                ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: Colors.white,
                  ),
                )
                : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(icon, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: GoogleFonts.mukta(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
      ),
    );
  }
}
