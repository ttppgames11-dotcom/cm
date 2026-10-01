import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/auth/auth_scope.dart';
import '../../../core/config/api_config.dart';
import '../../../core/profile/profile_photo.dart';
import '../widgets/profile_subpage_header.dart';

/// "सुरक्षा आणि गोपनीयता" — privacy policy, support and permanent account
/// deletion. Only actions that really work are shown here; there are no
/// placeholder toggles.
class SecurityPrivacyScreen extends StatefulWidget {
  const SecurityPrivacyScreen({super.key});

  @override
  State<SecurityPrivacyScreen> createState() => _SecurityPrivacyScreenState();
}

class _SecurityPrivacyScreenState extends State<SecurityPrivacyScreen> {
  Future<void> _open(Uri uri) async {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      showProfileMessage(context, 'लिंक उघडता आली नाही.');
    }
  }

  Future<void> _confirmDelete() async {
    final result = await showModalBottomSheet<_DeleteResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _DeleteAccountSheet(),
    );
    if (result == null || !mounted) return;

    final auth = AuthScope.of(context);
    final memberId = auth.state.profile?.id;
    final deleted = await auth.deleteAccount(
      password: result.password,
      googleIdToken: result.googleIdToken,
    );
    if (deleted && memberId != null) {
      // The server deleted the uploaded photo with the account; remove the
      // copy kept on this phone too.
      try {
        final photos = ProfilePhotoStore();
        await photos.remove(memberId);
        await photos.markUploadedAs(memberId, '');
      } catch (_) {}
    }
    if (!mounted) return;
    if (deleted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('आपले खाते कायमचे हटवण्यात आले.')),
      );
      context.go('/login');
    } else {
      showProfileMessage(
        context,
        auth.state.errorMessage ??
            'खाते हटवता आले नाही. कृपया पुन्हा प्रयत्न करा.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'सुरक्षा आणि गोपनीयता',
              subtitle: 'तुमची माहिती आणि खाते व्यवस्थापित करा',
              icon: Icons.shield_outlined,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  _sectionCard('गोपनीयता', [
                    _actionTile(
                      icon: Icons.privacy_tip_outlined,
                      title: 'गोपनीयता धोरण',
                      subtitle: 'आम्ही कोणती माहिती कशासाठी वापरतो',
                      onTap: () => _open(Uri.parse(ApiConfig.privacyPolicyUrl)),
                    ),
                    _actionTile(
                      icon: Icons.mail_outline_rounded,
                      title: 'सपोर्टशी संपर्क',
                      subtitle: ApiConfig.supportEmail,
                      onTap:
                          () => _open(
                            Uri(scheme: 'mailto', path: ApiConfig.supportEmail),
                          ),
                    ),
                  ]),
                  const SizedBox(height: 16),
                  _sectionCard('खाते', [
                    _actionTile(
                      icon: Icons.delete_forever_outlined,
                      title: 'खाते कायमचे हटवा',
                      subtitle: 'तुमची प्रोफाईल व माहिती कायमची हटवली जाईल',
                      danger: true,
                      onTap: _confirmDelete,
                    ),
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionCard(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8, left: 4),
          child: Text(
            title,
            style: GoogleFonts.mukta(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF6B7280),
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(8),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                children[i],
                if (i != children.length - 1)
                  const Divider(
                    height: 1,
                    indent: 58,
                    color: Color(0xFFF3F4F6),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _actionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool danger = false,
  }) {
    final accent = danger ? const Color(0xFFB91C1C) : const Color(0xFF1F2937);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color:
                    danger ? const Color(0xFFFEE2E2) : const Color(0xFFFBEFE6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color:
                    danger ? const Color(0xFFB91C1C) : const Color(0xFF8B4513),
                size: 19,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.mukta(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w800,
                      color: accent,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    subtitle,
                    style: GoogleFonts.mukta(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Color(0xFF9CA3AF),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

class _DeleteResult {
  const _DeleteResult({this.password, this.googleIdToken});
  final String? password;
  final String? googleIdToken;
}

/// Collects the confirmation word and re-authentication (password, or a fresh
/// Google sign-in for Google accounts) before the account is deleted.
class _DeleteAccountSheet extends StatefulWidget {
  const _DeleteAccountSheet();

  @override
  State<_DeleteAccountSheet> createState() => _DeleteAccountSheetState();
}

class _DeleteAccountSheetState extends State<_DeleteAccountSheet> {
  final _confirmController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _confirmController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool get _confirmed => _confirmController.text.trim() == 'DELETE';

  void _submitPassword() {
    if (!_confirmed) {
      setState(() => _error = 'पुष्टीसाठी DELETE टाइप करा.');
      return;
    }
    if (_passwordController.text.isEmpty) {
      setState(() => _error = 'कृपया तुमचा पासवर्ड टाका.');
      return;
    }
    Navigator.pop(context, _DeleteResult(password: _passwordController.text));
  }

  Future<void> _submitGoogle() async {
    if (!_confirmed) {
      setState(() => _error = 'पुष्टीसाठी DELETE टाइप करा.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final google = GoogleSignIn(
        scopes: ['email'],
        serverClientId:
            ApiConfig.googleWebClientId.isEmpty
                ? null
                : ApiConfig.googleWebClientId,
      );
      final account = await google.signIn();
      final token =
          account == null ? null : (await account.authentication).idToken;
      if (!mounted) return;
      if (token == null) {
        setState(() {
          _busy = false;
          _error = 'Google पडताळणी पूर्ण झाली नाही.';
        });
        return;
      }
      Navigator.pop(context, _DeleteResult(googleIdToken: token));
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = 'Google पडताळणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'खाते कायमचे हटवायचे?',
                style: GoogleFonts.mukta(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFFB91C1C),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'तुमची प्रोफाईल, पोस्ट, प्रतिक्रिया, गट सदस्यत्व, व्यवसाय नोंदी व नोकरी अर्ज कायमचे हटवले जातील. '
                'इतर सदस्यांशी संबंधित संदर्भ नोंदी आणि देणगीचे आर्थिक रेकॉर्ड तुमचे नाव न दाखवता ठेवले जातील. '
                'ही कृती परत घेता येणार नाही.',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  height: 1.4,
                  color: const Color(0xFF4B5563),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmController,
                autocorrect: false,
                textCapitalization: TextCapitalization.characters,
                onChanged: (_) => setState(() => _error = null),
                decoration: InputDecoration(
                  labelText: 'पुष्टीसाठी DELETE टाइप करा',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: true,
                enableSuggestions: false,
                autocorrect: false,
                onChanged: (_) => setState(() => _error = null),
                decoration: InputDecoration(
                  labelText: 'तुमचा पासवर्ड',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(
                  _error!,
                  style: GoogleFonts.mukta(
                    fontSize: 12.5,
                    color: const Color(0xFFB91C1C),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB91C1C),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: _busy ? null : _submitPassword,
                child: Text(
                  'खाते कायमचे हटवा',
                  style: GoogleFonts.mukta(fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: _busy ? null : _submitGoogle,
                icon: const Icon(Icons.account_circle_outlined),
                label: Text(
                  'Google खाते? Google ने पडताळणी करा',
                  style: GoogleFonts.mukta(fontWeight: FontWeight.w700),
                ),
              ),
              TextButton(
                onPressed: _busy ? null : () => Navigator.pop(context),
                child: Text(
                  'रद्द करा',
                  style: GoogleFonts.mukta(fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
