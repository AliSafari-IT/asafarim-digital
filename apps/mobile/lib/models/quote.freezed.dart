// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quote.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Quote {

 String get id; String get tutorId; String get tutorName; String? get tutorAvatar; String? get tutorBio; int get hourlyRateCents; int get estimatedHours; int get totalCents; String? get notes; List<String>? get availabilitySlots; String get status; double? get ratingAvg; int? get ratingCount; String? get pdfUrl;
/// Create a copy of Quote
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuoteCopyWith<Quote> get copyWith => _$QuoteCopyWithImpl<Quote>(this as Quote, _$identity);

  /// Serializes this Quote to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Quote&&(identical(other.id, id) || other.id == id)&&(identical(other.tutorId, tutorId) || other.tutorId == tutorId)&&(identical(other.tutorName, tutorName) || other.tutorName == tutorName)&&(identical(other.tutorAvatar, tutorAvatar) || other.tutorAvatar == tutorAvatar)&&(identical(other.tutorBio, tutorBio) || other.tutorBio == tutorBio)&&(identical(other.hourlyRateCents, hourlyRateCents) || other.hourlyRateCents == hourlyRateCents)&&(identical(other.estimatedHours, estimatedHours) || other.estimatedHours == estimatedHours)&&(identical(other.totalCents, totalCents) || other.totalCents == totalCents)&&(identical(other.notes, notes) || other.notes == notes)&&const DeepCollectionEquality().equals(other.availabilitySlots, availabilitySlots)&&(identical(other.status, status) || other.status == status)&&(identical(other.ratingAvg, ratingAvg) || other.ratingAvg == ratingAvg)&&(identical(other.ratingCount, ratingCount) || other.ratingCount == ratingCount)&&(identical(other.pdfUrl, pdfUrl) || other.pdfUrl == pdfUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tutorId,tutorName,tutorAvatar,tutorBio,hourlyRateCents,estimatedHours,totalCents,notes,const DeepCollectionEquality().hash(availabilitySlots),status,ratingAvg,ratingCount,pdfUrl);

@override
String toString() {
  return 'Quote(id: $id, tutorId: $tutorId, tutorName: $tutorName, tutorAvatar: $tutorAvatar, tutorBio: $tutorBio, hourlyRateCents: $hourlyRateCents, estimatedHours: $estimatedHours, totalCents: $totalCents, notes: $notes, availabilitySlots: $availabilitySlots, status: $status, ratingAvg: $ratingAvg, ratingCount: $ratingCount, pdfUrl: $pdfUrl)';
}


}

/// @nodoc
abstract mixin class $QuoteCopyWith<$Res>  {
  factory $QuoteCopyWith(Quote value, $Res Function(Quote) _then) = _$QuoteCopyWithImpl;
@useResult
$Res call({
 String id, String tutorId, String tutorName, String? tutorAvatar, String? tutorBio, int hourlyRateCents, int estimatedHours, int totalCents, String? notes, List<String>? availabilitySlots, String status, double? ratingAvg, int? ratingCount, String? pdfUrl
});




}
/// @nodoc
class _$QuoteCopyWithImpl<$Res>
    implements $QuoteCopyWith<$Res> {
  _$QuoteCopyWithImpl(this._self, this._then);

  final Quote _self;
  final $Res Function(Quote) _then;

/// Create a copy of Quote
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? tutorId = null,Object? tutorName = null,Object? tutorAvatar = freezed,Object? tutorBio = freezed,Object? hourlyRateCents = null,Object? estimatedHours = null,Object? totalCents = null,Object? notes = freezed,Object? availabilitySlots = freezed,Object? status = null,Object? ratingAvg = freezed,Object? ratingCount = freezed,Object? pdfUrl = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tutorId: null == tutorId ? _self.tutorId : tutorId // ignore: cast_nullable_to_non_nullable
as String,tutorName: null == tutorName ? _self.tutorName : tutorName // ignore: cast_nullable_to_non_nullable
as String,tutorAvatar: freezed == tutorAvatar ? _self.tutorAvatar : tutorAvatar // ignore: cast_nullable_to_non_nullable
as String?,tutorBio: freezed == tutorBio ? _self.tutorBio : tutorBio // ignore: cast_nullable_to_non_nullable
as String?,hourlyRateCents: null == hourlyRateCents ? _self.hourlyRateCents : hourlyRateCents // ignore: cast_nullable_to_non_nullable
as int,estimatedHours: null == estimatedHours ? _self.estimatedHours : estimatedHours // ignore: cast_nullable_to_non_nullable
as int,totalCents: null == totalCents ? _self.totalCents : totalCents // ignore: cast_nullable_to_non_nullable
as int,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,availabilitySlots: freezed == availabilitySlots ? _self.availabilitySlots : availabilitySlots // ignore: cast_nullable_to_non_nullable
as List<String>?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,ratingAvg: freezed == ratingAvg ? _self.ratingAvg : ratingAvg // ignore: cast_nullable_to_non_nullable
as double?,ratingCount: freezed == ratingCount ? _self.ratingCount : ratingCount // ignore: cast_nullable_to_non_nullable
as int?,pdfUrl: freezed == pdfUrl ? _self.pdfUrl : pdfUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Quote].
extension QuotePatterns on Quote {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Quote value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Quote() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Quote value)  $default,){
final _that = this;
switch (_that) {
case _Quote():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Quote value)?  $default,){
final _that = this;
switch (_that) {
case _Quote() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String tutorId,  String tutorName,  String? tutorAvatar,  String? tutorBio,  int hourlyRateCents,  int estimatedHours,  int totalCents,  String? notes,  List<String>? availabilitySlots,  String status,  double? ratingAvg,  int? ratingCount,  String? pdfUrl)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Quote() when $default != null:
return $default(_that.id,_that.tutorId,_that.tutorName,_that.tutorAvatar,_that.tutorBio,_that.hourlyRateCents,_that.estimatedHours,_that.totalCents,_that.notes,_that.availabilitySlots,_that.status,_that.ratingAvg,_that.ratingCount,_that.pdfUrl);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String tutorId,  String tutorName,  String? tutorAvatar,  String? tutorBio,  int hourlyRateCents,  int estimatedHours,  int totalCents,  String? notes,  List<String>? availabilitySlots,  String status,  double? ratingAvg,  int? ratingCount,  String? pdfUrl)  $default,) {final _that = this;
switch (_that) {
case _Quote():
return $default(_that.id,_that.tutorId,_that.tutorName,_that.tutorAvatar,_that.tutorBio,_that.hourlyRateCents,_that.estimatedHours,_that.totalCents,_that.notes,_that.availabilitySlots,_that.status,_that.ratingAvg,_that.ratingCount,_that.pdfUrl);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String tutorId,  String tutorName,  String? tutorAvatar,  String? tutorBio,  int hourlyRateCents,  int estimatedHours,  int totalCents,  String? notes,  List<String>? availabilitySlots,  String status,  double? ratingAvg,  int? ratingCount,  String? pdfUrl)?  $default,) {final _that = this;
switch (_that) {
case _Quote() when $default != null:
return $default(_that.id,_that.tutorId,_that.tutorName,_that.tutorAvatar,_that.tutorBio,_that.hourlyRateCents,_that.estimatedHours,_that.totalCents,_that.notes,_that.availabilitySlots,_that.status,_that.ratingAvg,_that.ratingCount,_that.pdfUrl);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Quote implements Quote {
  const _Quote({required this.id, required this.tutorId, required this.tutorName, this.tutorAvatar, this.tutorBio, required this.hourlyRateCents, required this.estimatedHours, required this.totalCents, this.notes, final  List<String>? availabilitySlots, required this.status, this.ratingAvg, this.ratingCount, this.pdfUrl}): _availabilitySlots = availabilitySlots;
  factory _Quote.fromJson(Map<String, dynamic> json) => _$QuoteFromJson(json);

@override final  String id;
@override final  String tutorId;
@override final  String tutorName;
@override final  String? tutorAvatar;
@override final  String? tutorBio;
@override final  int hourlyRateCents;
@override final  int estimatedHours;
@override final  int totalCents;
@override final  String? notes;
 final  List<String>? _availabilitySlots;
@override List<String>? get availabilitySlots {
  final value = _availabilitySlots;
  if (value == null) return null;
  if (_availabilitySlots is EqualUnmodifiableListView) return _availabilitySlots;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  String status;
@override final  double? ratingAvg;
@override final  int? ratingCount;
@override final  String? pdfUrl;

/// Create a copy of Quote
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuoteCopyWith<_Quote> get copyWith => __$QuoteCopyWithImpl<_Quote>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$QuoteToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Quote&&(identical(other.id, id) || other.id == id)&&(identical(other.tutorId, tutorId) || other.tutorId == tutorId)&&(identical(other.tutorName, tutorName) || other.tutorName == tutorName)&&(identical(other.tutorAvatar, tutorAvatar) || other.tutorAvatar == tutorAvatar)&&(identical(other.tutorBio, tutorBio) || other.tutorBio == tutorBio)&&(identical(other.hourlyRateCents, hourlyRateCents) || other.hourlyRateCents == hourlyRateCents)&&(identical(other.estimatedHours, estimatedHours) || other.estimatedHours == estimatedHours)&&(identical(other.totalCents, totalCents) || other.totalCents == totalCents)&&(identical(other.notes, notes) || other.notes == notes)&&const DeepCollectionEquality().equals(other._availabilitySlots, _availabilitySlots)&&(identical(other.status, status) || other.status == status)&&(identical(other.ratingAvg, ratingAvg) || other.ratingAvg == ratingAvg)&&(identical(other.ratingCount, ratingCount) || other.ratingCount == ratingCount)&&(identical(other.pdfUrl, pdfUrl) || other.pdfUrl == pdfUrl));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tutorId,tutorName,tutorAvatar,tutorBio,hourlyRateCents,estimatedHours,totalCents,notes,const DeepCollectionEquality().hash(_availabilitySlots),status,ratingAvg,ratingCount,pdfUrl);

@override
String toString() {
  return 'Quote(id: $id, tutorId: $tutorId, tutorName: $tutorName, tutorAvatar: $tutorAvatar, tutorBio: $tutorBio, hourlyRateCents: $hourlyRateCents, estimatedHours: $estimatedHours, totalCents: $totalCents, notes: $notes, availabilitySlots: $availabilitySlots, status: $status, ratingAvg: $ratingAvg, ratingCount: $ratingCount, pdfUrl: $pdfUrl)';
}


}

/// @nodoc
abstract mixin class _$QuoteCopyWith<$Res> implements $QuoteCopyWith<$Res> {
  factory _$QuoteCopyWith(_Quote value, $Res Function(_Quote) _then) = __$QuoteCopyWithImpl;
@override @useResult
$Res call({
 String id, String tutorId, String tutorName, String? tutorAvatar, String? tutorBio, int hourlyRateCents, int estimatedHours, int totalCents, String? notes, List<String>? availabilitySlots, String status, double? ratingAvg, int? ratingCount, String? pdfUrl
});




}
/// @nodoc
class __$QuoteCopyWithImpl<$Res>
    implements _$QuoteCopyWith<$Res> {
  __$QuoteCopyWithImpl(this._self, this._then);

  final _Quote _self;
  final $Res Function(_Quote) _then;

/// Create a copy of Quote
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? tutorId = null,Object? tutorName = null,Object? tutorAvatar = freezed,Object? tutorBio = freezed,Object? hourlyRateCents = null,Object? estimatedHours = null,Object? totalCents = null,Object? notes = freezed,Object? availabilitySlots = freezed,Object? status = null,Object? ratingAvg = freezed,Object? ratingCount = freezed,Object? pdfUrl = freezed,}) {
  return _then(_Quote(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tutorId: null == tutorId ? _self.tutorId : tutorId // ignore: cast_nullable_to_non_nullable
as String,tutorName: null == tutorName ? _self.tutorName : tutorName // ignore: cast_nullable_to_non_nullable
as String,tutorAvatar: freezed == tutorAvatar ? _self.tutorAvatar : tutorAvatar // ignore: cast_nullable_to_non_nullable
as String?,tutorBio: freezed == tutorBio ? _self.tutorBio : tutorBio // ignore: cast_nullable_to_non_nullable
as String?,hourlyRateCents: null == hourlyRateCents ? _self.hourlyRateCents : hourlyRateCents // ignore: cast_nullable_to_non_nullable
as int,estimatedHours: null == estimatedHours ? _self.estimatedHours : estimatedHours // ignore: cast_nullable_to_non_nullable
as int,totalCents: null == totalCents ? _self.totalCents : totalCents // ignore: cast_nullable_to_non_nullable
as int,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,availabilitySlots: freezed == availabilitySlots ? _self._availabilitySlots : availabilitySlots // ignore: cast_nullable_to_non_nullable
as List<String>?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,ratingAvg: freezed == ratingAvg ? _self.ratingAvg : ratingAvg // ignore: cast_nullable_to_non_nullable
as double?,ratingCount: freezed == ratingCount ? _self.ratingCount : ratingCount // ignore: cast_nullable_to_non_nullable
as int?,pdfUrl: freezed == pdfUrl ? _self.pdfUrl : pdfUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
