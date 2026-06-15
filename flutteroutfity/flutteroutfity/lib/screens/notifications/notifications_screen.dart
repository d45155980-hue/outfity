import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notification_provider.dart';
import '../../models/notification.dart';
import '../../theme/app_theme.dart';

class _TypeStyle {
  final IconData icon;
  final Color bg;
  final Color ring;

  const _TypeStyle(this.icon, this.bg, this.ring);
}

final _typeStyles = <String, _TypeStyle>{
  'order_created': _TypeStyle(Icons.shopping_bag_outlined, Color(0xFFECFDF5), Color(0xFFA7F3D0)),
  'order_cancelled': _TypeStyle(Icons.shopping_bag_outlined, Color(0xFFFFF1F2), Color(0xFFFECDD3)),
  'order_status': _TypeStyle(Icons.shopping_bag_outlined, Color(0xFFEFF6FF), Color(0xFFBFDBFE)),
  'review_submitted': _TypeStyle(Icons.star_outline, Color(0xFFFFFBEB), Color(0xFFFDE68A)),
  'review_approved': _TypeStyle(Icons.star_outline, Color(0xFFF0FDF4), Color(0xFFBBF7D0)),
  'product_created': _TypeStyle(Icons.inventory_2_outlined, Color(0xFFF5F3FF), Color(0xFFDDD6FE)),
  'product_updated': _TypeStyle(Icons.inventory_2_outlined, Color(0xFFF0F9FF), Color(0xFFBAE6FD)),
  'product_deleted': _TypeStyle(Icons.inventory_2_outlined, Color(0xFFF5F5F4), Color(0xFFE7E5E4)),
  'coupon_created': _TypeStyle(Icons.local_offer_outlined, Color(0xFFFDF2F8), Color(0xFFFBCFE8)),
  'banner_created': _TypeStyle(Icons.photo_outlined, Color(0xFFEEF2FF), Color(0xFFC7D2FE)),
  'category_created': _TypeStyle(Icons.category_outlined, Color(0xFFF0FDFA), Color(0xFF99F6E4)),
  'user_registered': _TypeStyle(Icons.person_outline, Color(0xFFF7FEE7), Color(0xFFD9F99D)),
  'user_blocked': _TypeStyle(Icons.error_outline, Color(0xFFFEF2F2), Color(0xFFFECACA)),
  'user_unblocked': _TypeStyle(Icons.check_circle_outline, Color(0xFFF0FDF4), Color(0xFFBBF7D0)),
  'site_maintenance': _TypeStyle(Icons.settings_outlined, Color(0xFFFFFBEB), Color(0xFFFDE68A)),
  'site_payments': _TypeStyle(Icons.credit_card_outlined, Color(0xFFECFEFF), Color(0xFFA5F3FC)),
  'admin_broadcast': _TypeStyle(Icons.card_giftcard_outlined, Color(0xFFFAF5FF), Color(0xFFE9D5FF)),
};

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  String _timeAgo(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 1) return 'now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m';
      if (diff.inHours < 24) return '${diff.inHours}h';
      return '${diff.inDays}d';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NotificationProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (provider.unreadCount > 0)
            TextButton(
              onPressed: () => provider.markAllAsRead(),
              child: Text(
                'Mark all read',
                style: TextStyle(fontSize: 12, color: context.theme.stone900),
              ),
            ),
        ],
      ),
      body: provider.loading
          ? const Center(child: CircularProgressIndicator())
          : provider.notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(
                          color: context.theme.stone50,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(Icons.notifications_off_outlined,
                            size: 32, color: context.theme.stone300),
                      ),
                      const SizedBox(height: 16),
                      Text('No notifications yet',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w500, color: context.theme.stone500)),
                      const SizedBox(height: 4),
                      Text("We'll notify you when something happens",
                          style: TextStyle(fontSize: 11, color: context.theme.stone400)),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: provider.notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 4),
                  itemBuilder: (context, index) {
                    final n = provider.notifications[index];
                    final style = _typeStyles[n.type] ?? _TypeStyle(Icons.notifications_outlined, context.theme.stone50, context.theme.stone200);
                    return GestureDetector(
                      onTap: () => provider.markAsRead(n.id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: n.isRead ? context.theme.white : context.theme.stone50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: n.isRead ? context.theme.stone100 : context.theme.stone200,
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: style.bg,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: style.ring, width: 1),
                              ),
                              child: Icon(style.icon, size: 18, color: context.theme.stone900),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          n.title,
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: n.isRead ? FontWeight.w500 : FontWeight.w600,
                                            color: context.theme.stone900,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        _timeAgo(n.createdAt),
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: context.theme.stone400),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    n.message,
                                    style: TextStyle(fontSize: 11, color: context.theme.stone500, height: 1.4),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            if (!n.isRead)
                              Container(
                                width: 6,
                                height: 6,
                                margin: const EdgeInsets.only(top: 4),
                                decoration: BoxDecoration(
                                  color: context.theme.stone900,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
