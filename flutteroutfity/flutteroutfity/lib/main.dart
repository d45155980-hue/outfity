import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/wishlist_provider.dart';
import 'providers/product_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/banner_provider.dart';
import 'providers/category_provider.dart';
import 'providers/maintenance_provider.dart';
import 'providers/notification_provider.dart';
import 'screens/maintenance/maintenance_screen.dart';
import 'screens/splash/splash_screen.dart';
import 'services/sse_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => WishlistProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => BannerProvider()),
        ChangeNotifierProvider(create: (_) => CategoryProvider()),
        ChangeNotifierProvider(create: (_) => MaintenanceProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const OutfityApp(),
    ),
  );
}

class SSEListenerWidget extends StatefulWidget {
  final Widget child;
  const SSEListenerWidget({super.key, required this.child});

  @override
  State<SSEListenerWidget> createState() => _SSEListenerWidgetState();
}

class _SSEListenerWidgetState extends State<SSEListenerWidget> {
  final SSEService _sseService = SSEService();

  @override
  void initState() {
    super.initState();
    _sseService.stream.listen(_handleEvent);
    _sseService.connect('/sse/orders');
    context.read<NotificationProvider>().fetchNotifications();
  }

  @override
  void dispose() {
    _sseService.dispose();
    super.dispose();
  }

  void _handleEvent(SSEEvent event) {
    switch (event.event) {
      case 'site_updated':
        context.read<MaintenanceProvider>().updateFromSSE(event.data);
        break;
      case 'product_created':
      case 'product_updated':
      case 'product_deleted':
        context.read<ProductProvider>().fetchProducts();
        break;
      case 'banner_created':
      case 'banner_updated':
      case 'banner_deleted':
        context.read<BannerProvider>().fetchBanners();
        break;
      case 'category_created':
      case 'category_updated':
      case 'category_deleted':
        context.read<CategoryProvider>().fetchCategories();
        break;
      case 'new_notification':
        final ap = context.read<AuthProvider>();
        final uid = ap.user?.id;
        final isAdmin = ap.user?.role == 'admin';
        final nd = event.data;
        if (nd['forAdmin'] == true && !isAdmin) break;
        if (nd['user'] != null && nd['user'] != uid) break;
        context.read<NotificationProvider>().addNotificationFromSSE(nd);
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class OutfityApp extends StatelessWidget {
  const OutfityApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    return MaterialApp(
      title: 'OUTFITY',
      debugShowCheckedModeBanner: false,
      theme: themeProvider.theme.copyWith(
        scaffoldBackgroundColor: themeProvider.isDark
            ? const Color(0xFF0A0A0A)
            : const Color(0xFFFAFAFA),
      ),
      darkTheme: themeProvider.theme.copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
      ),
      themeMode: themeProvider.mode,
      home: SSEListenerWidget(
        child: const _AppShell(),
      ),
    );
  }
}

class _AppShell extends StatelessWidget {
  const _AppShell();

  @override
  Widget build(BuildContext context) {
    return Builder(builder: (context) {
      final maintenance = context.watch<MaintenanceProvider>();
      final auth = context.watch<AuthProvider>();

      if (maintenance.initialized &&
          maintenance.isUnderMaintenance &&
          auth.user?.role != 'admin') {
        return const MaintenanceScreen();
      }

      return const SplashScreen();
    });
  }
}
