import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:app/core/config/api_config.dart';
import '../../../../auth/providers/auth_provider.dart';
import '../../data/referral_repository_impl.dart';
import '../../data/referral_sample_data.dart';
import '../../domain/models/referral.dart';
import '../../domain/models/referral_member_recipient.dart';
import '../../domain/models/referral_stats.dart';
import '../../domain/models/referral_status.dart';
import '../../domain/repositories/referral_repository.dart';

/// Provider for [ReferralRepository].
final referralRepositoryProvider = Provider<ReferralRepository>((ref) {
  return ReferralRepositoryImpl(ref.watch(apiClientProvider));
});

/// StateNotifier that manages the in-memory list of referrals.
class ReferralsNotifier extends StateNotifier<AsyncValue<List<Referral>>> {
  ReferralsNotifier(this._repository) : super(const AsyncValue.loading()) {
    fetchReferrals();
  }

  final ReferralRepository _repository;

  Future<void> fetchReferrals() async {
    state = const AsyncValue.loading();
    try {
      // Without "type", it returns both given and received for the logged-in member.
      final list = await _repository.getReferrals();
      // Sort newest first by createdAt
      list.sort((a, b) {
        if (a.createdAt == null && b.createdAt == null) return 0;
        if (a.createdAt == null) return 1;
        if (b.createdAt == null) return -1;
        return b.createdAt!.compareTo(a.createdAt!);
      });
      state = AsyncValue.data(list);
    } catch (err, stack) {
      state = AsyncValue.error(err, stack);
    }
  }

  /// Adds a newly created referral to the top of the list.
  void prependReferral(Referral referral) {
    state.whenData((currentList) {
      final updated = [referral, ...currentList.where((r) => r.id != referral.id)];
      state = AsyncValue.data(updated);
    });
  }

  /// Updates an existing referral in the list.
  void updateReferral(Referral updated) {
    state.whenData((currentList) {
      final updatedList = currentList.map((r) => r.id == updated.id ? updated : r).toList();
      state = AsyncValue.data(updatedList);
    });
  }
}

final referralsProvider =
    StateNotifierProvider<ReferralsNotifier, AsyncValue<List<Referral>>>((ref) {
  final repo = ref.watch(referralRepositoryProvider);
  return ReferralsNotifier(repo);
});

/// Active tab index: 0 = "दिलेले" (Given), 1 = "मिळालेले" (Received).
final referralTabProvider = StateProvider<int>((ref) => 0);

/// Selected status filter enum: null = 'सर्व' (All), or specific ReferralStatusClass.
final referralStatusFilterProvider = StateProvider<ReferralStatusClass?>((ref) => null);

/// Computed statistics for the logged-in member.
final referralStatsProvider = Provider<ReferralStats>((ref) {
  final referralsAsync = ref.watch(referralsProvider);
  final authController = ref.watch(authControllerProvider);
  final myId = authController.state.profile?.id ?? 'DEMO1001';

  final list = referralsAsync.value ?? [];
  final effectiveList = list.isNotEmpty
      ? list
      : (ApiConfig.demoMode ? getSampleReferrals(myUserId: myId.isNotEmpty ? myId : 'DEMO1001') : <Referral>[]);

  return ReferralStats.compute(referrals: effectiveList, currentUserId: myId);
});

/// Filtered referrals list for the current tab and selected status filter.
final filteredReferralsProvider = Provider<AsyncValue<List<Referral>>>((ref) {
  final referralsAsync = ref.watch(referralsProvider);
  final tabIndex = ref.watch(referralTabProvider);
  final statusFilter = ref.watch(referralStatusFilterProvider);
  final authController = ref.watch(authControllerProvider);
  final profile = authController.state.profile;
  final myId = profile?.id ?? '';
  final myName = profile?.name ?? '';

  return referralsAsync.whenData((list) {
    final effectiveList = list.isNotEmpty
        ? list
        : (ApiConfig.demoMode ? getSampleReferrals(myUserId: myId.isNotEmpty ? myId : 'DEMO1001') : <Referral>[]);

    return effectiveList.where((item) {
      // Tab filter:
      // Tab 0: "दिलेले" (Given by me)
      // Tab 1: "मिळालेले" (Received by me or Open Lead)
      final isGiven = (myId.isNotEmpty && item.giverId == myId) ||
          (myName.isNotEmpty && item.giverName == myName);
      final isReceived = (myId.isNotEmpty && item.recipientId == myId) ||
          (myName.isNotEmpty && item.recipientName == myName);

      if (tabIndex == 0) {
        if (myId.isNotEmpty) {
          if (isGiven) {
            // keep
          } else if (isReceived) {
            return false;
          } else if (item.giverId != null && item.giverId!.isNotEmpty && item.giverId != myId) {
            return false;
          }
        }
      } else {
        if (myId.isNotEmpty) {
          if (isReceived) {
            // keep
          } else if (isGiven) {
            return false;
          } else if (item.recipientId != null && item.recipientId!.isNotEmpty && item.recipientId != myId) {
            return false;
          }
        }
      }

      // Status chip filter
      if (statusFilter != null) {
        if (item.statusClass != statusFilter) {
          return false;
        }
      }

      return true;
    }).toList();
  });
});

/// Member search query provider with autodispose.
final memberSearchQueryProvider = StateProvider.autoDispose<String>((ref) => '');

/// Debounced member search results provider.
final memberSearchResultsProvider =
    FutureProvider.autoDispose<List<ReferralMemberRecipient>>((ref) async {
  final query = ref.watch(memberSearchQueryProvider).trim();
  if (query.isEmpty) return [];

  final repo = ref.watch(referralRepositoryProvider);
  return repo.searchMembers(query: query, limit: 10);
});
