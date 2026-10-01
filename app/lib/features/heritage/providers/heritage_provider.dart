import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/forts_data.dart';
import '../../../data/warriors_data.dart';
import '../../../widgets/home/home_models.dart';
import '../repositories/heritage_repository.dart';

/// Provider for [HeritageRepository].
final heritageRepositoryProvider = Provider<HeritageRepository>((ref) {
  return const LocalHeritageRepository();
});

/// Provider for all Forts.
final fortsProvider = FutureProvider<List<Fort>>((ref) async {
  final repository = ref.watch(heritageRepositoryProvider);
  return repository.getAllForts();
});

/// Family provider for specific Fort details by ID.
final fortDetailProvider = FutureProvider.family<FortDetailModel?, String>((
  ref,
  id,
) async {
  final repository = ref.watch(heritageRepositoryProvider);
  return repository.getFortDetail(id);
});

/// Provider for all Warriors.
final warriorsProvider = FutureProvider<List<Warrior>>((ref) async {
  final repository = ref.watch(heritageRepositoryProvider);
  return repository.getAllWarriors();
});

/// Family provider for specific Warrior details by ID.
final warriorDetailProvider =
    FutureProvider.family<WarriorDetailModel?, String>((ref, id) async {
      final repository = ref.watch(heritageRepositoryProvider);
      return repository.getWarriorDetail(id);
    });

/// State containing combined heritage data.
class HeritageState {
  const HeritageState({required this.forts, required this.warriors});

  final List<Fort> forts;
  final List<Warrior> warriors;
}

/// Provider for combined Heritage state.
final heritageProvider = FutureProvider<HeritageState>((ref) async {
  final forts = await ref.watch(fortsProvider.future);
  final warriors = await ref.watch(warriorsProvider.future);
  return HeritageState(forts: forts, warriors: warriors);
});
