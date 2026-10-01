import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

/// Result of [pickProfilePhoto].
sealed class PhotoChoice {
  const PhotoChoice();
}

class PhotoPicked extends PhotoChoice {
  const PhotoPicked(this.path);
  final String path;
}

class PhotoRemoved extends PhotoChoice {
  const PhotoRemoved();
}

/// Lets the member take or choose their own photo. Returns null when they
/// cancel. [canRemove] adds a "remove photo" option.
///
/// [beforeLaunch] runs just before the camera / gallery opens, so a screen can
/// save unsaved input in case Android closes the app meanwhile (the photo is
/// then recovered with [recoverLostProfilePhoto]).
Future<PhotoChoice?> pickProfilePhoto(
  BuildContext context, {
  bool canRemove = false,
  Future<void> Function()? beforeLaunch,
}) => _pickPhoto(
  context,
  title: 'प्रोफाईल फोटो',
  subtitle: 'इतर सदस्यांना दिसेल / Visible to other members',
  icon: Icons.account_circle_rounded,
  maxSide: 800,
  camera: CameraDevice.front,
  canRemove: canRemove,
  beforeLaunch: beforeLaunch,
);

/// Lets the member take or choose a photo to attach to a community post.
/// Returns the picked file's path, or null when they cancel.
Future<String?> pickPostPhoto(BuildContext context) async {
  final choice = await _pickPhoto(
    context,
    title: 'पोस्टसाठी फोटो',
    subtitle: 'पोस्टसोबत सर्वांना दिसेल / Shown with your post',
    icon: Icons.image_rounded,
    maxSide: 1600,
    camera: CameraDevice.rear,
  );
  return choice is PhotoPicked ? choice.path : null;
}

Future<PhotoChoice?> _pickPhoto(
  BuildContext context, {
  required String title,
  required String subtitle,
  required IconData icon,
  required double maxSide,
  required CameraDevice camera,
  bool canRemove = false,
  Future<void> Function()? beforeLaunch,
}) async {
  final action = await showModalBottomSheet<Object>(
    context: context,
    backgroundColor: Colors.transparent,
    builder:
        (ctx) => _PhotoSourceSheet(
          title: title,
          subtitle: subtitle,
          icon: icon,
          canRemove: canRemove,
        ),
  );
  if (action is ImageSource) {
    try {
      if (beforeLaunch != null) await beforeLaunch();
      final file = await ImagePicker().pickImage(
        source: action,
        imageQuality: 85,
        maxWidth: maxSide,
        maxHeight: maxSide,
        preferredCameraDevice: camera,
        requestFullMetadata: false,
      );
      return file == null ? null : PhotoPicked(file.path);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('फोटो उघडता आला नाही. कृपया पुन्हा प्रयत्न करा.'),
          ),
        );
      }
      return null;
    }
  }
  if (action == _remove) return const PhotoRemoved();
  return null;
}

const _remove = 'remove';

/// On Android, the photo picked just before the system closed the app (see
/// [pickProfilePhoto]). Null when there is none or on other platforms.
Future<String?> recoverLostProfilePhoto() async {
  if (!Platform.isAndroid) return null;
  try {
    final lost = await ImagePicker().retrieveLostData();
    if (lost.isEmpty) return null;
    return lost.file?.path ?? lost.files?.firstOrNull?.path;
  } catch (_) {
    return null;
  }
}

class _PhotoSourceSheet extends StatelessWidget {
  const _PhotoSourceSheet({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.canRemove,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final bool canRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        24,
        20,
        24,
        20 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 38,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: const Color(0xFFDDD5CC),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBEFE6),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: const Color(0xFFE84C10), size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.mukta(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      subtitle,
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _tile(
            context,
            icon: Icons.photo_library_rounded,
            color: const Color(0xFF1E4B8B),
            title: 'गॅलरीतून निवडा',
            subtitle: 'Choose from Gallery',
            result: ImageSource.gallery,
          ),
          const SizedBox(height: 12),
          _tile(
            context,
            icon: Icons.camera_alt_rounded,
            color: const Color(0xFFE84C10),
            title: 'कॅमेरा वापरा',
            subtitle: 'Take a new photo',
            result: ImageSource.camera,
          ),
          if (canRemove) ...[
            const SizedBox(height: 12),
            _tile(
              context,
              icon: Icons.delete_outline_rounded,
              color: const Color(0xFFB91C1C),
              title: 'फोटो काढा',
              subtitle: 'Remove photo',
              result: _remove,
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => Navigator.pop(context),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFF3F4F6),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(
                'रद्द करा / Cancel',
                style: GoogleFonts.mukta(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF6B7280),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tile(
    BuildContext context, {
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
    required Object result,
  }) {
    return Material(
      color: color.withAlpha(12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: color.withAlpha(40)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => Navigator.pop(context, result),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.mukta(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      subtitle,
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios_rounded, size: 14, color: color),
            ],
          ),
        ),
      ),
    );
  }
}
