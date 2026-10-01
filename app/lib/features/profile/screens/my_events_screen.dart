import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../widgets/profile_subpage_header.dart';

class _EventEntry {
  const _EventEntry(this.title, this.date, this.venue, this.status, this.icon);
  final String title;
  final String date;
  final String venue;
  final String status; // 'नोंदणीकृत' | 'पूर्ण झाले'
  final IconData icon;
}

/// "माझे कार्यक्रम" — the member's registered/attended community events.
class MyEventsScreen extends StatefulWidget {
  const MyEventsScreen({super.key});

  @override
  State<MyEventsScreen> createState() => _MyEventsScreenState();
}

class _MyEventsScreenState extends State<MyEventsScreen> {
  int _tab = 0; // 0 = upcoming, 1 = past

  static const _upcoming = [
    _EventEntry(
      'शिवजयंती महोत्सव २०२६',
      '१९ फेब्रुवारी, सकाळी ९:०० वा.',
      'शिवाजी मैदान, पुणे',
      'नोंदणीकृत',
      Icons.celebration_rounded,
    ),
    _EventEntry(
      'रायगड ट्रेक व स्वच्छता मोहीम',
      '८ मार्च, सकाळी ६:०० वा.',
      'रायगड किल्ला',
      'नोंदणीकृत',
      Icons.hiking_rounded,
    ),
  ];

  static const _past = [
    _EventEntry(
      'व्यवसाय संगम मेळावा',
      '१२ जानेवारी',
      'हॉटेल ग्रँड, पुणे',
      'पूर्ण झाले',
      Icons.handshake_rounded,
    ),
    _EventEntry(
      'रक्तदान शिबिर',
      '५ डिसेंबर',
      'सामाजिक सभागृह, कोल्हापूर',
      'पूर्ण झाले',
      Icons.bloodtype_rounded,
    ),
    _EventEntry(
      'सिंहगड सूर्योदय ट्रेक',
      '१६ नोव्हेंबर',
      'सिंहगड किल्ला',
      'पूर्ण झाले',
      Icons.terrain_rounded,
    ),
  ];

  void _showMessage(String message) {
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
          style: GoogleFonts.mukta(
            color: const Color(0xFF2B1B12),
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
    final list = _tab == 0 ? _upcoming : _past;
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      body: SafeArea(
        child: Column(
          children: [
            const ProfileSubPageHeader(
              title: 'माझे कार्यक्रम',
              subtitle: 'नोंदणी केलेले आणि आगामी कार्यक्रम',
              icon: Icons.calendar_today_outlined,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: _tabChip(
                      'आगामी (${_upcoming.length})',
                      _tab == 0,
                      () => setState(() => _tab = 0),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _tabChip(
                      'मागील (${_past.length})',
                      _tab == 1,
                      () => setState(() => _tab = 1),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                physics: const BouncingScrollPhysics(),
                itemCount: list.length,
                itemBuilder: (context, i) {
                  final e = list[i];
                  final done = e.status == 'पूर्ण झाले';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(8),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFBEFE6),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            e.icon,
                            color: const Color(0xFFE84C10),
                            size: 21,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                e.title,
                                style: GoogleFonts.mukta(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF1F2937),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '🗓️ ${e.date}',
                                style: GoogleFonts.mukta(
                                  fontSize: 11.5,
                                  color: const Color(0xFF6B7280),
                                ),
                              ),
                              Text(
                                '📍 ${e.venue}',
                                style: GoogleFonts.mukta(
                                  fontSize: 11.5,
                                  color: const Color(0xFF6B7280),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 3,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          done
                                              ? const Color(0xFFF3F4F6)
                                              : const Color(0xFFEAF5EE),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      e.status,
                                      style: GoogleFonts.mukta(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color:
                                            done
                                                ? const Color(0xFF6B7280)
                                                : const Color(0xFF2E7D32),
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  if (!done)
                                    GestureDetector(
                                      onTap:
                                          () => _showMessage(
                                            '${e.title} — तिकीट दाखवले',
                                          ),
                                      child: Text(
                                        'तिकीट पहा',
                                        style: GoogleFonts.mukta(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: const Color(0xFFE84C10),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tabChip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFE84C10) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? Colors.transparent : const Color(0xFFE5DCD0),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.mukta(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: selected ? Colors.white : const Color(0xFF6B7280),
          ),
        ),
      ),
    );
  }
}
