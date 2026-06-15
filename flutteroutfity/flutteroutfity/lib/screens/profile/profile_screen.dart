import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/api_client.dart';
import '../admin/admin_shell.dart';
import '../auth/login_screen.dart';
import '../orders/my_orders_screen.dart';
import '../wishlist/wishlist_screen.dart';
import '../coupons/coupons_screen.dart';
import '../settings/settings_screen.dart';

void _showChangePassword(BuildContext context) {
  final currentCtrl = TextEditingController();
  final newCtrl = TextEditingController();
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Change Password'),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        TextField(controller: currentCtrl, obscureText: true, decoration: const InputDecoration(hintText: 'Current Password')),
        const SizedBox(height: 12),
        TextField(controller: newCtrl, obscureText: true, decoration: const InputDecoration(hintText: 'New Password')),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
        ElevatedButton(onPressed: () async {
          try {
            await ApiService().updatePassword(currentCtrl.text, newCtrl.text);
            if (ctx.mounted) Navigator.pop(ctx);
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Password updated'), behavior: SnackBarBehavior.floating),
              );
            }
          } on ApiException catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(e.message), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
              );
            }
          } catch (_) {}
        }, child: const Text('Update')),
      ],
    ),
  );
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final name = user?.name ?? '';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 20),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryLight]),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Center(
                  child: Text(initial, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: AppColors.white)),
                ),
              ),
              const SizedBox(height: 16),
              Text(user?.name ?? 'User', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text(user?.email ?? '', style: TextStyle(fontSize: 14, color: AppColors.textSecondary.withOpacity(0.8))),
              const SizedBox(height: 32),
              _menuItem(Icons.shopping_bag_outlined, 'My Orders', () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MyOrdersScreen()))),
              _menuItem(Icons.favorite_outline, 'Wishlist', () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WishlistScreen()))),
              _menuItem(Icons.location_on_outlined, 'Addresses', () {}),
              _menuItem(Icons.discount_outlined, 'Coupons', () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CouponsScreen()))),
              _menuItem(Icons.notifications_outlined, 'Notifications', () {}),
              _menuItem(Icons.lock_outline, 'Change Password', () => _showChangePassword(context)),
              _menuItem(Icons.settings_outlined, 'Settings', () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen()))),
              _menuItem(Icons.headset_mic_outlined, 'Help & Support', () {}),
              _menuItem(Icons.info_outline, 'About', () {}),
              if (user?.role == 'admin') ...[
                const Divider(height: 8),
                _menuItem(Icons.admin_panel_settings_outlined, 'Admin Panel', () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdminShell())), AppColors.primary),
              ],
              const Divider(height: 32),
              _menuItem(Icons.logout, 'Logout', () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                }
              }, AppColors.error),
            ],
          ),
        ),
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap, [Color? color]) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: (color ?? AppColors.textPrimary).withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: color ?? AppColors.textPrimary),
        ),
        title: Text(label, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: color ?? AppColors.textPrimary)),
        trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.textHint),
        onTap: onTap,
        contentPadding: EdgeInsets.zero,
        minLeadingWidth: 0,
      ),
    );
  }
}
