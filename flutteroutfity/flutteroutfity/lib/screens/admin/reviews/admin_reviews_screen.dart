import 'package:flutter/material.dart';
import '../../../theme/app_colors.dart';
import '../../../models/review.dart';
import '../../../services/api_service.dart';

class AdminReviewsScreen extends StatefulWidget {
  const AdminReviewsScreen({super.key});

  @override
  State<AdminReviewsScreen> createState() => _AdminReviewsScreenState();
}

class _AdminReviewsScreenState extends State<AdminReviewsScreen> {
  List<Review> _reviews = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try { _reviews = await ApiService().getAllReviews(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _approve(Review r) async {
    try { await ApiService().approveReview(r.id); await _fetch(); } catch (_) {}
  }

  Future<void> _delete(Review r) async {
    try { await ApiService().deleteReview(r.id); await _fetch(); } catch (_) {}
  }

  Color _ratingColor(double r) => r >= 4 ? AppColors.success : r >= 3 ? Colors.orange : AppColors.error;

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView.builder(
        padding: const EdgeInsets.all(20), itemCount: _reviews.length,
        itemBuilder: (_, i) {
          final r = _reviews[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                CircleAvatar(radius: 14, child: Text(r.userName.isNotEmpty ? r.userName[0].toUpperCase() : '?', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))),
                const SizedBox(width: 8),
                Expanded(child: Text(r.userName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))),
                Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: _ratingColor(r.rating).withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                  child: Row(children: [Icon(Icons.star, size: 12, color: _ratingColor(r.rating)), const SizedBox(width: 2), Text('${r.rating.toInt()}', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _ratingColor(r.rating)))])),
                if (!r.approved) ...[
                  const SizedBox(width: 8),
                  IconButton(icon: const Icon(Icons.check_circle_outline, size: 18, color: AppColors.success), onPressed: () => _approve(r)),
                ],
                IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error), onPressed: () => _delete(r)),
              ]),
              if (r.comment.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(r.comment, style: TextStyle(fontSize: 13, color: AppColors.textSecondary.withOpacity(0.8))),
              ],
            ]),
          );
        },
      ),
    );
  }
}
