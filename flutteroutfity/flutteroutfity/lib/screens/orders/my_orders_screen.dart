import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../models/order.dart';
import '../../services/api_service.dart';
import '../../services/sse_service.dart';
import '../../utils/helpers.dart';
import '../../widgets/empty_state.dart';
import 'order_detail_screen.dart';

class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  List<Order> _orders = [];
  bool _loading = true;
  final SSEService _sse = SSEService();

  @override
  void initState() {
    super.initState();
    _fetchOrders();
    _sse.connect('/sse/orders');
    _sse.stream.listen((_) => _fetchOrders());
  }

  @override
  void dispose() {
    _sse.dispose();
    super.dispose();
  }

  Future<void> _fetchOrders() async {
    setState(() => _loading = true);
    try {
      final orders = await ApiService().getMyOrders();
      if (mounted) setState(() => _orders = orders);
    } catch (_) {
      if (mounted) setState(() => _orders = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return AppColors.success;
      case 'shipped':
        return AppColors.primary;
      case 'processing':
        return Colors.orange;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _orders.isEmpty
              ? const EmptyState(
                  icon: Icons.receipt_long_outlined,
                  title: 'No orders yet',
                  description: 'Your orders will appear here once you make a purchase.',
                )
              : RefreshIndicator(
                  onRefresh: _fetchOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _orders.length,
                    itemBuilder: (context, index) {
                      final order = _orders[index];
                      final itemCount = order.items.length;
                      return GestureDetector(
                        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id))),
                        child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.inventory_2_outlined, color: AppColors.primary),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Order #${order.orderNumber.length > 8 ? order.orderNumber.substring(0, 8).toUpperCase() : order.orderNumber}',
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$itemCount item${itemCount > 1 ? 's' : ''} · ${Helpers.formatPrice(order.total)}',
                                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8)),
                                  ),
                                  if (order.createdAt.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 2),
                                      child: Text(
                                        Helpers.formatDate(order.createdAt),
                                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary.withOpacity(0.6)),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _statusColor(order.orderStatus).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                order.orderStatus[0].toUpperCase() + order.orderStatus.substring(1),
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor(order.orderStatus)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                    },
                  ),
                ),
    );
  }
}
