class ApiConfig {
  ApiConfig._();

  static const String baseUrl = 'http://localhost:5000/api/v1';
  static const String uploadsUrl = 'http://localhost:5000';

  static const Duration timeout = Duration(seconds: 30);

  static const String razorpayKey = 'rzp_test_T0o9Ynk8lfqlEh';
  static const String googleClientId = '634646437386-1rkucmt5k25lvpdcm257dn6al01ui08t.apps.googleusercontent.com';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  static String imageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    return '$uploadsUrl$path';
  }
}
