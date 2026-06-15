import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../models/category.dart';
import '../../services/api_service.dart';
import '../../widgets/product_card.dart';
import '../../widgets/shimmer_loader.dart';
import '../../widgets/empty_state.dart';

class SearchScreen extends StatefulWidget {
  final String? initialCategory;
  const SearchScreen({super.key, this.initialCategory});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  List _results = [];
  bool _loading = false;
  bool _searched = false;
  bool _searchError = false;

  List<Category> _categories = [];
  String? _selectedCategory;
  String _sortBy = 'newest';
  RangeValues _priceRange = const RangeValues(0, 1000);
  bool _showFilters = false;

  final _sortOptions = {
    'newest': 'Newest',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'popular': 'Most Popular',
    'rating': 'Top Rated',
  };

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _fetchCategories();
    if (widget.initialCategory != null) {
      _search('').then((_) {
        if (_searchError) {
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) _search('');
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchCategories() async {
    try {
      _categories = await ApiService().getCategories();
      if (mounted) setState(() {});
    } catch (_) {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        try {
          _categories = await ApiService().getCategories();
          if (mounted) setState(() {});
        } catch (_) {}
      }
    }
  }

  Future<void> _search(String query) async {
    final q = query.trim();
    if (q.isEmpty && _selectedCategory == null) {
      setState(() { _results = []; _searched = false; });
      return;
    }
    setState(() { _loading = true; _searched = true; _searchError = false; });
    try {
      final params = <String, String>{};
      if (q.isNotEmpty) params['search'] = q;
      if (_selectedCategory != null) params['category'] = _selectedCategory!;
      params['sort'] = _sortBy;
      params['minPrice'] = _priceRange.start.toStringAsFixed(0);
      params['maxPrice'] = _priceRange.end.toStringAsFixed(0);
      params['limit'] = '50';
      final data = await ApiService().getProductsWithParams(params);
      if (mounted) setState(() { _results = data; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _results = []; _loading = false; _searchError = true; });
    }
  }

  void _applyFilters() {
    setState(() => _showFilters = false);
    _search(_searchCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: TextField(
                controller: _searchCtrl,
                autofocus: widget.initialCategory == null,
                onChanged: (v) {
                  if (v.length >= 2) _search(v);
                  if (v.isEmpty && _selectedCategory == null) {
                    setState(() { _results = []; _searched = false; });
                  }
                },
                decoration: InputDecoration(
                  hintText: 'Search for products...',
                  prefixIcon: const Icon(Icons.search_outlined),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(_showFilters ? Icons.filter_list_off : Icons.filter_list,
                            color: _selectedCategory != null || _sortBy != 'newest'
                                ? AppColors.primary
                                : null),
                        onPressed: () => setState(() => _showFilters = !_showFilters),
                      ),
                      if (_searchCtrl.text.isNotEmpty)
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () {
                            _searchCtrl.clear();
                            setState(() { _results = []; _searched = false; });
                          },
                        ),
                    ],
                  ),
                  filled: true,
                  fillColor: Theme.of(context).brightness == Brightness.light
                      ? AppColors.background
                      : AppColors.cardDark,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            if (_showFilters) _buildFilterPanel(),
            if (_selectedCategory != null || _sortBy != 'newest')
              _buildActiveFilters(),
            Expanded(
              child: _loading
                  ? const ProductGridShimmer()
                  : _searched && _results.isEmpty
                      ? _searchError
                          ? EmptyState(
                              icon: Icons.cloud_off,
                              title: 'Search failed',
                              description: 'Check your connection and try again.',
                            )
                          : EmptyState(
                              icon: Icons.search_off,
                              title: 'No results found',
                              description: 'Try different keywords or browse categories.',
                            )
                      : _results.isNotEmpty
                          ? GridView.builder(
                              padding: const EdgeInsets.all(20),
                              itemCount: _results.length,
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.65,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemBuilder: (context, index) {
                                return ProductCard(product: _results[index], index: index);
                              },
                            )
                          : _buildSuggestions(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveFilters() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            if (_selectedCategory != null)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Chip(
                  label: Text(_selectedCategory!, style: const TextStyle(fontSize: 12)),
                  deleteIcon: const Icon(Icons.close, size: 16),
                  onDeleted: () {
                    setState(() => _selectedCategory = null);
                    _search(_searchCtrl.text);
                  },
                  side: const BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
            if (_sortBy != 'newest')
              Chip(
                label: Text(_sortOptions[_sortBy]!, style: const TextStyle(fontSize: 12)),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () {
                  setState(() => _sortBy = 'newest');
                  _search(_searchCtrl.text);
                },
                side: const BorderSide(color: AppColors.border),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterPanel() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Filters', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedCategory = null;
                    _sortBy = 'newest';
                    _priceRange = const RangeValues(0, 1000);
                  });
                },
                child: const Text('Reset'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text('Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          if (_categories.isEmpty)
            const Text('No categories', style: TextStyle(color: AppColors.textSecondary))
          else
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final cat = _categories[i];
                  final selected = cat.name == _selectedCategory;
                  return FilterChip(
                    label: Text(cat.name, style: TextStyle(fontSize: 12, color: selected ? AppColors.white : null)),
                    selected: selected,
                    selectedColor: AppColors.primary,
                    onSelected: (v) => setState(() => _selectedCategory = v ? cat.name : null),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  );
                },
              ),
            ),
          const SizedBox(height: 16),
          const Text('Sort By', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          DropdownButton<String>(
            value: _sortBy,
            isExpanded: true,
            underline: const SizedBox(),
            items: _sortOptions.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13)))).toList(),
            onChanged: (v) => setState(() => _sortBy = v!),
          ),
          const SizedBox(height: 16),
          const Text('Price Range', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          RangeSlider(
            values: _priceRange,
            min: 0,
            max: 1000,
            divisions: 20,
            labels: RangeLabels(
              '\$${_priceRange.start.toStringAsFixed(0)}',
              '\$${_priceRange.end.toStringAsFixed(0)}',
            ),
            onChanged: (v) => setState(() => _priceRange = v),
            activeColor: AppColors.primary,
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _applyFilters,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Apply Filters', style: TextStyle(color: AppColors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestions() {
    final suggestions = ['Cotton T-shirt', 'Denim Jacket', 'Formal Shoes', 'Summer Dress', 'Leather Bag'];
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text(
          'Trending Searches',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: suggestions.map((s) {
            return ActionChip(
              label: Text(s),
              onPressed: () {
                _searchCtrl.text = s;
                _search(s);
              },
              side: const BorderSide(color: AppColors.border),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            );
          }).toList(),
        ),
      ],
    );
  }
}
