import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/profile/member_avatar.dart';
import '../models/community_models.dart';

/// Bottom sheet with a post's comments and a box to add one.
///
/// [onSend] posts the text to the server and returns the updated comment
/// list; a thrown error is shown in the sheet and the text is kept so the
/// member can retry. Other members' comments can be reported ([onReport]),
/// as Play requires for user-generated content.
class PostCommentsSheet extends StatefulWidget {
  const PostCommentsSheet({
    super.key,
    required this.post,
    required this.onSend,
    required this.onReport,
    required this.errorText,
  });

  final CommunityFeedPost post;
  final Future<List<PostComment>> Function(String text) onSend;
  final void Function(PostComment comment) onReport;

  /// Turns a failure into the message shown to the member.
  final String Function(Object error) errorText;

  @override
  State<PostCommentsSheet> createState() => _PostCommentsSheetState();
}

class _PostCommentsSheetState extends State<PostCommentsSheet> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  late List<PostComment> _comments = widget.post.comments;
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      final updated = await widget.onSend(text);
      if (!mounted) return;
      _controller.clear();
      setState(() {
        _comments = updated;
        _sending = false;
      });
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) {
          _scroll.jumpTo(_scroll.position.maxScrollExtent);
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _sending = false;
        _error = widget.errorText(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    return Padding(
      // Keep the text box above the keyboard.
      padding: EdgeInsets.only(bottom: media.viewInsets.bottom),
      child: Container(
        constraints: BoxConstraints(maxHeight: media.size.height * 0.75),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Container(
                width: 38,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFDDD5CC),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 8, 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'टिप्पण्या (${_comments.length})',
                        style: GoogleFonts.mukta(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'बंद करा',
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              Flexible(
                child:
                    _comments.isEmpty
                        ? Padding(
                          padding: const EdgeInsets.all(28),
                          child: Text(
                            'अजून कोणतीही टिप्पणी नाही.\nपहिली टिप्पणी तुम्ही लिहा!',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.mukta(
                              fontSize: 13.5,
                              height: 1.45,
                              color: const Color(0xFF6B7280),
                            ),
                          ),
                        )
                        : ListView.separated(
                          controller: _scroll,
                          shrinkWrap: true,
                          padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
                          itemCount: _comments.length,
                          separatorBuilder:
                              (_, __) => const SizedBox(height: 12),
                          itemBuilder: (_, i) => _commentTile(_comments[i]),
                        ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 6),
                  child: Text(
                    _error!,
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFFB91C1C),
                    ),
                  ),
                ),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const MyAvatar(size: 34),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        enabled: !_sending,
                        minLines: 1,
                        maxLines: 4,
                        maxLength: 1000,
                        textCapitalization: TextCapitalization.sentences,
                        style: GoogleFonts.mukta(fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'तुमची टिप्पणी लिहा...',
                          hintStyle: GoogleFonts.mukta(
                            fontSize: 13.5,
                            color: const Color(0xFF9CA3AF),
                          ),
                          counterText: '',
                          isDense: true,
                          filled: true,
                          fillColor: const Color(0xFFF9FAFB),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(18),
                            borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(18),
                            borderSide: const BorderSide(
                              color: Color(0xFFE5E7EB),
                            ),
                          ),
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    IconButton(
                      tooltip: 'टिप्पणी पाठवा',
                      onPressed: _sending ? null : _send,
                      icon:
                          _sending
                              ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFFE84C10),
                                ),
                              )
                              : const Icon(
                                Icons.send_rounded,
                                color: Color(0xFFE84C10),
                              ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _commentTile(PostComment c) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        c.isMine
            ? const MyAvatar(size: 32)
            : MemberAvatar(
              name: c.authorName,
              photoUrl: c.authorPhotoUrl,
              size: 32,
            ),
        const SizedBox(width: 10),
        Expanded(
          child: Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 9),
            decoration: BoxDecoration(
              color: const Color(0xFFFAF7F2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: c.authorName,
                        style: GoogleFonts.mukta(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      if (c.timeAgo.isNotEmpty)
                        TextSpan(
                          text: '  •  ${c.timeAgo}',
                          style: GoogleFonts.mukta(
                            fontSize: 11,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  c.text,
                  style: GoogleFonts.mukta(
                    fontSize: 13.5,
                    height: 1.4,
                    color: const Color(0xFF374151),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (c.isMine)
          const SizedBox(width: 8)
        else
          IconButton(
            tooltip: 'टिप्पणीची तक्रार करा',
            visualDensity: VisualDensity.compact,
            icon: const Icon(
              Icons.flag_outlined,
              size: 18,
              color: Color(0xFF9CA3AF),
            ),
            onPressed: () => widget.onReport(c),
          ),
      ],
    );
  }
}
