import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_service.dart';

final tutorWalletProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.watch(apiServiceProvider).getWallet();
});

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(tutorWalletProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
      ),
      body: walletAsync.when(
        data: (data) => _buildWalletContent(context, ref, data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }

  Widget _buildWalletContent(
    BuildContext context,
    WidgetRef ref,
    Map<String, dynamic> data,
  ) {
    final wallet = data['wallet'] as Map<String, dynamic>? ?? {};
    final transactions = (data['transactions'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    final balance = wallet['balanceCents'] as int? ?? 0;
    final pending = wallet['pendingCents'] as int? ?? 0;
    final nextPayoutEligible = wallet['nextPayoutEligible'] as bool? ?? false;

    return RefreshIndicator(
      onRefresh: () => ref.refresh(tutorWalletProvider.future),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildBalanceCard(context, balance, pending, nextPayoutEligible, ref),
          const SizedBox(height: 24),
          Text(
            'Transaction History',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          ...transactions.map((tx) => _TransactionTile(transaction: tx)),
        ],
      ),
    );
  }

  Widget _buildBalanceCard(
    BuildContext context,
    int balance,
    int pending,
    bool nextPayoutEligible,
    WidgetRef ref,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text(
              'Available Balance',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '€${(balance / 100).toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
            if (pending > 0) ...[
              const SizedBox(height: 8),
              Text(
                '+ €${(pending / 100).toStringAsFixed(2)} pending',
                style: TextStyle(color: Colors.orange[600]),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: nextPayoutEligible
                    ? () => _requestPayout(context, ref)
                    : null,
                child: const Text('Request Payout'),
              ),
            ),
            if (!nextPayoutEligible) ...[
              const SizedBox(height: 8),
              Text(
                'Minimum €50 required for payout',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _requestPayout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request Payout'),
        content: const Text(
          'Funds will be transferred to your connected bank account within 1-2 business days.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(apiServiceProvider).requestPayout();
        ref.invalidate(tutorWalletProvider);

        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Payout requested successfully')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }
}

class _TransactionTile extends StatelessWidget {
  final Map<String, dynamic> transaction;

  const _TransactionTile({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final type = transaction['type'] as String? ?? 'CHARGE';
    final netCents = transaction['netCents'] as int? ?? 0;
    final createdAt = transaction['createdAt'] as String?;

    final isPositive = type == 'CHARGE';
    final amount = (netCents.abs() / 100).toStringAsFixed(2);

    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isPositive ? Colors.green[50] : Colors.blue[50],
          shape: BoxShape.circle,
        ),
        child: Icon(
          isPositive ? Icons.add : Icons.remove,
          color: isPositive ? Colors.green : Colors.blue,
        ),
      ),
      title: Text(isPositive ? 'Session Payment' : 'Payout'),
      subtitle: createdAt != null
          ? Text(_formatDate(createdAt))
          : null,
      trailing: Text(
        '${isPositive ? '+' : '-'}€$amount',
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: isPositive ? Colors.green : Colors.blue,
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    return '${date.day}/${date.month}/${date.year}';
  }
}
