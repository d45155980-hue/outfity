import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../config/api_config.dart';
import '../../models/product.dart';
import '../../models/cart_item.dart';
import '../../models/product_color.dart';
import '../../models/review.dart';
import '../../providers/cart_provider.dart';
import '../../services/api_service.dart';
import '../../services/api_client.dart';
import '../../utils/helpers.dart';
import '../../widgets/wishlist_button.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _currentImage = 0;
  String _selectedSize = '';
  String _selectedColorHex = '';
  int _quantity = 1;
  bool _descExpanded = false;
  List<Review> _reviews = [];
  bool _reviewsLoading = true;

  @override
  void initState() {
    super.initState();
    _selectedSize = widget.product.sizes.isNotEmpty ? widget.product.sizes.first : 'M';
    _selectedColorHex = widget.product.colors.isNotEmpty ? widget.product.colors.first.hex : '#000';
    _fetchReviews();
  }

  Future<void> _fetchReviews() async {
    try {
      final reviews = await ApiService().getProductReviews(widget.product.id);
      if (mounted) setState(() => _reviews = reviews);
    } catch (_) {}
    if (mounted) setState(() => _reviewsLoading = false);
  }

  Future<void> _showReviewDialog() async {
    final commentCtrl = TextEditingController();
    double rating = 5;
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Write a Review'),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(5, (i) {
              return IconButton(
                icon: Icon(i < rating ? Icons.star : Icons.star_outline, color: AppColors.starActive, size: 32),
                onPressed: () => setDialogState(() => rating = (i + 1).toDouble()),
              );
            })),
            const SizedBox(height: 12),
            TextField(controller: commentCtrl, maxLines: 3, decoration: const InputDecoration(hintText: 'Share your thoughts...')),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Submit')),
          ],
        ),
      ),
    );
    if (result != true) return;
    try {
      await ApiService().createProductReview(widget.product.id, {'rating': rating, 'comment': commentCtrl.text.trim()});
      await _fetchReviews();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Review submitted!'), behavior: SnackBarBehavior.floating),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
        );
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final images = p.images;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            leading: IconButton(
              icon: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.arrow_back, size: 20),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: WishlistButton(product: p),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: images.isNotEmpty
                  ? PageView.builder(
                      onPageChanged: (i) => setState(() => _currentImage = i),
                      itemCount: images.length,
                      itemBuilder: (context, index) {
                        final url = ApiConfig.imageUrl(images[index].url);
                        return CachedNetworkImage(
                          imageUrl: url,
                          width: double.infinity,
                          height: 400,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: AppColors.background),
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.background,
                            child: const Icon(Icons.image_outlined, size: 60, color: AppColors.textHint),
                          ),
                        );
                      },
                    )
                  : Container(
                      color: AppColors.background,
                      child: const Center(
                        child: Icon(Icons.image_outlined, size: 60, color: AppColors.textHint),
                      ),
                    ),
            ),
          ),
          if (images.length > 1)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    images.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: _currentImage == i ? 24 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _currentImage == i ? AppColors.primary : AppColors.border,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (p.brand != null)
                    Text(
                      p.brand!,
                      style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600, letterSpacing: 1),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    p.name,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _buildRating(p.ratings),
                      const SizedBox(width: 4),
                      Text('${p.ratings}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                      const SizedBox(width: 4),
                      Text('(${p.numOfReviews} reviews)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.7))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text(
                        Helpers.formatPrice(p.displayPrice),
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                      if (p.hasDiscount) ...[
                        const SizedBox(width: 8),
                        Text(
                          Helpers.formatPrice(p.price),
                          style: TextStyle(fontSize: 16, decoration: TextDecoration.lineThrough, color: AppColors.textSecondary.withOpacity(0.6)),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                          child: Text('-${p.discountPercent.toInt()}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.error)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (p.sizes.isNotEmpty) ...[
                    const Text('Size', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: p.sizes.map((s) {
                        final selected = _selectedSize == s;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedSize = s),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: selected ? AppColors.primary : Colors.transparent,
                              border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                s,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: selected ? AppColors.white : AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],
                  if (p.colors.isNotEmpty) ...[
                    const Text('Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 12,
                      children: p.colors.map((c) {
                        final selected = _selectedColorHex == c.hex;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedColorHex = c.hex),
                          child: Column(
                            children: [
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Color(int.parse(c.hex.replaceFirst('#', '0xFF'))),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: selected ? 3 : 1),
                                  boxShadow: selected ? [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8)] : [],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(c.name, style: TextStyle(fontSize: 10, color: selected ? AppColors.primary : AppColors.textSecondary, fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('Quantity', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const Spacer(),
                      _qtyBtn(Icons.remove, () {
                        if (_quantity > 1) setState(() => _quantity--);
                      }),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      ),
                      _qtyBtn(Icons.add, () {
                        if (_quantity < p.stock) setState(() => _quantity++);
                      }),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Divider(),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => setState(() => _descExpanded = !_descExpanded),
                    child: Row(
                      children: [
                        const Text('Description', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        const Spacer(),
                        Icon(_descExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                  AnimatedCrossFade(
                    firstChild: const SizedBox.shrink(),
                    secondChild: Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(p.description, style: TextStyle(fontSize: 14, color: AppColors.textSecondary.withOpacity(0.8), height: 1.6)),
                    ),
                    crossFadeState: _descExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                    duration: const Duration(milliseconds: 200),
                  ),
                  const Divider(),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _showReviewDialog,
                    child: Row(children: [
                      Text('Reviews (${_reviews.length})', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      const Spacer(),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                        child: const Text('Write a Review', style: TextStyle(fontSize: 12, color: AppColors.white, fontWeight: FontWeight.w600))),
                    ]),
                  ),
                  const SizedBox(height: 12),
                  if (_reviewsLoading)
                    const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(color: AppColors.primary)))
                  else if (_reviews.isEmpty)
                    Text('No reviews yet.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.7)))
                  else
                    ..._reviews.map((r) => Container(
                      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          CircleAvatar(radius: 14, child: Text(r.userName.isNotEmpty ? r.userName[0].toUpperCase() : '?', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))),
                          const SizedBox(width: 8),
                          Expanded(child: Text(r.userName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary))),
                          _buildRating(r.rating),
                        ]),
                        if (r.comment.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(r.comment, style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.8))),
                        ],
                      ]),
                    )),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(left: 20, right: 20, top: 12, bottom: MediaQuery.of(context).padding.bottom + 12),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5))],
        ),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  context.read<CartProvider>().addItem(CartItem(
                    productId: p.id,
                    name: p.name,
                    image: p.firstImage,
                    price: p.price,
                    salePrice: p.salePrice,
                    size: _selectedSize,
                    color: ProductColor(name: '', hex: _selectedColorHex),
                    quantity: _quantity,
                    stock: p.stock,
                  ));
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Added to cart!'),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                label: const Text('Add to Cart'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  backgroundColor: AppColors.black,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 18, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildRating(double rating) {
    return Row(
      children: List.generate(5, (i) {
        return Icon(
          i < rating ? Icons.star : Icons.star_outline,
          size: 16,
          color: AppColors.starActive,
        );
      }),
    );
  }
}
