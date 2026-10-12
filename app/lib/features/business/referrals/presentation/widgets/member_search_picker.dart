import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/models/referral_member_recipient.dart';
import '../providers/referral_providers.dart';

class MemberSearchPicker extends ConsumerStatefulWidget {
  const MemberSearchPicker({
    super.key,
    required this.selectedMember,
    required this.isAnyMember,
    required this.onSelected,
  });

  final ReferralMemberRecipient? selectedMember;
  final bool isAnyMember;
  final void Function(ReferralMemberRecipient? member, bool isAny) onSelected;

  @override
  ConsumerState<MemberSearchPicker> createState() => _MemberSearchPickerState();
}

class _MemberSearchPickerState extends ConsumerState<MemberSearchPicker> {
  final TextEditingController _searchCtrl = TextEditingController();
  Timer? _debounceTimer;

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _openSearchDialog() {
    _searchCtrl.clear();
    ref.read(memberSearchQueryProvider.notifier).state = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Consumer(
              builder: (context, ref, child) {
                final resultsAsync = ref.watch(memberSearchResultsProvider);
                final query = ref.watch(memberSearchQueryProvider);

                return DraggableScrollableSheet(
                  initialChildSize: 0.8,
                  minChildSize: 0.5,
                  maxChildSize: 0.95,
                  expand: false,
                  builder: (context, scrollCtrl) {
                    return Padding(
                      padding: EdgeInsets.only(
                        left: 18,
                        right: 18,
                        top: 16,
                        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Container(
                              width: 44,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'रेफरल कोणाला द्यायचा आहे?',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF2B1B12),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'विशिष्ट सदस्याचे नाव किंवा व्यवसाय शोधा, किंवा सर्व सदस्यांसाठी खुला ठेवा.',
                            style: TextStyle(fontSize: 12.5, color: Color(0xFF7A6A5D)),
                          ),
                          const SizedBox(height: 14),

                          // Search input
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAF7F2),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFFEADBCE)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.search_rounded, color: Color(0xFF8D7B6F)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _searchCtrl,
                                    onChanged: (val) {
                                      _debounceTimer?.cancel();
                                      _debounceTimer =
                                          Timer(const Duration(milliseconds: 400), () {
                                        ref.read(memberSearchQueryProvider.notifier).state = val;
                                      });
                                    },
                                    decoration: const InputDecoration(
                                      hintText: 'सदस्याचे नाव, व्यवसाय किंवा शहर शोधा...',
                                      hintStyle: TextStyle(fontSize: 13, color: Color(0xFF9E8E81)),
                                      border: InputBorder.none,
                                    ),
                                  ),
                                ),
                                if (_searchCtrl.text.isNotEmpty)
                                  IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 18),
                                    onPressed: () {
                                      _searchCtrl.clear();
                                      ref.read(memberSearchQueryProvider.notifier).state = '';
                                    },
                                  ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 12),

                          // Option: कोणत्याही सदस्याला (Any Member)
                          ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            leading: Container(
                              width: 42,
                              height: 42,
                              decoration: const BoxDecoration(
                                color: Color(0xFFFFECE5),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.public_rounded,
                                color: Color(0xFFE65100),
                                size: 22,
                              ),
                            ),
                            title: const Text(
                              'कोणत्याही सदस्याला (ओपन लीड)',
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF2B1B12),
                              ),
                            ),
                            subtitle: const Text(
                              'सर्व संबंधित व्यवसाय सदस्यांना ही लीड दिसेल',
                              style: TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D)),
                            ),
                            trailing: const Icon(Icons.check_circle_outline_rounded, color: Color(0xFFE65100)),
                            onTap: () {
                              widget.onSelected(null, true);
                              Navigator.pop(ctx);
                            },
                          ),
                          const Divider(height: 16),

                          // Search results list
                          Expanded(
                            child: query.isEmpty
                                ? const Center(
                                    child: Text(
                                      'नाव टाईप करून सदस्य शोधा',
                                      style: TextStyle(color: Color(0xFF9E8E81), fontSize: 13),
                                    ),
                                  )
                                : resultsAsync.when(
                                    loading: () => const Center(
                                      child: CircularProgressIndicator(color: Color(0xFF8B1E1E)),
                                    ),
                                    error: (err, _) => Center(
                                      child: Text(
                                        'शोधण्यात त्रुटी आली: $err',
                                        style: const TextStyle(color: Colors.red, fontSize: 12),
                                      ),
                                    ),
                                    data: (members) {
                                      if (members.isEmpty) {
                                        return const Center(
                                          child: Text(
                                            'कोणताही सदस्य आढळला नाही',
                                            style: TextStyle(color: Color(0xFF7A6A5D), fontSize: 13),
                                          ),
                                        );
                                      }

                                      return ListView.separated(
                                        controller: scrollCtrl,
                                        itemCount: members.length,
                                        separatorBuilder: (_, __) =>
                                            const Divider(height: 1, color: Color(0xFFF0E4D7)),
                                        itemBuilder: (context, index) {
                                          final m = members[index];
                                          // Never show phone or email
                                          final details = [
                                            if (m.profession.isNotEmpty) m.profession,
                                            if (m.city.isNotEmpty) m.city,
                                          ].join(' • ');

                                          return ListTile(
                                            contentPadding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 4,
                                            ),
                                            leading: CircleAvatar(
                                              backgroundColor: const Color(0xFFF1E5D8),
                                              child: Text(
                                                m.name.isNotEmpty ? m.name[0] : 'म',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF8B1E1E),
                                                ),
                                              ),
                                            ),
                                            title: Text(
                                              m.name,
                                              style: const TextStyle(
                                                fontSize: 14.5,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF2B1B12),
                                              ),
                                            ),
                                            subtitle: details.isNotEmpty
                                                ? Text(
                                                    details,
                                                    style: const TextStyle(
                                                      fontSize: 12,
                                                      color: Color(0xFF7A6A5D),
                                                    ),
                                                  )
                                                : null,
                                            onTap: () {
                                              widget.onSelected(m, false);
                                              Navigator.pop(ctx);
                                            },
                                          );
                                        },
                                      );
                                    },
                                  ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isAnyMember) {
      return _buildSelectedCard(
        title: 'कोणत्याही सदस्याला (सर्व सदस्य)',
        subtitle: 'ओपन लीड स्वरूपात पोस्ट होईल',
        icon: Icons.public_rounded,
        iconColor: const Color(0xFFE65100),
      );
    }

    if (widget.selectedMember != null) {
      final m = widget.selectedMember!;
      final subtitle = [
        if (m.profession.isNotEmpty) m.profession,
        if (m.city.isNotEmpty) m.city,
      ].join(' • ');

      return _buildSelectedCard(
        title: m.name,
        subtitle: subtitle.isNotEmpty ? subtitle : 'मराठा व्यवसाय सदस्य',
        icon: Icons.person_rounded,
        iconColor: const Color(0xFF8B1E1E),
      );
    }

    // Unselected placeholder button
    return InkWell(
      onTap: _openSearchDialog,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFEADBCE)),
        ),
        child: const Row(
          children: [
            Icon(Icons.person_search_rounded, color: Color(0xFF8D7B6F), size: 22),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'सदस्य निवडा किंवा "कोणत्याही सदस्याला" पाठवा',
                style: TextStyle(
                  fontSize: 13.5,
                  color: Color(0xFF7A6A5D),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF8D7B6F)),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectedCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7F2),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFFCCBC)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2B1B12),
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: Color(0xFF7A6A5D),
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: _openSearchDialog,
            style: TextButton.styleFrom(
              visualDensity: VisualDensity.compact,
              foregroundColor: const Color(0xFF8B1E1E),
            ),
            child: const Text('बदला', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
