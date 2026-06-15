import 'package:flutter/material.dart' hide Banner;
import '../../../theme/app_colors.dart';
import '../../../config/api_config.dart';
import '../../../models/banner.dart';
import '../../../services/api_service.dart';

class AdminBannersScreen extends StatefulWidget {
  const AdminBannersScreen({super.key});

  @override
  State<AdminBannersScreen> createState() => _AdminBannersScreenState();
}

class _AdminBannersScreenState extends State<AdminBannersScreen> {
  List<Banner> _banners = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try { _banners = await ApiService().getAllBanners(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _delete(Banner b) async {
    final confirmed = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Delete Banner'), content: Text('Delete "${b.title}"?'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete'))],
    ));
    if (confirmed != true) return;
    try { await ApiService().deleteBanner(b.id); await _fetch(); } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView.builder(
        padding: const EdgeInsets.all(20), itemCount: _banners.length,
        itemBuilder: (_, i) {
          final b = _banners[i];
          final url = b.image != null ? ApiConfig.imageUrl(b.image!.url) : '';
          return Dismissible(
            key: Key(b.id), direction: DismissDirection.endToStart,
            background: Container(alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), color: AppColors.error, child: const Icon(Icons.delete, color: AppColors.white)),
            onDismissed: (_) => _delete(b),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
              child: Row(children: [
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12),
                    image: url.isNotEmpty ? DecorationImage(image: NetworkImage(url), fit: BoxFit.cover) : null),
                  child: url.isEmpty ? const Icon(Icons.image_outlined, color: AppColors.primary) : null,
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(b.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  if (b.subtitle != null) Text(b.subtitle!, style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))),
                ])),
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: (b.isActive ? AppColors.success : AppColors.textSecondary).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(b.isActive ? 'Active' : 'Inactive', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: b.isActive ? AppColors.success : AppColors.textSecondary))),
              ]),
            ),
          );
        },
      ),
    );
  }
}
