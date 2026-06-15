import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/order.dart';
import '../../../models/product.dart';
import '../../../models/user.dart';
import '../../../services/api_service.dart';
import '../../../utils/helpers.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _totalOrders = 0;
  int _totalProducts = 0;
  int _totalUsers = 0;
  double _totalRevenue = 0;
  List<Order> _recentOrders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService().getAllOrders(),
        ApiService().getProducts(limit: 10000),
        ApiService().getAllUsers(),
      ]);
      final orders = results[0] as List<Order>;
      final products = (results[1] as List<Product>).length;
      final users = results[2] as List<User>;
      final revenue = orders.fold<double>(0, (sum, o) => sum + o.totalPrice);

      if (mounted) setState(() {
        _totalOrders = orders.length;
        _totalProducts = products;
        _totalUsers = users.length;
        _totalRevenue = revenue;
        _recentOrders = orders.take(5).toList();
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView(padding: const EdgeInsets.all(20), children: [
        _statRow(),
        const SizedBox(height: 24),
        const Text('Recent Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        ..._recentOrders.map((o) => Container(
          margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
          child: Row(children: [
            Expanded(child: Text('Order #${o.orderNumber.length > 8 ? o.orderNumber.substring(0, 8).toUpperCase() : o.orderNumber}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
            Text(Helpers.formatPrice(o.total), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            const SizedBox(width: 8),
            _statusBadge(o.orderStatus),
          ]),
        )),
      ]),
    );
  }

  Widget _statRow() {
    return GridView.count(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.6,
      children: [
        _statCard('Orders', '$_totalOrders', Icons.shopping_bag_outlined),
        _statCard('Revenue', Helpers.formatPrice(_totalRevenue), Icons.currency_rupee_outlined),
        _statCard('Products', '$_totalProducts', Icons.inventory_2_outlined),
        _statCard('Users', '$_totalUsers', Icons.people_outlined),
      ],
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        Text(label, style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8))),
      ]),
    );
  }

  Widget _statusBadge(String s) {
    final lc = s.toLowerCase();
    final c = lc == 'delivered' ? AppColors.success : lc == 'cancelled' ? AppColors.error : AppColors.primary;
    return Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(s[0].toUpperCase() + s.substring(1), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: c)));
  }
}
