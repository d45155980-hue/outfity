import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../models/order.dart';
import '../../services/api_service.dart';
import '../../utils/helpers.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _loading = true;
  bool _cancelling = false;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      _order = await ApiService().getOrderDetails(widget.orderId);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Color _statusColor(String s) {
    switch (s.toLowerCase()) {
      case 'delivered': return AppColors.success;
      case 'shipped': return AppColors.primary;
      case 'processing': return Colors.orange;
      case 'cancelled': return AppColors.error;
      default: return AppColors.textSecondary;
    }
  }

  Future<void> _cancel() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Order'),
        content: const Text('Are you sure? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes, Cancel')),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _cancelling = true);
    try {
      await ApiService().cancelOrder(widget.orderId);
      await _fetch();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order cancelled'), behavior: SnackBarBehavior.floating),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to cancel'), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
        );
      }
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _order == null
              ? const Center(child: Text('Order not found'))
              : RefreshIndicator(
                  onRefresh: _fetch,
                  child: ListView(padding: const EdgeInsets.all(20), children: [
                    _statusCard(),
                    const SizedBox(height: 20),
                    _section('Items', _itemsList()),
                    if (_order!.shippingAddress != null) ...[
                      const SizedBox(height: 16),
                      _section('Shipping Address', _addressWidget(_order!.shippingAddress!)),
                    ],
                    const SizedBox(height: 16),
                    _section('Payment', Text(_order!.paymentMethod ?? 'N/A', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary))),
                    const SizedBox(height: 16),
                    _section('Order Summary', _summary()),
                    if (_order!.orderStatus.toLowerCase() == 'processing')
                      Padding(
                        padding: const EdgeInsets.only(top: 20),
                        child: SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _cancelling ? null : _cancel,
                            icon: _cancelling
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.cancel_outlined, color: AppColors.error),
                            label: const Text('Cancel Order'),
                            style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
                          ),
                        ),
                      ),
                  ]),
                ),
    );
  }

  Widget _statusCard() {
    final o = _order!;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(gradient: LinearGradient(colors: [AppColors.primary, AppColors.primaryDark]), borderRadius: BorderRadius.circular(20)),
      child: Column(children: [
        Text(o.orderNumber.length > 8 ? '#${o.orderNumber.substring(0, 8).toUpperCase()}' : '#${o.orderNumber}', style: const TextStyle(fontSize: 14, color: AppColors.white, fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6), decoration: BoxDecoration(color: AppColors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
          child: Text(o.orderStatus[0].toUpperCase() + o.orderStatus.substring(1), style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w600, fontSize: 13))),
        const SizedBox(height: 12),
        Text(Helpers.formatPrice(o.total), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.white)),
        if (o.estimatedDelivery != null) ...[
          const SizedBox(height: 4),
          Text('Est. delivery: ${Helpers.formatDate(o.estimatedDelivery)}', style: TextStyle(fontSize: 12, color: AppColors.white.withOpacity(0.7))),
        ],
      ]),
    );
  }

  Widget _section(String title, Widget child) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      const SizedBox(height: 12),
      Container(
        width: double.infinity, padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
        child: child,
      ),
    ]);
  }

  Widget _itemsList() {
    return Column(children: _order!.items.map((item) => Padding(
      padding: const EdgeInsets.only(bottom: 12), child: Row(children: [
        Container(
          width: 56, height: 56,
          decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.inventory_2_outlined, color: AppColors.primary),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(item.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Row(children: [
            if (item.size != null) Text('Size: ${item.size}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            if (item.size != null) const SizedBox(width: 12),
            Text('Qty: ${item.quantity}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ]),
        ])),
        Text(Helpers.formatPrice(item.price), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      ]),
    )).toList());
  }

  Widget _addressWidget(ShippingAddress a) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(a.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      const SizedBox(height: 4),
      Text('${a.address}, ${a.city}', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
      Text('${a.state} - ${a.zipCode}', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
      if (a.phone.isNotEmpty) Text('Phone: ${a.phone}', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
    ]);
  }

  Widget _summary() {
    final o = _order!;
    return Column(children: [
      _row('Subtotal', Helpers.formatPrice(o.subtotal)),
      _row('Shipping', o.shipping == 0 ? 'Free' : Helpers.formatPrice(o.shipping)),
      if (o.discount > 0) _row('Discount', '-${Helpers.formatPrice(o.discount)}', AppColors.primary),
      const Divider(height: 20),
      _row('Total', Helpers.formatPrice(o.total), AppColors.textPrimary, true),
    ]);
  }

  Widget _row(String label, String value, [Color? color, bool bold = false]) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.8))),
        Text(value, style: TextStyle(fontSize: bold ? 16 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w500, color: color ?? AppColors.textPrimary)),
      ]),
    );
  }
}
