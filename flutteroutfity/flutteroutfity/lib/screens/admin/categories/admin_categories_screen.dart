import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/category.dart';
import '../../../services/api_service.dart';

class AdminCategoriesScreen extends StatefulWidget {
  const AdminCategoriesScreen({super.key});

  @override
  State<AdminCategoriesScreen> createState() => _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends State<AdminCategoriesScreen> {
  List<Category> _categories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      _categories = await ApiService().getCategories();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _showDialog({Category? cat}) async {
    final nameCtrl = TextEditingController(text: cat?.name ?? '');
    final descCtrl = TextEditingController(text: cat?.description ?? '');
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(cat != null ? 'Edit Category' : 'New Category'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: nameCtrl, decoration: const InputDecoration(hintText: 'Name')),
          const SizedBox(height: 12),
          TextField(controller: descCtrl, decoration: const InputDecoration(hintText: 'Description'), maxLines: 2),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Save')),
        ],
      ),
    );
    if (saved != true) return;
    final body = {'name': nameCtrl.text.trim(), 'description': descCtrl.text.trim()};
    try {
      if (cat != null) {
        await ApiService().updateCategory(cat.id, body);
      } else {
        await ApiService().createCategory(body);
      }
      await _fetch();
    } catch (_) {}
  }

  Future<void> _delete(Category cat) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Category'),
        content: Text('Delete "${cat.name}"?'),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete'))],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiService().deleteCategory(cat.id);
      await _fetch();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showDialog(),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.white),
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: _categories.length,
          itemBuilder: (_, i) {
            final c = _categories[i];
            return Dismissible(
              key: Key(c.id),
              direction: DismissDirection.endToStart,
              background: Container(alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), color: AppColors.error, child: const Icon(Icons.delete, color: AppColors.white)),
              onDismissed: (_) => _delete(c),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                child: ListTile(
                  leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                    child: Center(child: Text(c.name[0].toUpperCase(), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)))),
                  title: Text(c.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: c.description != null ? Text(c.description!, style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))) : null,
                  trailing: IconButton(icon: const Icon(Icons.edit_outlined, size: 18), onPressed: () => _showDialog(cat: c)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
