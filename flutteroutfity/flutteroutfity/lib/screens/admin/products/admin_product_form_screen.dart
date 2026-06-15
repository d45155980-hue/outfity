import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cross_file/cross_file.dart';
import '../../../theme/app_colors.dart';
import '../../../config/api_config.dart';
import '../../../models/product.dart';
import '../../../models/category.dart';
import '../../../services/api_service.dart';

class AdminProductFormScreen extends StatefulWidget {
  final Product? product;
  const AdminProductFormScreen({super.key, this.product});

  @override
  State<AdminProductFormScreen> createState() => _AdminProductFormScreenState();
}

class _AdminProductFormScreenState extends State<AdminProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();
  late TextEditingController _nameCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _brandCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _salePriceCtrl;
  late TextEditingController _stockCtrl;

  String? _selectedCategory;
  List<Category> _categories = [];
  bool _loadingCats = true;
  bool _saving = false;

  bool _featured = false;
  bool _isNewArrival = false;
  bool _isTrending = false;
  bool _isSale = false;

  final _sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7', '8', '9', '10', '11', '12', '30', '32', '34', '36', 'One Size'];
  final Set<String> _selectedSizes = {};

  final List<Map<String, String>> _colors = [];
  final TextEditingController _colorNameCtrl = TextEditingController();
  Color _colorHex = Colors.black;

  final List<XFile> _imageFiles = [];
  final List<Uint8List> _imageBytes = [];
  final List<String> _existingImageUrls = [];

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _descCtrl = TextEditingController(text: p?.description ?? '');
    _brandCtrl = TextEditingController(text: p?.brand ?? '');
    _priceCtrl = TextEditingController(text: p != null ? p.price.toStringAsFixed(2) : '');
    _salePriceCtrl = TextEditingController(text: p?.salePrice?.toStringAsFixed(2) ?? '');
    _stockCtrl = TextEditingController(text: p != null ? p.stock.toString() : '');
    _featured = p?.featured ?? false;
    _isNewArrival = p?.isNewArrival ?? false;
    _isTrending = p?.isTrending ?? false;
    _isSale = p?.isSale ?? false;
    if (p?.sizes != null) _selectedSizes.addAll(p!.sizes);
    if (p?.colors != null) {
      for (final c in p!.colors) {
        _colors.add({'name': c.name, 'hex': c.hex});
      }
    }
    if (p?.images != null) {
      _existingImageUrls.addAll(p!.images.map((img) => img.url));
    }
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      _categories = await ApiService().getCategories();
      if (widget.product != null && widget.product!.category != null) {
        final catId = widget.product!.category is String
            ? widget.product!.category as String
            : (widget.product!.category as Map)['_id'] as String?;
        if (catId != null) {
          _selectedCategory = _categories.where((c) => c.id == catId).firstOrNull?.name;
        }
      }
    } catch (_) {}
    if (mounted) setState(() => _loadingCats = false);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _brandCtrl.dispose();
    _priceCtrl.dispose();
    _salePriceCtrl.dispose();
    _stockCtrl.dispose();
    _colorNameCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage();
    if (picked.isNotEmpty) {
      for (final xfile in picked) {
        final bytes = await xfile.readAsBytes();
        _imageFiles.add(xfile);
        _imageBytes.add(bytes);
      }
      setState(() {});
    }
  }

  void _removeImageFile(int index) {
    setState(() {
      _imageFiles.removeAt(index);
      _imageBytes.removeAt(index);
    });
  }

  void _removeExistingImage(int index) {
    setState(() => _existingImageUrls.removeAt(index));
  }

  void _addColor() {
    final name = _colorNameCtrl.text.trim();
    if (name.isEmpty) return;
    final hex = '#${_colorHex.value.toRadixString(16).padLeft(8, '0').substring(0, 6).toUpperCase()}';
    setState(() {
      _colors.add({'name': name, 'hex': hex});
      _colorNameCtrl.clear();
    });
  }

  void _removeColor(int index) {
    setState(() => _colors.removeAt(index));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final fields = <String, String>{
      'name': _nameCtrl.text.trim(),
      'description': _descCtrl.text.trim(),
      'brand': _brandCtrl.text.trim(),
      'price': _priceCtrl.text.trim(),
      'salePrice': _salePriceCtrl.text.trim().isEmpty ? '0' : _salePriceCtrl.text.trim(),
      'stock': _stockCtrl.text.trim(),
      'sizes': jsonEncode(_selectedSizes.toList()),
      'colors': jsonEncode(_colors.map((c) => {'name': c['name'], 'hex': c['hex']}).toList()),
      'featured': _featured.toString(),
      'isNewArrival': _isNewArrival.toString(),
      'isTrending': _isTrending.toString(),
      'isSale': _isSale.toString(),
    };
    if (_selectedCategory != null) fields['category'] = _selectedCategory!;

    try {
      if (widget.product != null) {
        await ApiService().updateProductWithImages(widget.product!.id, fields, _imageFiles);
      } else {
        await ApiService().createProductWithImages(fields, _imageFiles);
      }
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: AppColors.error),
        );
      }
    }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product != null ? 'Edit Product' : 'Add Product'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Save', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _sectionLabel('Basic Info'),
            const SizedBox(height: 12),
            _buildTextField(_nameCtrl, 'Product Name', required: true),
            const SizedBox(height: 12),
            _buildTextField(_descCtrl, 'Description', maxLines: 3),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildTextField(_brandCtrl, 'Brand')),
                const SizedBox(width: 12),
                Expanded(
                  child: _loadingCats
                      ? const SizedBox(height: 48, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
                      : DropdownButtonFormField<String>(
                          value: _selectedCategory,
                          decoration: const InputDecoration(filled: true, hintText: 'Category'),
                          items: _categories.map((c) => DropdownMenuItem(value: c.name, child: Text(c.name))).toList(),
                          onChanged: (v) => setState(() => _selectedCategory = v),
                          validator: (v) => v == null ? 'Select a category' : null,
                        ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _sectionLabel('Pricing & Stock'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildTextField(_priceCtrl, 'Price', keyboardType: TextInputType.number, required: true)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField(_salePriceCtrl, 'Sale Price', keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 12),
            _buildTextField(_stockCtrl, 'Stock', keyboardType: TextInputType.number, required: true),
            const SizedBox(height: 20),
            _sectionLabel('Sizes'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _sizeOptions.map((size) {
                final selected = _selectedSizes.contains(size);
                return GestureDetector(
                  onTap: () => setState(() {
                    if (selected) { _selectedSizes.remove(size); } else { _selectedSizes.add(size); }
                  }),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                    ),
                    child: Text(size, style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: selected ? AppColors.white : AppColors.textPrimary,
                    )),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            _sectionLabel('Colors'),
            const SizedBox(height: 12),
            if (_colors.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _colors.asMap().entries.map((entry) {
                    final i = entry.key;
                    final c = entry.value;
                    return Chip(
                      avatar: CircleAvatar(
                        backgroundColor: Color(int.parse(c['hex']!.replaceFirst('#', '0xFF'))),
                        radius: 6,
                      ),
                      label: Text(c['name']!, style: const TextStyle(fontSize: 12)),
                      deleteIcon: const Icon(Icons.close, size: 16),
                      onDeleted: () => _removeColor(i),
                      side: BorderSide.none,
                      backgroundColor: AppColors.background,
                    );
                  }).toList(),
                ),
              ),
            Row(
              children: [
                Expanded(child: _buildTextField(_colorNameCtrl, 'Color name')),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDialog<Color>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Pick Color'),
                        content: SizedBox(
                          width: 300,
                          child: ColorPicker(selectedColor: _colorHex, onChanged: (c) => _colorHex = c),
                        ),
                        actions: [TextButton(onPressed: () => Navigator.pop(ctx, _colorHex), child: const Text('Done'))],
                      ),
                    );
                    if (picked != null) setState(() => _colorHex = picked);
                  },
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _colorHex,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addColor,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.background,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: const Text('Add', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _sectionLabel('Images'),
            const SizedBox(height: 12),
            if (_existingImageUrls.isNotEmpty || _imageBytes.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: SizedBox(
                  height: 80,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _existingImageUrls.length + _imageBytes.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      if (i < _existingImageUrls.length) {
                        final url = ApiConfig.imageUrl(_existingImageUrls[i]);
                        return Stack(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.border),
                                image: url.isNotEmpty
                                    ? DecorationImage(
                                        image: NetworkImage(url),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                            ),
                            Positioned(
                              top: 2, right: 2,
                              child: GestureDetector(
                                onTap: () => _removeExistingImage(i),
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                                  child: const Icon(Icons.close, size: 14, color: AppColors.white),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                      final fileIdx = i - _existingImageUrls.length;
                      return Stack(
                        children: [
                          Container(
                            width: 80, height: 80,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.border),
                              image: DecorationImage(
                                image: MemoryImage(_imageBytes[fileIdx]),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          Positioned(
                            top: 2, right: 2,
                            child: GestureDetector(
                              onTap: () => _removeImageFile(fileIdx),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                                child: const Icon(Icons.close, size: 14, color: AppColors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
            GestureDetector(
              onTap: _pickImages,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 32),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border, width: 2, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Icon(Icons.image_outlined, size: 40, color: AppColors.textHint),
                    const SizedBox(height: 8),
                    Text('Tap to upload images', style: TextStyle(fontSize: 13, color: AppColors.textHint)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            _sectionLabel('Tags'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _tagChip(Icons.star_outline, 'Featured', _featured, (v) => setState(() => _featured = v)),
                _tagChip(Icons.auto_awesome, 'New', _isNewArrival, (v) => setState(() => _isNewArrival = v)),
                _tagChip(Icons.local_fire_department, 'Trending', _isTrending, (v) => setState(() => _isTrending = v)),
                _tagChip(Icons.sell_outlined, 'Sale', _isSale, (v) => setState(() => _isSale = v)),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Text(text, style: const TextStyle(
      fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 1,
    ));
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String hint, {
    bool required = false,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(hintText: hint, filled: true),
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: required ? (v) => v == null || v.trim().isEmpty ? 'Required' : null : null,
    );
  }

  Widget _tagChip(IconData icon, String label, bool selected, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!selected),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: selected ? AppColors.white : AppColors.textPrimary),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.w500,
              color: selected ? AppColors.white : AppColors.textPrimary,
            )),
          ],
        ),
      ),
    );
  }
}

class ColorPicker extends StatelessWidget {
  final Color selectedColor;
  final ValueChanged<Color> onChanged;
  const ColorPicker({super.key, required this.selectedColor, required this.onChanged});

  static const _presets = [
    Colors.black, Colors.white, Colors.red, Colors.pink, Colors.purple,
    Colors.deepPurple, Colors.indigo, Colors.blue, Colors.lightBlue, Colors.cyan,
    Colors.teal, Colors.green, Colors.lightGreen, Colors.lime, Colors.yellow,
    Colors.amber, Colors.orange, Colors.deepOrange, Colors.brown, Colors.grey,
    Color(0xFF1a1a2e), Color(0xFF16213e), Color(0xFF0f3460), Color(0xFFe94560),
    Color(0xFF533483), Color(0xFF3b185f), Color(0xFFa12568), Color(0xFFf5c518),
    Color(0xFF2d4059), Color(0xFFea5455), Color(0xFFf07b3f), Color(0xFFffd460),
    Color(0xFFeeeee), Color(0xFF393e46), Color(0xFF6d9886), Color(0xFFd9c5b1),
    Color(0xFF222831), Color(0xFF30475e), Color(0xFFf05454), Color(0xFFf5a623),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _presets.map((c) {
        final isSelected = c.value == selectedColor.value;
        return GestureDetector(
          onTap: () => onChanged(c),
          child: Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: c,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? AppColors.primary : (c == Colors.white ? AppColors.border : Colors.transparent),
                width: isSelected ? 3 : 1,
              ),
            ),
            child: isSelected
                ? Icon(Icons.check, size: 18, color: c == Colors.white ? AppColors.primary : AppColors.white)
                : null,
          ),
        );
      }).toList(),
    );
  }
}
