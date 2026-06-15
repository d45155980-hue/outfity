import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MaintenanceProvider extends ChangeNotifier {
  bool _isUnderMaintenance = false;
  bool _initialized = false;
  Map<String, dynamic> _payments = {};

  bool get isUnderMaintenance => _isUnderMaintenance;
  bool get initialized => _initialized;
  Map<String, dynamic> get payments => _payments;

  bool isPaymentEnabled(String method) {
    return _payments[method] != false;
  }

  Future<void> init() async {
    await _fetch();
    _initialized = true;
    notifyListeners();
  }

  Future<void> _fetch() async {
    try {
      final results = await Future.wait([
        ApiService().getSiteStatus(),
        ApiService().getPaymentConfig(),
      ]);
      _isUnderMaintenance = results[0]['maintenance'] == true;
      _payments = Map<String, dynamic>.from(results[1]['payments'] ?? {});
    } catch (_) {}
  }

  void updateFromSSE(Map<String, dynamic> data) {
    bool changed = false;
    if (data.containsKey('maintenance') && data['maintenance'] is bool) {
      final newVal = data['maintenance'] as bool;
      if (newVal != _isUnderMaintenance) {
        _isUnderMaintenance = newVal;
        changed = true;
      }
    }
    if (data.containsKey('payments') && data['payments'] is Map) {
      final newPayments = Map<String, dynamic>.from(data['payments'] as Map);
      if (newPayments.toString() != _payments.toString()) {
        _payments = newPayments;
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }
}
