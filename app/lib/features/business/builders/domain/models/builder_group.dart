import 'builder_project.dart';
import '../utils/builder_utils.dart';

/// Aggregated Builder representation grouping multiple projects by developer.
class BuilderGroup {
  final String developer;
  final List<BuilderProject> projects;
  final String? ownerName;
  final String? city;
  final int? flatsDelivered;
  final List<String> amenities;
  final String? discountForMembers;
  final String? phone;
  final String primaryProjectId;
  final bool hasRera;
  final String? reraNumber;
  final Set<String> projectTypes;

  String? get primaryPhone => phone;

  const BuilderGroup({
    required this.developer,
    required this.projects,
    this.ownerName,
    this.city,
    this.flatsDelivered,
    this.amenities = const [],
    this.discountForMembers,
    this.phone,
    required this.primaryProjectId,
    this.hasRera = false,
    this.reraNumber,
    this.projectTypes = const {},
  });

  /// Groups a list of [BuilderProject] records by developer name.
  /// Takes ownerName, flatsDelivered, amenities, and discountForMembers
  /// from the first record in the group that has them.
  static List<BuilderGroup> groupProjects(List<BuilderProject> projects) {
    if (projects.isEmpty) return [];

    final Map<String, List<BuilderProject>> map = {};
    for (final p in projects) {
      final dev = (p.developer ?? p.projectName ?? 'अज्ञात बिल्डर').trim();
      final key = dev.toLowerCase();
      map.putIfAbsent(key, () => []).add(p);
    }

    final List<BuilderGroup> groups = [];
    for (final entry in map.entries) {
      final groupProjects = entry.value;
      if (groupProjects.isEmpty) continue;

      final first = groupProjects.first;
      final devName = (first.developer ?? first.projectName ?? 'अज्ञात बिल्डर').trim();

      // Find first record having each field
      String? ownerName;
      int? flatsDelivered;
      List<String> amenities = [];
      String? discountForMembers;
      String? city;
      String? phone;
      bool hasRera = false;
      String? reraNumber;
      final Set<String> types = {};

      for (final p in groupProjects) {
        if (ownerName == null && p.ownerName != null && p.ownerName!.trim().isNotEmpty) {
          ownerName = p.ownerName!.trim();
        }
        if (flatsDelivered == null && p.flatsDelivered != null && p.flatsDelivered! > 0) {
          flatsDelivered = p.flatsDelivered;
        }
        if (amenities.isEmpty && p.amenities.isNotEmpty) {
          amenities = List<String>.from(p.amenities);
        }
        if (discountForMembers == null && p.discountForMembers != null && p.discountForMembers!.trim().isNotEmpty) {
          discountForMembers = p.discountForMembers!.trim();
        }
        if (city == null && (p.city?.trim().isNotEmpty == true || p.location?.trim().isNotEmpty == true)) {
          city = (p.city?.trim().isNotEmpty == true ? p.city : p.location)?.trim();
        }
        if (phone == null && p.phone != null && p.phone!.trim().isNotEmpty) {
          phone = p.phone!.trim();
        }
        if (p.reraApproved && p.reraNumber != null && p.reraNumber!.trim().isNotEmpty) {
          hasRera = true;
          reraNumber ??= p.reraNumber!.trim();
        }

        // Infer project type for each project in group
        final t = BuilderUtils.inferProjectType(p);
        if (t != null) {
          types.add(t);
        }
      }

      groups.add(
        BuilderGroup(
          developer: devName,
          projects: groupProjects,
          ownerName: ownerName,
          city: city ?? 'महाराष्ट्र',
          flatsDelivered: flatsDelivered,
          amenities: amenities,
          discountForMembers: discountForMembers,
          phone: phone,
          primaryProjectId: first.id,
          hasRera: hasRera,
          reraNumber: reraNumber,
          projectTypes: types,
        ),
      );
    }

    return groups;
  }
}
