class Coupon {
  final String id;
  final String code;
  final String type;
  final double value;
  final double minOrder;
  final bool isActive;
  final String? expiresAt;

  Coupon({
    required this.id,
    required this.code,
    required this.type,
    required this.value,
    this.minOrder = 0,
    this.isActive = true,
    this.expiresAt,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['_id'] ?? '',
      code: json['code'] ?? '',
      type: json['type'] ?? 'percentage',
      value: (json['value'] ?? 0).toDouble(),
      minOrder: (json['minOrder'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
      expiresAt: json['expiresAt'],
    );
  }
}
