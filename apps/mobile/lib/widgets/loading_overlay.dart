import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final loadingProvider = NotifierProvider<_LoadingNotifier, bool>(_LoadingNotifier.new);

class _LoadingNotifier extends Notifier<bool> {
  @override
  bool build() => false;
  void setLoading(bool value) => state = value;
}

class LoadingOverlay extends ConsumerWidget {
  final Widget child;

  const LoadingOverlay({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoading = ref.watch(loadingProvider);

    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black54,
            child: const Center(
              child: Card(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Loading...'),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

extension LoadingOverlayExtension on WidgetRef {
  void showLoading() => read(loadingProvider.notifier).setLoading(true);
  void hideLoading() => read(loadingProvider.notifier).setLoading(false);
}
