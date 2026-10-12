import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../domain/models/dairy_item.dart';
import '../providers/dairy_providers.dart';
import 'farmer_registration_sheet.dart';

class CollectionCenterCard extends ConsumerWidget {
  final DairyItem centre;

  const CollectionCenterCard({
    super.key,
    required this.centre,
  });

  Future<void> _makeCall(BuildContext context, String? phone) async {
    if (phone == null || phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('संपर्क क्रमांक उपलब्ध नाही')),
      );
      return;
    }
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('कॉल करता आला नाही')),
        );
      }
    }
  }

  void _openRegistrationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FarmerRegistrationSheet(centre: centre),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.watch(dairyRepositoryProvider);
    final locationText = centre.formattedLocation;
    final timingsText = centre.formattedTimings;
    final hasCowRate = centre.milkRateCow != null && centre.milkRateCow!.trim().isNotEmpty;
    final hasBuffaloRate = centre.milkRateBuffalo != null && centre.milkRateBuffalo!.trim().isNotEmpty;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC8E6C9), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Centre Name & Active Badge
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    centre.displayName,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1B5E20),
                      letterSpacing: -0.2,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFA5D6A7)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_rounded, size: 13, color: Color(0xFF2E7D32)),
                      const SizedBox(width: 4),
                      Text(
                        centre.verified ? 'मान्यताप्राप्त' : 'सक्रिय केंद्र',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Location Line (Only if present)
            if (locationText.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF388E3C)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      locationText,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF424242),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Timings Line (Only if present)
            if (timingsText != null) ...[
              const SizedBox(height: 6),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.access_time_filled_rounded, size: 15, color: Color(0xFF558B2F)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      timingsText,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFF555555),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Daily Collection & Registered Farmers Row
            if ((centre.dailyCollection != null && centre.dailyCollection!.trim().isNotEmpty) ||
                (centre.registeredFarmers != null && centre.registeredFarmers! > 0)) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F8E9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    if (centre.dailyCollection != null && centre.dailyCollection!.trim().isNotEmpty) ...[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'दैनिक संकलन',
                              style: TextStyle(fontSize: 11, color: Color(0xFF689F38), fontWeight: FontWeight.w600),
                            ),
                            Text(
                              centre.dailyCollection!.trim(),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF1B5E20),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (centre.registeredFarmers != null && centre.registeredFarmers! > 0) ...[
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'शेतकरी संख्या',
                              style: TextStyle(fontSize: 11, color: Color(0xFF689F38), fontWeight: FontWeight.w600),
                            ),
                            Text(
                              '${centre.registeredFarmers}+ शेतकरी',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF1B5E20),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],

            // Centre Head Line (Only if present)
            if (centre.centerHead != null && centre.centerHead!.trim().isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person_rounded, size: 15, color: Color(0xFF616161)),
                  const SizedBox(width: 6),
                  Text(
                    'प्रमुख: ${centre.centerHead!.trim()}',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF424242),
                    ),
                  ),
                ],
              ),
            ],

            // Milk Rates Section (Only if present)
            if (hasCowRate || hasBuffaloRate) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFDE7),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFFF59D)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (hasCowRate) ...[
                          Text(
                            '🐄 गाय: ${centre.milkRateCow!.trim()}',
                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFFF57F17)),
                          ),
                          const SizedBox(width: 14),
                        ],
                        if (hasBuffaloRate) ...[
                          Text(
                            '🐃 म्हैस: ${centre.milkRateBuffalo!.trim()}',
                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFFE65100)),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      '* फॅट व गुणवत्तेनुसार प्रत्यक्ष दर बदलू शकतात',
                      style: TextStyle(fontSize: 10.5, fontStyle: FontStyle.italic, color: Color(0xFF757575)),
                    ),
                  ],
                ),
              ),
            ],

            // Facilities tags (Only if present)
            if (centre.facilities.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: centre.facilities.take(4).map((f) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F8E9),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFDCEDC8)),
                    ),
                    child: Text(
                      f,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF33691E),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFEEEEEE)),
            const SizedBox(height: 12),

            // Actions Row: Call Button and "नोंदणी करा" (Registration) Button
            Row(
              children: [
                if (centre.primaryPhone != null) ...[
                  OutlinedButton.icon(
                    onPressed: () => _makeCall(context, centre.primaryPhone),
                    icon: const Icon(Icons.call_rounded, size: 16),
                    label: const Text('कॉल'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF2E7D32),
                      side: const BorderSide(color: Color(0xFF2E7D32), width: 1.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],

                // Registration Button (Hide if backend returned 404/405 fallback)
                if (repo.isRegistrationSupported) ...[
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _openRegistrationSheet(context),
                      icon: const Icon(Icons.how_to_reg_rounded, size: 18),
                      label: const Text(
                        'नोंदणी करा',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B5E20),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
