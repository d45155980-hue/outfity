import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/app_colors.dart';

class ShimmerLoader extends StatelessWidget {
  final double height;
  final double? width;
  final double borderRadius;

  const ShimmerLoader({
    super.key,
    this.height = 200,
    this.width,
    this.borderRadius = 16,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Theme.of(context).brightness == Brightness.light
          ? AppColors.shimmerBase
          : AppColors.shimmerBaseDark,
      highlightColor: Theme.of(context).brightness == Brightness.light
          ? AppColors.shimmerHighlight
          : AppColors.shimmerHighlightDark,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.shimmerBase,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class ProductGridShimmer extends StatelessWidget {
  const ProductGridShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: 6,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.65,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (_, __) => Column(
        children: [
          Expanded(
            child: ShimmerLoader(borderRadius: 16),
          ),
          const SizedBox(height: 8),
          const ShimmerLoader(height: 12, width: 140),
          const SizedBox(height: 4),
          const ShimmerLoader(height: 10, width: 80),
        ],
      ),
    );
  }
}
