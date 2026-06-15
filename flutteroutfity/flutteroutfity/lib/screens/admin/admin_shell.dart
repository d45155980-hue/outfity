import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notification_provider.dart';
import 'dashboard/dashboard_screen.dart';
import 'orders/admin_orders_screen.dart';
import 'categories/admin_categories_screen.dart';
import 'coupons/admin_coupons_screen.dart';
import 'banners/admin_banners_screen.dart';
import 'reviews/admin_reviews_screen.dart';
import 'customers/admin_customers_screen.dart';
import 'products/admin_products_screen.dart';
import 'settings/admin_settings_screen.dart';
import '../notifications/notifications_screen.dart';
import 'notifications/admin_broadcast_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  final _screens = const [
    AdminDashboardScreen(),
    AdminOrdersScreen(),
    AdminProductsScreen(),
    AdminCategoriesScreen(),
    AdminCouponsScreen(),
    AdminBannersScreen(),
    AdminReviewsScreen(),
    AdminCustomersScreen(),
    AdminSettingsScreen(),
  ];

  final _titles = [
    'Admin Dashboard',
    'Orders',
    'Products',
    'Categories',
    'Coupons',
    'Banners',
    'Reviews',
    'Customers',
    'Settings',
  ];

  final _icons = [
    Icons.dashboard_outlined,
    Icons.shopping_bag_outlined,
    Icons.inventory_2_outlined,
    Icons.category_outlined,
    Icons.discount_outlined,
    Icons.image_outlined,
    Icons.star_outline,
    Icons.people_outline,
    Icons.settings_outlined,
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    if (user?.role != 'admin') {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: const Center(child: Text('Admin access required')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index]),
        actions: [
          Consumer<NotificationProvider>(
            builder: (context, np, _) => Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                    );
                  },
                ),
                if (np.unreadCount > 0)
                  Positioned(
                    right: 6,
                    top: 6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${np.unreadCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          PopupMenuButton(
            icon: const Icon(Icons.more_vert),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'broadcast', child: Text('Send Notification')),
            ],
            onSelected: (v) {
              if (v == 'broadcast') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AdminBroadcastScreen()),
                );
              }
            },
          ),
          IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ]),
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        indicatorColor: AppColors.primary.withOpacity(0.15),
        destinations: List.generate(_titles.length, (i) =>
          NavigationDestination(icon: Icon(_icons[i]), label: _titles[i]),
        ),
      ),
    );
  }
}
