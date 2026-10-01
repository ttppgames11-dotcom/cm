import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// The forts and warriors the member has marked with the heart button.
///
/// Kept on this phone (SharedPreferences) so they are still there after
/// leaving the screen or restarting the app, and shared by every screen that
/// shows a heart: the heritage list, the fort / warrior pages and
/// Profile → "जतन केलेले".
class FavoritesStore extends ChangeNotifier {
  FavoritesStore._();

  static final FavoritesStore instance = FavoritesStore._();

  static const _key = 'cm_favorites';
  static const _fort = 'fort:';
  static const _warrior = 'warrior:';

  Set<String> _entries = {};
  bool _loaded = false;

  /// Reads the saved favourites once; later calls return immediately.
  Future<void> load() async {
    if (_loaded) return;
    final prefs = await SharedPreferences.getInstance();
    _entries = (prefs.getStringList(_key) ?? const []).toSet();
    _loaded = true;
    notifyListeners();
  }

  bool isFort(String id) => _entries.contains('$_fort$id');
  bool isWarrior(String id) => _entries.contains('$_warrior$id');

  List<String> get fortIds => _idsOf(_fort);
  List<String> get warriorIds => _idsOf(_warrior);
  bool get isEmpty => _entries.isEmpty;

  List<String> _idsOf(String prefix) => [
    for (final e in _entries)
      if (e.startsWith(prefix)) e.substring(prefix.length),
  ];

  /// Toggles the fort and returns whether it is now a favourite.
  Future<bool> toggleFort(String id) => _toggle('$_fort$id');

  /// Toggles the warrior and returns whether it is now a favourite.
  Future<bool> toggleWarrior(String id) => _toggle('$_warrior$id');

  Future<bool> _toggle(String entry) async {
    await load();
    final added = !_entries.remove(entry);
    if (added) _entries.add(entry);
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_key, _entries.toList());
    return added;
  }

  /// Forgets what was loaded, so the next [load] reads storage again.
  @visibleForTesting
  void resetForTest() {
    _entries = {};
    _loaded = false;
  }
}
