import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/core/network/api_client.dart';
import '../../../../auth/providers/auth_provider.dart';
import '../../data/meetings_repository_impl.dart';
import '../../domain/models/meeting.dart';
import '../../domain/models/meeting_member.dart';
import '../../domain/repositories/meetings_repository.dart';
import '../../domain/utils/meeting_date_utils.dart';

/// Provider for [MeetingsRepository].
final meetingsRepositoryProvider = Provider<MeetingsRepository>((ref) {
  return MeetingsRepositoryImpl(ref.watch(apiClientProvider));
});

/// Tracks whether reschedule and cancel actions are unsupported (404/405).
final meetingActionsUnsupportedProvider = StateProvider<bool>((ref) => false);

/// StateNotifier that manages meetings list and async mutations.
class MeetingsNotifier extends StateNotifier<AsyncValue<List<Meeting>>> {
  MeetingsNotifier(this._repository, this._ref) : super(const AsyncValue.loading()) {
    fetchMeetings();
  }

  final MeetingsRepository _repository;
  final Ref _ref;

  Future<void> fetchMeetings() async {
    state = const AsyncValue.loading();
    try {
      final authController = _ref.read(authControllerProvider);
      final currentUserId = authController.state.profile?.id;
      final list = await _repository.getMeetings(memberId: currentUserId);
      state = AsyncValue.data(list);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  void prependMeeting(Meeting meeting) {
    state.whenData((currentList) {
      final updated = [meeting, ...currentList.where((m) => m.id != meeting.id)];
      state = AsyncValue.data(updated);
    });
  }

  void updateMeeting(Meeting updated) {
    state.whenData((currentList) {
      final updatedList = currentList.map((m) => m.id == updated.id ? updated : m).toList();
      state = AsyncValue.data(updatedList);
    });
  }

  Future<bool> rescheduleMeeting(
    String meetingId, {
    required String date,
    String? time,
    String? location,
    String? notes,
  }) async {
    try {
      final updated = await _repository.rescheduleMeeting(
        meetingId,
        date: date,
        time: time,
        location: location,
        notes: notes,
      );
      updateMeeting(updated);
      return true;
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        _ref.read(meetingActionsUnsupportedProvider.notifier).state = true;
      }
      rethrow;
    } catch (_) {
      rethrow;
    }
  }

  Future<bool> cancelMeeting(String meetingId) async {
    try {
      final updated = await _repository.updateMeetingStatus(
        meetingId,
        status: 'cancelled',
      );
      updateMeeting(updated);
      return true;
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        _ref.read(meetingActionsUnsupportedProvider.notifier).state = true;
      }
      rethrow;
    } catch (_) {
      rethrow;
    }
  }

  Future<bool> completeMeeting(String meetingId) async {
    try {
      final updated = await _repository.updateMeetingStatus(
        meetingId,
        status: 'completed',
      );
      updateMeeting(updated);
      return true;
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) {
        _ref.read(meetingActionsUnsupportedProvider.notifier).state = true;
      }
      rethrow;
    } catch (_) {
      rethrow;
    }
  }
}

final meetingsProvider =
    StateNotifierProvider<MeetingsNotifier, AsyncValue<List<Meeting>>>((ref) {
  final repo = ref.watch(meetingsRepositoryProvider);
  return MeetingsNotifier(repo, ref);
});

/// Upcoming meetings list: sorted by nearest date first.
final upcomingMeetingsProvider = Provider<List<Meeting>>((ref) {
  final meetingsAsync = ref.watch(meetingsProvider);
  final allMeetings = meetingsAsync.value ?? [];

  final upcoming = allMeetings
      .where((m) => MeetingDateUtils.isUpcoming(dateStr: m.date, status: m.status))
      .toList();

  upcoming.sort((a, b) {
    final da = MeetingDateUtils.parseTolerantDate(a.date);
    final db = MeetingDateUtils.parseTolerantDate(b.date);

    if (da != null && db != null) {
      final cmp = da.compareTo(db);
      if (cmp != 0) return cmp;
    } else if (da != null) {
      return -1;
    } else if (db != null) {
      return 1;
    }

    // Secondary fallback: createdAt
    if (a.createdAt != null && b.createdAt != null) {
      return a.createdAt!.compareTo(b.createdAt!);
    }
    return 0;
  });

  return upcoming;
});

/// Past meetings list: sorted newest first.
final pastMeetingsProvider = Provider<List<Meeting>>((ref) {
  final meetingsAsync = ref.watch(meetingsProvider);
  final allMeetings = meetingsAsync.value ?? [];

  final past = allMeetings
      .where((m) => !MeetingDateUtils.isUpcoming(dateStr: m.date, status: m.status))
      .toList();

  past.sort((a, b) {
    final da = MeetingDateUtils.parseTolerantDate(a.date);
    final db = MeetingDateUtils.parseTolerantDate(b.date);

    if (da != null && db != null) {
      final cmp = db.compareTo(da);
      if (cmp != 0) return cmp;
    } else if (da != null) {
      return -1;
    } else if (db != null) {
      return 1;
    }

    if (a.createdAt != null && b.createdAt != null) {
      return b.createdAt!.compareTo(a.createdAt!);
    }
    return 0;
  });

  return past;
});

/// Debounced Member Search Notifier (400ms debounce)
class MemberSearchState {
  final bool isLoading;
  final List<MeetingMember> results;
  final String? error;

  const MemberSearchState({
    this.isLoading = false,
    this.results = const [],
    this.error,
  });
}

class MemberSearchNotifier extends StateNotifier<MemberSearchState> {
  MemberSearchNotifier(this._repository, this._ref) : super(const MemberSearchState());

  final MeetingsRepository _repository;
  final Ref _ref;
  Timer? _debounceTimer;

  void onQueryChanged(String query) {
    _debounceTimer?.cancel();
    final trimmed = query.trim();

    if (trimmed.isEmpty) {
      state = const MemberSearchState(results: [], isLoading: false);
      return;
    }

    state = MemberSearchState(results: state.results, isLoading: true);

    _debounceTimer = Timer(const Duration(milliseconds: 400), () async {
      try {
        final authController = _ref.read(authControllerProvider);
        final currentUserId = authController.state.profile?.id;

        final rawResults = await _repository.searchMembers(trimmed, limit: 10);

        // Filter out current user (cannot meet with yourself)
        final filtered = rawResults.where((m) {
          if (currentUserId != null && currentUserId.isNotEmpty) {
            return m.id != currentUserId;
          }
          return true;
        }).toList();

        state = MemberSearchState(results: filtered, isLoading: false);
      } catch (e) {
        state = MemberSearchState(
          results: [],
          isLoading: false,
          error: e.toString(),
        );
      }
    });
  }

  void clear() {
    _debounceTimer?.cancel();
    state = const MemberSearchState();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

final memberSearchProvider =
    StateNotifierProvider.autoDispose<MemberSearchNotifier, MemberSearchState>((ref) {
  final repo = ref.watch(meetingsRepositoryProvider);
  return MemberSearchNotifier(repo, ref);
});
