import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/quote.dart';
import '../../services/api_service.dart';

final quotesProvider = FutureProvider.family<List<Quote>, String>((ref, inquiryId) {
  return ref.watch(apiServiceProvider).getQuotes(inquiryId);
});

class QuotesScreen extends ConsumerWidget {
  const QuotesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    final inquiryId = args?['inquiryId'] as String?;

    if (inquiryId == null) {
      return const Scaffold(
        body: Center(child: Text('No inquiry ID provided')),
      );
    }

    final quotesAsync = ref.watch(quotesProvider(inquiryId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tutor Quotes'),
      ),
      body: quotesAsync.when(
        data: (quotes) => _buildQuotesList(context, quotes),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildQuotesList(BuildContext context, List<Quote> quotes) {
    if (quotes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.pending_actions, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Waiting for quotes...',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Tutors are reviewing your request',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: quotes.length,
      itemBuilder: (context, index) {
        return _QuoteCard(quote: quotes[index]);
      },
    );
  }
}

class _QuoteCard extends StatelessWidget {
  final Quote quote;

  const _QuoteCard({required this.quote});

  @override
  Widget build(BuildContext context) {
    final total = (quote.totalCents / 100).toStringAsFixed(2);
    final rate = (quote.hourlyRateCents / 100).toStringAsFixed(2);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: quote.tutorAvatar != null
                      ? NetworkImage(quote.tutorAvatar!)
                      : null,
                  child: quote.tutorAvatar == null
                      ? const Icon(Icons.person)
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        quote.tutorName,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      if (quote.ratingAvg != null)
                        Row(
                          children: [
                            Icon(Icons.star, size: 16, color: Colors.amber[600]),
                            const SizedBox(width: 4),
                            Text(
                              '${quote.ratingAvg!.toStringAsFixed(1)} (${quote.ratingCount} reviews)',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
                Text(
                  '€$total',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
              ],
            ),
            if (quote.tutorBio != null) ...[
              const SizedBox(height: 12),
              Text(
                quote.tutorBio!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _buildDetailChip(Icons.euro, '€$rate/hr'),
                const SizedBox(width: 8),
                _buildDetailChip(Icons.timer, '${quote.estimatedHours} hrs'),
              ],
            ),
            if (quote.notes != null && quote.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  quote.notes!,
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ),
            ],
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _declineQuote(context, quote.id),
                    child: const Text('Decline'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: () => _acceptQuote(context, quote.id),
                    child: const Text('Select & Book'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailChip(IconData icon, String label) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      backgroundColor: Colors.grey[100],
    );
  }

  void _acceptQuote(BuildContext context, String quoteId) {
    Navigator.pushNamed(
      context,
      '/student/booking',
      arguments: {'quoteId': quoteId},
    );
  }

  void _declineQuote(BuildContext context, String quoteId) {
    // Decline logic
  }
}
