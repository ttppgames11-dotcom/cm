import '../../../data/forts_data.dart';
import '../../../data/warriors_data.dart';
import '../../../widgets/home/home_models.dart';

/// Repository interface for Maratha Heritage data (Forts & Warriors).
abstract class HeritageRepository {
  Future<List<Fort>> getAllForts();
  Future<FortDetailModel?> getFortDetail(String id);
  Future<List<Warrior>> getAllWarriors();
  Future<WarriorDetailModel?> getWarriorDetail(String id);
}

/// Local implementation of [HeritageRepository] backed by [FortsData] and [WarriorsData].
class LocalHeritageRepository implements HeritageRepository {
  const LocalHeritageRepository();

  @override
  Future<List<Fort>> getAllForts() async {
    return Fort.defaultForts;
  }

  @override
  Future<FortDetailModel?> getFortDetail(String id) async {
    return FortsData.getFortById(id);
  }

  @override
  Future<List<Warrior>> getAllWarriors() async {
    return Warrior.defaultWarriors;
  }

  @override
  Future<WarriorDetailModel?> getWarriorDetail(String id) async {
    return WarriorsData.getWarriorById(id);
  }
}
