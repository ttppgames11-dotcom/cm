import 'referral.dart';
import 'referral_status.dart';

/// Computed in-app statistics for the current member's referrals.
class ReferralStats {
  final int givenCount;
  final int receivedCount;
  final int closedCount;
  final double totalClosedValue;

  const ReferralStats({
    required this.givenCount,
    required this.receivedCount,
    required this.closedCount,
    required this.totalClosedValue,
  });

  /// Computes stats from a list of referrals for a given user ID.
  factory ReferralStats.compute({
    required List<Referral> referrals,
    required String currentUserId,
  }) {
    int given = 0;
    int received = 0;
    int closed = 0;
    double closedValueSum = 0.0;

    for (final ref in referrals) {
      final isGiver = ref.giverId == currentUserId;
      final isReceiver = ref.recipientId == currentUserId;

      if (isGiver) given++;
      if (isReceiver) received++;

      final isClosed = ref.statusClass == ReferralStatusClass.closed;
      if (isClosed) {
        closed++;
        closedValueSum += ref.value;
      }
    }

    return ReferralStats(
      givenCount: given,
      receivedCount: received,
      closedCount: closed,
      totalClosedValue: closedValueSum,
    );
  }

  /// Formats the total closed value as Indian currency string with लाख / कोटी when large.
  String get formattedTotalValue => formatIndianCurrency(totalClosedValue);
}

/// Formats number with Indian comma grouping (e.g. 1,00,000).
String formatIndianNumber(num number) {
  final isNegative = number < 0;
  final absNumber = number.abs().round();
  final s = absNumber.toString();

  if (s.length <= 3) {
    return (isNegative ? '-' : '') + s;
  }

  // Last 3 digits
  final last3 = s.substring(s.length - 3);
  final remaining = s.substring(0, s.length - 3);

  // Group remaining in pairs of 2 from right to left
  final StringBuffer buffer = StringBuffer();
  int count = 0;
  for (int i = remaining.length - 1; i >= 0; i--) {
    buffer.write(remaining[i]);
    count++;
    if (count == 2 && i > 0) {
      buffer.write(',');
      count = 0;
    }
  }

  final formattedRemaining = buffer.toString().split('').reversed.join('');
  final result = '$formattedRemaining,$last3';
  return (isNegative ? '-' : '') + result;
}

/// Formats amount in Rupees with Indian grouping and लाख/कोटी notation for large numbers.
String formatIndianCurrency(double amount) {
  if (amount <= 0) return '₹०';

  final absAmount = amount.abs();

  // 1 Crore = 1,00,00,000
  if (absAmount >= 10000000) {
    final crores = absAmount / 10000000;
    final formatted = crores.toStringAsFixed(crores.truncateToDouble() == crores ? 0 : 2);
    // Remove trailing zero if .X0 (e.g. 2.40 -> 2.4)
    final cleaned = formatted.replaceAll(RegExp(r'\.0$'), '').replaceAll(RegExp(r'0$'), '');
    return '₹$cleaned कोटी';
  }

  // 1 Lakh = 1,00,000
  if (absAmount >= 100000) {
    final lakhs = absAmount / 100000;
    final formatted = lakhs.toStringAsFixed(lakhs.truncateToDouble() == lakhs ? 0 : 2);
    final cleaned = formatted.replaceAll(RegExp(r'\.0$'), '').replaceAll(RegExp(r'0$'), '');
    return '₹$cleaned लाख';
  }

  return '₹${formatIndianNumber(absAmount)}';
}
