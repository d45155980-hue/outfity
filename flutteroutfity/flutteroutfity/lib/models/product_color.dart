class ProductColor {
  final String name;
  final String hex;

  ProductColor({required this.name, required this.hex});

  factory ProductColor.fromJson(Map<String, dynamic> json) {
    return ProductColor(
      name: json['name'] ?? '',
      hex: json['hex'] ?? '#000000',
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'hex': hex,
  };
}
