import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/api_config.dart';
import '../../theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/maintenance_provider.dart';
import '../../services/api_client.dart';
import '../../services/api_service.dart';
import '../../services/razorpay_service.dart';
import '../../utils/helpers.dart';
import '../auth/login_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _paymentMethod = 'cod';
  bool _placing = false;
  Map<String, dynamic>? _pendingPayload;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _stateCtrl.dispose();
    _pincodeCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!context.read<AuthProvider>().isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please login to place an order'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
      return;
    }

    if (_nameCtrl.text.trim().isEmpty ||
        _emailCtrl.text.trim().isEmpty ||
        _addressCtrl.text.trim().isEmpty ||
        _cityCtrl.text.trim().isEmpty ||
        _stateCtrl.text.trim().isEmpty ||
        _pincodeCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please fill in all address fields'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    setState(() => _placing = true);
    final cart = context.read<CartProvider>();

    if (_paymentMethod == 'razorpay') {
      await _placeRazorpayOrder(cart);
    } else {
      await _placeCodOrder(cart);
    }

    if (mounted) setState(() => _placing = false);
  }

  Future<void> _placeCodOrder(CartProvider cart) async {
    try {
      final payload = _buildPayload(cart);
      await ApiService().createOrder(payload);
      if (!mounted) return;
      cart.clearCart();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Order placed successfully!'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppColors.error,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Failed to place order. Please try again.'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _placeRazorpayOrder(CartProvider cart) async {
    try {
      final orderData = await ApiService().createRazorpayOrder(cart.total, 'INR');
      if (!mounted) return;
      if (orderData['success'] != true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Failed to create payment. Please try again.'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      await RazorpayService.loadScript();
      if (!mounted) return;

      _pendingPayload = _buildPayload(cart);
      RazorpayService.openCheckout(
        key: ApiConfig.razorpayKey,
        amount: orderData['amount'],
        currency: orderData['currency'],
        name: 'OUTFITY',
        description: 'Order #${DateTime.now().millisecondsSinceEpoch}',
        orderId: orderData['id'],
        contact: _phoneCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        onSuccess: _handlePaymentSuccess,
        onError: (msg) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(msg),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                backgroundColor: AppColors.error,
              ),
            );
            setState(() => _placing = false);
          }
        },
        onDismiss: () {
          if (mounted) setState(() => _placing = false);
        },
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppColors.error,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment error: $e'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _handlePaymentSuccess(Map<String, dynamic> response) async {
    try {
      final verifyData = await ApiService().verifyRazorpayPayment({
        'razorpay_order_id': response['razorpay_order_id'],
        'razorpay_payment_id': response['razorpay_payment_id'],
        'razorpay_signature': response['razorpay_signature'],
      });

      if (verifyData['success'] == true && _pendingPayload != null) {
        await ApiService().createOrder(_pendingPayload!);
        _pendingPayload = null;
        if (!mounted) return;
        context.read<CartProvider>().clearCart();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Order placed successfully!'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Payment verification failed.'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Payment verification failed.'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: AppColors.error,
        ),
      );
    }
    if (mounted) setState(() => _placing = false);
  }

  Map<String, dynamic> _buildPayload(CartProvider cart) {
    return {
      'shippingAddress': {
        'fullName': _nameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'address': _addressCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _stateCtrl.text.trim(),
        'country': 'India',
        'zipCode': _pincodeCtrl.text.trim(),
      },
      'paymentMethod': _paymentMethod,
      'orderItems': cart.items.map((item) => {
        'product': item.productId,
        'name': item.name,
        'image': item.image,
        'price': item.price,
        'size': item.size,
        'color': item.color.hex,
        'quantity': item.quantity,
      }).toList(),
      'itemsPrice': cart.subtotal,
      'shippingPrice': cart.shipping,
      'discount': cart.discount,
      if (cart.coupon != null) 'couponCode': cart.coupon!.code,
    };
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Shipping Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            TextField(controller: _nameCtrl, decoration: const InputDecoration(hintText: 'Full Name')),
            const SizedBox(height: 12),
            TextField(controller: _emailCtrl, decoration: const InputDecoration(hintText: 'Email Address'), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 12),
            TextField(controller: _addressCtrl, decoration: const InputDecoration(hintText: 'Street Address'), maxLines: 2),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: TextField(controller: _cityCtrl, decoration: const InputDecoration(hintText: 'City'))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: _stateCtrl, decoration: const InputDecoration(hintText: 'State'))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: TextField(controller: _pincodeCtrl, decoration: const InputDecoration(hintText: 'Pincode'), keyboardType: TextInputType.number)),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: _phoneCtrl, decoration: const InputDecoration(hintText: 'Phone'), keyboardType: TextInputType.phone)),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Payment Method', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            _buildPaymentOptions(),
            const SizedBox(height: 24),
            const Text('Order Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _summaryRow('Items', '${cart.items.length}'),
                  _summaryRow('Subtotal', Helpers.formatPrice(cart.subtotal)),
                  _summaryRow('Shipping', cart.shipping == 0 ? 'Free' : Helpers.formatPrice(cart.shipping)),
                  if (cart.discount > 0) _summaryRow('Discount', '-${Helpers.formatPrice(cart.discount)}', AppColors.primary),
                  const Divider(height: 20),
                  _summaryRow('Total', Helpers.formatPrice(cart.total), AppColors.textPrimary, true),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _placing ? null : _placeOrder,
                child: _placing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                      )
                    : const Text('Place Order'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _paymentTile(String value, String label, IconData icon) {
    final selected = _paymentMethod == value;
    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.05) : AppColors.background,
          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: selected ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: selected ? AppColors.primary : AppColors.textPrimary))),
            if (selected) const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOptions() {
    final maintenance = context.watch<MaintenanceProvider>();
    final methods = [
      ('cod', 'Cash on Delivery', Icons.money_outlined),
      ('razorpay', 'UPI / Card / Net Banking', Icons.account_balance_outlined),
    ];

    final filtered = methods.where((m) => maintenance.isPaymentEnabled(m.$1)).toList();

    if (_paymentMethod.isNotEmpty && !filtered.any((m) => m.$1 == _paymentMethod)) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        setState(() => _paymentMethod = filtered.isNotEmpty ? filtered.first.$1 : '');
      });
    }

    return Column(children: filtered.map((m) => _paymentTile(m.$1, m.$2, m.$3)).toList());
  }

  Widget _summaryRow(String label, String value, [Color? color, bool bold = false]) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.8))),
          Text(value, style: TextStyle(fontSize: bold ? 16 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w500, color: color ?? AppColors.textPrimary)),
        ],
      ),
    );
  }
}
