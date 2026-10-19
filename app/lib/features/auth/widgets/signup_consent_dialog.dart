import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/legal_urls_config.dart';

/// Asks for the same consent as the registration form (terms, privacy policy
/// and 18+) before an account is created another way, e.g. Google sign-up.
///
/// Returns the `legalCompliance` map the server expects, or null when the
/// member cancels.
Future<Map<String, Object?>?> showSignupConsentDialog(BuildContext context) {
  return showDialog<Map<String, Object?>>(
    context: context,
    builder: (_) => const _SignupConsentDialog(),
  );
}

class _SignupConsentDialog extends StatefulWidget {
  const _SignupConsentDialog();

  @override
  State<_SignupConsentDialog> createState() => _SignupConsentDialogState();
}

class _SignupConsentDialogState extends State<_SignupConsentDialog> {
  bool _terms = false;
  bool _privacy = false;
  bool _age = false;

  bool get _allAccepted => _terms && _privacy && _age;

  Future<void> _open(String url) =>
      launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);

  Widget _item({
    required Key key,
    required bool value,
    required ValueChanged<bool> onChanged,
    required String text,
    String? linkLabel,
    String? url,
  }) {
    return CheckboxListTile(
      key: key,
      value: value,
      onChanged: (v) => setState(() => onChanged(v ?? false)),
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
      title: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(text, style: GoogleFonts.mukta(fontSize: 13.5)),
          if (linkLabel != null && url != null)
            InkWell(
              onTap: () => _open(url),
              child: Text(
                linkLabel,
                style: GoogleFonts.mukta(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFE84C10),
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(
        'नोंदणीपूर्वी संमती / Consent',
        style: GoogleFonts.mukta(fontWeight: FontWeight.w800, fontSize: 18),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _item(
              key: const Key('consent_terms_checkbox'),
              value: _terms,
              onChanged: (v) => _terms = v,
              text: 'मी ',
              linkLabel: 'वापराच्या अटी (Terms)',
              url: LegalUrlsConfig.termsOfUseUrl,
            ),
            _item(
              key: const Key('consent_privacy_checkbox'),
              value: _privacy,
              onChanged: (v) => _privacy = v,
              text: 'मी ',
              linkLabel: 'गोपनीयता धोरण (Privacy Policy)',
              url: LegalUrlsConfig.privacyPolicyUrl,
            ),
            _item(
              key: const Key('consent_age_checkbox'),
              value: _age,
              onChanged: (v) => _age = v,
              text: 'माझे वय १८ वर्षे किंवा अधिक आहे (I am 18+)',
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('रद्द करा'),
        ),
        FilledButton(
          key: const Key('consent_continue_button'),
          style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE84C10)),
          onPressed:
              _allAccepted
                  ? () => Navigator.pop(context, <String, Object?>{
                    'termsAccepted': true,
                    'privacyAccepted': true,
                    'ageConfirmed': true,
                    'dpdpConsent': true,
                  })
                  : null,
          child: const Text('सहमत आहे, पुढे चला'),
        ),
      ],
    );
  }
}
