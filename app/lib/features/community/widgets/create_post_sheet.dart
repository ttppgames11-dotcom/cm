import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/network/api_client.dart';
import '../../../core/profile/member_avatar.dart';
import '../../../core/profile/photo_picker_sheet.dart';
import '../models/community_models.dart';
import '../repositories/community_repository.dart';

/// Bottom sheet for writing a community post: text, a photo from the gallery
/// or camera, or both. Pops with the created [CommunityFeedPost].
class CreatePostSheet extends StatefulWidget {
  const CreatePostSheet({
    super.key,
    required this.repository,
    required this.myMemberId,
    required this.authorName,
    required this.authorTier,
  });

  final CommunityRepository repository;
  final String myMemberId;
  final String authorName;
  final String authorTier;

  @override
  State<CreatePostSheet> createState() => _CreatePostSheetState();
}

class _CreatePostSheetState extends State<CreatePostSheet> {
  final _text = TextEditingController();
  String? _photoPath;
  bool _posting = false;
  String? _error;

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  bool get _canPost =>
      !_posting && (_text.text.trim().isNotEmpty || _photoPath != null);

  Future<void> _addPhoto() async {
    FocusScope.of(context).unfocus();
    final path = await pickPostPhoto(context);
    if (path != null && mounted) setState(() => _photoPath = path);
  }

  Future<void> _post() async {
    if (!_canPost) return;
    setState(() {
      _posting = true;
      _error = null;
    });
    try {
      final created = await widget.repository.createPost(
        _text.text.trim(),
        myMemberId: widget.myMemberId,
        imagePath: _photoPath,
      );
      if (mounted) Navigator.pop(context, created);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _posting = false;
        _error =
            e is ApiException
                ? e.message
                : 'पोस्ट करता आली नाही. कृपया पुन्हा प्रयत्न करा.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.authorName.isNotEmpty ? widget.authorName : 'सदस्य';
    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        20,
        20,
        MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const MyAvatar(size: 40),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.mukta(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      Text(
                        '${widget.authorTier} • Connect Maratha',
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
            const SizedBox(height: 14),
            TextField(
              controller: _text,
              maxLines: 4,
              maxLength: 2000,
              autofocus: true,
              enabled: !_posting,
              onChanged: (_) => setState(() {}),
              style: GoogleFonts.mukta(
                fontSize: 14,
                color: const Color(0xFF1F2937),
              ),
              decoration: InputDecoration(
                hintText:
                    'समाजाशी काय शेअर करू इच्छिता? (उदा. कार्यक्रम, व्यवसाय संधी, विचार)...',
                hintStyle: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF9CA3AF),
                ),
                border: InputBorder.none,
                counterText: '',
              ),
            ),
            if (_photoPath != null) ...[
              const SizedBox(height: 8),
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(
                      File(_photoPath!),
                      height: 170,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Material(
                      color: Colors.black54,
                      shape: const CircleBorder(),
                      child: IconButton(
                        tooltip: 'फोटो काढा / Remove photo',
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(
                          Icons.close_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                        onPressed:
                            _posting
                                ? null
                                : () => setState(() => _photoPath = null),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 10),
              Text(
                _error!,
                style: GoogleFonts.mukta(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFFB91C1C),
                ),
              ),
            ],
            const SizedBox(height: 14),
            Row(
              children: [
                TextButton.icon(
                  onPressed: _posting ? null : _addPhoto,
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF1E4B8B),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  icon: const Icon(Icons.photo_library_rounded, size: 20),
                  label: Text(
                    _photoPath == null ? 'फोटो जोडा' : 'फोटो बदला',
                    style: GoogleFonts.mukta(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE84C10),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 8,
                    ),
                  ),
                  onPressed: _canPost ? _post : null,
                  child:
                      _posting
                          ? const SizedBox.square(
                            dimension: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: Colors.white,
                            ),
                          )
                          : Text(
                            'पोस्ट करा',
                            style: GoogleFonts.mukta(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
