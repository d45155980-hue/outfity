import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../utils/constants.dart';

class SSEEvent {
  final String event;
  final Map<String, dynamic> data;

  SSEEvent({required this.event, required this.data});
}

class SSEService {
  http.Client? _client;
  StreamSubscription? _subscription;
  bool _connected = false;
  final StreamController<SSEEvent> _controller = StreamController<SSEEvent>.broadcast();

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

  Future<void> connect(String path) async {
    disconnect();
    _client = http.Client();
    try {
      final token = await _getToken();
      final uri = token != null
          ? Uri.parse('${ApiConfig.baseUrl}$path?token=${Uri.encodeComponent(token)}')
          : Uri.parse('${ApiConfig.baseUrl}$path');
      final request = http.Request('GET', uri);
      request.headers['Accept'] = 'text/event-stream';
      request.headers['Cache-Control'] = 'no-cache';

      final response = await _client!.send(request);

      if (response.statusCode != 200) {
        _connected = false;
        Future.delayed(const Duration(seconds: 3), () => connect(path));
        return;
      }

      _connected = true;

      String buffer = '';
      String currentEvent = 'message';

      _subscription = response.stream
          .transform(utf8.decoder)
          .listen((chunk) {
        buffer += chunk;
        final lines = buffer.split('\n');
        buffer = lines.removeLast();

        for (final line in lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            final dataStr = line.substring(6).trim();
            if (dataStr.isNotEmpty) {
              try {
                final data = jsonDecode(dataStr) as Map<String, dynamic>;
                _controller.add(SSEEvent(event: currentEvent, data: data));
              } catch (_) {}
            }
          } else if (line.isEmpty) {
            currentEvent = 'message';
          }
        }
      }, onError: (_) {
        _connected = false;
        Future.delayed(const Duration(seconds: 3), () => connect(path));
      }, onDone: () {
        _connected = false;
        Future.delayed(const Duration(seconds: 3), () => connect(path));
      });
    } catch (_) {
      _connected = false;
      Future.delayed(const Duration(seconds: 3), () => connect(path));
    }
  }

  void disconnect() {
    _subscription?.cancel();
    _subscription = null;
    _client?.close();
    _client = null;
    _connected = false;
  }

  void dispose() {
    disconnect();
    _controller.close();
  }
}
