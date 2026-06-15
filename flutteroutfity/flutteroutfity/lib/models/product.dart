import 'product_color.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final String? brand;
  final String? category;
  final String? categoryName;
  final String? subcategory;
  final double price;
  final double? salePrice;
  final int stock;
  final String? sku;
  final List<ProductImage> images;
  final List<String> sizes;
  final List<ProductColor> colors;
  final List<String> tags;
  final bool featured;
  final bool isNewArrival;
  final bool isTrending;
  final bool isSale;
  final double ratings;
  final int numOfReviews;
  final String createdAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    this.brand,
    this.category,
    this.categoryName,
    this.subcategory,
    required this.price,
    this.salePrice,
    this.stock = 1,
    this.sku,
    this.images = const [],
    this.sizes = const [],
    this.colors = const [],
    this.tags = const [],
    this.featured = false,
    this.isNewArrival = false,
    this.isTrending = false,
    this.isSale = false,
    this.ratings = 0,
    this.numOfReviews = 0,
    this.createdAt = '',
  });

  double get displayPrice => salePrice ?? price;
  double get discountPercent => price > 0 && salePrice != null
      ? ((price - salePrice!) / price * 100).roundToDouble()
      : 0;
  bool get hasDiscount => discountPercent > 0;
  String get firstImage => images.isNotEmpty ? images.first.url : '';

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      brand: json['brand'],
      category: json['category'] is Map ? json['category']['_id'] : json['category'],
      categoryName: json['category'] is Map ? json['category']['name'] : null,
      subcategory: json['subcategory'],
      price: (json['price'] ?? 0).toDouble(),
      salePrice: json['salePrice']?.toDouble(),
      stock: json['stock'] ?? 1,
      sku: json['sku'],
      images: (json['images'] as List?)?.map((e) => ProductImage.fromJson(e)).toList() ?? [],
      sizes: (json['sizes'] as List?)?.map((e) => e.toString()).toList() ?? [],
      colors: (json['colors'] as List?)?.map((e) => ProductColor.fromJson(e)).toList() ?? [],
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList() ?? [],
      featured: json['featured'] ?? false,
      isNewArrival: json['isNewArrival'] ?? false,
      isTrending: json['isTrending'] ?? false,
      isSale: json['isSale'] ?? false,
      ratings: (json['ratings'] ?? 0).toDouble(),
      numOfReviews: json['numOfReviews'] ?? 0,
      createdAt: json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'description': description,
    'brand': brand,
    'category': category,
    'subcategory': subcategory,
    'price': price,
    'salePrice': salePrice,
    'stock': stock,
    'sku': sku,
    'images': images.map((e) => e.toJson()).toList(),
    'sizes': sizes,
    'colors': colors.map((e) => e.toJson()).toList(),
    'tags': tags,
    'featured': featured,
    'isNewArrival': isNewArrival,
    'isTrending': isTrending,
    'isSale': isSale,
    'ratings': ratings,
    'numOfReviews': numOfReviews,
  };
}

class ProductImage {
  final String publicId;
  final String url;
  final String alt;

  ProductImage({required this.publicId, required this.url, this.alt = ''});

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      publicId: json['public_id'] ?? '',
      url: json['url'] ?? '',
      alt: json['alt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'public_id': publicId,
    'url': url,
    'alt': alt,
  };
}
