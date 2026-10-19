import 'package:flutter/foundation.dart';
import 'package:play_install_referrer/play_install_referrer.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Referral code that arrived with the install from Google Play.
///
/// A shared invite link carries `&referrer=ref%3D<code>` (see
/// `playStoreReferralLink`). Play keeps that value for the install, so on the
/// first registration the app can fill in the inviter's code by itself.

const _usedKey = 'cm_install_referral_used';

/// Codes are member IDs, REF-codes or phone numbers; anything else is ignored.
final _codePattern = RegExp(r'^[A-Za-z0-9+\- ]{3,50}$');

/// Reads the raw referrer string from Google Play. A variable so tests can
/// replace it (the real one talks to the Play Store app).
@visibleForTesting
Future<String?> Function() installReferrerSource = _playInstallReferrer;

Future<String?> _playInstallReferrer() async {
  if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) return null;
  final details = await PlayInstallReferrer.installReferrer;
  return details.installReferrer;
}

/// Pulls the `ref` value out of a Play referrer string such as
/// `ref=REF-96K-1234` or `utm_source=x&ref=REF-96K-1234`.
/// Returns null for normal installs (`utm_medium=organic`) and bad values.
String? referralCodeFromReferrer(String? raw) {
  if (raw == null || raw.trim().isEmpty) return null;
  try {
    final code = Uri.splitQueryString(raw.trim())['ref']?.trim();
    if (code == null || !_codePattern.hasMatch(code)) return null;
    return code.toUpperCase();
  } catch (_) {
    return null;
  }
}

/// The inviter's code from the Play install, or null when there is none,
/// it was already used for a registration, or Play can't be asked.
Future<String?> readInstallReferralCode() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool(_usedKey) ?? false) return null;
    return referralCodeFromReferrer(await installReferrerSource());
  } catch (_) {
    // No Play Store, old Play version, or not an Android build.
    return null;
  }
}

/// Called after a successful registration so the code isn't filled in again
/// for a later account on the same phone.
Future<void> markInstallReferralUsed() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_usedKey, true);
  } catch (_) {}
}
