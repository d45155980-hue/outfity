import 'dart:async';
import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/order.dart';
import '../../../services/api_service.dart';
import '../../../services/sse_service.dart';
import '../../../utils/helpers.dart';

class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  State<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  List<Order> _orders = [];
  bool _loading = true;
  final SSEService _sse = SSEService();

  @override
  void initState() {
    super.initState();
    _fetch();
    _sse.connect('/sse/orders');
    _sse.stream.listen((_) {
      _poll();
    });
  }

  @override
  void dispose() {
    _sse.dispose();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      _orders = await ApiService().getAllOrders();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _poll() async {
    try {
      _orders = await ApiService().getAllOrders();
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> _updateStatus(Order order, String newStatus) async {
    if (newStatus == order.orderStatus) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(newStatus == 'Confirmed' ? 'Accept Order' : 'Cancel Order'),
        content: Text(newStatus == 'Confirmed'
            ? 'Accept this order? The customer will be notified.'
            : 'Cancel this order? The customer will be notified.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Yes', style: TextStyle(color: newStatus == 'Confirmed' ? AppColors.primary : AppColors.error)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiService().updateOrderStatus(order.id, newStatus);
      await _fetch();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(newStatus == 'Confirmed'
              ? 'Order accepted — customer notified'
              : 'Order cancelled — customer notified'),
          backgroundColor: AppColors.success,
        ));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Failed to update status'),
          backgroundColor: AppColors.error,
        ));
      }
    }
  }

  Color _color(String s) {
    switch (s.toLowerCase()) {
      case 'delivered': return AppColors.success;
      case 'shipped': return AppColors.primary;
      case 'processing': return Colors.orange;
      case 'cancelled': return AppColors.error;
      default: return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _orders.length,
        itemBuilder: (_, i) {
          final o = _orders[i];
          final isProcessing = o.orderStatus.toLowerCase() == 'processing';
          final isFinal = o.orderStatus.toLowerCase() == 'delivered' || o.orderStatus.toLowerCase() == 'cancelled';
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Order #${o.orderNumber.length > 8 ? o.orderNumber.substring(0, 8).toUpperCase() : o.orderNumber}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text('${o.items.length} items · ${Helpers.formatPrice(o.total)}',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))),
                  ])),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _color(o.orderStatus).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      o.orderStatus[0].toUpperCase() + o.orderStatus.substring(1),
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _color(o.orderStatus)),
                    ),
                  ),
                ]),
                const SizedBox(height: 8),
                if (!isFinal)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (isProcessing)
                        _actionChip('Accept', AppColors.primary, () => _updateStatus(o, 'Confirmed')),
                      if (!isProcessing)
                        const SizedBox.shrink(),
                      const SizedBox(width: 6),
                      _actionChip('Cancel', AppColors.error, () => _updateStatus(o, 'Cancelled')),
                      const SizedBox(width: 6),
                      _statusDropdown(o),
                    ],
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _actionChip(String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
      ),
    );
  }

  Widget _statusDropdown(Order order) {
    return GestureDetector(
      onTap: () async {
        final statuses = ['confirmed', 'packed', 'shipped', 'outfordelivery', 'delivered'];
        final result = await showDialog<String>(
          context: context,
          builder: (ctx) => SimpleDialog(
            title: const Text('Update Status'),
            children: statuses.map((s) {
              return SimpleDialogOption(
                onPressed: () => Navigator.pop(ctx, s),
                child: Row(children: [
                  Radio<String>(value: s, groupValue: order.orderStatus, onChanged: (_) {}),
                  const SizedBox(width: 8),
                  Text(s[0].toUpperCase() + s.substring(1)),
                ]),
              );
            }).toList(),
          ),
        );
        if (result != null && result != order.orderStatus) {
          try {
            await ApiService().updateOrderStatus(order.id, result);
            await _fetch();
          } catch (_) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Failed to update'), backgroundColor: AppColors.error),
              );
            }
          }
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Text('More', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            SizedBox(width: 2),
            Icon(Icons.arrow_drop_down, size: 14, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
