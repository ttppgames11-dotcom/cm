import 'referral_status.dart';

/// Domain model representing a business referral lead.
/// Parses defensively: all fields except `id` can be missing, and ids are strings.
class Referral {
  final String id;
  final String title;
  final String? category;
  final String? giverId;
  final String? giverName;
  final String? recipientId;
  final String? recipientName;
  final String clientName;
  final String clientPhone;
  final String? clientEmail;
  final String urgency;
  final String status;
  final double value;
  final String? notes;
  final DateTime? createdAt;

  const Referral({
    required this.id,
    required this.title,
    this.category,
    this.giverId,
    this.giverName,
    this.recipientId,
    this.recipientName,
    required this.clientName,
    required this.clientPhone,
    this.clientEmail,
    this.urgency = kUrgencyApiMedium,
    this.status = kStatusApiNew,
    this.value = 0.0,
    this.notes,
    this.createdAt,
  });

  /// Factory constructor that defensively parses JSON from the API.
  factory Referral.fromJson(Map<String, dynamic> json) {
    // ID is the only required key, parsed as String
    final id = (json['id'] ?? json['_id'] ?? '').toString();

    // Value parsing
    double parsedValue = 0.0;
    final rawVal = json['value'];
    if (rawVal != null) {
      if (rawVal is num) {
        parsedValue = rawVal.toDouble();
      } else if (rawVal is String) {
        parsedValue = double.tryParse(rawVal) ?? 0.0;
      }
    }

    // CreatedAt parsing
    DateTime? parsedDate;
    final rawDate = json['createdAt'] ?? json['created_at'];
    if (rawDate != null) {
      if (rawDate is String) {
        parsedDate = DateTime.tryParse(rawDate);
      } else if (rawDate is int) {
        parsedDate = DateTime.fromMillisecondsSinceEpoch(rawDate);
      }
    }

    return Referral(
      id: id,
      title: (json['title'] ?? json['lead_title'] ?? json['name'] ?? '').toString(),
      category: (json['category'] ?? json['category_name'])?.toString(),
      giverId: (json['giverId'] ?? json['giver_id'] ?? json['giver_user_id'])?.toString(),
      giverName: (json['giverName'] ?? json['giver_name'])?.toString(),
      recipientId: (json['recipientId'] ?? json['recipient_id'] ?? json['recipient_user_id'])?.toString(),
      recipientName: (json['recipientName'] ?? json['recipient_name'])?.toString(),
      clientName: (json['clientName'] ?? json['client_name'])?.toString() ?? '',
      clientPhone: (json['clientPhone'] ?? json['client_phone'])?.toString() ?? '',
      clientEmail: (json['clientEmail'] ?? json['client_email'])?.toString(),
      urgency: (json['urgency'] ?? json['urgency_level'] ?? json['priority'])?.toString() ?? kUrgencyApiMedium,
      status: (json['status'] ?? json['referral_status'])?.toString() ?? kStatusApiNew,
      value: parsedValue >= 0 ? parsedValue : 0.0,
      notes: (json['notes'] ?? json['description'] ?? json['note'])?.toString(),
      createdAt: parsedDate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      if (category != null) 'category': category,
      if (giverId != null) 'giverId': giverId,
      if (giverName != null) 'giverName': giverName,
      if (recipientId != null) 'recipientId': recipientId,
      if (recipientName != null) 'recipientName': recipientName,
      'clientName': clientName,
      'clientPhone': clientPhone,
      if (clientEmail != null) 'clientEmail': clientEmail,
      'urgency': urgency,
      'status': status,
      'value': value,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }

  Referral copyWith({
    String? id,
    String? title,
    String? category,
    String? giverId,
    String? giverName,
    String? recipientId,
    String? recipientName,
    String? clientName,
    String? clientPhone,
    String? clientEmail,
    String? urgency,
    String? status,
    double? value,
    String? notes,
    DateTime? createdAt,
  }) {
    return Referral(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      giverId: giverId ?? this.giverId,
      giverName: giverName ?? this.giverName,
      recipientId: recipientId ?? this.recipientId,
      recipientName: recipientName ?? this.recipientName,
      clientName: clientName ?? this.clientName,
      clientPhone: clientPhone ?? this.clientPhone,
      clientEmail: clientEmail ?? this.clientEmail,
      urgency: urgency ?? this.urgency,
      status: status ?? this.status,
      value: value ?? this.value,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Normalized status classification
  ReferralStatusClass get statusClass => classifyReferralStatus(status);

  /// Normalized urgency classification
  ReferralUrgency get urgencyLevel => parseReferralUrgency(urgency);

  /// Masked client phone for card views
  String get maskedPhone => maskPhoneNumber(clientPhone);
}
