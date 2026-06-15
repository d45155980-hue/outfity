import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import '../models/coupon.dart';
import '../utils/constants.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  Coupon? _coupon;

  List<CartItem> get items => _items;
  Coupon? get coupon => _coupon;
  int get count => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subtotal => _items.fold(0, (sum, item) => sum + item.subtotal);
  double get shipping => subtotal > 5000 ? 0 : 99;

  double get discount {
    if (_coupon == null || subtotal <= 0) return 0;
    if (_coupon!.type == 'percentage') return subtotal * (_coupon!.value / 100);
    if (_coupon!.type == 'fixed') return _coupon!.value;
    return 0;
  }

  double get total => subtotal + shipping - discount;

  CartProvider() {
    _loadFromStorage();
  }

  void _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(AppConstants.cartKey);
    if (saved != null) {
      _items = (jsonDecode(saved) as List).map((e) => CartItem.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.cartKey, jsonEncode(_items.map((e) => e.toJson()).toList()));
  }

  void addItem(CartItem item) {
    final existing = _items.indexWhere(
      (e) => e.productId == item.productId && e.size == item.size && e.color.hex == item.color.hex,
    );
    if (existing >= 0) {
      _items[existing].quantity += item.quantity;
      if (_items[existing].quantity > item.stock) {
        _items[existing].quantity = item.stock;
      }
    } else {
      _items.add(item);
    }
    _saveToStorage();
    notifyListeners();
  }

  void updateQuantity(String productId, String size, String colorHex, int quantity) {
    final existing = _items.indexWhere(
      (e) => e.productId == productId && e.size == size && e.color.hex == colorHex,
    );
    if (existing >= 0) {
      _items[existing].quantity = quantity.clamp(1, _items[existing].stock);
      _saveToStorage();
      notifyListeners();
    }
  }

  void removeItem(String productId, String size, String colorHex) {
    _items.removeWhere(
      (e) => e.productId == productId && e.size == size && e.color.hex == colorHex,
    );
    _saveToStorage();
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _coupon = null;
    _saveToStorage();
    notifyListeners();
  }

  void applyCoupon(Coupon coupon) {
    _coupon = coupon;
    notifyListeners();
  }

  void removeCoupon() {
    _coupon = null;
    notifyListeners();
  }
}
