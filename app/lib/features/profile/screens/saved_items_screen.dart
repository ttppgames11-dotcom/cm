import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/favorites/favorites_store.dart';
import '../../../data/forts_data.dart';
import '../../../data/warriors_data.dart';
import '../widgets/profile_subpage_header.dart';

/// "जतन केलेले" — the forts and warriors the member marked with the heart
/// button ([FavoritesStore]). Only what was really saved is listed; with
/// nothing saved the screen says so and points to where the hearts are.
class SavedItemsScreen extends StatefulWidget {
  const SavedItemsScreen({super.key});

  @override
  State<SavedItemsScreen> createState() => _SavedItemsScreenState();
}

class _SavedItemsScreenState extends State<SavedItemsScreen> {
  final FavoritesStore _favorites = FavoritesStore.instance;

  @override
  void initState() {
    super.initState();
    _favorites.addListener(_onChanged);
    _favorites.load();
  }

  @override
  void dispose() {
    _favorites.removeListener(_onChanged);
    super.dispose();
  }

  void _onChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final fortIds = _favorites.fortIds;
    final warriorIds = _favorites.warriorIds;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'जतन केलेले',
              subtitle: 'तुमचे आवडते किल्ले व वीर',
              icon: Icons.bookmark_border_rounded,
            ),
            Expanded(
              child:
                  fortIds.isEmpty && warriorIds.isEmpty
                      ? _empty(context)
                      : ListView(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                        physics: const BouncingScrollPhysics(),
                        children: [
                          for (final id in fortIds) _fortTile(context, id),
                          for (final id in warriorIds)
                            _warriorTile(context, id),
                        ],
                      ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _empty(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: const BoxDecoration(
                color: Color(0xFFFFF1E6),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_border_rounded,
                size: 40,
                color: Color(0xFFE84C10),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'अजून काहीही जतन केलेले नाही',
              textAlign: TextAlign.center,
              style: GoogleFonts.mukta(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'किल्ला किंवा वीराच्या पानावरील ♥ दाबा — ते येथे दिसेल.',
              textAlign: TextAlign.center,
              style: GoogleFonts.mukta(
                fontSize: 13,
                height: 1.45,
                color: const Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFE84C10),
                side: const BorderSide(color: Color(0xFFE84C10)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () => context.push('/heritage'),
              child: Text(
                'किल्ले व वीर पहा',
                style: GoogleFonts.mukta(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _fortTile(BuildContext context, String id) {
    final fort = FortsData.getFortById(id);
    return _tile(
      context,
      image: fort.carouselImages.isNotEmpty ? fort.carouselImages.first : null,
      fallbackIcon: Icons.fort_rounded,
      title: fort.name,
      line1: '📍 ${fort.district}',
      line2: fort.subtitle,
      onTap: () => context.push('/fort/$id'),
      onRemove: () => _favorites.toggleFort(id),
    );
  }

  Widget _warriorTile(BuildContext context, String id) {
    final warrior = WarriorsData.getWarriorById(id);
    return _tile(
      context,
      image: warrior.imagePath,
      fallbackIcon: Icons.shield_rounded,
      title: warrior.name,
      line1: warrior.roleTag,
      line2: warrior.era,
      onTap: () => context.push('/warrior/$id'),
      onRemove: () => _favorites.toggleWarrior(id),
    );
  }

  Widget _tile(
    BuildContext context, {
    required String? image,
    required IconData fallbackIcon,
    required String title,
    required String line1,
    required String line2,
    required VoidCallback onTap,
    required VoidCallback onRemove,
  }) {
    Widget placeholder() => Container(
      width: 56,
      height: 56,
      color: const Color(0xFFFBEFE6),
      child: Icon(fallbackIcon, color: const Color(0xFFE84C10)),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        elevation: 1,
        shadowColor: Colors.black.withAlpha(30),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 4, 12),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child:
                      image == null || image.isEmpty
                          ? placeholder()
                          : Image.asset(
                            image,
                            width: 56,
                            height: 56,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => placeholder(),
                          ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.mukta(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        line1,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.mukta(
                          fontSize: 11.5,
                          color: const Color(0xFF6B7280),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        line2,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.mukta(
                          fontSize: 11,
                          color: const Color(0xFF9CA3AF),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'आवडीमधून काढा',
                  icon: const Icon(
                    Icons.favorite_rounded,
                    color: Color(0xFFE84C10),
                    size: 22,
                  ),
                  onPressed: onRemove,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
