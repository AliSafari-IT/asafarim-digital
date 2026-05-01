import 'package:freezed_annotation/freezed_annotation.dart';

part 'inquiry.freezed.dart';
part 'inquiry.g.dart';

@freezed
class Inquiry with _$Inquiry {
  const factory Inquiry({
    required String id,
    required String subject,
    required String gradeLevel,
    required String description,
    required String status,
    required DateTime createdAt,
    List<String>? attachments,
    String? aiResponse,
  }) = _Inquiry;

  factory Inquiry.fromJson(Map<String, dynamic> json) =>
      _$InquiryFromJson(json);
}
