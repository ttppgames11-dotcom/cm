import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../auth/providers/auth_provider.dart';
import '../../data/builders_repository_impl.dart';
import '../../domain/models/builder_group.dart';
import '../../domain/models/builder_project.dart';
import '../../domain/repositories/builders_repository.dart';

/// Provider for [BuildersRepository].
final buildersRepositoryProvider = Provider<BuildersRepository>((ref) {
  return BuildersRepositoryImpl(ref.watch(apiClientProvider));
});

/// StateNotifier that manages builder projects list and refresh.
class BuildersNotifier extends StateNotifier<AsyncValue<List<BuilderProject>>> {
  BuildersNotifier(this._repository) : super(const AsyncValue.loading()) {
    fetchProjects();
  }

  final BuildersRepository _repository;

  Future<void> fetchProjects() async {
    state = const AsyncValue.loading();
    try {
      final list = await _repository.getProjects();
      state = AsyncValue.data(list);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }
}

final buildersProjectsProvider =
    StateNotifierProvider<BuildersNotifier, AsyncValue<List<BuilderProject>>>((ref) {
  final repo = ref.watch(buildersRepositoryProvider);
  return BuildersNotifier(repo);
});

/// Raw list of aggregated [BuilderGroup]s grouped by developer.
final builderGroupsProvider = Provider<List<BuilderGroup>>((ref) {
  final asyncVal = ref.watch(buildersProjectsProvider);
  final projects = asyncVal.value ?? [];
  return BuilderGroup.groupProjects(projects);
});

/// Search query provider.
final buildersSearchQueryProvider = StateProvider<String>((ref) => '');

/// Selected city filter provider (null = all cities).
final buildersCityFilterProvider = StateProvider<String?>((ref) => null);

/// Selected project type filter: null = all, or 'flats', 'villas', 'plots'.
final buildersTypeFilterProvider = StateProvider<String?>((ref) => null);

/// Flag tracking whether enquiry endpoint returned 404/405.
final builderEnquiryUnsupportedProvider = StateProvider<bool>((ref) => false);

/// In-memory draft for builder enquiry form.
class EnquiryDraft {
  final String name;
  final String phone;
  final String budget;
  final String preferredCity;
  final String message;

  const EnquiryDraft({
    this.name = '',
    this.phone = '',
    this.budget = '',
    this.preferredCity = '',
    this.message = '',
  });

  EnquiryDraft copyWith({
    String? name,
    String? phone,
    String? budget,
    String? preferredCity,
    String? message,
  }) {
    return EnquiryDraft(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      budget: budget ?? this.budget,
      preferredCity: preferredCity ?? this.preferredCity,
      message: message ?? this.message,
    );
  }
}

final builderEnquiryDraftProvider = StateProvider<EnquiryDraft>((ref) {
  final authController = ref.watch(authControllerProvider);
  final profile = authController.state.profile;
  return EnquiryDraft(
    name: profile?.name ?? '',
    preferredCity: profile?.city ?? '',
  );
});

/// Distinct list of cities derived from builder projects.
final allBuilderCitiesProvider = Provider<List<String>>((ref) {
  final groups = ref.watch(builderGroupsProvider);
  final Set<String> cities = {};
  for (final g in groups) {
    if (g.city != null && g.city!.trim().isNotEmpty) {
      // Split city if it contains comma (e.g. "पुणे, महाराष्ट्र" -> "पुणे")
      final parts = g.city!.split(RegExp(r'[,|]'));
      final primary = parts.first.trim();
      if (primary.isNotEmpty) cities.add(primary);
    }
  }
  return cities.toList()..sort();
});

/// Filtered list of [BuilderGroup]s based on search query, city, and project type.
final filteredBuilderGroupsProvider = Provider<List<BuilderGroup>>((ref) {
  final groups = ref.watch(builderGroupsProvider);
  final query = ref.watch(buildersSearchQueryProvider).trim().toLowerCase();
  final selectedCity = ref.watch(buildersCityFilterProvider);
  final selectedType = ref.watch(buildersTypeFilterProvider);

  return groups.where((g) {
    // 1. Search Query filter (matches developer name, any project name, or location/city)
    if (query.isNotEmpty) {
      final devMatch = g.developer.toLowerCase().contains(query);
      final cityMatch = (g.city ?? '').toLowerCase().contains(query);
      final projMatch = g.projects.any((p) =>
          (p.projectName ?? '').toLowerCase().contains(query) ||
          (p.location ?? '').toLowerCase().contains(query));
      if (!devMatch && !cityMatch && !projMatch) {
        return false;
      }
    }

    // 2. City Filter
    if (selectedCity != null && selectedCity.isNotEmpty && selectedCity != 'सर्व') {
      final cityStr = (g.city ?? '').toLowerCase();
      if (!cityStr.contains(selectedCity.toLowerCase())) {
        return false;
      }
    }

    // 3. Project Type Filter ("flats", "villas", "plots")
    if (selectedType != null && selectedType.isNotEmpty && selectedType != 'all') {
      if (!g.projectTypes.contains(selectedType.toLowerCase())) {
        return false;
      }
    }

    return true;
  }).toList();
});
