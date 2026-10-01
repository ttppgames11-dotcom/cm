import 'package:flutter/material.dart';

import '../../../core/theme/home_theme.dart';
import '../models/sangam_models.dart';
import '../widgets/business_page_header.dart';

/// "चेंबर्स व लीडरशिप" — local business-networking chapters ("मंडळ"), where
/// members meet weekly to refer business to each other. Ported from the
/// website's `BusinessSangamPage.jsx`.
class BusinessSangamScreen extends StatelessWidget {
  const BusinessSangamScreen({super.key});

  void _showMessage(BuildContext context, String message) {
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
    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: Column(
          children: [
            const BusinessPageHeader(
              title: 'व्यवसाय मंडळ (Chapters)',
              subtitle:
                  'साप्ताहिक भेटणारे स्थानिक व्यवसाय गट — एकमेकांना संधी, संदर्भ आणि व्यवसाय द्या.',
              icon: Icons.groups_rounded,
              accentColor: HomeTheme.accentBlue,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                physics: const BouncingScrollPhysics(),
                children:
                    businessChapters
                        .map(
                          (chapter) => Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: _ChapterCard(
                              chapter: chapter,
                              onJoin:
                                  () => _showMessage(
                                    context,
                                    '${chapter.marathiName} साठी सहभाग विनंती पाठवली!',
                                  ),
                            ),
                          ),
                        )
                        .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChapterCard extends StatelessWidget {
  const _ChapterCard({required this.chapter, required this.onJoin});

  final BusinessChapter chapter;
  final VoidCallback onJoin;

  @override
  Widget build(BuildContext context) {
    final seatsFull = chapter.openSeats == 0;
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
            children: [
              Expanded(
                child: Text(
                  chapter.marathiName,
                  style: HomeTheme.marathiHeading(fontSize: 16),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color:
                      seatsFull
                          ? const Color(0xFFFDEBEC)
                          : const Color(0xFFEAF5EE),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  seatsFull
                      ? 'जागा भरल्या'
                      : '${chapter.openSeats} जागा उपलब्ध',
                  style: HomeTheme.marathiBody(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color:
                        seatsFull
                            ? const Color(0xFFD32F2F)
                            : const Color(0xFF2E7D32),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '📍 ${chapter.venue}  •  🗓️ दर ${chapter.meetingDay}, ${chapter.meetingTime}',
            style: HomeTheme.marathiBody(
              fontSize: 12,
              color: HomeTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _StatTile(
                  label: 'सदस्य क्षमता',
                  value:
                      '${chapter.capacity - chapter.openSeats}/${chapter.capacity}',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _StatTile(
                  label: 'मासिक व्यवसाय',
                  value: BusinessChapter.formatCurrency(
                    chapter.monthlyBusiness,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _StatTile(
                  label: 'एकूण उलाढाल',
                  value: BusinessChapter.formatCurrency(
                    chapter.totalClosedValue,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'या महिन्यात ${chapter.monthlyOpportunities} व्यवसाय संधी व ${chapter.visitors} पाहुणे सहभागी.',
            style: HomeTheme.marathiBody(
              fontSize: 11.5,
              color: HomeTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: GestureDetector(
              onTap: seatsFull ? null : onJoin,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color:
                      seatsFull
                          ? const Color(0xFFE5E7EB)
                          : HomeTheme.accentBlue,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  seatsFull
                      ? 'सध्या जागा उपलब्ध नाहीत'
                      : 'सहभागी होण्यासाठी विनंती करा',
                  style: HomeTheme.marathiBody(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: seatsFull ? const Color(0xFF6B7280) : Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(
            value,
            textAlign: TextAlign.center,
            style: HomeTheme.marathiHeading(
              fontSize: 12.5,
              color: HomeTheme.accentBlue,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: HomeTheme.marathiBody(
              fontSize: 10.5,
              color: HomeTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
