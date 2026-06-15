import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/maintenance_provider.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_colors.dart';

const _paymentMethods = {
  'cod': ('Cash on Delivery', Icons.money_outlined),
  'razorpay': ('UPI / Card / Net Banking', Icons.account_balance_outlined),
  'stripe': ('Credit / Debit Card', Icons.credit_card_outlined),
  'upi': ('UPI', Icons.phone_android_outlined),
  'netbanking': ('Net Banking', Icons.account_balance_outlined),
};

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  bool _maintenance = false;
  bool _loading = true;
  bool _toggling = false;
  bool _paymentLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchStatus();
  }

  Future<void> _fetchStatus() async {
    try {
      final status = await ApiService().getSiteStatus();
      if (mounted) {
        setState(() {
          _maintenance = status['maintenance'] == true;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleMaintenance() async {
    setState(() => _toggling = true);
    try {
      await ApiService().toggleMaintenance();
      setState(() => _maintenance = !_maintenance);
      if (mounted) {
        context.read<MaintenanceProvider>().init();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to toggle maintenance mode')),
        );
      }
    } finally {
      if (mounted) setState(() => _toggling = false);
    }
  }

  Future<void> _togglePayment(String key, bool current) async {
    setState(() => _paymentLoading = true);
    final updated = {
      key: !current,
    };
    try {
      await ApiService().updatePaymentConfig(updated);
      if (mounted) {
        context.read<MaintenanceProvider>().init();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to toggle $key')),
        );
      }
    } finally {
      if (mounted) setState(() => _paymentLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final maintenance = context.watch<MaintenanceProvider>();

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Site Settings',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text(
                  'Maintenance Mode',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                ),
                subtitle: Text(
                  _maintenance
                      ? 'Store is currently under maintenance — users see a downtime page'
                      : 'Store is live and accessible to all users',
                  style: const TextStyle(fontSize: 12),
                ),
                value: _maintenance,
                onChanged: _toggling ? null : (_) => _toggleMaintenance(),
                activeColor: Colors.red,
                secondary: Icon(
                  _maintenance ? Icons.construction : Icons.check_circle_outline,
                  color: _maintenance ? Colors.red : Colors.green,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Payment Methods',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              const Text(
                'Toggle payment methods on/off. Disabled methods are hidden on checkout in real time.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              ..._paymentMethods.entries.map((entry) {
                final enabled = maintenance.isPaymentEnabled(entry.key);
                return SwitchListTile(
                  title: Text(
                    entry.value.$1,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                  value: enabled,
                  onChanged: _paymentLoading ? null : (_) => _togglePayment(entry.key, enabled),
                  activeColor: AppColors.primary,
                  secondary: Icon(
                    entry.value.$2,
                    color: enabled ? AppColors.primary : AppColors.textSecondary,
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}
