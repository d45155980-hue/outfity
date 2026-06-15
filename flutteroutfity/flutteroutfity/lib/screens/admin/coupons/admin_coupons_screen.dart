import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/coupon.dart';
import '../../../services/api_service.dart';
import '../../../utils/helpers.dart';

class AdminCouponsScreen extends StatefulWidget {
  const AdminCouponsScreen({super.key});

  @override
  State<AdminCouponsScreen> createState() => _AdminCouponsScreenState();
}

class _AdminCouponsScreenState extends State<AdminCouponsScreen> {
  List<Coupon> _coupons = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try { _coupons = await ApiService().getAllCoupons(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _showDialog({Coupon? c}) async {
    final codeCtrl = TextEditingController(text: c?.code ?? '');
    final valueCtrl = TextEditingController(text: c?.value.toString() ?? '');
    final minCtrl = TextEditingController(text: c?.minOrder.toString() ?? '0');
    String type = c?.type ?? 'percentage';
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (ctx, setS) => AlertDialog(
        title: Text(c != null ? 'Edit Coupon' : 'New Coupon'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: codeCtrl, decoration: const InputDecoration(hintText: 'Code')),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(value: type, items: ['percentage', 'fixed'].map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
            onChanged: (v) => setS(() => type = v!), decoration: const InputDecoration(hintText: 'Type')),
          const SizedBox(height: 8),
          TextField(controller: valueCtrl, decoration: const InputDecoration(hintText: 'Value'), keyboardType: TextInputType.number),
          const SizedBox(height: 8),
          TextField(controller: minCtrl, decoration: const InputDecoration(hintText: 'Min Order'), keyboardType: TextInputType.number),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Save')),
        ],
      )),
    );
    if (saved != true) return;
    final body = {'code': codeCtrl.text.trim().toUpperCase(), 'type': type, 'value': double.parse(valueCtrl.text.trim()), 'minOrder': double.parse(minCtrl.text.trim())};
    try {
      if (c != null) { await ApiService().updateCoupon(c.id, body); } else { await ApiService().createCoupon(body); }
      await _fetch();
    } catch (_) {}
  }

  Future<void> _delete(Coupon c) async {
    final confirmed = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Delete Coupon'), content: Text('Delete "${c.code}"?'),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')), ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete'))],
    ));
    if (confirmed != true) return;
    try { await ApiService().deleteCoupon(c.id); await _fetch(); } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return Scaffold(
      floatingActionButton: FloatingActionButton(onPressed: () => _showDialog(), backgroundColor: AppColors.primary, child: const Icon(Icons.add, color: AppColors.white)),
      body: RefreshIndicator(onRefresh: _fetch, child: ListView.builder(
        padding: const EdgeInsets.all(20), itemCount: _coupons.length,
        itemBuilder: (_, i) {
          final c = _coupons[i];
          return Dismissible(
            key: Key(c.id), direction: DismissDirection.endToStart,
            background: Container(alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), color: AppColors.error, child: const Icon(Icons.delete, color: AppColors.white)),
            onDismissed: (_) => _delete(c),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
              child: ListTile(
                leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.discount_outlined, color: AppColors.primary)),
                title: Text(c.code, style: const TextStyle(fontWeight: FontWeight.w600, letterSpacing: 1)),
                subtitle: Text('${c.type == 'percentage' ? "${c.value.toInt()}%" : Helpers.formatPrice(c.value)} · Min: ${Helpers.formatPrice(c.minOrder)}',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))),
                trailing: IconButton(icon: const Icon(Icons.edit_outlined, size: 18), onPressed: () => _showDialog(c: c)),
                contentPadding: EdgeInsets.zero,
              ),
            ),
          );
        },
      )),
    );
  }
}
