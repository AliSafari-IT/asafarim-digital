import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

final tutorWalletProvider = FutureProvider<Map<String, dynamic>>((ref) {
  return ref.watch(apiServiceProvider).getWallet();
});

class TutorHomeScreen extends ConsumerWidget {
  const TutorHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(tutorWalletProvider);
    final user = ref.watch(authProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tutor Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(tutorWalletProvider.future),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildEarningsCards(context, walletAsync),
              const SizedBox(height: 24),
              _buildQuickActions(context),
              const SizedBox(height: 24),
              _buildQuoteRequestsPreview(context),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.request_page_outlined),
            selectedIcon: Icon(Icons.request_page),
            label: 'Requests',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_today_outlined),
            selectedIcon: Icon(Icons.calendar_today),
            label: 'Bookings',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_outlined),
            selectedIcon: Icon(Icons.account_balance_wallet),
            label: 'Wallet',
          ),
        ],
        onDestinationSelected: (index) {
          switch (index) {
            case 1:
              Navigator.pushNamed(context, '/tutor/quote-requests');
              break;
            case 2:
              Navigator.pushNamed(context, '/tutor/bookings');
              break;
            case 3:
              Navigator.pushNamed(context, '/tutor/wallet');
              break;
          }
        },
      ),
    );
  }

  Widget _buildEarningsCards(
    BuildContext context,
    AsyncValue<Map<String, dynamic>> walletAsync,
  ) {
    return walletAsync.when(
      data: (wallet) {
        final balance = wallet['wallet']?['balanceCents'] ?? 0;
        final pending = wallet['wallet']?['pendingCents'] ?? 0;
        final nextPayoutEligible = wallet['wallet']?['nextPayoutEligible'] ?? false;

        return Row(
          children: [
            Expanded(
              child: _EarningsCard(
                title: 'Available',
                amount: '€${(balance / 100).toStringAsFixed(2)}',
                color: Colors.green,
                icon: Icons.account_balance_wallet,
                action: nextPayoutEligible
                    ? TextButton(
                        onPressed: () => _requestPayout(context),
                        child: const Text('PAYOUT'),
                      )
                    : null,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _EarningsCard(
                title: 'Pending',
                amount: '€${(pending / 100).toStringAsFixed(2)}',
                color: Colors.orange,
                icon: Icons.access_time,
              ),
            ),
          ],
        );
      },
      loading: () => const Row(
        children: [
          Expanded(child: _EarningsCard.loading()),
          SizedBox(width: 12),
          Expanded(child: _EarningsCard.loading()),
        ],
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Future<void> _requestPayout(BuildContext context) async {
    // Show confirmation dialog
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

    if (confirmed == true && context.mounted) {
      try {
        // Call payout API
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payout requested successfully')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Widget _buildQuickActions(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ActionButton(
                    icon: Icons.request_page,
                    label: 'View\nRequests',
                    onTap: () => Navigator.pushNamed(context, '/tutor/quote-requests'),
                  ),
                ),
                Expanded(
                  child: _ActionButton(
                    icon: Icons.calendar_today,
                    label: 'My\nBookings',
                    onTap: () => Navigator.pushNamed(context, '/tutor/bookings'),
                  ),
                ),
                Expanded(
                  child: _ActionButton(
                    icon: Icons.account_circle,
                    label: 'Edit\nProfile',
                    onTap: () {},
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuoteRequestsPreview(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'New Quote Requests',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/tutor/quote-requests'),
                  child: const Text('See All'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Center(
              child: Column(
                children: [
                  Icon(
                    Icons.inbox_outlined,
                    size: 48,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'No new requests',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EarningsCard extends StatelessWidget {
  final String title;
  final String amount;
  final Color color;
  final IconData icon;
  final Widget? action;

  const _EarningsCard({
    required this.title,
    required this.amount,
    required this.color,
    required this.icon,
    this.action,
  });

  const _EarningsCard.loading()
      : title = 'Loading',
        amount = '---',
        color = Colors.grey,
        icon = Icons.account_balance_wallet,
        action = null;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              amount,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
            if (action != null) ...[
              const SizedBox(height: 8),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
