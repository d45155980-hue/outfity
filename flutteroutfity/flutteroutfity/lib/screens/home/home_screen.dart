import 'package:flutter/material.dart' hide Banner;
import 'package:provider/provider.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/app_colors.dart';
import '../../config/api_config.dart';
import '../../providers/product_provider.dart';
import '../../providers/banner_provider.dart';
import '../../widgets/product_card.dart';
import '../../models/category.dart';
import '../../models/product.dart';
import '../../models/banner.dart';
import '../../models/coupon.dart';
import '../../services/api_service.dart';
import '../search/search_screen.dart';
import '../wishlist/wishlist_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Category> _categories = [];
  List<Coupon> _coupons = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    await Future.wait([
      context.read<ProductProvider>().fetchProducts(),
      context.read<BannerProvider>().fetchBanners(),
      _fetchCategories(),
      _fetchCoupons(),
    ]);
  }

  Future<void> _fetchCategories() async {
    try {
      final cats = await ApiService().getCategories();
      if (mounted) setState(() => _categories = cats);
    } catch (_) {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        try {
          final cats = await ApiService().getCategories();
          if (mounted) setState(() => _categories = cats);
        } catch (_) {}
      }
    }
  }

  Future<void> _fetchCoupons() async {
    try {
      final coupons = await ApiService().getActiveCoupons();
      if (mounted) setState(() => _coupons = coupons);
    } catch (_) {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        try {
          final coupons = await ApiService().getActiveCoupons();
          if (mounted) setState(() => _coupons = coupons);
        } catch (_) {}
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final bannerProvider = context.watch<BannerProvider>();
    final featured = productProvider.featured;
    final newArrivals = productProvider.newArrivals;
    final trending = productProvider.trending;
    final banners = bannerProvider.banners;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(context),
                    if (banners.isNotEmpty) _buildBannerSlider(banners),
                    if (_categories.isNotEmpty) _buildCategories(),
                    if (_coupons.isNotEmpty) _buildCoupons(),
                    if (productProvider.loading) ...[
                      const SizedBox(height: 16),
                      const _HomeShimmer(),
                    ] else ...[
                      if (featured.isNotEmpty)
                        _buildSection('Best Sellers', featured.take(6).toList()),
                      if (trending.isNotEmpty)
                        _buildSection('Trending Now', trending.take(6).toList()),
                      if (newArrivals.isNotEmpty)
                        _buildHorizontalSection('New Arrivals', newArrivals),
                      if (_allProducts.isNotEmpty)
                        _buildSection('All Products', _allProducts.take(6).toList()),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Product> get _allProducts {
    final productProvider = context.watch<ProductProvider>();
    return productProvider.products;
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'OUTFITY',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: 2,
            ),
          ),
          Row(
            children: [
              _iconBtn(Icons.search_outlined, () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SearchScreen()),
              )),
              const SizedBox(width: 8),
              _iconBtn(Icons.favorite_outline, () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const WishlistScreen()),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _iconBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, size: 22, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildBannerSlider(List<Banner> banners) {
    final slides = banners.where((b) => b.image != null && b.image!.url.isNotEmpty).toList();
    if (slides.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: SizedBox(
        height: 200,
        child: CarouselSlider(
          items: slides.map((b) {
            return ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: CachedNetworkImage(
                imageUrl: ApiConfig.imageUrl(b.image!.url),
                fit: BoxFit.cover,
                width: double.infinity,
                placeholder: (_, __) => Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                errorWidget: (_, __, ___) => Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(child: Icon(Icons.image, color: AppColors.white, size: 48)),
                ),
              ),
            );
          }).toList(),
          options: CarouselOptions(
            height: 200,
            autoPlay: true,
            autoPlayInterval: const Duration(seconds: 4),
            enlargeCenterPage: true,
            enlargeFactor: 0.05,
            viewportFraction: 1,
          ),
        ),
      ),
    );
  }

  Widget _buildCategories() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: SizedBox(
        height: 80,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          scrollDirection: Axis.horizontal,
          itemCount: _categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 16),
          itemBuilder: (context, index) {
            final cat = _categories[index];
            final icon = _categoryIcon(cat.name);
            return GestureDetector(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SearchScreen(initialCategory: cat.name),
                  ),
                );
              },
              child: Column(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(icon, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 60,
                    child: Text(
                      cat.name,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildCoupons() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: SizedBox(
        height: 120,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          scrollDirection: Axis.horizontal,
          itemCount: _coupons.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (_, i) {
            final c = _coupons[i];
            final colors = [
              [const Color(0xFF1a1a2e), const Color(0xFF16213e)],
              [const Color(0xFF2d3436), const Color(0xFF636e72)],
              [const Color(0xFF6c5ce7), const Color(0xFFa29bfe)],
              [const Color(0xFF00b894), const Color(0xFF55efc4)],
            ];
            final gradient = colors[i % colors.length];
            return Container(
              width: 200,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c.code, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 1.5)),
                  const Spacer(),
                  Text(
                    c.type == 'percentage' ? '${c.value.toStringAsFixed(0)}% OFF' : '₹${c.value.toStringAsFixed(0)} OFF',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  if (c.minOrder > 0) Text('Min. order ₹${c.minOrder.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  IconData _categoryIcon(String name) {
    final n = name.toLowerCase();
    if (n.contains('men') || n.contains('man')) return Icons.man;
    if (n.contains('women') || n.contains('woman')) return Icons.woman;
    if (n.contains('kid') || n.contains('child')) return Icons.child_care;
    if (n.contains('shoe') || n.contains('foot')) return Icons.shopping_bag;
    if (n.contains('bag') || n.contains('accessor')) return Icons.backpack;
    if (n.contains('watch') || n.contains('jewel')) return Icons.watch;
    if (n.contains('dress') || n.contains('cloth')) return Icons.checkroom;
    return Icons.category_outlined;
  }

  void _navigateToSearch(BuildContext context, {String? category}) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SearchScreen(initialCategory: category),
      ),
    );
  }

  Widget _buildSection(String title, List<Product> products) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () => _navigateToSearch(context),
                  child: Text(
                    'See All',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary.withOpacity(0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 260,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final product = products[index];
                return SizedBox(
                  width: 170,
                  child: ProductCard(product: product, index: index),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalSection(String title, List<Product> products) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () => _navigateToSearch(context),
                  child: Text(
                    'See All',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary.withOpacity(0.8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 220,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final product = products[index];
                return SizedBox(
                  width: 150,
                  child: ProductCard(product: product, index: index),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeShimmer extends StatelessWidget {
  const _HomeShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(width: 120, height: 18, decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(4))),
                Container(width: 40, height: 14, decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(4))),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: 4,
              itemBuilder: (_, __) => Container(
                width: 150,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
