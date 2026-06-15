import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';
import '../utils/constants.dart';

class WishlistProvider extends ChangeNotifier {
  List<Product> _items = [];

  List<Product> get items => _items;
  int get count => _items.length;

  WishlistProvider() {
    _loadFromStorage();
  }

  void _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(AppConstants.wishlistKey);
    if (saved != null) {
      _items = (jsonDecode(saved) as List).map((e) => Product.fromJson(e)).toList();
      notifyListeners();
    }
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.wishlistKey, jsonEncode(_items.map((e) => e.toJson()).toList()));
  }

  bool isInWishlist(String productId) => _items.any((e) => e.id == productId);

  void toggle(Product product) {
    if (isInWishlist(product.id)) {
      _items.removeWhere((e) => e.id == product.id);
    } else {
      _items.add(product);
    }
    _saveToStorage();
    notifyListeners();
  }

  void remove(String productId) {
    _items.removeWhere((e) => e.id == productId);
    _saveToStorage();
    notifyListeners();
  }
}
