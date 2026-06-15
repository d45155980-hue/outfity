import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  Helpers._();

  static String formatPrice(dynamic price) {
    final number = (price is num) ? price.toDouble() : 0.0;
    final formatter = NumberFormat('#,##0', 'en_IN');
    return '₹${formatter.format(number)}';
  }

  static double getDiscountPercent(double original, double sale) {
    if (original <= 0 || sale <= 0) return 0;
    return ((original - sale) / original * 100).roundToDouble();
  }

  static String formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  static String timeAgo(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inDays > 365) return '${diff.inDays ~/ 365}y ago';
      if (diff.inDays > 30) return '${diff.inDays ~/ 30}mo ago';
      if (diff.inDays > 7) return '${diff.inDays ~/ 7}w ago';
      if (diff.inDays > 0) return '${diff.inDays}d ago';
      if (diff.inHours > 0) return '${diff.inHours}h ago';
      if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
      return 'Just now';
    } catch (_) {
      return '';
    }
  }

  static Color generateColor(String name) {
    final hash = name.hashCode;
    return Color.fromARGB(
      255,
      (hash & 0xFF) % 200 + 55,
      ((hash >> 8) & 0xFF) % 200 + 55,
      ((hash >> 16) & 0xFF) % 200 + 55,
    );
  }
}
