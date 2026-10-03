import 'package:flutter/foundation.dart';

/// Represents a hierarchical administrative location entity
/// (Country, State, District, Taluka, or Village).
@immutable
class LocationItem {
  const LocationItem({
    required this.id,
    required this.name,
    this.code = '',
    this.parentId,
    this.localName,
  });

  final String id;
  final String name;
  final String code;
  final String? parentId;
  final String? localName;

  String get displayName => (localName != null && localName!.trim().isNotEmpty && localName != name)
      ? '$name ($localName)'
      : name;

  factory LocationItem.fromJson(Map<String, dynamic> json) {
    return LocationItem(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      code: (json['code'] ?? '').toString(),
      parentId: (json['countryId'] ?? json['stateId'] ?? json['districtId'] ?? json['talukaId'])?.toString(),
      localName: json['localName'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'code': code,
    if (parentId != null) 'parentId': parentId,
    if (localName != null) 'localName': localName,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LocationItem && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => displayName;
}

