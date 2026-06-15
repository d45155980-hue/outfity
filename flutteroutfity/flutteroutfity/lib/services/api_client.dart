import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cross_file/cross_file.dart';
import '../config/api_config.dart';
import '../utils/constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._();
  factory ApiClient() => _instance;
  ApiClient._();

  String? _token;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString(AppConstants.tokenKey, token);
    } else {
      await prefs.remove(AppConstants.tokenKey);
    }
  }

  String? get token => _token;

  Map<String, String> get _headers {
    final headers = Map<String, String>.from(ApiConfig.headers);
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String endpoint, {
    Map<String, String>? params,
    Map<String, dynamic>? body,
  }) async {
    var uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    if (params != null) uri = uri.replace(queryParameters: params);

    http.Response response;
    try {
      switch (method) {
        case 'GET':
          response = await http.get(uri, headers: _headers).timeout(ApiConfig.timeout);
          break;
        case 'POST':
          response = await http.post(uri, headers: _headers, body: body != null ? jsonEncode(body) : null).timeout(ApiConfig.timeout);
          break;
        case 'PUT':
          response = await http.put(uri, headers: _headers, body: body != null ? jsonEncode(body) : null).timeout(ApiConfig.timeout);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: _headers).timeout(ApiConfig.timeout);
          break;
        default:
          throw ApiException('Unsupported method');
      }
    } on Exception {
      throw ApiException('No internet connection');
    }

    return _handleResponse(response, endpoint, method, params, body);
  }

  Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? params}) =>
      _request('GET', endpoint, params: params);

  Future<Map<String, dynamic>> post(String endpoint, {Map<String, dynamic>? body}) =>
      _request('POST', endpoint, body: body);

  Future<Map<String, dynamic>> put(String endpoint, {Map<String, dynamic>? body}) =>
      _request('PUT', endpoint, body: body);

  Future<Map<String, dynamic>> delete(String endpoint) =>
      _request('DELETE', endpoint);

  Future<Map<String, dynamic>> uploadPost(String endpoint, {Map<String, String>? fields, List<XFile>? files}) =>
      _multipart('POST', endpoint, fields: fields, files: files);

  Future<Map<String, dynamic>> uploadPut(String endpoint, {Map<String, String>? fields, List<XFile>? files}) =>
      _multipart('PUT', endpoint, fields: fields, files: files);

  Future<Map<String, dynamic>> _multipart(
    String method,
    String endpoint, {
    Map<String, String>? fields,
    List<XFile>? files,
  }) async {
    var uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final request = http.MultipartRequest(method, uri);
    request.headers.addAll(_headers);
    if (fields != null) request.fields.addAll(fields);
    if (files != null) {
      for (final file in files) {
        final bytes = await file.readAsBytes();
        request.files.add(http.MultipartFile.fromBytes('images', bytes, filename: file.name));
      }
    }
    try {
      final streamed = await request.send().timeout(ApiConfig.timeout);
      final response = await http.Response.fromStream(streamed);
      return _handleResponse(response, endpoint, method, null, null);
    } on Exception {
      throw ApiException('No internet connection');
    }
  }

  Future<Map<String, dynamic>> _handleResponse(
    http.Response response,
    String endpoint,
    String method,
    Map<String, String>? params,
    Map<String, dynamic>? body,
  ) async {
    if (response.body.isEmpty) throw ApiException('Empty response');
    final data = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (data.containsKey('token')) {
        await setToken(data['token'].toString());
      }
      return data;
    }

    if (response.statusCode == 401 && endpoint != '/auth/refresh') {
      try {
        final refreshUri = Uri.parse('${ApiConfig.baseUrl}/auth/refresh');
        final refreshBody = jsonEncode({'token': _token});
        final refreshResp = await http.post(
          refreshUri,
          headers: ApiConfig.headers,
          body: refreshBody,
        ).timeout(ApiConfig.timeout);
        if (refreshResp.statusCode == 200) {
          final refreshData = jsonDecode(refreshResp.body) as Map<String, dynamic>;
          if (refreshData.containsKey('token')) {
            await setToken(refreshData['token'].toString());
            final retryResp = await _httpRetry(method, Uri.parse('${ApiConfig.baseUrl}$endpoint'), params, body);
            return jsonDecode(retryResp.body) as Map<String, dynamic>;
          }
        }
      } catch (_) {}
      await setToken(null);
      throw ApiException('Session expired');
    }

    throw ApiException(data['message'] ?? 'Something went wrong');
  }

  Future<http.Response> _httpRetry(String method, Uri uri, Map<String, String>? params, Map<String, dynamic>? body) async {
    final finalUri = params != null ? uri.replace(queryParameters: params) : uri;
    switch (method) {
      case 'GET': return await http.get(finalUri, headers: _headers);
      case 'POST': return await http.post(finalUri, headers: _headers, body: body != null ? jsonEncode(body) : null);
      case 'PUT': return await http.put(finalUri, headers: _headers, body: body != null ? jsonEncode(body) : null);
      case 'DELETE': return await http.delete(finalUri, headers: _headers);
      default: throw ApiException('Unsupported method');
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
