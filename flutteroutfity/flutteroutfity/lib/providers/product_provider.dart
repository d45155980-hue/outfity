import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductProvider extends ChangeNotifier {
  List<Product> _products = [];
  List<Product> _featured = [];
  List<Product> _newArrivals = [];
  List<Product> _trending = [];
  List<Product> _saleItems = [];
  bool _loading = false;

  List<Product> get products => _products;
  List<Product> get featured => _featured;
  List<Product> get newArrivals => _newArrivals;
  List<Product> get trending => _trending;
  List<Product> get saleItems => _saleItems;
  bool get loading => _loading;

  Future<void> fetchProducts() async {
    _loading = true;
    notifyListeners();
    try {
      _products = await ApiService().getProducts(limit: 50);
      _featured = _products.where((p) => p.featured).toList();
      _newArrivals = _products.where((p) => p.isNewArrival).toList();
      _trending = _products.where((p) => p.isTrending).toList();
      _saleItems = _products.where((p) => p.isSale).toList();
    } catch (_) {}
    _loading = false;
    notifyListeners();
  }

  Future<List<Product>> search(String query, {String? category}) async {
    if (query.isEmpty) return [];
    try {
      return await ApiService().getProducts(keyword: query, category: category);
    } catch (_) {
      return [];
    }
  }

  Future<Product?> getProduct(String id) async {
    try {
      return await ApiService().getProduct(id);
    } catch (_) {
      return null;
    }
  }
}
