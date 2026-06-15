class Review {
  final String id;
  final String productId;
  final String userId;
  final String userName;
  final double rating;
  final String comment;
  final bool approved;
  final String createdAt;

  Review({
    required this.id,
    this.productId = '',
    this.userId = '',
    this.userName = '',
    this.rating = 0,
    this.comment = '',
    this.approved = false,
    this.createdAt = '',
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    String name = '';
    if (json['user'] is Map) {
      name = json['user']['name'] ?? '';
    } else if (json['userName'] != null) {
      name = json['userName'];
    }
    return Review(
      id: json['_id'] ?? '',
      productId: json['product'] is Map ? json['product']['_id'] ?? '' : json['product'] ?? '',
      userId: json['user'] is Map ? json['user']['_id'] ?? '' : json['user'] ?? '',
      userName: name,
      rating: (json['rating'] ?? 0).toDouble(),
      comment: json['comment'] ?? '',
      approved: json['isApproved'] ?? false,
      createdAt: json['createdAt'] ?? '',
    );
  }
}
