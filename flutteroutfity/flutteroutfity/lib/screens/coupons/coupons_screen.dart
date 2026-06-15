import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../models/coupon.dart';
import '../../services/api_service.dart';
import '../../providers/cart_provider.dart';
import '../../utils/helpers.dart';
import '../../widgets/empty_state.dart';

class CouponsScreen extends StatefulWidget {
  const CouponsScreen({super.key});

  @override
  State<CouponsScreen> createState() => _CouponsScreenState();
}

class _CouponsScreenState extends State<CouponsScreen> {
  List<Coupon> _coupons = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchCoupons();
  }

  Future<void> _fetchCoupons() async {
    setState(() => _loading = true);
    try {
      final coupons = await ApiService().getActiveCoupons();
      if (mounted) setState(() => _coupons = coupons);
    } catch (_) {
      if (mounted) setState(() => _coupons = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _copyCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Copied $code'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
    context.read<CartProvider>().applyCoupon(
      _coupons.firstWhere((c) => c.code == code),
    );
  }

  String _couponDescription(Coupon c) {
    if (c.type == 'percentage') {
      final desc = '${c.value.toInt()}% off';
      return c.minOrder > 0 ? '$desc on orders above ${Helpers.formatPrice(c.minOrder)}' : desc;
    }
    final desc = '${Helpers.formatPrice(c.value)} off';
    return c.minOrder > 0 ? '$desc on orders above ${Helpers.formatPrice(c.minOrder)}' : desc;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Coupons')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _coupons.isEmpty
              ? const EmptyState(
                  icon: Icons.discount_outlined,
                  title: 'No coupons yet',
                  description: 'Available coupons will appear here.',
                )
              : RefreshIndicator(
                  onRefresh: _fetchCoupons,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _coupons.length,
                    itemBuilder: (context, index) {
                      final coupon = _coupons[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppColors.primary.withOpacity(0.05), AppColors.white],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.discount_outlined, color: AppColors.primary),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    coupon.code,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: 1),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _couponDescription(coupon),
                                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8)),
                                  ),
                                ],
                              ),
                            ),
                            GestureDetector(
                              onTap: () => _copyCode(coupon.code),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text('Copy', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.white)),
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
}
