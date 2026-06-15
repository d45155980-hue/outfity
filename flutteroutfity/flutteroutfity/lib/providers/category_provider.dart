import 'package:flutter/material.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class CategoryProvider extends ChangeNotifier {
  List<Category> _categories = [];
  bool _loading = false;

  List<Category> get categories => _categories;
  bool get loading => _loading;

  Future<void> fetchCategories() async {
    _loading = true;
    notifyListeners();
    try {
      _categories = await ApiService().getCategories();
    } catch (_) {
      _categories = [];
    }
    _loading = false;
    notifyListeners();
  }
}