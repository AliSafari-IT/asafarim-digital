// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Quote _$QuoteFromJson(Map<String, dynamic> json) => _Quote(
  id: json['id'] as String,
  tutorId: json['tutorId'] as String,
  tutorName: json['tutorName'] as String,
  tutorAvatar: json['tutorAvatar'] as String?,
  tutorBio: json['tutorBio'] as String?,
  hourlyRateCents: (json['hourlyRateCents'] as num).toInt(),
  estimatedHours: (json['estimatedHours'] as num).toInt(),
  totalCents: (json['totalCents'] as num).toInt(),
  notes: json['notes'] as String?,
  availabilitySlots: (json['availabilitySlots'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  status: json['status'] as String,
  ratingAvg: (json['ratingAvg'] as num?)?.toDouble(),
  ratingCount: (json['ratingCount'] as num?)?.toInt(),
  pdfUrl: json['pdfUrl'] as String?,
);

Map<String, dynamic> _$QuoteToJson(_Quote instance) => <String, dynamic>{
  'id': instance.id,
  'tutorId': instance.tutorId,
  'tutorName': instance.tutorName,
  'tutorAvatar': instance.tutorAvatar,
  'tutorBio': instance.tutorBio,
  'hourlyRateCents': instance.hourlyRateCents,
  'estimatedHours': instance.estimatedHours,
  'totalCents': instance.totalCents,
  'notes': instance.notes,
  'availabilitySlots': instance.availabilitySlots,
  'status': instance.status,
  'ratingAvg': instance.ratingAvg,
  'ratingCount': instance.ratingCount,
  'pdfUrl': instance.pdfUrl,
};
