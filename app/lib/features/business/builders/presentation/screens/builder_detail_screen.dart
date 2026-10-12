import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../domain/models/builder_group.dart';
import '../../domain/models/builder_project.dart';
import '../providers/builders_providers.dart';
import '../widgets/enquiry_bottom_sheet.dart';

class BuilderDetailScreen extends ConsumerWidget {
  const BuilderDetailScreen({
    super.key,
    required this.builderId,
  });

  final String builderId;

  Future<void> _makeCall(BuildContext context, String? phone) async {
    if (phone == null || phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('फोन नंबर उपलब्ध नाही.')),
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
          const SnackBar(content: Text('कॉल सुरू करता आला नाही.')),
        );
      }
    }
  }

  Future<void> _openWhatsApp(BuildContext context, String? phone, String devName) async {
    if (phone == null || phone.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('व्हॉट्सॲप नंबर उपलब्ध नाही.')),
      );
      return;
    }
    var clean = phone.replaceAll(RegExp(r'\D'), '');
    if (clean.length == 10) clean = '91$clean';
    final text = Uri.encodeComponent('नमस्कार $devName, मला आपल्या प्रकल्पाबद्दल माहिती हवी आहे.');
    final uri = Uri.parse('https://wa.me/$clean?text=$text');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('व्हॉट्सॲप उघडता आले नाही.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groups = ref.watch(builderGroupsProvider);
    final enquiryUnsupported = ref.watch(builderEnquiryUnsupportedProvider);

    // Find the group containing this project ID, or matching by ID directly
    BuilderGroup? group;
    for (final g in groups) {
      if (g.primaryProjectId == builderId || g.projects.any((p) => p.id == builderId)) {
        group = g;
        break;
      }
    }

    // Fallback if not loaded yet: show loading
    if (group == null) {
      final projectsAsync = ref.watch(buildersProjectsProvider);
      return projectsAsync.when(
        loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
        error: (err, _) => Scaffold(
          appBar: AppBar(title: const Text('तपशील')),
          body: Center(child: Text('त्रुटी: $err')),
        ),
        data: (_) {
          return Scaffold(
            appBar: AppBar(title: const Text('तपशील')),
            body: const Center(child: Text('बिल्डर माहिती आढळली नाही.')),
          );
        },
      );
    }

    final firstChar = group.developer.isNotEmpty ? group.developer[0] : 'ब';

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        title: Text(
          group.developer,
          style: const TextStyle(
            fontSize: 17.5,
            fontWeight: FontWeight.w800,
            color: Color(0xFF2B1B12),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF2B1B12), size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Rich Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF8B1E1E), Color(0xFFC62828), Color(0xFFE65100)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      // Large Avatar
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.15),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            firstChar,
                            style: const TextStyle(
                              color: Color(0xFF8B1E1E),
                              fontSize: 30,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              group.developer,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            if (group.ownerName != null && group.ownerName!.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.person_rounded, size: 14, color: Colors.white70),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      group.ownerName!,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            if (group.city != null && group.city!.isNotEmpty) ...[
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFFFCC80)),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      group.city!,
                                      style: const TextStyle(fontSize: 12.5, color: Colors.white70),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Member discount badge in banner
                  if (group.discountForMembers != null && group.discountForMembers!.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.stars_rounded, size: 16, color: Color(0xFFFFD54F)),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              group.discountForMembers!,
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // 2. Action Buttons (Call and WhatsApp)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _makeCall(context, group?.phone),
                      icon: const Icon(Icons.phone_rounded, size: 18),
                      label: const Text('कॉल करा'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF2E7D32),
                        side: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _openWhatsApp(context, group?.phone, group?.developer ?? ''),
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                      label: const Text('व्हॉट्सॲप'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 1,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 3. About / Configuration Section
            if (group.projects.first.configuration != null &&
                group.projects.first.configuration!.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEDE3D8)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'बिल्डर माहिती (About)',
                        style: TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2B1B12),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        group.projects.first.configuration!,
                        style: const TextStyle(
                          fontSize: 13,
                          height: 1.4,
                          color: Color(0xFF6D4C41),
                        ),
                      ),
                      if (group.amenities.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        const Text(
                          'प्रकल्प वैशिष्ट्ये व सुविधा:',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF5D4037)),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: group.amenities.map((a) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF3E0),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFFFE0B2)),
                              ),
                              child: Text(
                                a,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFD84315)),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),
            ],

            // 4. Projects Header & Cards
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              child: Row(
                children: [
                  const Icon(Icons.home_work_rounded, color: Color(0xFF8B1E1E), size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'उपलब्ध प्रकल्प (${group.projects.length})',
                    style: const TextStyle(
                      fontSize: 16.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Individual Project Cards
            ...group.projects.map((proj) => _buildProjectCard(proj)),

            const SizedBox(height: 100), // Spacing for sticky bottom enquiry button
          ],
        ),
      ),
      bottomSheet: !enquiryUnsupported
          ? Container(
              padding: EdgeInsets.fromLTRB(
                16,
                12,
                16,
                MediaQuery.of(context).padding.bottom + 12,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    EnquiryBottomSheet.show(context, group!);
                  },
                  icon: const Icon(Icons.send_rounded, size: 18),
                  label: const Text(
                    'चौकशी करा (Enquire Now)',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B1E1E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildProjectCard(BuilderProject project) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE3D8)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    project.projectName ?? 'गृहप्रकल्प',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                ),
                if (project.reraApproved && project.reraNumber != null && project.reraNumber!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'RERA: ${project.reraNumber}',
                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF2E7D32)),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),

            if (project.location != null && project.location!.isNotEmpty) ...[
              Row(
                children: [
                  const Icon(Icons.place_outlined, size: 14, color: Color(0xFFE65100)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      project.location!,
                      style: const TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
            ],

            if (project.configuration != null && project.configuration!.isNotEmpty) ...[
              Text(
                project.configuration!,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Color(0xFF5D4037)),
              ),
              const SizedBox(height: 4),
            ],

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (project.priceRange != null && project.priceRange!.isNotEmpty)
                  Text(
                    project.priceRange!,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                if (project.possessionDate != null && project.possessionDate!.isNotEmpty)
                  Text(
                    'ताबा: ${project.possessionDate!}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFE65100),
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
