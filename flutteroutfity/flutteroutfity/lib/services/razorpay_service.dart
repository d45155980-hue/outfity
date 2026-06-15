import 'dart:async';
import 'dart:convert';
import 'dart:js' as js;

class RazorpayService {
  static Future<void> loadScript() async {
    if (js.context.hasProperty('Razorpay')) return;
    final completer = Completer<void>();
    js.context.callMethod('eval', ['''
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = function() { if (window.__rzpReady) __rzpReady(); };
      s.onerror = function() { if (window.__rzpError) __rzpError('Script load failed'); };
      document.head.appendChild(s);
    ''']);
    js.context['__rzpReady'] = js.allowInterop(() => completer.complete());
    js.context['__rzpError'] = js.allowInterop((msg) => completer.completeError(msg ?? 'Failed to load Razorpay SDK'));
    if (js.context.hasProperty('Razorpay')) completer.complete();
    await completer.future.timeout(const Duration(seconds: 15));
  }

  static void openCheckout({
    required String key,
    required int amount,
    required String currency,
    required String name,
    required String description,
    required String orderId,
    required String contact,
    required String email,
    required Function(Map<String, dynamic>) onSuccess,
    required Function(String) onError,
    required void Function() onDismiss,
  }) {
    final data = {
      'key': key,
      'amount': amount,
      'currency': currency,
      'name': name,
      'description': description,
      'order_id': orderId,
      'prefill': {'contact': contact, 'email': email},
      'theme': {'color': '#1c1917'},
    };

    js.context['__rzpSuccess'] = js.allowInterop((r) {
      onSuccess({
        'razorpay_payment_id': r['razorpay_payment_id'],
        'razorpay_order_id': r['razorpay_order_id'],
        'razorpay_signature': r['razorpay_signature'],
      });
    });
    js.context['__rzpDismiss'] = js.allowInterop(() => onDismiss());
    js.context['__rzpError'] = js.allowInterop((msg) => onError(msg?.toString() ?? 'Payment failed'));

    final json = jsonEncode(data);
    js.context.callMethod('eval', ['''
      (function() {
        try {
          var opts = JSON.parse('$json');
          opts.handler = function(r) { __rzpSuccess(r); };
          opts.modal = { ondismiss: function() { __rzpDismiss(); } };
          if (typeof Razorpay === 'undefined') {
            __rzpError('Razorpay SDK not loaded');
            return;
          }
          var rzp = new Razorpay(opts);
          rzp.open();
        } catch(e) {
          __rzpError(e.message || e.toString());
        }
      })();
    ''']);
  }
}
