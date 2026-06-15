import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../theme/app_colors.dart';
import '../../config/api_config.dart';
import '../../providers/cart_provider.dart';
import '../../widgets/empty_state.dart';
import '../../utils/helpers.dart';
import '../checkout/checkout_screen.dart';
import '../coupons/coupons_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    if (cart.items.isEmpty) {
      return Scaffold(
        body: SafeArea(
          child: EmptyState(
            icon: Icons.shopping_bag_outlined,
            title: 'Your cart is empty',
            description: 'Looks like you haven\'t added anything yet.',
            actionLabel: 'Start Shopping',
            onAction: () {},
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Text(
                'Shopping Cart',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: cart.items.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, index) {
                  final item = cart.items[index];
                  final imageUrl = ApiConfig.imageUrl(item.image);
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          width: 80,
                          height: 100,
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: imageUrl.isNotEmpty
                              ? CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.cover)
                              : const Center(child: Icon(Icons.image_outlined, color: AppColors.textHint)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(width: 12, height: 12, decoration: BoxDecoration(color: Color(int.parse(item.color.hex.replaceFirst('#', '0xFF'))), shape: BoxShape.circle, border: Border.all(color: AppColors.border))),
                                  const SizedBox(width: 4),
                                  Text(item.color.name, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                  const SizedBox(width: 12),
                                  Text('Size: ${item.size}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(Helpers.formatPrice(item.displayPrice), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  _qtyBtn(context, Icons.remove, () => cart.updateQuantity(item.productId, item.size, item.color.hex, item.quantity - 1)),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    child: Text('${item.quantity}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                                  ),
                                  _qtyBtn(context, Icons.add, () => cart.updateQuantity(item.productId, item.size, item.color.hex, item.quantity + 1)),
                                  const Spacer(),
                                  GestureDetector(
                                    onTap: () => cart.removeItem(item.productId, item.size, item.color.hex),
                                    child: Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(color: AppColors.error.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                      child: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Container(
              padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5))],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Subtotal', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      Text(Helpers.formatPrice(cart.subtotal), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Shipping', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      Text(cart.shipping == 0 ? 'Free' : Helpers.formatPrice(cart.shipping), style: TextStyle(fontSize: 14, color: cart.shipping == 0 ? AppColors.primary : AppColors.textSecondary)),
                    ],
                  ),
                  if (cart.discount > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(cart.coupon != null ? 'Discount (${cart.coupon!.code})' : 'Discount', style: const TextStyle(fontSize: 14, color: AppColors.primary)),
                        Text('-${Helpers.formatPrice(cart.discount)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      ],
                    ),
                  ],
                  if (cart.coupon == null) ...[
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CouponsScreen())),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.discount_outlined, size: 16, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text('Apply Coupon', style: TextStyle(fontSize: 13, color: AppColors.primary.withOpacity(0.8), fontWeight: FontWeight.w600)),
                      ]),
                    ),
                  ] else ...[
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () => cart.removeCoupon(),
                      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Icon(Icons.close, size: 16, color: AppColors.error),
                        const SizedBox(width: 4),
                        Text('Remove Coupon', style: TextStyle(fontSize: 13, color: AppColors.error.withOpacity(0.8), fontWeight: FontWeight.w600)),
                      ]),
                    ),
                  ],
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      Text(Helpers.formatPrice(cart.total), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CheckoutScreen())),
                      child: const Text('Proceed to Checkout'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _qtyBtn(BuildContext context, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 16, color: AppColors.textPrimary),
      ),
    );
  }
}
