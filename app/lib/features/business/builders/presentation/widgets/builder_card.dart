import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../domain/models/builder_group.dart';

class BuilderCard extends StatelessWidget {
  const BuilderCard({
    super.key,
    required this.group,
  });

  final BuilderGroup group;

  @override
  Widget build(BuildContext context) {
    final firstChar = group.developer.isNotEmpty ? group.developer[0] : 'ब';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEDE3D8), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Avatar + Developer info + RERA badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // First-letter Avatar with rich gradient
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF8B1E1E), Color(0xFFE65100)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF8B1E1E).withValues(alpha: 0.2),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      firstChar,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Developer name + Owner/President
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        group.developer,
                        style: const TextStyle(
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      if (group.ownerName != null && group.ownerName!.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            const Icon(Icons.person_outline_rounded, size: 14, color: Color(0xFF7A6A5D)),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                group.ownerName!,
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF5D4037),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (group.city != null && group.city!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: Color(0xFFE65100)),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                group.city!,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF7A6A5D)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

                // RERA Badge: Only if reraApproved is true AND reraNumber exists
                if (group.hasRera && group.reraNumber != null && group.reraNumber!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFA5D6A7)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, size: 13, color: Color(0xFF2E7D32)),
                        SizedBox(width: 4),
                        Text(
                          'RERA',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 12),

            // Middle Badges: Flats delivered & Member discount
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                // "N+ फ्लॅट्स हस्तांतरित" only if flatsDelivered exists
                if (group.flatsDelivered != null && group.flatsDelivered! > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFFCC80)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.apartment_rounded, size: 13, color: Color(0xFFE65100)),
                        const SizedBox(width: 4),
                        Text(
                          '${group.flatsDelivered}+ फ्लॅट्स हस्तांतरित',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFD84315),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Member discount badge only if discountForMembers exists
                if (group.discountForMembers != null && group.discountForMembers!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFEF9A9A)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.stars_rounded, size: 13, color: Color(0xFFC62828)),
                        const SizedBox(width: 4),
                        Text(
                          group.discountForMembers!,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFC62828),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            // Amenities Tags (up to 4)
            if (group.amenities.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: group.amenities.take(4).map((amenity) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAF7F2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFE0D5C9)),
                    ),
                    child: Text(
                      '• $amenity',
                      style: const TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF6D4C41),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFF0E5D8)),
            const SizedBox(height: 12),

            // Bottom Row: Projects count + "तपशील" Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${group.projects.length} प्रकल्प उपलब्ध',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF8D6E63),
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    context.push('/business/builders/${group.primaryProjectId}');
                  },
                  icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                  label: const Text('तपशील'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E), // Maratha Maroon
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    elevation: 0.5,
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
