import 'package:flutter/material.dart';

import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// ऐतिहासिक दिनविशेष व शिवकालपट (website: HistoricalDatesPage.jsx).
class HistoricalDatesScreen extends StatefulWidget {
  const HistoricalDatesScreen({super.key});

  @override
  State<HistoricalDatesScreen> createState() => _HistoricalDatesScreenState();
}

class _HistoricalDatesScreenState extends State<HistoricalDatesScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final dates =
        q.isEmpty
            ? HistoryData.dates
            : HistoryData.dates
                .where(
                  (d) =>
                      d.title.toLowerCase().contains(q) ||
                      d.date.toLowerCase().contains(q) ||
                      d.description.toLowerCase().contains(q),
                )
                .toList();

    return ContentPage(
      hero: const ContentHero(
        badge: '📅 इतिहास कालदर्शिका',
        title: 'ऐतिहासिक दिनविशेष व शिवकालपट',
        subtitle:
            'शिवजन्मापासून शिवराज्याभिषेक आणि मराठा साम्राज्याच्या देदीप्यमान विजयांचे महत्त्वाचे ऐतिहासिक दिवस.',
      ),
      children: [
        ContentSearchField(
          hint: 'तारीख किंवा घटना शोधा (उदा. राज्याभिषेक, शिवजयंती)',
          onChanged: (v) => setState(() => _query = v),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: CardList(
            emptyText: 'अशी घटना सापडली नाही.',
            children: [
              for (final d in dates)
                DateEventCard(
                  date: d.date,
                  title: d.title,
                  place: d.place,
                  body: d.description,
                  tag: d.tag,
                ),
            ],
          ),
        ),
      ],
    );
  }
}
