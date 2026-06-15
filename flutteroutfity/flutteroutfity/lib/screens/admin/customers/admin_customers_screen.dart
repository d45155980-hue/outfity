import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/user.dart';
import '../../../services/api_service.dart';

class AdminCustomersScreen extends StatefulWidget {
  const AdminCustomersScreen({super.key});

  @override
  State<AdminCustomersScreen> createState() => _AdminCustomersScreenState();
}

class _AdminCustomersScreenState extends State<AdminCustomersScreen> {
  List<User> _users = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try { _users = await ApiService().getAllUsers(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _toggleBlock(User u) async {
    try { await ApiService().toggleBlockUser(u.id); await _fetch(); } catch (_) {}
  }

  Future<void> _delete(User u) async {
    try { await ApiService().deleteUser(u.id); await _fetch(); } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView.builder(
        padding: const EdgeInsets.all(20), itemCount: _users.length,
        itemBuilder: (_, i) {
          final u = _users[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
            child: Row(children: [
              CircleAvatar(radius: 18, child: Text(u.name.isNotEmpty ? u.name[0].toUpperCase() : '?', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600))),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(u.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                Text(u.email, style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))),
              ])),
              if (u.role == 'admin')
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Text('Admin', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)))
              else ...[
                IconButton(icon: const Icon(Icons.block_outlined, size: 18, color: AppColors.error), onPressed: () => _toggleBlock(u)),
                IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error), onPressed: () => _delete(u)),
              ],
            ]),
          );
        },
      ),
    );
  }
}
