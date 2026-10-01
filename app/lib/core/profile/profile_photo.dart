import 'dart:async';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/providers/auth_provider.dart';
import '../config/api_config.dart';
import '../network/api_client.dart';

/// The member's own profile photo on this phone. The same photo is uploaded
/// to the server ([ProfilePhotoApi]) so other members see it; the copy kept
/// here lets the member's own screens show it instantly and offline.
/// One file per member ID, so a second account on the same phone never
/// shows the first account's photo.
class ProfilePhotoStore {
  /// [baseDir] replaces the app documents folder (tests).
  ProfilePhotoStore({Future<Directory> Function()? baseDir})
    : _baseDir = baseDir ?? getApplicationDocumentsDirectory;

  final Future<Directory> Function() _baseDir;

  Future<Directory> _dir() async {
    final base = await _baseDir();
    final dir = Directory('${base.path}/profile_photos');
    if (!dir.existsSync()) await dir.create(recursive: true);
    return dir;
  }

  static String _safe(String memberId) =>
      memberId.replaceAll(RegExp(r'[^A-Za-z0-9_-]'), '_');

  static String _prefix(String memberId) => '${_safe(memberId)}_';

  Future<List<File>> _filesOf(String memberId) async {
    final prefix = _prefix(memberId);
    return (await _dir())
        .listSync()
        .whereType<File>()
        .where((f) => f.uri.pathSegments.last.startsWith(prefix))
        .toList();
  }

  Future<File?> load(String memberId) async {
    final files = await _filesOf(memberId);
    if (files.isEmpty) return null;
    files.sort((a, b) => b.path.compareTo(a.path));
    return files.first;
  }

  /// Copies the picked image into app storage. A new file name each time, so
  /// Flutter's image cache never shows the previous photo.
  Future<File> save(String memberId, String sourcePath) async {
    final old = await _filesOf(memberId);
    final stamp = DateTime.now().millisecondsSinceEpoch;
    final saved = await File(
      sourcePath,
    ).copy('${(await _dir()).path}/${_prefix(memberId)}$stamp.jpg');
    for (final f in old) {
      await f.delete();
    }
    return saved;
  }

  Future<void> remove(String memberId) async {
    for (final f in await _filesOf(memberId)) {
      await f.delete();
    }
  }

  static String _syncKey(String memberId) =>
      'cm_photo_synced_${_safe(memberId)}';

  /// Marks a photo on this phone that still has to be uploaded.
  static const pendingUpload = 'pending';

  /// Server path of the photo the file on this phone was uploaded as,
  /// [pendingUpload] while it still has to be uploaded, or '' when unknown
  /// (a photo saved by an older version of the app).
  Future<String> uploadedAs(String memberId) async =>
      (await SharedPreferences.getInstance()).getString(_syncKey(memberId)) ??
      '';

  Future<void> markUploadedAs(String memberId, String serverPath) async =>
      (await SharedPreferences.getInstance()).setString(
        _syncKey(memberId),
        serverPath,
      );
}

final profilePhotoStoreProvider = Provider<ProfilePhotoStore>(
  (ref) => ProfilePhotoStore(),
);

/// Profile photo on the server (what other members see).
class ProfilePhotoApi {
  ProfilePhotoApi(this._api);

  final ApiClient _api;

  /// Uploads [file] as the member's photo; returns its server path.
  Future<String> upload(File file) async {
    final data = await _api.uploadImage(
      '/api/media/profile',
      await file.readAsBytes(),
    );
    return (data['photo'] ?? '').toString();
  }

  Future<void> remove() => _api.delete('/api/media/profile', auth: true);
}

final profilePhotoApiProvider = Provider<ProfilePhotoApi>(
  (ref) => ProfilePhotoApi(ref.watch(apiClientProvider)),
);

/// Photo file of the signed-in member on this phone; `null` means none here
/// (their server photo, if any, or their initials are shown — see `MyAvatar`).
final myProfilePhotoProvider =
    AsyncNotifierProvider<MyProfilePhotoNotifier, File?>(
      MyProfilePhotoNotifier.new,
    );

class MyProfilePhotoNotifier extends AsyncNotifier<File?> {
  String? get _memberId => ref.read(authControllerProvider).state.profile?.id;

  ProfilePhotoStore get _store => ref.read(profilePhotoStoreProvider);

  @override
  Future<File?> build() async {
    final id = ref.watch(
      authControllerProvider.select((auth) => auth.state.profile?.id),
    );
    if (id == null || id.isEmpty) return null;
    final local = await _store.load(id);
    if (local == null || ApiConfig.demoMode) return local;

    final server = ref.read(authControllerProvider).state.profile?.photo ?? '';
    final uploadedAs = await _store.uploadedAs(id);
    if (uploadedAs.isNotEmpty && uploadedAs == server) return local;
    if (uploadedAs == ProfilePhotoStore.pendingUpload ||
        (uploadedAs.isEmpty && server.isEmpty)) {
      // The last upload failed (no internet), or the photo comes from an older
      // version of the app that kept photos on the phone only: upload it now
      // so other members see it.
      unawaited(_upload(id, local).catchError((_) {}));
      return local;
    }
    // The photo was changed or removed on another phone: this copy is stale.
    await _store.remove(id);
    await _store.markUploadedAs(id, '');
    return null;
  }

  /// Saves the picked photo on this phone and uploads it. Throws an
  /// [ApiException] when the upload fails; the photo is then still shown on
  /// this phone and is uploaded the next time the app starts.
  Future<void> setPhoto(String sourcePath) async {
    final id = _memberId;
    if (id == null || id.isEmpty) return;
    final saved = await _store.save(id, sourcePath);
    await _store.markUploadedAs(id, ProfilePhotoStore.pendingUpload);
    state = AsyncData(saved);
    if (ApiConfig.demoMode) return;
    await _upload(id, saved);
  }

  /// Removes the photo from this phone and from the server.
  Future<void> removePhoto() async {
    final id = _memberId;
    if (id == null || id.isEmpty) return;
    await _store.remove(id);
    await _store.markUploadedAs(id, '');
    state = const AsyncData(null);
    if (ApiConfig.demoMode) return;
    await ref.read(profilePhotoApiProvider).remove();
    await _setServerPhoto('');
  }

  Future<void> _upload(String id, File file) async {
    final serverPath = await ref.read(profilePhotoApiProvider).upload(file);
    await _store.markUploadedAs(id, serverPath);
    await _setServerPhoto(serverPath);
  }

  /// Keeps the signed-in profile (and its cached copy) in step with the server.
  Future<void> _setServerPhoto(String serverPath) async {
    final auth = ref.read(authControllerProvider);
    auth.setProfilePhoto(serverPath);
    final profile = auth.state.profile;
    if (profile != null) {
      await ref.read(authLocalDataSourceProvider).saveSession(profile);
    }
  }
}
