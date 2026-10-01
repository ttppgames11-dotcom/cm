/// A local business-networking chapter ("मंडळ"), ported from the website's
/// `BusinessSangamPage.jsx` (`FALLBACK_CHAPTERS`).
class BusinessChapter {
  const BusinessChapter({
    required this.marathiName,
    required this.city,
    required this.meetingDay,
    required this.meetingTime,
    required this.venue,
    required this.capacity,
    required this.openSeats,
    required this.visitors,
    required this.monthlyBusiness,
    required this.monthlyOpportunities,
    required this.totalClosedValue,
  });

  final String marathiName;
  final String city;
  final String meetingDay;
  final String meetingTime;
  final String venue;
  final int capacity;
  final int openSeats;
  final int visitors;
  final int monthlyBusiness;
  final int monthlyOpportunities;
  final int totalClosedValue;

  /// Formats a rupee amount the way the website does: crores with two
  /// decimals above 1,00,00,000, lakhs with one decimal above 1,00,000.
  static String formatCurrency(int amount) {
    if (amount >= 10000000) {
      return '₹${(amount / 10000000).toStringAsFixed(2)} कोटी';
    }
    if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(1)} लाख';
    }
    return '₹$amount';
  }
}

const businessChapters = [
  BusinessChapter(
    marathiName: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    city: 'पुणे',
    meetingDay: 'बुधवार',
    meetingTime: 'सकाळी ७:३०',
    venue: 'शिवाजीनगर, पुणे',
    capacity: 32,
    openSeats: 11,
    visitors: 19,
    monthlyBusiness: 4875000,
    monthlyOpportunities: 47,
    totalClosedValue: 18500000,
  ),
  BusinessChapter(
    marathiName: 'कोल्हापूर – रायगड व्यवसाय मंडळ',
    city: 'कोल्हापूर',
    meetingDay: 'शुक्रवार',
    meetingTime: 'सकाळी ८:००',
    venue: 'महाद्वार रोड, कोल्हापूर',
    capacity: 28,
    openSeats: 9,
    visitors: 12,
    monthlyBusiness: 2610000,
    monthlyOpportunities: 35,
    totalClosedValue: 12600000,
  ),
  BusinessChapter(
    marathiName: 'नाशिक – जिजाऊ व्यवसाय संगम',
    city: 'नाशिक',
    meetingDay: 'मंगळवार',
    meetingTime: 'सकाळी ७:००',
    venue: 'गंगापूर रोड, नाशिक',
    capacity: 38,
    openSeats: 6,
    visitors: 23,
    monthlyBusiness: 6240000,
    monthlyOpportunities: 58,
    totalClosedValue: 22400000,
  ),
];
