import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/api_client.dart';
import '../services/google_auth.dart' as google_auth;

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _loading = false;
  bool _initialized = false;
  String? _error;

  User? get user => _user;
  bool get loading => _loading;
  bool get initialized => _initialized;
  bool get isAuthenticated => _user != null;
  String? get error => _error;

  Future<void> init() async {
    _loading = true;
    notifyListeners();
    try {
      await ApiClient().init();
      if (ApiClient().token != null) {
        _user = await ApiService().getMe();
      }
    } catch (_) {} // keep token — backend might recover
    _initialized = true;
    _loading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await ApiService().login(email, password);
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Login failed';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, String phone) async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _user = await ApiService().register(name, email, password, phone);
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Registration failed';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signInWithGoogle() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final userData = await google_auth.signInWithGoogle();
      if (userData == null) {
        _loading = false;
        notifyListeners();
        return false;
      }
      _user = User.fromJson(userData['user']);
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Google sign-in failed';
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService().logout();
    } catch (_) {}
    await ApiClient().setToken(null);
    _user = null;
    notifyListeners();
  }
}
