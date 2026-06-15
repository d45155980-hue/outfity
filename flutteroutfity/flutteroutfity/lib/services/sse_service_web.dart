import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../utils/constants.dart';

class SSEEvent {
  final String event;
  final Map<String, dynamic> data;

  SSEEvent({required this.event, required this.data});
}

class SSEService {
  html.EventSource? _es;
  bool _connected = false;
  final StreamController<SSEEvent> _controller = StreamController<SSEEvent>.broadcast();
  int _reconnectAttempts = 0;

  Stream<SSEEvent> get stream => _controller.stream;
  bool get isConnected => _connected;

  Future<String?> _getToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(AppConstants.tokenKey);
    } catch (_) {
      return null;
    }
  }

  void _onMessage(html.Event evt) {
    final event = evt as html.MessageEvent;
    if (event.data == null || (event.data is String && (event.data as String).isEmpty)) return;
    try {
      final data = jsonDecode(event.data as String) as Map<String, dynamic>;
      _controller.add(SSEEvent(event: event.type, data: data));
    } catch (_) {}
  }

  Future<void> connect(String path) async {
    disconnect();
    try {
      final token = await _getToken();
      final url = token != null
          ? '${ApiConfig.baseUrl}$path?token=${Uri.encodeComponent(token)}'
          : '${ApiConfig.baseUrl}$path';
      _es = html.EventSource(url);

      _es!.onOpen.listen((_) {
        _connected = true;
        _reconnectAttempts = 0;
      });

      _es!.onError.listen((_) {
        _connected = false;
        _es?.close();
        final delay = (_reconnectAttempts + 1) * 2;
        _reconnectAttempts++;
        Future.delayed(Duration(seconds: delay.clamp(1, 30)), () => connect(path));
      });

      _es!.onMessage.listen(_onMessage);

      _es!.addEventListener('new_notification', _onMessage);
      _es!.addEventListener('user_notification', _onMessage);
      _es!.addEventListener('site_updated', _onMessage);
      _es!.addEventListener('product_created', _onMessage);
      _es!.addEventListener('product_updated', _onMessage);
      _es!.addEventListener('product_deleted', _onMessage);
      _es!.addEventListener('order_created', _onMessage);
      _es!.addEventListener('order_updated', _onMessage);
      _es!.addEventListener('review_submitted', _onMessage);
      _es!.addEventListener('review_approved', _onMessage);
      _es!.addEventListener('review_deleted', _onMessage);
      _es!.addEventListener('banner_created', _onMessage);
      _es!.addEventListener('banner_updated', _onMessage);
      _es!.addEventListener('banner_deleted', _onMessage);
      _es!.addEventListener('category_created', _onMessage);
      _es!.addEventListener('category_updated', _onMessage);
      _es!.addEventListener('category_deleted', _onMessage);
      _es!.addEventListener('coupon_created', _onMessage);
      _es!.addEventListener('coupon_updated', _onMessage);
      _es!.addEventListener('coupon_deleted', _onMessage);
      _es!.addEventListener('user_updated', _onMessage);
      _es!.addEventListener('user_deleted', _onMessage);
    } catch (_) {
      _connected = false;
      final delay = (_reconnectAttempts + 1) * 2;
      _reconnectAttempts++;
      Future.delayed(Duration(seconds: delay.clamp(1, 30)), () => connect(path));
    }
  }

  void disconnect() {
    _es?.close();
    _es = null;
    _connected = false;
  }

  void dispose() {
    disconnect();
    _controller.close();
  }
}
