import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../config/api_config.dart';
import 'profile_photo.dart';

/// Round member picture: the member's own photo — a file on this phone
/// ([photo]) or the one they uploaded ([photoUrl]) — or the first letter of
/// their name on a saffron circle. Never a stock photo of another person.
class MemberAvatar extends StatelessWidget {
  const MemberAvatar({
    super.key,
    required this.name,
    this.photo,
    this.photoUrl,
    this.size = 40,
  });

  final String name;
  final File? photo;
  final String? photoUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    final cache = (size * MediaQuery.devicePixelRatioOf(context)).round();
    return SizedBox.square(
      dimension: size,
      child: ClipOval(
        child:
            photo != null
                ? Image.file(
                  photo!,
                  fit: BoxFit.cover,
                  cacheWidth: cache,
                  errorBuilder: (_, __, ___) => _initials(),
                )
                : photoUrl != null
                ? Image.network(
                  photoUrl!,
                  fit: BoxFit.cover,
                  cacheWidth: cache,
                  // Initials while it loads and when it cannot be loaded.
                  frameBuilder:
                      (_, child, frame, loadedAtOnce) =>
                          loadedAtOnce || frame != null ? child : _initials(),
                  errorBuilder: (_, __, ___) => _initials(),
                )
                : _initials(),
      ),
    );
  }

  Widget _initials() {
    final trimmed = name.trim();
    final letter =
        trimmed.isEmpty ? '' : trimmed.characters.first.toUpperCase();
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFE84C10), Color(0xFFF59E0B)],
        ),
      ),
      child: Center(
        child:
            letter.isEmpty
                ? Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                  size: size * 0.55,
                )
                : Text(
                  letter,
                  style: GoogleFonts.mukta(
                    fontSize: size * 0.44,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.1,
                  ),
                ),
      ),
    );
  }
}

/// [MemberAvatar] of the signed-in member.
class MyAvatar extends ConsumerWidget {
  const MyAvatar({super.key, this.size = 40});

  final double size;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(
      authControllerProvider.select((auth) => auth.state.profile?.name ?? ''),
    );
    final photo = ref.watch(myProfilePhotoProvider).valueOrNull;
    // No copy on this phone (e.g. just logged in here): the uploaded photo.
    final photoUrl = ref.watch(
      authControllerProvider.select(
        (auth) => ApiConfig.mediaUrl(auth.state.profile?.photo),
      ),
    );
    return MemberAvatar(
      name: name,
      photo: photo,
      photoUrl: photoUrl,
      size: size,
    );
  }
}
