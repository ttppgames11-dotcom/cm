import '../models/referral.dart';
import '../models/referral_member_recipient.dart';

abstract class ReferralRepository {
  /// Fetches referrals.
  /// If [type] is 'given', returns given referrals.
  /// If [type] is 'received', returns received referrals.
  /// If [type] is null, returns both for the logged-in member.
  Future<List<Referral>> getReferrals({String? type});

  /// Creates a new referral lead.
  Future<Referral> createReferral({
    required String title,
    required String clientName,
    required String clientPhone,
    String? category,
    String? recipientId,
    String? recipientName,
    String? clientEmail,
    String? urgency,
    double? value,
    String? notes,
  });

  /// Updates status and optionally final value of a referral.
  Future<Referral> updateReferralStatus({
    required String id,
    required String status,
    double? value,
  });

  /// Searches members publicly by name, profession, or city.
  Future<List<ReferralMemberRecipient>> searchMembers({
    required String query,
    int limit = 10,
  });
}
