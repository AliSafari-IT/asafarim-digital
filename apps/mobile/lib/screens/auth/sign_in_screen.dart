import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../providers/auth_provider.dart';
import 'google_sign_in_web_stub.dart'
    if (dart.library.js_interop) 'google_sign_in_web_impl.dart' as web_sign_in;

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (kIsWeb) {
      GoogleSignIn.instance.authenticationEvents
          .where((e) => e is GoogleSignInAuthenticationEventSignIn)
          .listen((event) {
        final signInEvent = event as GoogleSignInAuthenticationEventSignIn;
        ref
            .read(authProvider.notifier)
            .handleWebGoogleSignIn(signInEvent.user);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    final role = args?['role'] as String? ?? 'student';

    ref.listen(authProvider, (previous, next) {
      next.whenOrNull(
        error: (error, _) {
          setState(() {
            _isLoading = false;
            _error = error.toString();
          });
        },
      );
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign In'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 32),
              Icon(
                Icons.account_circle_outlined,
                size: 80,
                color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
              ),
              const SizedBox(height: 24),
              Text(
                'Sign in to continue',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Continue as ${role == 'student' ? 'a Student' : 'a Tutor'}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _error!,
                    style: TextStyle(color: Colors.red[700]),
                    textAlign: TextAlign.center,
                  ),
                ),
              if (_error != null) const SizedBox(height: 16),
              _buildGoogleSignInButton(),
              const SizedBox(height: 16),
              _buildAppleSignInButton(),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGoogleSignInButton() {
    if (kIsWeb && !GoogleSignIn.instance.supportsAuthenticate()) {
      return SizedBox(
        height: 50,
        child: web_sign_in.buildGoogleSignInButton(),
      );
    }

    return ElevatedButton.icon(
      onPressed: _isLoading
          ? null
          : () async {
              setState(() {
                _isLoading = true;
                _error = null;
              });
              try {
                await ref.read(authProvider.notifier).signInWithGoogle();
              } finally {
                if (mounted) {
                  setState(() => _isLoading = false);
                }
              }
            },
      icon: _isLoading
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Image.asset(
              'assets/images/google_logo.png',
              width: 20,
              height: 20,
              errorBuilder: (_, __, ___) => const Icon(Icons.login),
            ),
      label: Text(_isLoading ? 'Signing in...' : 'Continue with Google'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 2,
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }

  Widget _buildAppleSignInButton() {
    return ElevatedButton.icon(
      onPressed: () {
        // Apple Sign In implementation
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Apple Sign In coming soon')),
        );
      },
      icon: const Icon(Icons.apple),
      label: const Text('Continue with Apple'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
      ),
    );
  }
}
