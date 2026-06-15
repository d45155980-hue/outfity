import 'dart:async';
import 'package:flutter/material.dart';
import '../models/notification.dart';
import '../services/api_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  bool _loading = false;
  int _unreadCount = 0;
  Timer? _silentTimer;

  List<AppNotification> get notifications => _notifications;
  bool get loading => _loading;
  int get unreadCount => _unreadCount;

  NotificationProvider() {
    _silentTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _silentFetch();
    });
  }

  Future<void> _silentFetch() async {
    try {
      final result = await ApiService().getNotifications();
      final fetched = (result['notifications'] as List)
          .map((n) => AppNotification.fromJson(n as Map<String, dynamic>))
          .toList();
      _unreadCount = result['unreadCount'] as int? ?? 0;
      if (_notifications.length != fetched.length || _unreadCount > 0) {
        _notifications = fetched;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> fetchNotifications() async {
    _loading = true;
    notifyListeners();
    try {
      final result = await ApiService().getNotifications();
      _notifications = (result['notifications'] as List)
          .map((n) => AppNotification.fromJson(n as Map<String, dynamic>))
          .toList();
      _unreadCount = result['unreadCount'] as int? ?? 0;
    } catch (_) {
      _notifications = [];
      _unreadCount = 0;
    }
    _loading = false;
    notifyListeners();
  }

  void addNotificationFromSSE(Map<String, dynamic> data) {
    final notification = AppNotification.fromJson(data);
    _notifications.insert(0, notification);
    _unreadCount++;
    notifyListeners();
  }

  Future<void> markAsRead(String id) async {
    try {
      await ApiService().markNotificationRead(id);
      final idx = _notifications.indexWhere((n) => n.id == id);
      if (idx != -1 && !_notifications[idx].isRead) {
        _notifications[idx].isRead = true;
        _unreadCount = (_unreadCount - 1).clamp(0, _unreadCount);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await ApiService().markAllNotificationsRead();
      for (var n in _notifications) {
        n.isRead = true;
      }
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  @override
  void dispose() {
    _silentTimer?.cancel();
    super.dispose();
  }
}
