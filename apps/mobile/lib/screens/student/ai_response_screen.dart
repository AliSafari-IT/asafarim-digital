import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_service.dart';

class AIResponseScreen extends ConsumerStatefulWidget {
  const AIResponseScreen({super.key});

  @override
  ConsumerState<AIResponseScreen> createState() => _AIResponseScreenState();
}

class _AIResponseScreenState extends ConsumerState<AIResponseScreen> {
  String _response = '';
  bool _isLoading = true;
  bool _isStreaming = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    final inquiryId = args?['inquiryId'] as String?;
    if (inquiryId != null) {
      _loadResponse(inquiryId);
    }
  }

  Future<void> _loadResponse(String inquiryId) async {
    final api = ref.read(apiServiceProvider);

    try {
      await for (final chunk in api.streamAIResponse(inquiryId)) {
        setState(() {
          _response += chunk;
          _isStreaming = true;
        });
      }
    } catch (e) {
      // Handle error
    } finally {
      setState(() {
        _isLoading = false;
        _isStreaming = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    final inquiryId = args?['inquiryId'] as String?;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Explanation'),
        actions: [
          if (!_isLoading)
            TextButton.icon(
              onPressed: () => _requestTutors(inquiryId!),
              icon: const Icon(Icons.people),
              label: const Text('Get Tutors'),
            ),
        ],
      ),
      body: _isLoading && _response.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('AI is analyzing your question...'),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_isStreaming)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Generating response...',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Text(
                    _response,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 32),
                  if (!_isStreaming) ...[
                    const Divider(),
                    const SizedBox(height: 16),
                    Text(
                      'Need more help?',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Get personalized help from verified tutors. Request quotes from up to 5 tutors.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _requestTutors(inquiryId!),
                        icon: const Icon(Icons.people),
                        label: const Text('Request Tutor Quotes'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Future<void> _requestTutors(String inquiryId) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.requestQuotes(inquiryId);

      if (mounted) {
        Navigator.pushNamed(
          context,
          '/student/quotes',
          arguments: {'inquiryId': inquiryId},
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }
}
