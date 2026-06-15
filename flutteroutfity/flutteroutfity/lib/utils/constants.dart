class AppConstants {
  AppConstants._();

  static const String appName = 'OUTFITY';
  static const String appTagline = 'Premium Fashion';

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration bannerAutoScroll = Duration(seconds: 4);
  static const Duration debounceDuration = Duration(milliseconds: 400);

  static const double defaultPadding = 16.0;
  static const double cardRadius = 16.0;
  static const double buttonRadius = 30.0;
  static const double productCardAspect = 0.75;

  static const List<String> onboardingTitles = [
    'Shop Premium Fashion',
    'Multiple Brands',
    'Fast Shopping',
  ];

  static const List<String> onboardingDescriptions = [
    'Discover the latest fashion trends from top designers and brands.',
    'Thousands of products from premium brands at your fingertips.',
    'Easy and secure shopping experience with quick delivery.',
  ];

  static const List<String> sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  static const String tokenKey = 'outfity_token';
  static const String cartKey = 'cart_items';
  static const String wishlistKey = 'wishlist_items';
  static const String themeKey = 'theme_mode';
  static const String onboardingKey = 'onboarding_seen';
}
