/// Domain model representing a 1-to-1 Business Meeting.
/// Parses defensively: all fields except `id` can be missing; ids are strings.
class Meeting {
  final String id;
  final String? requesterId;
  final String? requesterName;
  final String? recipientId;
  final String? recipientName;
  final String? date;
  final String? time;
  final String? topic;
  final String? location;
  final String? status;
  final String? notes;
  final DateTime? createdAt;

  const Meeting({
    required this.id,
    this.requesterId,
    this.requesterName,
    this.recipientId,
    this.recipientName,
    this.date,
    this.time,
    this.topic,
    this.location,
    this.status,
    this.notes,
    this.createdAt,
  });

  /// Defensive JSON deserialization: all fields except `id` can be missing or null.
  factory Meeting.fromJson(Map<String, dynamic> json) {
    final id = (json['id'] ?? json['_id'] ?? '').toString();

    DateTime? parsedCreatedAt;
    final rawCreated = json['createdAt'] ?? json['created_at'];
    if (rawCreated != null) {
      if (rawCreated is String) {
        parsedCreatedAt = DateTime.tryParse(rawCreated);
      } else if (rawCreated is int) {
        parsedCreatedAt = DateTime.fromMillisecondsSinceEpoch(rawCreated);
      }
    }

    return Meeting(
      id: id,
      requesterId: (json['requesterId'] ?? json['requester_id'])?.toString(),
      requesterName: (json['requesterName'] ?? json['requester_name'])?.toString(),
      recipientId: (json['recipientId'] ?? json['recipient_id'])?.toString(),
      recipientName: (json['recipientName'] ?? json['recipient_name'])?.toString(),
      date: json['date']?.toString(),
      time: json['time']?.toString(),
      topic: json['topic']?.toString(),
      location: json['location']?.toString(),
      status: json['status']?.toString(),
      notes: json['notes']?.toString(),
      createdAt: parsedCreatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requesterId': requesterId,
      'requesterName': requesterName,
      'recipientId': recipientId,
      'recipientName': recipientName,
      'date': date,
      'time': time,
      'topic': topic,
      'location': location,
      'status': status,
      'notes': notes,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }

  Meeting copyWith({
    String? id,
    String? requesterId,
    String? requesterName,
    String? recipientId,
    String? recipientName,
    String? date,
    String? time,
    String? topic,
    String? location,
    String? status,
    String? notes,
    DateTime? createdAt,
  }) {
    return Meeting(
      id: id ?? this.id,
      requesterId: requesterId ?? this.requesterId,
      requesterName: requesterName ?? this.requesterName,
      recipientId: recipientId ?? this.recipientId,
      recipientName: recipientName ?? this.recipientName,
      date: date ?? this.date,
      time: time ?? this.time,
      topic: topic ?? this.topic,
      location: location ?? this.location,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
