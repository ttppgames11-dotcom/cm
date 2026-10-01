import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../models/directory_models.dart';
import '../widgets/business_page_header.dart';

/// Reusable browsable-directory screen: banner, search, category chips and
/// a card list. Driven entirely by a [DirectoryConfig], so one widget can
/// serve every simple listing page ported from the website (builders,
/// manufacturers, etc.) without duplicating the layout each time.
class SimpleDirectoryScreen extends StatefulWidget {
  const SimpleDirectoryScreen({super.key, required this.config});

  final DirectoryConfig config;

  @override
  State<SimpleDirectoryScreen> createState() => _SimpleDirectoryScreenState();
}

class _SimpleDirectoryScreenState extends State<SimpleDirectoryScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  late String _selectedCategory = widget.config.categories.first;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<DirectoryEntry> get _filtered {
    final allLabel = widget.config.categories.first;
    return widget.config.entries.where((e) {
      if (_selectedCategory != allLabel && e.category != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        if (!e.name.toLowerCase().contains(q) &&
            !e.tagline.toLowerCase().contains(q) &&
            !e.city.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.white,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Color(0xFFF2EAE0)),
        ),
        content: Text(
          message,
          style: HomeTheme.marathiBody(
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.config;
    final results = _filtered;

    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: Column(
          children: [
            BusinessPageHeader(
              title: config.titleMr,
              subtitle: config.subtitleMr,
              icon: config.headerIcon,
              accentColor: config.accentColor,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                physics: const BouncingScrollPhysics(),
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: HomeTheme.subtleShadow,
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (v) => setState(() => _searchQuery = v),
                      style: HomeTheme.marathiBody(fontSize: 13.5),
                      decoration: InputDecoration(
                        hintText: 'नाव, वैशिष्ट्य किंवा शहर शोधा...',
                        hintStyle: HomeTheme.marathiBody(
                          fontSize: 13,
                          color: HomeTheme.textMuted,
                        ),
                        prefixIcon: const Icon(
                          Icons.search_rounded,
                          color: HomeTheme.textMuted,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: config.categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, i) {
                        final cat = config.categories[i];
                        final isSelected = _selectedCategory == cat;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedCategory = cat),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color:
                                  isSelected
                                      ? const Color(0xFFFFF3E0)
                                      : const Color(0xFFF9FAFB),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color:
                                    isSelected
                                        ? config.accentColor
                                        : const Color(0xFFE5E7EB),
                                width: isSelected ? 2 : 1,
                              ),
                            ),
                            child: Text(
                              cat,
                              style: HomeTheme.marathiBody(
                                fontSize: 12,
                                fontWeight:
                                    isSelected
                                        ? FontWeight.w800
                                        : FontWeight.w500,
                                color:
                                    isSelected
                                        ? config.accentColor
                                        : const Color(0xFF4B5563),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (results.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          const Text('🔍', style: TextStyle(fontSize: 36)),
                          const SizedBox(height: 10),
                          Text(
                            'काहीही आढळले नाही',
                            style: HomeTheme.marathiHeading(fontSize: 15),
                          ),
                        ],
                      ),
                    )
                  else
                    ...results.map(
                      (e) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: _DirectoryCard(
                          entry: e,
                          accentColor: config.accentColor,
                          onCall:
                              e.phone == null
                                  ? null
                                  : () => _showMessage(
                                    '${e.name} ला कॉल करत आहे... 📞',
                                  ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DirectoryCard extends StatelessWidget {
  const _DirectoryCard({
    required this.entry,
    required this.accentColor,
    required this.onCall,
  });

  final DirectoryEntry entry;
  final Color accentColor;
  final VoidCallback? onCall;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: HomeTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: accentColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(entry.icon, style: const TextStyle(fontSize: 24)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.name,
                      style: HomeTheme.marathiHeading(fontSize: 15),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      entry.tagline,
                      style: HomeTheme.marathiBody(
                        fontSize: 11.5,
                        color: HomeTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: accentColor.withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  entry.category,
                  style: HomeTheme.marathiBody(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: accentColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '📍 ${entry.city}',
            style: HomeTheme.marathiBody(
              fontSize: 11.5,
              color: HomeTheme.textMuted,
            ),
          ),
          if (entry.description != null) ...[
            const SizedBox(height: 8),
            Text(
              entry.description!,
              style: HomeTheme.marathiBody(fontSize: 12, height: 1.4),
            ),
          ],
          if (entry.infoLines.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...entry.infoLines.map(
              (line) => Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  line,
                  style: HomeTheme.marathiBody(
                    fontSize: 11,
                    color: HomeTheme.textMuted,
                  ),
                ),
              ),
            ),
          ],
          if (onCall != null) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: GestureDetector(
                onTap: onCall,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: accentColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '📞 कॉल करा',
                    style: HomeTheme.marathiBody(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
