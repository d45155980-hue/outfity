import 'product_color.dart';

class CartItem {
  final String productId;
  final String name;
  final String image;
  final double price;
  final double? salePrice;
  final String size;
  final ProductColor color;
  int quantity;
  final int stock;

  CartItem({
    required this.productId,
    required this.name,
    this.image = '',
    required this.price,
    this.salePrice,
    this.size = 'M',
    required this.color,
    this.quantity = 1,
    this.stock = 1,
  });

  double get displayPrice => salePrice ?? price;
  double get subtotal => displayPrice * quantity;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      productId: json['product'] ?? '',
      name: json['name'] ?? '',
      image: json['image'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      salePrice: json['salePrice']?.toDouble(),
      size: json['size'] ?? 'M',
      color: ProductColor.fromJson(json['color'] ?? {'name': 'Default', 'hex': '#000000'}),
      quantity: json['quantity'] ?? 1,
      stock: json['stock'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'product': productId,
    'name': name,
    'image': image,
    'price': price,
    'salePrice': salePrice,
    'size': size,
    'color': color.toJson(),
    'quantity': quantity,
    'stock': stock,
  };
}
