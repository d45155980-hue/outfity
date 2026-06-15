class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String? role;
  final bool isBlocked;
  final String createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    this.role,
    this.isBlocked = false,
    this.createdAt = '',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    String? avatarUrl;
    if (json['avatar'] is Map) {
      avatarUrl = json['avatar']['url'];
    } else if (json['avatar'] is String) {
      avatarUrl = json['avatar'];
    }
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatar: avatarUrl,
      role: json['role'],
      isBlocked: json['isBlocked'] ?? false,
      createdAt: json['createdAt'] ?? '',
    );
  }
}
