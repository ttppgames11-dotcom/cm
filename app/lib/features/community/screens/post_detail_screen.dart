import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/network/api_client.dart';
import '../../../core/profile/member_avatar.dart';
import '../../../core/share/copy_share.dart';
import '../../auth/providers/current_user_provider.dart';
import '../models/community_models.dart';
import '../providers/community_provider.dart';
import '../repositories/community_repository.dart';
import '../widgets/post_comments_sheet.dart';
import '../widgets/post_image.dart';

/// One community post on its own page — what a shared link
/// (`https://api.connectmaratha.com/post/<id>`) opens inside the app.
/// The member can like it, read and write comments, share it again, and
/// report it if it is someone else's.
class PostDetailScreen extends ConsumerStatefulWidget {
  const PostDetailScreen({super.key, required this.postId});

  final String postId;

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  CommunityFeedPost? _post;
  bool _loading = true;
  bool _notFound = false;
  String? _error;

  CommunityRepository get _repo => ref.read(communityRepositoryProvider);
  String get _myId => ref.read(currentUserOrDefaultProvider).id;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _notFound = false;
    });
    try {
      final post = await _repo.fetchPost(widget.postId, myMemberId: _myId);
      if (!mounted) return;
      setState(() {
        _post = post;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _notFound = e is ApiException && e.statusCode == 404;
        _error = _errorText(e);
      });
    }
  }

  String _errorText(Object e) =>
      e is ApiException
          ? e.message
          : 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.';

  void _message(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  void _leave() {
    if (context.canPop()) {
      context.pop();
    } else {
      // Opened straight from a link: there is no previous screen.
      context.go('/community');
    }
  }

  Future<void> _toggleLike() async {
    final before = _post;
    if (before == null) return;
    setState(() {
      _post = before.copyWith(
        isLikedByMe: !before.isLikedByMe,
        likesCount: before.likesCount + (before.isLikedByMe ? -1 : 1),
      );
    });
    try {
      final result = await _repo.toggleLike(before.id);
      if (!mounted) return;
      setState(() {
        _post = _post?.copyWith(
          isLikedByMe: result.liked,
          likesCount: result.count,
        );
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _post = before);
      _message(_errorText(e));
    }
  }

  void _openComments() {
    final post = _post;
    if (post == null) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (ctx) => PostCommentsSheet(
            post: post,
            errorText: _errorText,
            onSend: (text) async {
              final comments = await _repo.addComment(
                post.id,
                text,
                myMemberId: _myId,
              );
              if (mounted) {
                setState(() => _post = _post?.copyWith(comments: comments));
              }
              return comments;
            },
            onReport: (comment) {
              Navigator.pop(ctx);
              _report(targetType: 'comment', targetId: comment.id);
            },
          ),
    );
  }

  Future<void> _share() async {
    final post = _post;
    if (post == null) return;
    final shared = await shareText(
      postShareText(
        postId: post.id,
        author: post.authorName,
        content: post.content,
      ),
    );
    if (!shared) _message(copiedForSharingMessage);
  }

  Future<void> _report({
    required String targetType,
    required String targetId,
  }) async {
    final reason = await showModalBottomSheet<ReportReason>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder:
          (ctx) => SafeArea(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      'तक्रारीचे कारण निवडा',
                      style: GoogleFonts.mukta(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  for (final r in ReportReason.values)
                    ListTile(
                      title: Text(r.label),
                      onTap: () => Navigator.pop(ctx, r),
                    ),
                ],
              ),
            ),
          ),
    );
    if (reason == null || !mounted) return;
    try {
      await _repo.report(
        targetType: targetType,
        targetId: targetId,
        reason: reason,
      );
      _message('तक्रार नोंदवली गेली. आमची टीम ती तपासेल.');
    } catch (e) {
      _message(_errorText(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final post = _post;
    return PopScope(
      canPop: context.canPop(),
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go('/community');
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFFAF7F2),
        appBar: AppBar(
          leading: IconButton(
            tooltip: 'मागे',
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: _leave,
          ),
          title: Text(
            'समाज पोस्ट',
            style: GoogleFonts.mukta(fontWeight: FontWeight.w800, fontSize: 18),
          ),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF2B1B12),
          elevation: 0.5,
          actions: [
            if (post != null && !post.isMine)
              IconButton(
                tooltip: 'पोस्टची तक्रार करा',
                icon: const Icon(Icons.flag_outlined),
                onPressed: () => _report(targetType: 'post', targetId: post.id),
              ),
          ],
        ),
        body: SafeArea(
          child:
              _loading
                  ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFFE84C10)),
                  )
                  : post == null
                  ? _problem()
                  : _content(post),
        ),
      ),
    );
  }

  Widget _problem() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _notFound ? Icons.search_off_rounded : Icons.wifi_off_rounded,
              size: 48,
              color: const Color(0xFFE84C10),
            ),
            const SizedBox(height: 14),
            Text(
              _notFound ? 'ही पोस्ट उपलब्ध नाही' : 'पोस्ट लोड करता आली नाही',
              textAlign: TextAlign.center,
              style: GoogleFonts.mukta(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _notFound
                  ? 'पोस्ट हटवली गेली असेल किंवा लिंक चुकीची असेल.'
                  : (_error ?? ''),
              textAlign: TextAlign.center,
              style: GoogleFonts.mukta(
                fontSize: 13,
                height: 1.45,
                color: const Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 18),
            if (!_notFound)
              FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFE84C10),
                ),
                onPressed: _load,
                child: const Text('पुन्हा प्रयत्न करा'),
              ),
            TextButton(
              onPressed: () => context.go('/community'),
              child: Text(
                'समाज फीड पहा',
                style: GoogleFonts.mukta(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFFE84C10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _content(CommunityFeedPost post) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF0E8DF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  post.isMine
                      ? const MyAvatar(size: 44)
                      : MemberAvatar(
                        name: post.authorName,
                        photoUrl: post.authorPhotoUrl,
                        size: 44,
                      ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post.authorName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.mukta(
                            fontSize: 15.5,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF1F2937),
                          ),
                        ),
                        Text(
                          [
                            post.authorTitle,
                            post.timeAgo,
                          ].where((s) => s.isNotEmpty).join(' • '),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.mukta(
                            fontSize: 12,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              if (post.content.isNotEmpty)
                SelectableText(
                  post.content,
                  style: GoogleFonts.mukta(
                    fontSize: 15.5,
                    height: 1.55,
                    color: const Color(0xFF1F2937),
                  ),
                ),
              if (post.imageUrl != null) ...[
                const SizedBox(height: 12),
                PostImage(url: post.imageUrl!, maxHeight: 420),
              ],
              const SizedBox(height: 10),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              Row(
                children: [
                  TextButton.icon(
                    onPressed: _toggleLike,
                    icon: Icon(
                      post.isLikedByMe
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      size: 19,
                      color:
                          post.isLikedByMe
                              ? const Color(0xFFE84C10)
                              : const Color(0xFF6B7280),
                    ),
                    label: Text(
                      '${post.likesCount}',
                      style: GoogleFonts.mukta(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF4B5563),
                      ),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: _openComments,
                    icon: const Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 18,
                      color: Color(0xFF6B7280),
                    ),
                    label: Text(
                      '${post.commentsCount} टिप्पण्या',
                      style: GoogleFonts.mukta(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF4B5563),
                      ),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    tooltip: 'शेअर करा',
                    onPressed: _share,
                    icon: const Icon(
                      Icons.share_outlined,
                      size: 20,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFFE84C10),
            side: const BorderSide(color: Color(0xFFE84C10)),
            padding: const EdgeInsets.symmetric(vertical: 13),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: () => context.go('/community'),
          child: Text(
            'संपूर्ण समाज फीड पहा',
            style: GoogleFonts.mukta(
              fontSize: 14.5,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}
