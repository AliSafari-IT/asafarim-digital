// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'inquiry.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Inquiry {

 String get id; String get subject; String get gradeLevel; String get description; String get status; DateTime get createdAt; List<String>? get attachments; String? get aiResponse;
/// Create a copy of Inquiry
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InquiryCopyWith<Inquiry> get copyWith => _$InquiryCopyWithImpl<Inquiry>(this as Inquiry, _$identity);

  /// Serializes this Inquiry to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Inquiry&&(identical(other.id, id) || other.id == id)&&(identical(other.subject, subject) || other.subject == subject)&&(identical(other.gradeLevel, gradeLevel) || other.gradeLevel == gradeLevel)&&(identical(other.description, description) || other.description == description)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&const DeepCollectionEquality().equals(other.attachments, attachments)&&(identical(other.aiResponse, aiResponse) || other.aiResponse == aiResponse));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,subject,gradeLevel,description,status,createdAt,const DeepCollectionEquality().hash(attachments),aiResponse);

@override
String toString() {
  return 'Inquiry(id: $id, subject: $subject, gradeLevel: $gradeLevel, description: $description, status: $status, createdAt: $createdAt, attachments: $attachments, aiResponse: $aiResponse)';
}


}

/// @nodoc
abstract mixin class $InquiryCopyWith<$Res>  {
  factory $InquiryCopyWith(Inquiry value, $Res Function(Inquiry) _then) = _$InquiryCopyWithImpl;
@useResult
$Res call({
 String id, String subject, String gradeLevel, String description, String status, DateTime createdAt, List<String>? attachments, String? aiResponse
});




}
/// @nodoc
class _$InquiryCopyWithImpl<$Res>
    implements $InquiryCopyWith<$Res> {
  _$InquiryCopyWithImpl(this._self, this._then);

  final Inquiry _self;
  final $Res Function(Inquiry) _then;

/// Create a copy of Inquiry
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? subject = null,Object? gradeLevel = null,Object? description = null,Object? status = null,Object? createdAt = null,Object? attachments = freezed,Object? aiResponse = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,subject: null == subject ? _self.subject : subject // ignore: cast_nullable_to_non_nullable
as String,gradeLevel: null == gradeLevel ? _self.gradeLevel : gradeLevel // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,attachments: freezed == attachments ? _self.attachments : attachments // ignore: cast_nullable_to_non_nullable
as List<String>?,aiResponse: freezed == aiResponse ? _self.aiResponse : aiResponse // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [Inquiry].
extension InquiryPatterns on Inquiry {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Inquiry value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Inquiry() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Inquiry value)  $default,){
final _that = this;
switch (_that) {
case _Inquiry():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Inquiry value)?  $default,){
final _that = this;
switch (_that) {
case _Inquiry() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String subject,  String gradeLevel,  String description,  String status,  DateTime createdAt,  List<String>? attachments,  String? aiResponse)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Inquiry() when $default != null:
return $default(_that.id,_that.subject,_that.gradeLevel,_that.description,_that.status,_that.createdAt,_that.attachments,_that.aiResponse);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String subject,  String gradeLevel,  String description,  String status,  DateTime createdAt,  List<String>? attachments,  String? aiResponse)  $default,) {final _that = this;
switch (_that) {
case _Inquiry():
return $default(_that.id,_that.subject,_that.gradeLevel,_that.description,_that.status,_that.createdAt,_that.attachments,_that.aiResponse);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String subject,  String gradeLevel,  String description,  String status,  DateTime createdAt,  List<String>? attachments,  String? aiResponse)?  $default,) {final _that = this;
switch (_that) {
case _Inquiry() when $default != null:
return $default(_that.id,_that.subject,_that.gradeLevel,_that.description,_that.status,_that.createdAt,_that.attachments,_that.aiResponse);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Inquiry implements Inquiry {
  const _Inquiry({required this.id, required this.subject, required this.gradeLevel, required this.description, required this.status, required this.createdAt, final  List<String>? attachments, this.aiResponse}): _attachments = attachments;
  factory _Inquiry.fromJson(Map<String, dynamic> json) => _$InquiryFromJson(json);

@override final  String id;
@override final  String subject;
@override final  String gradeLevel;
@override final  String description;
@override final  String status;
@override final  DateTime createdAt;
 final  List<String>? _attachments;
@override List<String>? get attachments {
  final value = _attachments;
  if (value == null) return null;
  if (_attachments is EqualUnmodifiableListView) return _attachments;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  String? aiResponse;

/// Create a copy of Inquiry
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InquiryCopyWith<_Inquiry> get copyWith => __$InquiryCopyWithImpl<_Inquiry>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$InquiryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Inquiry&&(identical(other.id, id) || other.id == id)&&(identical(other.subject, subject) || other.subject == subject)&&(identical(other.gradeLevel, gradeLevel) || other.gradeLevel == gradeLevel)&&(identical(other.description, description) || other.description == description)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&const DeepCollectionEquality().equals(other._attachments, _attachments)&&(identical(other.aiResponse, aiResponse) || other.aiResponse == aiResponse));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,subject,gradeLevel,description,status,createdAt,const DeepCollectionEquality().hash(_attachments),aiResponse);

@override
String toString() {
  return 'Inquiry(id: $id, subject: $subject, gradeLevel: $gradeLevel, description: $description, status: $status, createdAt: $createdAt, attachments: $attachments, aiResponse: $aiResponse)';
}


}

/// @nodoc
abstract mixin class _$InquiryCopyWith<$Res> implements $InquiryCopyWith<$Res> {
  factory _$InquiryCopyWith(_Inquiry value, $Res Function(_Inquiry) _then) = __$InquiryCopyWithImpl;
@override @useResult
$Res call({
 String id, String subject, String gradeLevel, String description, String status, DateTime createdAt, List<String>? attachments, String? aiResponse
});




}
/// @nodoc
class __$InquiryCopyWithImpl<$Res>
    implements _$InquiryCopyWith<$Res> {
  __$InquiryCopyWithImpl(this._self, this._then);

  final _Inquiry _self;
  final $Res Function(_Inquiry) _then;

/// Create a copy of Inquiry
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? subject = null,Object? gradeLevel = null,Object? description = null,Object? status = null,Object? createdAt = null,Object? attachments = freezed,Object? aiResponse = freezed,}) {
  return _then(_Inquiry(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,subject: null == subject ? _self.subject : subject // ignore: cast_nullable_to_non_nullable
as String,gradeLevel: null == gradeLevel ? _self.gradeLevel : gradeLevel // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,attachments: freezed == attachments ? _self._attachments : attachments // ignore: cast_nullable_to_non_nullable
as List<String>?,aiResponse: freezed == aiResponse ? _self.aiResponse : aiResponse // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
