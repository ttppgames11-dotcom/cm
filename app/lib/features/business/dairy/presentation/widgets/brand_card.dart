import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../domain/models/dairy_item.dart';

class BrandCard extends StatelessWidget {
  final DairyItem brand;

  const BrandCard({
    super.key,
    required this.brand,
  });

  Future<void> _handleTap(BuildContext context) async {
    // If website is available, open website; otherwise call
    if (brand.website != null && brand.website!.trim().isNotEmpty) {
      final uri = Uri.parse(brand.website!.trim());
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return;
      }
    }

    if (brand.primaryPhone != null && brand.primaryPhone!.trim().isNotEmpty) {
      final clean = brand.primaryPhone!.replaceAll(RegExp(r'\D'), '');
      final uri = Uri.parse('tel:$clean');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        return;
      }
    }
  }

  Future<void> _makeCall(BuildContext context) async {
    if (brand.primaryPhone != null && brand.primaryPhone!.trim().isNotEmpty) {
      final clean = brand.primaryPhone!.replaceAll(RegExp(r'\D'), '');
      final uri = Uri.parse('tel:$clean');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final initials = brand.displayName.isNotEmpty ? brand.displayName[0] : 'द';

    return Container(
      width: 250,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE0E0E0), width: 1.1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _handleTap(context),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Header with Avatar and Brand Name
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          brand.displayName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1B5E20),
                            height: 1.2,
                          ),
                        ),
                        if (brand.type != null && brand.type!.trim().isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            brand.type!.trim(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF616161),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              // Procurement & Headquarters Info
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (brand.dailyProcurement != null && brand.dailyProcurement!.trim().isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.water_drop_rounded, size: 14, color: Color(0xFF0288D1)),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            brand.dailyProcurement!.trim(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF37474F),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                  ],
                  if (brand.headquarters != null && brand.headquarters!.trim().isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.business_rounded, size: 14, color: Color(0xFF757575)),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            brand.headquarters!.trim(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF616161),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),

              const SizedBox(height: 8),

              // Bottom Actions (Call or Website icons)
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (brand.primaryPhone != null) ...[
                    InkWell(
                      onTap: () => _makeCall(context),
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.call_rounded, size: 13, color: Color(0xFF2E7D32)),
                            SizedBox(width: 4),
                            Text(
                              'कॉल',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF2E7D32)),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                  ],
                  if (brand.website != null && brand.website!.trim().isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE3F2FD),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.open_in_new_rounded, size: 13, color: Color(0xFF1565C0)),
                          SizedBox(width: 4),
                          Text(
                            'संकेतस्थळ',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF1565C0)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
