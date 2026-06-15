class Order {
  final String id;
  final String orderNumber;
  final List<OrderItem> items;
  final ShippingAddress? shippingAddress;
  final String? paymentMethod;
  final String? paymentStatus;
  final String orderStatus;
  final double itemsPrice;
  final double shippingPrice;
  final double deliveryCharge;
  final double discount;
  final double totalPrice;
  final String? couponCode;
  final String? estimatedDelivery;
  final String createdAt;

  Order({
    required this.id,
    this.orderNumber = '',
    this.items = const [],
    this.shippingAddress,
    this.paymentMethod,
    this.paymentStatus,
    this.orderStatus = 'Processing',
    this.itemsPrice = 0,
    this.shippingPrice = 0,
    this.deliveryCharge = 0,
    this.discount = 0,
    this.totalPrice = 0,
    this.couponCode,
    this.estimatedDelivery,
    this.createdAt = '',
  });

  double get subtotal => itemsPrice;
  double get shipping => shippingPrice + deliveryCharge;
  double get total => totalPrice;

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? '',
      orderNumber: json['orderNumber'] ?? json['_id']?.toString() ?? '',
      items: (json['orderItems'] as List?)?.map((e) => OrderItem.fromJson(e)).toList() ?? [],
      shippingAddress: json['shippingAddress'] != null
          ? ShippingAddress.fromJson(json['shippingAddress'])
          : null,
      paymentMethod: json['paymentMethod'],
      paymentStatus: json['paymentInfo'] is Map ? json['paymentInfo']['status'] : null,
      orderStatus: json['orderStatus'] ?? 'Processing',
      itemsPrice: (json['itemsPrice'] ?? 0).toDouble(),
      shippingPrice: (json['shippingPrice'] ?? 0).toDouble(),
      deliveryCharge: (json['deliveryCharge'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      couponCode: json['couponCode'],
      estimatedDelivery: json['estimatedDelivery'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}

class OrderItem {
  final String productId;
  final String name;
  final String image;
  final double price;
  final int quantity;
  final String? size;
  final String? color;

  OrderItem({
    required this.productId,
    required this.name,
    this.image = '',
    this.price = 0,
    this.quantity = 1,
    this.size,
    this.color,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product'] is Map ? json['product']['_id'] ?? '' : json['product'] ?? '',
      name: json['name'] ?? '',
      image: json['image'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      size: json['size'],
      color: json['color'],
    );
  }
}

class ShippingAddress {
  final String fullName;
  final String? email;
  final String phone;
  final String address;
  final String city;
  final String state;
  final String country;
  final String zipCode;

  ShippingAddress({
    this.fullName = '',
    this.email,
    this.phone = '',
    this.address = '',
    this.city = '',
    this.state = '',
    this.country = 'India',
    this.zipCode = '',
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      fullName: json['fullName'] ?? '',
      email: json['email'],
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      country: json['country'] ?? 'India',
      zipCode: json['zipCode'] ?? '',
    );
  }

  @override
  String toString() => '$address, $city, $state - $zipCode';
}
