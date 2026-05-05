// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inquiry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Inquiry _$InquiryFromJson(Map<String, dynamic> json) => _Inquiry(
  id: json['id'] as String,
  subject: json['subject'] as String,
  gradeLevel: json['gradeLevel'] as String,
  description: json['description'] as String,
  status: json['status'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  attachments: (json['attachments'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  aiResponse: json['aiResponse'] as String?,
);

Map<String, dynamic> _$InquiryToJson(_Inquiry instance) => <String, dynamic>{
  'id': instance.id,
  'subject': instance.subject,
  'gradeLevel': instance.gradeLevel,
  'description': instance.description,
  'status': instance.status,
  'createdAt': instance.createdAt.toIso8601String(),
  'attachments': instance.attachments,
  'aiResponse': instance.aiResponse,
};
