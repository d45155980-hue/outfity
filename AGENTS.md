## Goal
Complete a full-stack fashion e-commerce platform (OUTFITY) with Next.js 16, Express 5, MongoDB, Redux, and a companion Flutter mobile app.

## Constraints & Preferences
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion
- Express 5 + Mongoose + JWT (httpOnly cookie + localStorage fallback) + Stripe + Razorpay
- Black/white/beige premium design, responsive
- Redux Toolkit (auth, cart, wishlist, product, order slices) with localStorage persistence
- MongoDB: `mongodb+srv://dhruvjain0807:satbhaiya@cluster0.b59vhwh.mongodb.net/outfity`
- Images stored on **filesystem** (`backend/uploads/`) — served via `express.static` at `/uploads`
- Flutter app: Provider state management, `ApiClient`/`ApiService` with JWT, light/dark theme

## Progress
### Done
- **(New) SSE per-user routing**: `SSEManager` rewritten with `addClient(res, userId)` + `sendToUser(userId, event, data)` — user-specific notifications go only to the right user's SSE connection instead of broadcasting to all clients
- **(New) SSE auth via URL token**: `GET /sse/orders` accepts `?token=...` or `Authorization: Bearer` header, extracts `userId` from JWT, passes to `addClient`. Website + Flutter EventSource/SSE connections now include the token in the URL
- **(New) Frontend notification filtering removed**: `data.user` client-side filtering removed from `ClientLayout.tsx`, `main.dart`, and `admin_shell.dart` — now handled server-side via `sendToUser()`
- **Auth session persists on refresh**: JWT saved to `localStorage` on login, attached as `Authorization: Bearer` on every request via interceptor; `ClientLayout` dispatches `loadUser()` on mount to restore user from cookie/token
- **Auth/refresh endpoint**: `POST /auth/refresh` on backend verifies existing JWT and issues new one; 401 interceptor in `api.ts` retries with refresh before redirecting to login
- **Backend route fixes**: Fixed mismatches (`PUT /auth/update` → `PUT /update`, `PUT /auth/password` → `PUT /password`, `POST /auth/logout` added)
- **Auth guard on checkout**: Checkout page checks `isInitialized && isAuthenticated` — redirects to `/login?redirect=/checkout` if not authenticated; cart page "Proceed to Checkout" Link conditionally routes to `/login?redirect=%2Fcheckout` when not authenticated
- **Auth init race condition fixed**: Added `isInitialized` flag to `authSlice` — set `true` when `loadUser`/`login`/`register` settles; components wait for init before deciding to redirect
- **Checkout page**: Reads from Redux `cartSlice` (not sampleData); dispatches `createOrder()` with address/payment/pricing payload; calls `saveShippingInfo()` + `clearCart()` on success; navigates to `/order-success?id=#{order._id}`; wrapped in `<Suspense>` for `useSearchParams`; order summary images handle gradient/URL images correctly
- **Cart page**: Reads from `state.cart.cartItems` (not sampleData); dispatches `removeFromCart()` / `updateQuantity()` with `{product, size, color}` payloads
- **Order-success page**: Reads real `order` from `state.orders.order` (set by `createOrder.fulfilled`); shows real `orderNumber` / `estimatedDelivery`; links to `/dashboard/orders/#{orderId}`
- **Wishlist pages** (public + dashboard): Read from `state.wishlist.wishlistItems` (not sampleData); dispatch `removeFromWishlist(productId)`; handle empty images with gradient fallback divs
- **Dashboard home**: Fetches `GET /orders/me`; reads `user` from `state.auth.user`; calculates real stats (order count, wishlist count)
- **Dashboard orders list**: Dispatches `getMyOrders()` thunk; shows real order data with expandable rows
- **Dashboard order detail**: Dispatches `getOrderDetails(id)`; shows real items, shipping address, payment method, status tracker
- **Dashboard profile**: Pre-fills from `state.auth.user`; dispatches `updateProfile()` for name/email/phone; calls `PUT /auth/password` directly for password change
- **Admin dashboard**: Fetches `GET /orders/admin/all`, `GET /products?limit=10000`, `GET /users/admin/all` — shows real stats/sales/recent orders
- **Admin orders**: Fetches `GET /orders/admin/all`; status update via `PUT /orders/admin/:id/status`
- **Admin categories**: Full CRUD via `GET/POST/PUT/DELETE /categories`; colored placeholder based on name hash
- **Admin coupons**: Full CRUD via `GET/POST/PUT/DELETE /coupons/admin/*`; ISO date input
- **Admin banners**: Full CRUD with file upload via `GET/POST/PUT/DELETE /banners/admin/*`; displays actual banner images
- **Admin reviews**: Fetches `GET /reviews/admin/all`; approve/delete via API
- **Admin customers**: Fetches `GET /users/admin/all`; block/unblock via API
- **Image storage migrated**: Cloudinary removed; images stored on **filesystem** (`backend/uploads/`) via multer `diskStorage` with random hex filenames; served via `express.static('/uploads')`; controller stores full URL (`http://localhost:5000/uploads/#{filename}`)
- **Image upload limits**: File size limit 10MB; allowed types: jpeg/jpg/png/webp; JSON/URL body limit 10MB
- **Image cleanup**: Old files deleted from disk on product update/delete (controllers parse filename from stored URL)
- **Image display robustness**: `ImageGallery` and `ProductCard` filter out empty/invalid image URLs; gradient fallback placeholders show when no valid images exist
- **Image data sanitized at insertion**: Cart/wishlist items only store valid image URLs (http/data:/absolute-path); gradient CSS classes never stored as image values on cart/wishlist — components handle empty images with gradient fallbacks
- **Hooks order violation fixed**: All `useState` calls moved before conditional early return in `CheckoutForm`
- **Search improved**: Backend now searches across `name`, `description`, `brand`, `subcategory`, `sku`, `tags`, `sizes`, and `colors.name` via `$or` + `$regex` (with regex escaping)
- **Search live-typing**: Header search bar auto-navigates after 400ms debounce (at 2+ chars); Enter still works for instant search; search page also debounces input updates to URL
- **Search category chips**: Results extract unique category names; clickable chips filter results by category; clear button to remove filter
- **Coupon visibility**: New `GET /coupons/active` public endpoint returns valid, non-expired coupons with remaining uses; homepage shows animated coupon highlights section (gradient cards, sparkle icons, hover scale, progress bars)
- **Banner backend migrated**: Banner controller switched from Cloudinary to filesystem storage (consistent with product controller); stores full URL with host
- **HeroBanner enhanced**: Fetches from `GET /banners` API with fallback to hardcoded slides; enhanced animations (amber accent, text drop shadows, progress dots with glow, slide counter, hover scale on buttons)
- **Homepage banner grid**: Secondary banner grid (2-column) from API with `whileInView` animations and hover overlays
- **Seed cleanup**: Seeder no longer injects placeholder gradient images as product images; frontend shows natural gradient fallbacks
- **Flutter app fully built and connected**: 55 Dart files, 42K lines — complete OUTFITY Flutter with Provider state management, theme system, all screens, all API endpoints connected to real backend at `http://localhost:5000/api/v1`
- **Flutter compilation fixed**: `withValues` → `withOpacity` (SDK compat), custom `AnimatedBuilder` removed (uses Flutter built-in), missing imports added (`Shimmer`, `ApiException`, `ProductColor`)
- **Flutter CORS fixed**: `server.js` updated to allow any `localhost:*` origin (not just port 3000)
- **Flutter endpoint mismatch fixed**: `POST /orders/new` → `POST /orders`
- **Flutter auth flow**: SplashScreen calls `AuthProvider.init()`, routes based on session; `logout()` uses `GET /auth/logout` (matching backend)
- **Flutter models aligned with backend**: `Order` model uses correct field names (`orderItems`, `itemsPrice`, `shippingPrice`, `deliveryCharge`, `totalPrice`); `shippingAddress` is proper object with `ShippingAddress` class; `Review` reads `isApproved`; `User.avatar` handles object/string
- **Flutter checkout payload fixed**: Sends `shippingAddress` object (`fullName`, `phone`, `address`, `city`, `state`, `country`, `zipCode`), `orderItems`, `itemsPrice`, `shippingPrice`, `discount` — matches `createOrder` controller exactly
- **Flutter order detail fixed**: Uses `ShippingAddress` widget, correct cancel condition (only `Processing` status)
- **Flutter API audit completed**: All 40 backend routes documented and matched; added missing `googleAuth()` method; fixed `logout()` method to GET; fixed `updatePassword()`/`resetPassword()` to include `confirmPassword`; fixed `getProducts()` param `keyword` → `search`
- **Flutter Banner class conflict resolved**: `hide Banner` on Material import in `admin_banners_screen.dart`
- **Flutter `const` interpolation fixed**: Removed `const` from dynamic string in `product_detail_screen.dart`
- **Flutter `my_orders_screen.dart` widget tree fixed**: Fixed unbalanced parenthesis after removing duplicate `);`
- **Flutter `CardThemeData` → `CardTheme`**: Fixed SDK compatibility in `app_theme.dart`
- **Flutter 0 errors / 0 warnings**: `flutter analyze` clean — 19 infos (style only)
- **Flutter admin products CRUD**: New `admin_products_screen.dart` + `admin_product_form_screen.dart` — full form matching website layout (2-column grid, size toggle buttons, color chips with hex picker, tag toggles, image file picker, image previews)
- **Flutter multipart upload**: `ApiClient` → `uploadPost`/`uploadPut`; `ApiService` → `createProductWithImages`/`updateProductWithImages` — sends `images[]` files via `FormData` matching backend `upload.array('images', 10)`
- **Backend product controller**: `createProduct`/`updateProduct` now accept image URLs from JSON body (not just file uploads)
- **Flutter home screen real API**: Banners from `GET /banners`, categories from `GET /categories`, dynamic category icons, tap-to-filter
- **Flutter search filters**: Category chips (API), sort (newest/price/popular/rating), price slider, initialCategory param
- **Flutter admin shell Products tab**: Added between Orders and Categories
- **Flutter unused imports cleaned**: 14+ lines removed across 8 files
- **Flutter `notification_permission_screen` removed**: No backend support

### In Progress
- **(none)**

### Blocked
- **Payment integration**: Stripe/Razorpay frontend code is stub; no `paymentIntents` or checkout sessions created — backend `paymentController.js` routes exist but untested
- **Addresses backend**: Dashboard addresses page does local CRUD only — no `Address` model, controller, or routes exist on backend
- **Seeded products lack images**: Seeder creates products without the `images` field — frontend shows gradient placeholders; admin needs to upload images manually or a migration script needs to run
- **Flutter admin banner image upload**: `createBanner`/`updateBanner` still need multipart — not implemented in Flutter
- **Flutter Google sign-in**: `googleAuth()` method exists but no UI integration for Google/Apple sign-in buttons
- **Mongoose 9 + kareem 3 `pre('save')` breaking change**: `next` callback removed from `pre` middleware — `Order.js` `pre('save')` no longer takes/uses `next` param
- **Order Controller validation**: Added `mongoose.Types.ObjectId.isValid()` check before `Product.findById()` in `createOrder` to prevent CastError on invalid product IDs
- **Frontend checkout color fix**: `checkout/page.tsx` sends `color: item.color.hex` instead of object
- **Order slice error surfacing**: `orderSlice.ts` reads `error.response?.data?.message` for clearer error messages
- **Flutter API client token persistence**: Non-auth errors (400/500) no longer clear the stored JWT token — only 401 after failed refresh clears it
- **Flutter auth init resilience**: `AuthProvider.init()` no longer clears token on transient backend failures — keeps token in storage for next attempt
- **Flutter checkout auth guard**: `CheckoutScreen._placeOrder()` checks `AuthProvider.isAuthenticated` before placing order; redirects to `LoginScreen` if not
- **Flutter home screen retry**: Categories, coupons, and products retry with 2s delay on initial fetch failure
- **Flutter home screen coupons**: New `_buildCoupons()` section — gradient cards showing active coupon codes / discounts
- **Flutter search error state**: Added `_searchError` flag — displays cloud_off `EmptyState` on API failure instead of misleading "no results"
- **Flutter checkout email field**: Added missing `email` field to `shippingAddress` payload (Order model requires it)
- **APIFeatures double `$` prefix**: `minPrice`/`maxPrice` and `rating` in `productController.js` no longer set `$gte`/`$lte` directly — they use `gte`/`lte` without `$` so `APIFeatures.filter()` adds it once (was producing `$$gte` which Mongoose 9 rejects)
- **Search param mapping**: Added `search` → `keyword` mapping in `productController.js` — Flutter sends `search` param but `APIFeatures.search()` reads `keyword`

## Key Decisions
- **Image storage**: Filesystem (`backend/uploads/`) instead of Cloudinary or base64-in-MongoDB — avoids 16MB doc limit, keeps API responses lightweight, simple to serve statically
- **Auth token**: Dual approach — httpOnly cookie (secure) + localStorage (cross-origin Bearer header fallback) — ensures persistence across port-3000-to-port-5000 requests
- **Auth initialization**: `isInitialized` flag in Redux state prevents premature redirect-to-login while `loadUser` is pending on page load
- **All sampleData removed**: Every page now fetches from real APIs
- **Gradient CSS never stored as image value**: Cart/wishlist/order items only store valid image URLs; empty/gradient values are never passed downstream — UI components manage their own gradient fallbacks
- **Search uses debounced live-typing**: 400ms debounce on keystroke with minimum 2 characters before navigation; searches across all product fields
- **Flutter state management**: Provider (ChangeNotifier) instead of Redux — simpler for mobile, matches provider ecosystem
- **Flutter API layer**: Singleton `ApiClient` + `ApiService` — JWT auto-attached, 401 auto-retry with `/auth/refresh`
- **Flutter cart/wishlist**: Local via SharedPreferences — no backend cart/wishlist endpoints exist; syncs with API only during checkout/order creation

## Next Steps
1. Integrate Stripe Elements / Razorpay SDK in checkout after `createOrder` succeeds
2. Create `Address` model + controller + routes on backend for dashboard addresses CRUD
3. Add image migration script or admin UI to upload images for legacy seeded products
4. Add Flutter admin banner create/edit with multipart (follow product pattern)
5. Build and test Flutter app on Android/iOS simulators
6. Add Google/Apple sign-in to Flutter login screen
7. Run `flutter run -d chrome` to test on web browser

## Critical Context
- Backend on **port 5000**, frontend on **port 3000**
- API base: `http://localhost:5000/api/v1` (constants.ts and `ApiConfig.baseUrl`)
- JWT in **both** httpOnly cookie and localStorage key `outfity_token`
- Axios interceptor: reads `localStorage.outfity_token` → sets `Authorization: Bearer`; captures `response.data.token` → saves; 401 retries `POST /auth/refresh` then original request
- Image URL format in DB: `http://localhost:5000/uploads/#{hex}.#{ext}` — served by `express.static('/uploads')`
- Admin: `npm run seed:admin` (admin@outfity.com / admin123); after `seed:cleanup`, run `seed:admin` then `seed`
- Backend routes: `GET /auth/logout` (not POST), `POST /auth/google`, `POST /auth/refresh`, `PUT /auth/update`, `PUT /auth/password` (expects `confirmPassword`), `GET /auth/me`, `GET /coupons/active` (public), `GET /banners` (public)
- Order field names: `orderItems`, `itemsPrice`, `shippingPrice`, `deliveryCharge`, `totalPrice` — NOT `items`/`subtotal`/`shipping`/`total`
- Shipping address shape: `{ fullName, phone, address, city, state, country, zipCode }`
- Order statuses: `Processing`, `Confirmed`, `Packed`, `Shipped`, `OutForDelivery`, `Delivered`, `Cancelled`
- Review field: `isApproved` (not `approved`)
- Flutter project at `/Users/dhruv/Desktop/outfityweb/flutteroutfity/flutteroutfity/`
- Flutter API base: `http://localhost:5000/api/v1` (`ApiConfig.baseUrl`)
- Flutter run: `flutter run -d chrome` (from `flutteroutfity/`)
- Flutter backend must be running: `npm run dev` or `node server.js` from `backend/`

## All Backend Routes (40 total)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/google` | Public | Google OAuth |
| GET | `/auth/logout` | Public | Logout (clear cookie) |
| POST | `/auth/forgot-password` | Public | Send reset email |
| PUT | `/auth/reset-password/:token` | Public | Reset password (body: `password`, `confirmPassword`) |
| POST | `/auth/refresh` | Public | Refresh JWT |
| GET | `/auth/me` | Protected | Get current user |
| PUT | `/auth/update` | Protected | Update profile |
| PUT | `/auth/password` | Protected | Change password (body: `currentPassword`, `newPassword`, `confirmPassword`) |
| GET | `/products` | Public | List products (params: `search`, `category`, `sort`, `minPrice`, `maxPrice`, etc.) |
| GET | `/products/:id` | Public | Get product |
| POST | `/products` | Admin+upload | Create product (multipart `images[]`) |
| PUT | `/products/:id` | Admin+upload | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| PUT | `/products/:id/review` | Protected | Create/update review |
| GET | `/products/:id/reviews` | Public | Get product reviews |
| POST | `/orders` | Protected | Create order |
| GET | `/orders/me` | Protected | My orders |
| GET | `/orders/:id` | Protected | Order detail |
| PUT | `/orders/:id/cancel` | Protected | Cancel (only `Processing` status) |
| GET | `/orders/admin/all` | Admin | All orders |
| PUT | `/orders/admin/:id/status` | Admin | Update status |
| DELETE | `/orders/admin/:id` | Admin | Delete order |
| GET | `/categories` | Public | List active categories |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |
| GET | `/banners` | Public | Active banners |
| GET | `/banners/admin/all` | Admin | All banners |
| POST | `/banners/admin/create` | Admin+upload | Create banner (multipart `image`) |
| PUT | `/banners/admin/:id` | Admin+upload | Update banner |
| DELETE | `/banners/admin/:id` | Admin | Delete banner |
| POST | `/coupons/validate` | Protected | Validate coupon (body: `code`, `orderAmount?`) |
| GET | `/coupons/active` | Public | Active coupons |
| POST | `/coupons/admin/create` | Admin | Create coupon |
| GET | `/coupons/admin/all` | Admin | All coupons |
| PUT | `/coupons/admin/:id` | Admin | Update coupon |
| DELETE | `/coupons/admin/:id` | Admin | Delete coupon |
| GET | `/reviews/admin/all` | Admin | All reviews |
| PUT | `/reviews/admin/:id/approve` | Admin | Approve review |
| DELETE | `/reviews/admin/:id` | Admin | Delete review |
| GET | `/users/admin/all` | Admin | All users |
| GET | `/users/admin/:id` | Admin | User detail |
| PUT | `/users/admin/:id/block` | Admin | Toggle block |
| DELETE | `/users/admin/:id` | Admin | Delete user |
| POST | `/payments/razorpay/order` | Protected | Create Razorpay order |
| POST | `/payments/razorpay/verify` | Protected | Verify Razorpay payment |
| POST | `/payments/stripe/create` | Protected | Create Stripe PaymentIntent |

## Relevant Files
- `frontend/src/app/checkout/page.tsx`: Auth guard + Redux cart + createOrder API; Suspense wrapper; order summary handles gradient images correctly
- `frontend/src/app/cart/page.tsx`: Reads `state.cart.cartItems`; fetches active coupons; calls real `POST /coupons/validate` API; dispatches `applyCoupon`/`removeCoupon`; animated coupon cards with hover effects
- `frontend/src/app/page.tsx`: Fetches `GET /banners` and `GET /coupons/active`; secondary banner grid; animated coupon highlight section
- `frontend/src/components/HeroBanner.tsx`: Fetches from `GET /banners` API; amber accent; progress dots with glow; slide counter
- `frontend/src/components/Header.tsx`: Debounced auto-search (400ms, ≥2 chars)
- `frontend/src/app/search/page.tsx`: Debounced auto-search; category filter chips from results
- `backend/server.js`: `express.static('/uploads')`; auto-creates uploads dir; CORS allows `localhost:*` origins; CORS middleware registered BEFORE static middleware so `/uploads` files get CORS headers
- `backend/controllers/authController.js`: `refreshToken` endpoint
- `backend/utils/apiFeatures.js`: Multi-field `$or` search with regex escaping
- `backend/controllers/orderController.js`: `createOrder` reads `orderItems`, `shippingAddress`, `itemsPrice`, `shippingPrice`, `discount`; validates ObjectId with `isValid()` before Product.findById
- `backend/models/Order.js`: `pre('save')` no longer uses `next` callback (Mongoose 9/kareem v3 compat)
- `flutteroutfity/flutteroutfity/lib/models/order.dart`: Aligned — reads `orderItems`, `itemsPrice`, `shippingPrice`, `deliveryCharge`, `totalPrice`; `ShippingAddress` class
- `flutteroutfity/flutteroutfity/lib/models/review.dart`: Reads `isApproved` from JSON
- `flutteroutfity/flutteroutfity/lib/models/user.dart`: Handles `avatar` as object `{url}` or string; `isBlocked` field
- `flutteroutfity/flutteroutfity/lib/services/api_service.dart`: 45+ endpoints; `logout()` uses GET; `updatePassword()`/`resetPassword()` send `confirmPassword`; `getProducts()` sends `search` param; includes `googleAuth()`
- `flutteroutfity/flutteroutfity/lib/services/api_client.dart`: 401 → `/auth/refresh` retry logic; token preserved on non-401 errors
- `flutteroutfity/flutteroutfity/lib/screens/checkout/checkout_screen.dart`: Sends `shippingAddress` object, `orderItems`, `itemsPrice`, `shippingPrice` — matches backend exactly; auth guard checks `isAuthenticated` before placing order
- `flutteroutfity/flutteroutfity/lib/screens/orders/order_detail_screen.dart`: Displays `ShippingAddress` widget; cancels only on `Processing` status
- `flutteroutfity/flutteroutfity/lib/screens/admin/banners/admin_banners_screen.dart`: `hide Banner` on Material import
- `flutteroutfity/flutteroutfity/lib/screens/product_detail/product_detail_screen.dart`: Removed `const` from dynamic string
