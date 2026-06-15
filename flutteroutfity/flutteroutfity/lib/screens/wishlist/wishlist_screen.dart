import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/wishlist_provider.dart';
import '../../widgets/empty_state.dart';
import '../../widgets/product_card.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final wishlist = context.watch<WishlistProvider>();

    return Scaffold(
      body: SafeArea(
        child: wishlist.items.isEmpty
            ? EmptyState(
                icon: Icons.favorite_outline,
                title: 'Your wishlist is empty',
                description: 'Save your favorite items here.',
                actionLabel: 'Explore Products',
                onAction: () {},
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Wishlist',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                        Text(
                          '${wishlist.count} items',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.8)),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: GridView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: wishlist.items.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemBuilder: (context, index) {
                        return ProductCard(product: wishlist.items[index], index: index);
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
