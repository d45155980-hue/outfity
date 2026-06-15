import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../models/product.dart';
import '../providers/wishlist_provider.dart';

class WishlistButton extends StatelessWidget {
  final Product product;
  final double size;

  const WishlistButton({super.key, required this.product, this.size = 20});

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistProvider>();
    final isInWishlist = wishlist.isInWishlist(product.id);
    return GestureDetector(
      onTap: () => wishlist.toggle(product),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: isInWishlist ? AppColors.error.withOpacity(0.1) : AppColors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
            ),
          ],
        ),
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (child, animation) =>
                ScaleTransition(scale: animation, child: child),
            child: Icon(
              isInWishlist ? Icons.favorite : Icons.favorite_outline,
              key: ValueKey(isInWishlist),
              color: isInWishlist ? AppColors.error : AppColors.textHint,
              size: size,
            ),
          ),
        ),
      ),
    );
  }
}
