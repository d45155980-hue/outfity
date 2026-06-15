import 'package:flutter/material.dart' hide Banner;
import '../models/banner.dart';
import '../services/api_service.dart';

class BannerProvider extends ChangeNotifier {
  List<Banner> _banners = [];
  bool _loading = false;

  List<Banner> get banners => _banners;
  bool get loading => _loading;

  Future<void> fetchBanners() async {
    _loading = true;
    notifyListeners();
    try {
      _banners = await ApiService().getBanners();
    } catch (_) {
      _banners = [];
    }
    _loading = false;
    notifyListeners();
  }
}