import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../auth/auth_controller.dart';
import '../../../../auth/providers/auth_provider.dart';
import '../../domain/models/meeting_member.dart';
import '../../domain/utils/meeting_date_utils.dart';
import '../providers/meetings_providers.dart';

class RequestMeetingScreen extends ConsumerStatefulWidget {
  const RequestMeetingScreen({super.key});

  @override
  ConsumerState<RequestMeetingScreen> createState() => _RequestMeetingScreenState();
}

class _RequestMeetingScreenState extends ConsumerState<RequestMeetingScreen> {
  final _searchController = TextEditingController();
  final _topicController = TextEditingController();
  final _venueController = TextEditingController();
  final _onlineLinkController = TextEditingController();
  final _notesController = TextEditingController();

  MeetingMember? _selectedMember;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 11, minute: 0);

  // Location toggle: 0 = "प्रत्यक्ष", 1 = "ऑनलाइन"
  int _locationToggle = 0;

  bool _isSubmitting = false;

  final List<String> _quickTopics = [
    'ओळख',
    'भागीदारी',
    'खरेदी-विक्री',
    'मार्गदर्शन',
    'इतर',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    _topicController.dispose();
    _venueController.dispose();
    _onlineLinkController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate.isBefore(today) ? today : _selectedDate,
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
      helpText: 'बैठकीची तारीख निवडा (आज किंवा नंतर)',
      confirmText: 'निश्चित करा',
      cancelText: 'रद्द',
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      helpText: 'बैठकीची वेळ निवडा',
      confirmText: 'निश्चित करा',
      cancelText: 'रद्द',
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
    }
  }

  Future<void> _submitRequest() async {
    if (_selectedMember == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया बैठकीसाठी सदस्य निवडा (केवळ शोध निकालातून).'),
          backgroundColor: Color(0xFFD32F2F),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final marathiDate = MeetingDateUtils.formatMarathiDate(_selectedDate);
    final marathiTime = MeetingDateUtils.formatMarathiTime(_selectedTime);

    // Location calculation
    String finalLocation;
    if (_locationToggle == 1) {
      finalLocation = 'ऑनलाइन (Online)';
    } else {
      final venue = _venueController.text.trim();
      finalLocation = venue.isNotEmpty ? venue : 'प्रत्यक्ष भेट';
    }

    // Notes calculation (append link if online)
    var finalNotes = _notesController.text.trim();
    if (_locationToggle == 1) {
      final link = _onlineLinkController.text.trim();
      if (link.isNotEmpty) {
        if (finalNotes.isNotEmpty) {
          finalNotes += '\nऑनलाइन लिंक: $link';
        } else {
          finalNotes = 'ऑनलाइन लिंक: $link';
        }
      }
    }

    try {
      final repo = ref.read(meetingsRepositoryProvider);
      final newMeeting = await repo.createMeeting(
        recipientId: _selectedMember!.id,
        recipientName: _selectedMember!.name,
        date: marathiDate,
        time: marathiTime,
        topic: _topicController.text.trim().isNotEmpty
            ? _topicController.text.trim()
            : 'व्यवसाय संगम १-टू-१ भेट',
        location: finalLocation,
        notes: finalNotes,
      );

      // Prepend to meeting list state
      ref.read(meetingsProvider.notifier).prependMeeting(newMeeting);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('बैठक विनंती यशस्वीरित्या पाठवली! (Meeting Scheduled)'),
            backgroundColor: Color(0xFF2E7D32),
            duration: Duration(seconds: 3),
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('विनंती पाठवताना त्रुटी: ${e.toString()}'),
            backgroundColor: const Color(0xFFD32F2F),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authController = ref.watch(authControllerProvider);
    if (authController.state.status != AuthStatus.authenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go('/login');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final searchState = ref.watch(memberSearchProvider);
    final formattedDate = MeetingDateUtils.formatMarathiDate(_selectedDate);
    final formattedTime = MeetingDateUtils.formatMarathiTime(_selectedTime);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        title: const Text(
          '१-टू-१ बैठक विनंती',
          style: TextStyle(
            fontSize: 18.5,
            fontWeight: FontWeight.w800,
            color: Color(0xFF2B1B12),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF2B1B12), size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: Member Search & Selection
            _buildSectionHeader('१. सदस्याची निवड करा (Member)', Icons.person_search_rounded),
            const SizedBox(height: 8),

            if (_selectedMember != null) ...[
              // Selected Member Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFA5D6A7), width: 1.2),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF2E7D32),
                      radius: 20,
                      child: Text(
                        _selectedMember!.name.isNotEmpty ? _selectedMember!.name[0] : 'म',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedMember!.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF1B5E20),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            [
                              if (_selectedMember!.profession != null && _selectedMember!.profession!.isNotEmpty)
                                _selectedMember!.profession,
                              if (_selectedMember!.city != null && _selectedMember!.city!.isNotEmpty)
                                _selectedMember!.city,
                            ].join(' • '),
                            style: const TextStyle(fontSize: 12.5, color: Color(0xFF388E3C)),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Color(0xFF2E7D32)),
                      onPressed: () {
                        setState(() => _selectedMember = null);
                        _searchController.clear();
                        ref.read(memberSearchProvider.notifier).clear();
                      },
                      tooltip: 'सदस्य बदला',
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Member Search Input Field
              TextField(
                controller: _searchController,
                onChanged: (val) {
                  ref.read(memberSearchProvider.notifier).onQueryChanged(val);
                },
                decoration: InputDecoration(
                  hintText: 'नाव, व्यवसाय किंवा शहरानुसार शोधा...',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13.5),
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFE65100)),
                  suffixIcon: searchState.isLoading
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE65100)),
                          ),
                        )
                      : (_searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                ref.read(memberSearchProvider.notifier).clear();
                              },
                            )
                          : null),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE65100), width: 1.5),
                  ),
                ),
              ),

              // Search Results Dropdown List
              if (searchState.results.isNotEmpty) ...[
                const SizedBox(height: 6),
                Container(
                  constraints: const BoxConstraints(maxHeight: 220),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE0D5C9)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: searchState.results.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFF0E5D8)),
                    itemBuilder: (context, idx) {
                      final m = searchState.results[idx];
                      return ListTile(
                        dense: true,
                        leading: CircleAvatar(
                          radius: 16,
                          backgroundColor: const Color(0xFFFFF3E0),
                          child: Text(
                            m.name.isNotEmpty ? m.name[0] : 'म',
                            style: const TextStyle(
                              color: Color(0xFFE65100),
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        title: Text(
                          m.name,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                        ),
                        subtitle: Text(
                          [
                            if (m.profession != null && m.profession!.isNotEmpty) m.profession,
                            if (m.city != null && m.city!.isNotEmpty) m.city,
                          ].join(' • '),
                          style: const TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D)),
                        ),
                        onTap: () {
                          setState(() {
                            _selectedMember = m;
                          });
                          ref.read(memberSearchProvider.notifier).clear();
                        },
                      );
                    },
                  ),
                ),
              ] else if (_searchController.text.trim().isNotEmpty && !searchState.isLoading) ...[
                const Padding(
                  padding: EdgeInsets.only(top: 8, left: 4),
                  child: Text(
                    'कोणताही सदस्य आढळला नाही. कृपया नाव तपासा.',
                    style: TextStyle(fontSize: 12, color: Color(0xFFC62828)),
                  ),
                ),
              ],
            ],

            const SizedBox(height: 22),

            // Section 2: Date & Time
            _buildSectionHeader('२. तारीख व वेळ (Date & Time)', Icons.calendar_month_rounded),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: _pickDate,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE0D5C9)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('तारीख', style: TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D))),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFFE65100)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  formattedDate,
                                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: _pickTime,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE0D5C9)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('वेळ', style: TextStyle(fontSize: 11.5, color: Color(0xFF7A6A5D))),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.access_time_rounded, size: 16, color: Color(0xFFE65100)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  formattedTime,
                                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 22),

            // Section 3: Topic & Quick-Pick Chips
            _buildSectionHeader('३. बैठकीचा विषय (Topic)', Icons.topic_rounded),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _quickTopics.map((topic) {
                final isSelected = _topicController.text == topic;
                return ChoiceChip(
                  label: Text(topic),
                  selected: isSelected,
                  selectedColor: const Color(0xFF8B1E1E),
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : const Color(0xFF5D4037),
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    fontSize: 12.5,
                  ),
                  side: BorderSide(
                    color: isSelected ? const Color(0xFF8B1E1E) : const Color(0xFFE0D5C9),
                  ),
                  onSelected: (selected) {
                    setState(() {
                      _topicController.text = selected ? topic : '';
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _topicController,
              decoration: InputDecoration(
                hintText: 'किंवा इतर विषय लिहा...',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
              ),
            ),

            const SizedBox(height: 22),

            // Section 4: Location Toggle ("प्रत्यक्ष" vs "ऑनलाइन")
            _buildSectionHeader('४. भेटीचे स्थान (Location)', Icons.location_on_rounded),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF2ECE4),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _locationToggle = 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _locationToggle == 0 ? const Color(0xFF8B1E1E) : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.business_rounded,
                                size: 16,
                                color: _locationToggle == 0 ? Colors.white : const Color(0xFF7A6A5D),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'प्रत्यक्ष भेट',
                                style: TextStyle(
                                  color: _locationToggle == 0 ? Colors.white : const Color(0xFF7A6A5D),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _locationToggle = 1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _locationToggle == 1 ? const Color(0xFF8B1E1E) : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.videocam_rounded,
                                size: 16,
                                color: _locationToggle == 1 ? Colors.white : const Color(0xFF7A6A5D),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'ऑनलाइन भेट',
                                style: TextStyle(
                                  color: _locationToggle == 1 ? Colors.white : const Color(0xFF7A6A5D),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            if (_locationToggle == 0) ...[
              TextField(
                controller: _venueController,
                decoration: InputDecoration(
                  hintText: 'भेटीचे ठिकाण उदा. हॉटेल, कार्यालय, किंवा शहर...',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  prefixIcon: const Icon(Icons.place_outlined, size: 20, color: Color(0xFF7A6A5D)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                ),
              ),
            ] else ...[
              TextField(
                controller: _onlineLinkController,
                decoration: InputDecoration(
                  hintText: 'Google Meet / Zoom लिंक (पर्यायी)...',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  prefixIcon: const Icon(Icons.link_rounded, size: 20, color: Color(0xFF1565C0)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 22),

            // Section 5: Notes
            _buildSectionHeader('५. टिपण्णी / अजेंडा (Notes)', Icons.notes_rounded),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'बैठकीत काय चर्चा करायची आहे याबद्दल थोडक्यात लिहा...',
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.all(14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE0D5C9)),
                ),
              ),
            ),

            const SizedBox(height: 30),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8B1E1E),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey.shade400,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 2,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                      )
                    : const Text(
                        'विनंती पाठवा (Send Request)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF8B1E1E)),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14.5,
            fontWeight: FontWeight.w800,
            color: Color(0xFF2B1B12),
          ),
        ),
      ],
    );
  }
}
