// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_User _$UserFromJson(Map<String, dynamic> json) => _User(
  id: json['id'] as String,
  email: json['email'] as String,
  name: json['name'] as String,
  role: json['role'] as String,
  avatarUrl: json['avatarUrl'] as String?,
  gradeLevel: json['gradeLevel'] as String?,
  subjectsOfInterest: (json['subjectsOfInterest'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  bio: json['bio'] as String?,
  subjectsTaught: (json['subjectsTaught'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  hourlyRateCents: (json['hourlyRateCents'] as num?)?.toInt(),
  onlineOnly: json['onlineOnly'] as bool?,
  payoutEnabled: json['payoutEnabled'] as bool?,
);

Map<String, dynamic> _$UserToJson(_User instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'name': instance.name,
  'role': instance.role,
  'avatarUrl': instance.avatarUrl,
  'gradeLevel': instance.gradeLevel,
  'subjectsOfInterest': instance.subjectsOfInterest,
  'bio': instance.bio,
  'subjectsTaught': instance.subjectsTaught,
  'hourlyRateCents': instance.hourlyRateCents,
  'onlineOnly': instance.onlineOnly,
  'payoutEnabled': instance.payoutEnabled,
};
