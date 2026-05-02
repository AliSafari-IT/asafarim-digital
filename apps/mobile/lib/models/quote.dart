import 'package:freezed_annotation/freezed_annotation.dart';

part 'quote.freezed.dart';
part 'quote.g.dart';

@freezed
class Quote with _$Quote {
  const factory Quote({
    required String id,
    required String tutorId,
    required String tutorName,
    String? tutorAvatar,
    String? tutorBio,
    required int hourlyRateCents,
    required int estimatedHours,
    required int totalCents,
    String? notes,
    List<String>? availabilitySlots,
    required String status,
    double? ratingAvg,
    int? ratingCount,
    String? pdfUrl,
  }) = _Quote;

  factory Quote.fromJson(Map<String, dynamic> json) => _$QuoteFromJson(json);
}
