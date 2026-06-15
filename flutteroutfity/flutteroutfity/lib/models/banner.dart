class Banner {
  final String id;
  final String title;
  final String? subtitle;
  final String? description;
  final BannerImage? image;
  final String? link;
  final int position;
  final bool isActive;
  final String? category;

  Banner({
    required this.id,
    required this.title,
    this.subtitle,
    this.description,
    this.image,
    this.link,
    this.position = 0,
    this.isActive = true,
    this.category,
  });

  factory Banner.fromJson(Map<String, dynamic> json) {
    return Banner(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      description: json['description'],
      image: json['image'] != null ? BannerImage.fromJson(json['image']) : null,
      link: json['link'],
      position: json['position'] ?? 0,
      isActive: json['isActive'] ?? true,
      category: json['category'],
    );
  }
}

class BannerImage {
  final String url;
  final String? publicId;

  BannerImage({required this.url, this.publicId});

  factory BannerImage.fromJson(Map<String, dynamic> json) {
    return BannerImage(
      url: json['url'] ?? '',
      publicId: json['public_id'],
    );
  }
}
