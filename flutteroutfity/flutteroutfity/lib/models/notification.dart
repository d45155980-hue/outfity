class AppNotification {
  final String id;
  final String type;
  final String title;
  final String message;
  final Map<String, dynamic> data;
  bool isRead;
  final String createdAt;
  final bool forAdmin;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.data,
    this.isRead = false,
    required this.createdAt,
    this.forAdmin = false,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? '',
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      data: Map<String, dynamic>.from(json['data'] ?? {}),
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] ?? '',
      forAdmin: json['forAdmin'] ?? false,
    );
  }
}
