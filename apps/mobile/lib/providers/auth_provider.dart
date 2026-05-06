import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user.dart';
import '../services/api_service.dart';

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(() {
  return AuthNotifier();
});

class AuthNotifier extends AsyncNotifier<User?> {
  late final ApiService _apiService;
  final _storage = const FlutterSecureStorage();

  @override
  Future<User?> build() async {
    _apiService = ref.watch(apiServiceProvider);
    return _checkAuth();
  }

  Future<User?> _checkAuth() async {
    final token = await _storage.read(key: 'auth_token');
    if (token == null) return null;
    _apiService.setToken(token);
    return _apiService.getMe();
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await GoogleSignIn.instance.authenticate();
      final googleUser = await GoogleSignIn.instance.authenticationEvents
          .where((e) => e is GoogleSignInAuthenticationEventSignIn)
          .first as GoogleSignInAuthenticationEventSignIn;
      final auth = await googleUser.user.authorizationClient
          .authorizationForScopes(['email', 'profile']);
      final token = await _apiService.signInWithGoogle(
        accessToken: auth?.accessToken ?? '',
        idToken: '',
      );

      await _storage.write(key: 'auth_token', value: token);
      _apiService.setToken(token);
      return _apiService.getMe();
    });
  }

  Future<void> handleWebGoogleSignIn(GoogleSignInAccount googleUser) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final auth = await googleUser.authorizationClient
          .authorizationForScopes(['email', 'profile']);
      final token = await _apiService.signInWithGoogle(
        accessToken: auth?.accessToken ?? '',
        idToken: '',
      );

      await _storage.write(key: 'auth_token', value: token);
      _apiService.setToken(token);
      return _apiService.getMe();
    });
  }

  Future<void> signOut() async {
    await GoogleSignIn.instance.signOut();
    await _storage.delete(key: 'auth_token');
    _apiService.clearToken();
    state = const AsyncValue.data(null);
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    state = await AsyncValue.guard(() async {
      return _apiService.updateProfile(data);
    });
  }
}
