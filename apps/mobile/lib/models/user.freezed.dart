// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$User {

 String get id; String get email; String get name; String get role; String? get avatarUrl; String? get gradeLevel; List<String>? get subjectsOfInterest; String? get bio; List<String>? get subjectsTaught; int? get hourlyRateCents; bool? get onlineOnly; bool? get payoutEnabled;
/// Create a copy of User
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserCopyWith<User> get copyWith => _$UserCopyWithImpl<User>(this as User, _$identity);

  /// Serializes this User to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is User&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.name, name) || other.name == name)&&(identical(other.role, role) || other.role == role)&&(identical(other.avatarUrl, avatarUrl) || other.avatarUrl == avatarUrl)&&(identical(other.gradeLevel, gradeLevel) || other.gradeLevel == gradeLevel)&&const DeepCollectionEquality().equals(other.subjectsOfInterest, subjectsOfInterest)&&(identical(other.bio, bio) || other.bio == bio)&&const DeepCollectionEquality().equals(other.subjectsTaught, subjectsTaught)&&(identical(other.hourlyRateCents, hourlyRateCents) || other.hourlyRateCents == hourlyRateCents)&&(identical(other.onlineOnly, onlineOnly) || other.onlineOnly == onlineOnly)&&(identical(other.payoutEnabled, payoutEnabled) || other.payoutEnabled == payoutEnabled));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,name,role,avatarUrl,gradeLevel,const DeepCollectionEquality().hash(subjectsOfInterest),bio,const DeepCollectionEquality().hash(subjectsTaught),hourlyRateCents,onlineOnly,payoutEnabled);

@override
String toString() {
  return 'User(id: $id, email: $email, name: $name, role: $role, avatarUrl: $avatarUrl, gradeLevel: $gradeLevel, subjectsOfInterest: $subjectsOfInterest, bio: $bio, subjectsTaught: $subjectsTaught, hourlyRateCents: $hourlyRateCents, onlineOnly: $onlineOnly, payoutEnabled: $payoutEnabled)';
}


}

/// @nodoc
abstract mixin class $UserCopyWith<$Res>  {
  factory $UserCopyWith(User value, $Res Function(User) _then) = _$UserCopyWithImpl;
@useResult
$Res call({
 String id, String email, String name, String role, String? avatarUrl, String? gradeLevel, List<String>? subjectsOfInterest, String? bio, List<String>? subjectsTaught, int? hourlyRateCents, bool? onlineOnly, bool? payoutEnabled
});




}
/// @nodoc
class _$UserCopyWithImpl<$Res>
    implements $UserCopyWith<$Res> {
  _$UserCopyWithImpl(this._self, this._then);

  final User _self;
  final $Res Function(User) _then;

/// Create a copy of User
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? email = null,Object? name = null,Object? role = null,Object? avatarUrl = freezed,Object? gradeLevel = freezed,Object? subjectsOfInterest = freezed,Object? bio = freezed,Object? subjectsTaught = freezed,Object? hourlyRateCents = freezed,Object? onlineOnly = freezed,Object? payoutEnabled = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,avatarUrl: freezed == avatarUrl ? _self.avatarUrl : avatarUrl // ignore: cast_nullable_to_non_nullable
as String?,gradeLevel: freezed == gradeLevel ? _self.gradeLevel : gradeLevel // ignore: cast_nullable_to_non_nullable
as String?,subjectsOfInterest: freezed == subjectsOfInterest ? _self.subjectsOfInterest : subjectsOfInterest // ignore: cast_nullable_to_non_nullable
as List<String>?,bio: freezed == bio ? _self.bio : bio // ignore: cast_nullable_to_non_nullable
as String?,subjectsTaught: freezed == subjectsTaught ? _self.subjectsTaught : subjectsTaught // ignore: cast_nullable_to_non_nullable
as List<String>?,hourlyRateCents: freezed == hourlyRateCents ? _self.hourlyRateCents : hourlyRateCents // ignore: cast_nullable_to_non_nullable
as int?,onlineOnly: freezed == onlineOnly ? _self.onlineOnly : onlineOnly // ignore: cast_nullable_to_non_nullable
as bool?,payoutEnabled: freezed == payoutEnabled ? _self.payoutEnabled : payoutEnabled // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}

}


/// Adds pattern-matching-related methods to [User].
extension UserPatterns on User {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _User value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _User() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _User value)  $default,){
final _that = this;
switch (_that) {
case _User():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _User value)?  $default,){
final _that = this;
switch (_that) {
case _User() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String email,  String name,  String role,  String? avatarUrl,  String? gradeLevel,  List<String>? subjectsOfInterest,  String? bio,  List<String>? subjectsTaught,  int? hourlyRateCents,  bool? onlineOnly,  bool? payoutEnabled)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _User() when $default != null:
return $default(_that.id,_that.email,_that.name,_that.role,_that.avatarUrl,_that.gradeLevel,_that.subjectsOfInterest,_that.bio,_that.subjectsTaught,_that.hourlyRateCents,_that.onlineOnly,_that.payoutEnabled);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String email,  String name,  String role,  String? avatarUrl,  String? gradeLevel,  List<String>? subjectsOfInterest,  String? bio,  List<String>? subjectsTaught,  int? hourlyRateCents,  bool? onlineOnly,  bool? payoutEnabled)  $default,) {final _that = this;
switch (_that) {
case _User():
return $default(_that.id,_that.email,_that.name,_that.role,_that.avatarUrl,_that.gradeLevel,_that.subjectsOfInterest,_that.bio,_that.subjectsTaught,_that.hourlyRateCents,_that.onlineOnly,_that.payoutEnabled);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String email,  String name,  String role,  String? avatarUrl,  String? gradeLevel,  List<String>? subjectsOfInterest,  String? bio,  List<String>? subjectsTaught,  int? hourlyRateCents,  bool? onlineOnly,  bool? payoutEnabled)?  $default,) {final _that = this;
switch (_that) {
case _User() when $default != null:
return $default(_that.id,_that.email,_that.name,_that.role,_that.avatarUrl,_that.gradeLevel,_that.subjectsOfInterest,_that.bio,_that.subjectsTaught,_that.hourlyRateCents,_that.onlineOnly,_that.payoutEnabled);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _User implements User {
  const _User({required this.id, required this.email, required this.name, required this.role, this.avatarUrl, this.gradeLevel, final  List<String>? subjectsOfInterest, this.bio, final  List<String>? subjectsTaught, this.hourlyRateCents, this.onlineOnly, this.payoutEnabled}): _subjectsOfInterest = subjectsOfInterest,_subjectsTaught = subjectsTaught;
  factory _User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

@override final  String id;
@override final  String email;
@override final  String name;
@override final  String role;
@override final  String? avatarUrl;
@override final  String? gradeLevel;
 final  List<String>? _subjectsOfInterest;
@override List<String>? get subjectsOfInterest {
  final value = _subjectsOfInterest;
  if (value == null) return null;
  if (_subjectsOfInterest is EqualUnmodifiableListView) return _subjectsOfInterest;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  String? bio;
 final  List<String>? _subjectsTaught;
@override List<String>? get subjectsTaught {
  final value = _subjectsTaught;
  if (value == null) return null;
  if (_subjectsTaught is EqualUnmodifiableListView) return _subjectsTaught;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override final  int? hourlyRateCents;
@override final  bool? onlineOnly;
@override final  bool? payoutEnabled;

/// Create a copy of User
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserCopyWith<_User> get copyWith => __$UserCopyWithImpl<_User>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _User&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.name, name) || other.name == name)&&(identical(other.role, role) || other.role == role)&&(identical(other.avatarUrl, avatarUrl) || other.avatarUrl == avatarUrl)&&(identical(other.gradeLevel, gradeLevel) || other.gradeLevel == gradeLevel)&&const DeepCollectionEquality().equals(other._subjectsOfInterest, _subjectsOfInterest)&&(identical(other.bio, bio) || other.bio == bio)&&const DeepCollectionEquality().equals(other._subjectsTaught, _subjectsTaught)&&(identical(other.hourlyRateCents, hourlyRateCents) || other.hourlyRateCents == hourlyRateCents)&&(identical(other.onlineOnly, onlineOnly) || other.onlineOnly == onlineOnly)&&(identical(other.payoutEnabled, payoutEnabled) || other.payoutEnabled == payoutEnabled));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,name,role,avatarUrl,gradeLevel,const DeepCollectionEquality().hash(_subjectsOfInterest),bio,const DeepCollectionEquality().hash(_subjectsTaught),hourlyRateCents,onlineOnly,payoutEnabled);

@override
String toString() {
  return 'User(id: $id, email: $email, name: $name, role: $role, avatarUrl: $avatarUrl, gradeLevel: $gradeLevel, subjectsOfInterest: $subjectsOfInterest, bio: $bio, subjectsTaught: $subjectsTaught, hourlyRateCents: $hourlyRateCents, onlineOnly: $onlineOnly, payoutEnabled: $payoutEnabled)';
}


}

/// @nodoc
abstract mixin class _$UserCopyWith<$Res> implements $UserCopyWith<$Res> {
  factory _$UserCopyWith(_User value, $Res Function(_User) _then) = __$UserCopyWithImpl;
@override @useResult
$Res call({
 String id, String email, String name, String role, String? avatarUrl, String? gradeLevel, List<String>? subjectsOfInterest, String? bio, List<String>? subjectsTaught, int? hourlyRateCents, bool? onlineOnly, bool? payoutEnabled
});




}
/// @nodoc
class __$UserCopyWithImpl<$Res>
    implements _$UserCopyWith<$Res> {
  __$UserCopyWithImpl(this._self, this._then);

  final _User _self;
  final $Res Function(_User) _then;

/// Create a copy of User
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? email = null,Object? name = null,Object? role = null,Object? avatarUrl = freezed,Object? gradeLevel = freezed,Object? subjectsOfInterest = freezed,Object? bio = freezed,Object? subjectsTaught = freezed,Object? hourlyRateCents = freezed,Object? onlineOnly = freezed,Object? payoutEnabled = freezed,}) {
  return _then(_User(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,avatarUrl: freezed == avatarUrl ? _self.avatarUrl : avatarUrl // ignore: cast_nullable_to_non_nullable
as String?,gradeLevel: freezed == gradeLevel ? _self.gradeLevel : gradeLevel // ignore: cast_nullable_to_non_nullable
as String?,subjectsOfInterest: freezed == subjectsOfInterest ? _self._subjectsOfInterest : subjectsOfInterest // ignore: cast_nullable_to_non_nullable
as List<String>?,bio: freezed == bio ? _self.bio : bio // ignore: cast_nullable_to_non_nullable
as String?,subjectsTaught: freezed == subjectsTaught ? _self._subjectsTaught : subjectsTaught // ignore: cast_nullable_to_non_nullable
as List<String>?,hourlyRateCents: freezed == hourlyRateCents ? _self.hourlyRateCents : hourlyRateCents // ignore: cast_nullable_to_non_nullable
as int?,onlineOnly: freezed == onlineOnly ? _self.onlineOnly : onlineOnly // ignore: cast_nullable_to_non_nullable
as bool?,payoutEnabled: freezed == payoutEnabled ? _self.payoutEnabled : payoutEnabled // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}


}

// dart format on
