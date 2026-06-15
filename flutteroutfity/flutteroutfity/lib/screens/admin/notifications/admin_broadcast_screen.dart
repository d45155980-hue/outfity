import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/user.dart';
import '../../../services/api_service.dart';
import '../../../theme/app_theme.dart';

class AdminBroadcastScreen extends StatefulWidget {
  const AdminBroadcastScreen({super.key});

  @override
  State<AdminBroadcastScreen> createState() => _AdminBroadcastScreenState();
}

class _AdminBroadcastScreenState extends State<AdminBroadcastScreen> {
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  String _type = 'admin_broadcast';
  String _sendMethod = 'website';
  bool _sendToAll = true;
  List<User> _users = [];
  List<String> _selectedUserIds = [];
  bool _loadingUsers = false;
  bool _sending = false;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() => _loadingUsers = true);
    try {
      _users = await ApiService().getAllUsers();
    } catch (_) {
      _users = [];
    }
    setState(() => _loadingUsers = false);
  }

  List<User> get _filteredUsers {
    if (_search.isEmpty) return _users;
    final q = _search.toLowerCase();
    return _users.where((u) =>
      u.name.toLowerCase().contains(q) ||
      u.email.toLowerCase().contains(q)
    ).toList();
  }

  Future<void> _send() async {
    final title = _titleController.text.trim();
    final message = _messageController.text.trim();
    if (title.isEmpty || message.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and message are required')),
      );
      return;
    }
    if (!_sendToAll && _selectedUserIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one user')),
      );
      return;
    }

    setState(() => _sending = true);
    try {
      await ApiService().broadcastNotification(
        title: title,
        message: message,
        type: _type,
        userIds: _sendToAll ? null : _selectedUserIds,
        sendMethod: _sendMethod,
      );
      if (!mounted) return;
      final methodLabel = _sendMethod == 'email' ? 'via Email' : _sendMethod == 'both' ? 'via Website + Email' : 'via Website';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Sent $methodLabel to ${_sendToAll ? 'all users' : '${_selectedUserIds.length} users'}')),
      );
      _titleController.clear();
      _messageController.clear();
      setState(() => _selectedUserIds = []);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed: $e')),
      );
    }
    setState(() => _sending = false);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send Notification')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Broadcast messages to users about offers, coupons, and updates',
                style: TextStyle(fontSize: 12, color: context.theme.stone400)),
            const SizedBox(height: 20),

            // Type selector
            _label('Notification Type'),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _type,
              decoration: _decoration(),
              items: const [
                DropdownMenuItem(value: 'admin_broadcast', child: Text('General Announcement', style: TextStyle(fontSize: 13))),
                DropdownMenuItem(value: 'coupon_created', child: Text('Coupon / Offer', style: TextStyle(fontSize: 13))),
                DropdownMenuItem(value: 'product_created', child: Text('New Collection / Product', style: TextStyle(fontSize: 13))),
              ],
              onChanged: (v) => setState(() => _type = v ?? 'admin_broadcast'),
            ),
            const SizedBox(height: 16),

            // Title
            _label('Title'),
            const SizedBox(height: 6),
            TextField(
              controller: _titleController,
              decoration: _decoration(hint: 'e.g. Summer Sale - 30% Off!'),
              style: const TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 16),

            // Message
            _label('Message'),
            const SizedBox(height: 6),
            TextField(
              controller: _messageController,
              decoration: _decoration(hint: 'Write your notification message...'),
              maxLines: 4,
              style: const TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 16),

            // Send method
            _label('Send Method'),
            const SizedBox(height: 8),
            Row(
              children: [
                _methodChip(Icons.notifications_outlined, 'Website', _sendMethod == 'website', () => setState(() => _sendMethod = 'website')),
                const SizedBox(width: 8),
                _methodChip(Icons.email_outlined, 'Email', _sendMethod == 'email', () => setState(() => _sendMethod = 'email')),
                const SizedBox(width: 8),
                _methodChip(Icons.swap_horiz, 'Both', _sendMethod == 'both', () => setState(() => _sendMethod = 'both')),
              ],
            ),
            const SizedBox(height: 16),

            // Send to
            _label('Send To'),
            const SizedBox(height: 8),
            Row(
              children: [
                _toggleChip('All Users', _sendToAll, () => setState(() { _sendToAll = true; _selectedUserIds = []; })),
                const SizedBox(width: 8),
                _toggleChip('Select Users', !_sendToAll, () => setState(() => _sendToAll = false)),
              ],
            ),
            const SizedBox(height: 16),

            // User list
            if (!_sendToAll) ...[
              TextField(
                decoration: _decoration(hint: 'Search users...', prefix: Icons.search),
                style: const TextStyle(fontSize: 13),
                onChanged: (v) => setState(() => _search = v),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  TextButton(
                    onPressed: () => setState(() => _selectedUserIds = _filteredUsers.map((u) => u.id).toList()),
                    child: const Text('Select all', style: TextStyle(fontSize: 12)),
                  ),
                  TextButton(
                    onPressed: () => setState(() => _selectedUserIds = []),
                    child: const Text('Clear', style: TextStyle(fontSize: 12)),
                  ),
                  if (_selectedUserIds.isNotEmpty)
                    Text('${_selectedUserIds.length} selected',
                        style: TextStyle(fontSize: 11, color: context.theme.stone400)),
                ],
              ),
              const SizedBox(height: 8),
              if (_loadingUsers)
                const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
              else if (_filteredUsers.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text('No users found', style: TextStyle(fontSize: 12, color: context.theme.stone400)),
                  ),
                )
              else
                SizedBox(
                  height: 300,
                  child: ListView.separated(
                    itemCount: _filteredUsers.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final user = _filteredUsers[index];
                      final selected = _selectedUserIds.contains(user.id);
                      return InkWell(
                        onTap: () => setState(() {
                          if (selected) {
                            _selectedUserIds.remove(user.id);
                          } else {
                            _selectedUserIds.add(user.id);
                          }
                        }),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          color: selected ? context.theme.stone50 : null,
                          child: Row(
                            children: [
                              Container(
                                width: 20, height: 20,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: selected ? Colors.black : context.theme.stone300, width: 2),
                                  color: selected ? Colors.black : null,
                                ),
                                child: selected
                                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                                    : null,
                              ),
                              const SizedBox(width: 12),
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: context.theme.stone900,
                                child: Text(
                                  user.name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join().toUpperCase(),
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(user.name, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: context.theme.stone900)),
                                    Text(user.email, style: TextStyle(fontSize: 11, color: context.theme.stone400)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
            const SizedBox(height: 24),

            // Send button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: _sending ? null : _send,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text(_sending ? 'Sending...' : 'Send to ${_sendToAll ? 'All Users' : '${_selectedUserIds.length} Users'}'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) {
    return Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: context.theme.stone600));
  }

  InputDecoration _decoration({String? hint, IconData? prefix}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(fontSize: 12, color: context.theme.stone300),
      prefixIcon: prefix != null ? Icon(prefix, size: 18, color: context.theme.stone400) : null,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: context.theme.stone200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: context.theme.stone200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: context.theme.stone400),
      ),
    );
  }

  Widget _toggleChip(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: active ? Colors.black : context.theme.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: active ? Colors.black : context.theme.stone200),
        ),
        child: Text(label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: active ? Colors.white : context.theme.stone600,
          ),
        ),
      ),
    );
  }

  Widget _methodChip(IconData icon, String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: active ? Colors.black : context.theme.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: active ? Colors.black : context.theme.stone200),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: active ? Colors.white : context.theme.stone600),
            const SizedBox(width: 4),
            Text(label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: active ? Colors.white : context.theme.stone600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
