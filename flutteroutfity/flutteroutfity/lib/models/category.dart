class Category {
  final String id;
  final String name;
  final String? description;
  final CategoryImage? image;
  final String? slug;

  Category({required this.id, required this.name, this.description, this.image, this.slug});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      image: json['image'] != null ? CategoryImage.fromJson(json['image']) : null,
      slug: json['slug'],
    );
  }
}

class CategoryImage {
  final String url;
  final String? publicId;

  CategoryImage({required this.url, this.publicId});

  factory CategoryImage.fromJson(Map<String, dynamic> json) {
    return CategoryImage(
      url: json['url'] ?? '',
      publicId: json['public_id'],
    );
  }
}
