import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../config/api_config.dart';
import '../../../models/product.dart';
import '../../../services/api_service.dart';
import 'admin_product_form_screen.dart';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  List<Product> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService().getProducts(limit: 100);
      _products = data;
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _openForm({Product? product}) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AdminProductFormScreen(product: product),
      ),
    );
    if (saved == true) _fetch();
  }

  Future<void> _delete(Product p) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Product'),
        content: Text('Delete "${p.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiService().deleteProduct(p.id);
      await _fetch();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openForm(),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: AppColors.white),
      ),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: _products.length,
          itemBuilder: (_, i) {
            final p = _products[i];
            final hasImage = p.images.isNotEmpty && p.images.first.url.isNotEmpty;
            final imageUrl = hasImage ? ApiConfig.imageUrl(p.images.first.url) : null;
            return Dismissible(
              key: Key(p.id),
              direction: DismissDirection.endToStart,
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 20),
                color: AppColors.error,
                child: const Icon(Icons.delete, color: AppColors.white),
              ),
              onDismissed: (_) => _delete(p),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: ListTile(
                  leading: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      image: hasImage
                          ? DecorationImage(image: NetworkImage(imageUrl!), fit: BoxFit.cover)
                          : null,
                      color: hasImage ? null : AppColors.primary.withOpacity(0.1),
                    ),
                    child: hasImage ? null : const Icon(Icons.image, color: AppColors.primary, size: 22),
                  ),
                  title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('\$${p.price.toStringAsFixed(2)}',
                      style: TextStyle(fontSize: 12, color: AppColors.primary)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Stock: ${p.stock}',
                              style: TextStyle(fontSize: 11, color: p.stock > 0 ? AppColors.success : AppColors.error)),
                          if (p.salePrice != null)
                            Text('\$${p.salePrice!.toStringAsFixed(2)}',
                                style: const TextStyle(fontSize: 11, color: AppColors.error, decoration: TextDecoration.lineThrough)),
                        ],
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, size: 18),
                        onPressed: () => _openForm(product: p),
                      ),
                    ],
                  ),
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
