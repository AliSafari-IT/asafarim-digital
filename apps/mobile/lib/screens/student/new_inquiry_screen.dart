import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class NewInquiryScreen extends ConsumerStatefulWidget {
  const NewInquiryScreen({super.key});

  @override
  ConsumerState<NewInquiryScreen> createState() => _NewInquiryScreenState();
}

class _NewInquiryScreenState extends ConsumerState<NewInquiryScreen> {
  int _currentStep = 0;
  String _subject = '';
  String _gradeLevel = 'K12';
  String _description = '';
  bool _isSubmitting = false;

  final List<String> _subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
    'Other',
  ];

  final List<Map<String, String>> _gradeLevels = [
    {'value': 'K12', 'label': 'K-12'},
    {'value': 'UNDERGRAD', 'label': 'Undergraduate'},
    {'value': 'GRAD', 'label': 'Graduate'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ask a Question'),
        actions: [
          TextButton(
            onPressed: _currentStep > 0 ? _previousStep : null,
            child: const Text('Back'),
          ),
        ],
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _nextStep,
        onStepCancel: _currentStep > 0 ? _previousStep : null,
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: details.onStepContinue,
                    child: Text(_currentStep == 2 ? 'Submit' : 'Continue'),
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Subject'),
            isActive: _currentStep >= 0,
            content: _buildSubjectStep(),
          ),
          Step(
            title: const Text('Details'),
            isActive: _currentStep >= 1,
            content: _buildDetailsStep(),
          ),
          Step(
            title: const Text('Review'),
            isActive: _currentStep >= 2,
            content: _buildReviewStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'What subject is your question about?',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _subjects.map((subject) {
            final isSelected = _subject == subject;
            return ChoiceChip(
              label: Text(subject),
              selected: isSelected,
              onSelected: (selected) {
                setState(() => _subject = subject);
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        Text(
          'What grade level?',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          children: _gradeLevels.map((level) {
            final isSelected = _gradeLevel == level['value'];
            return ChoiceChip(
              label: Text(level['label']!),
              selected: isSelected,
              onSelected: (selected) {
                setState(() => _gradeLevel = level['value']!);
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Describe your question',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'Be specific — include any formulas, context, or what you\'ve tried.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
        const SizedBox(height: 16),
        TextField(
          maxLines: 6,
          maxLength: 2000,
          decoration: const InputDecoration(
            hintText: 'Type your question here...',
          ),
          onChanged: (value) => _description = value,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // Image picker
                },
                icon: const Icon(Icons.camera_alt),
                label: const Text('Add Photo'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // Voice recording
                },
                icon: const Icon(Icons.mic),
                label: const Text('Record Voice'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review your question',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        _buildReviewItem('Subject', _subject),
        _buildReviewItem('Grade Level', _gradeLevel),
        _buildReviewItem('Question', _description),
        const SizedBox(height: 24),
        if (_isSubmitting)
          const Center(child: CircularProgressIndicator())
        else
          Text(
            'After submitting, our AI will generate an explanation. You can then request tutor quotes if you need more help.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
      ],
    );
  }

  Widget _buildReviewItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          Text(
            value.isEmpty ? 'Not provided' : value,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }

  void _nextStep() async {
    if (_currentStep == 2) {
      await _submit();
    } else {
      setState(() => _currentStep++);
    }
  }

  void _previousStep() {
    setState(() => _currentStep--);
  }

  Future<void> _submit() async {
    if (_subject.isEmpty || _description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final api = ref.read(apiServiceProvider);
      final inquiry = await api.createInquiry(
        subject: _subject,
        gradeLevel: _gradeLevel,
        description: _description,
      );

      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          '/student/ai-response',
          arguments: {'inquiryId': inquiry.id},
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }
}
