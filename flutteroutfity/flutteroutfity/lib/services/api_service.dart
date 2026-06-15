import 'package:cross_file/cross_file.dart';
import '../models/review.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/banner.dart';
import '../models/coupon.dart';
import '../models/order.dart';
import '../models/user.dart';
import 'api_client.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  ApiService._();

  final _client = ApiClient();

  // ─── Products ──────────────────────────────────────────────────────────

  Future<List<Product>> getProducts({String? keyword, String? category, int limit = 50}) async {
    final params = <String, String>{
      if (keyword != null) 'search': keyword,
      if (category != null) 'category': category,
      'limit': limit.toString(),
    };
    final data = await _client.get('/products', params: params);
    return (data['products'] as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<List<Product>> getProductsWithParams(Map<String, String> params) async {
    final data = await _client.get('/products', params: params);
    return (data['products'] as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<Product> getProduct(String id) async {
    final data = await _client.get('/products/$id');
    return Product.fromJson(data['product']);
  }

  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> body) async {
    return await _client.post('/products', body: body);
  }

  Future<Map<String, dynamic>> updateProduct(String id, Map<String, dynamic> body) async {
    return await _client.put('/products/$id', body: body);
  }

  Future<Map<String, dynamic>> createProductWithImages(Map<String, String> fields, List<XFile> files) async {
    return await _client.uploadPost('/products', fields: fields, files: files);
  }

  Future<Map<String, dynamic>> updateProductWithImages(String id, Map<String, String> fields, List<XFile> files) async {
    return await _client.uploadPut('/products/$id', fields: fields, files: files);
  }

  Future<void> deleteProduct(String id) async {
    await _client.delete('/products/$id');
  }

  // ─── Categories ────────────────────────────────────────────────────────

  Future<List<Category>> getCategories() async {
    final data = await _client.get('/categories');
    return (data['categories'] as List).map((e) => Category.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> createCategory(Map<String, dynamic> body) async {
    return await _client.post('/categories', body: body);
  }

  Future<Map<String, dynamic>> updateCategory(String id, Map<String, dynamic> body) async {
    return await _client.put('/categories/$id', body: body);
  }

  Future<void> deleteCategory(String id) async {
    await _client.delete('/categories/$id');
  }

  // ─── Banners ───────────────────────────────────────────────────────────

  Future<List<Banner>> getBanners() async {
    final data = await _client.get('/banners');
    return (data['banners'] as List).map((e) => Banner.fromJson(e)).toList();
  }

  Future<List<Banner>> getAllBanners() async {
    final data = await _client.get('/banners/admin/all');
    return (data['banners'] as List).map((e) => Banner.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> createBanner(Map<String, dynamic> body) async {
    return await _client.post('/banners/admin/create', body: body);
  }

  Future<Map<String, dynamic>> updateBanner(String id, Map<String, dynamic> body) async {
    return await _client.put('/banners/admin/$id', body: body);
  }

  Future<void> deleteBanner(String id) async {
    await _client.delete('/banners/admin/$id');
  }

  // ─── Coupons ───────────────────────────────────────────────────────────

  Future<List<Coupon>> getActiveCoupons() async {
    final data = await _client.get('/coupons/active');
    return (data['coupons'] as List).map((e) => Coupon.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> validateCoupon(String code, {double orderAmount = 0}) async {
    return await _client.post('/coupons/validate', body: {
      'code': code,
      'orderAmount': orderAmount,
    });
  }

  Future<List<Coupon>> getAllCoupons() async {
    final data = await _client.get('/coupons/admin/all');
    return (data['coupons'] as List).map((e) => Coupon.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> createCoupon(Map<String, dynamic> body) async {
    return await _client.post('/coupons/admin/create', body: body);
  }

  Future<Map<String, dynamic>> updateCoupon(String id, Map<String, dynamic> body) async {
    return await _client.put('/coupons/admin/$id', body: body);
  }

  Future<void> deleteCoupon(String id) async {
    await _client.delete('/coupons/admin/$id');
  }

  // ─── Auth ──────────────────────────────────────────────────────────────

  Future<User> login(String email, String password) async {
    final data = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    return User.fromJson(data['user']);
  }

  Future<User> register(String name, String email, String password, String phone) async {
    final data = await _client.post('/auth/register', body: {
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
    });
    return User.fromJson(data['user']);
  }

  Future<User> getMe() async {
    final data = await _client.get('/auth/me');
    return User.fromJson(data['user']);
  }

  Future<void> logout() async {
    await _client.get('/auth/logout');
  }

  Future<User> updateProfile(Map<String, dynamic> body) async {
    final data = await _client.put('/auth/update', body: body);
    return User.fromJson(data['user']);
  }

  Future<void> updatePassword(String currentPassword, String newPassword) async {
    await _client.put('/auth/password', body: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
      'confirmPassword': newPassword,
    });
  }

  Future<void> forgotPassword(String email) async {
    await _client.post('/auth/forgot-password', body: {'email': email});
  }

  Future<void> resetPassword(String token, String password) async {
    await _client.put('/auth/reset-password/$token', body: {
      'password': password,
      'confirmPassword': password,
    });
  }

  Future<Map<String, dynamic>> refreshToken() async {
    return await _client.post('/auth/refresh');
  }

  // ─── Google Auth ─────────────────────────────────────────────────────

  Future<Map<String, dynamic>> googleAuth({String? idToken, String? accessToken, String? email, String? name, String? googleId, String? avatar}) async {
    return await _client.post('/auth/google', body: {
      if (idToken != null) 'idToken': idToken,
      if (accessToken != null) 'accessToken': accessToken,
      if (email != null) 'email': email,
      if (name != null) 'name': name,
      if (googleId != null) 'googleId': googleId,
      if (avatar != null) 'avatar': avatar,
    });
  }

  // ─── Reviews ───────────────────────────────────────────────────────────

  Future<List<Review>> getProductReviews(String productId) async {
    final data = await _client.get('/products/$productId/reviews');
    return (data['reviews'] as List).map((e) => Review.fromJson(e)).toList();
  }

  Future<Map<String, dynamic>> createProductReview(String productId, Map<String, dynamic> body) async {
    return await _client.put('/products/$productId/review', body: body);
  }

  Future<List<Review>> getAllReviews() async {
    final data = await _client.get('/reviews/admin/all');
    return (data['reviews'] as List).map((e) => Review.fromJson(e)).toList();
  }

  Future<void> approveReview(String id) async {
    await _client.put('/reviews/admin/$id/approve');
  }

  Future<void> deleteReview(String id) async {
    await _client.delete('/reviews/admin/$id');
  }

  // ─── Payments ──────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> createRazorpayOrder(double amount, String currency) async {
    return await _client.post('/payments/razorpay/order', body: {
      'amount': (amount * 100).round(),
      'currency': currency,
    });
  }

  Future<Map<String, dynamic>> verifyRazorpayPayment(Map<String, dynamic> body) async {
    return await _client.post('/payments/razorpay/verify', body: body);
  }

  // ─── Site / Maintenance ────────────────────────────────────────────────

  Future<Map<String, dynamic>> getSiteStatus() async {
    return await _client.get('/site/status');
  }

  Future<Map<String, dynamic>> toggleMaintenance() async {
    return await _client.put('/site/maintenance');
  }

  Future<Map<String, dynamic>> getPaymentConfig() async {
    return await _client.get('/site/payment');
  }

  Future<Map<String, dynamic>> updatePaymentConfig(Map<String, dynamic> payments) async {
    return await _client.put('/site/payment', body: {'payments': payments});
  }

  // ─── Orders ────────────────────────────────────────────────────────────

  Future<List<Order>> getMyOrders() async {
    final data = await _client.get('/orders/me');
    return (data['orders'] as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> getOrderDetails(String id) async {
    final data = await _client.get('/orders/$id');
    return Order.fromJson(data['order']);
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> body) async {
    return await _client.post('/orders', body: body);
  }

  Future<void> cancelOrder(String id) async {
    await _client.put('/orders/$id/cancel');
  }

  Future<List<Order>> getAllOrders() async {
    final data = await _client.get('/orders/admin/all');
    return (data['orders'] as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<void> updateOrderStatus(String id, String status) async {
    await _client.put('/orders/admin/$id/status', body: {'status': status});
  }

  Future<void> deleteOrder(String id) async {
    await _client.delete('/orders/admin/$id');
  }

  // ─── Users / Admin ─────────────────────────────────────────────────────

  Future<List<User>> getAllUsers() async {
    final data = await _client.get('/users/admin/all');
    return (data['users'] as List).map((e) => User.fromJson(e)).toList();
  }

  Future<User> getUserDetail(String id) async {
    final data = await _client.get('/users/admin/$id');
    return User.fromJson(data['user']);
  }

  Future<void> toggleBlockUser(String id) async {
    await _client.put('/users/admin/$id/block');
  }

  Future<void> deleteUser(String id) async {
    await _client.delete('/users/admin/$id');
  }

  // ─── Notifications ─────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getNotifications() async {
    return await _client.get('/notifications');
  }

  Future<void> markNotificationRead(String id) async {
    await _client.put('/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await _client.put('/notifications/read-all');
  }

  Future<void> broadcastNotification({
    required String title,
    required String message,
    String type = 'admin_broadcast',
    List<String>? userIds,
    String sendMethod = 'website',
  }) async {
    await _client.post('/notifications/admin/broadcast', body: {
      'title': title,
      'message': message,
      'type': type,
      'sendMethod': sendMethod,
      if (userIds != null && userIds.isNotEmpty) 'userList': userIds,
    });
  }
}
