import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    required String name,
    required String role,
    String? avatarUrl,
    String? gradeLevel,
    List<String>? subjectsOfInterest,
    String? bio,
    List<String>? subjectsTaught,
    int? hourlyRateCents,
    bool? onlineOnly,
    bool? payoutEnabled,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
