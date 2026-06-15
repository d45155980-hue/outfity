import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/theme_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.isDark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Dark Mode', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                  value: isDark,
                  onChanged: (_) => themeProvider.toggleTheme(),
                  activeColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                ),
                const Divider(),
                ListTile(
                  title: const Text('Language', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                  trailing: const Text('English', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                  contentPadding: EdgeInsets.zero,
                  onTap: () {},
                ),
                const Divider(),
                SwitchListTile(
                  title: const Text('Push Notifications', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                  value: true,
                  onChanged: (_) {},
                  activeColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
