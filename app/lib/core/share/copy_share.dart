import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';

import '../config/api_config.dart';

/// Where people can get the app; added to what is shared from it.
const appStoreLink =
    'https://play.google.com/store/apps/details?id=com.connectmaratha.app';

/// Shown when the share sheet could not be opened and the text was copied
/// instead, so the member knows what happened and what to do next.
const copiedForSharingMessage =
    'माहिती कॉपी केली ✓ — WhatsApp किंवा कुठेही पेस्ट करा';

/// Public link of a community post. Anyone can open it in a browser; on a
/// phone with the app it opens the post inside the app (`/post/:id` route).
String postLink(String postId) =>
    '${ApiConfig.baseUrl}/post/${Uri.encodeComponent(postId)}';

/// Text sent when a member shares a community post: a short quote, the
/// author and the link to the post.
String postShareText({
  required String postId,
  required String author,
  required String content,
}) {
  final text = content.trim();
  if (text.isEmpty) {
    // A photo-only post.
    return '$author यांची पोस्ट\n\nConnect मराठा वर पहा: ${postLink(postId)}';
  }
  final quote = text.length > 200 ? '${text.substring(0, 197)}…' : text;
  return '"$quote"\n— $author\n\nConnect मराठा वर वाचा: ${postLink(postId)}';
}

/// Text sent when a fort or warrior page is shared.
String withAppLink(String text) =>
    '${text.trim()}\n\nConnect मराठा अ‍ॅप: $appStoreLink';

/// Opens the phone's share sheet (WhatsApp, Telegram, SMS, ...) with [text].
///
/// Returns true when the sheet was opened. If the phone cannot open it, the
/// text is copied to the clipboard instead and false is returned — the
/// caller then shows [copiedForSharingMessage].
Future<bool> shareText(String text, {String? subject}) async {
  try {
    await shareSheet(text, subject);
    return true;
  } catch (_) {
    await Clipboard.setData(ClipboardData(text: text));
    return false;
  }
}

/// Opens the system share sheet; throws when the phone has none. A variable
/// so tests can replace it (the real one opens a system window).
@visibleForTesting
Future<void> Function(String text, String? subject) shareSheet =
    _systemShareSheet;

Future<void> _systemShareSheet(String text, String? subject) async {
  final result = await SharePlus.instance.share(
    ShareParams(text: text, subject: subject),
  );
  if (result.status == ShareResultStatus.unavailable) {
    throw StateError('share sheet unavailable');
  }
}
