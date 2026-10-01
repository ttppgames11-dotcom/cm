import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/history_data.dart';
import '../widgets/content_kit.dart';

/// स्वराज्याचे अमर वीर व वीरांगना (website: WarriorsPage.jsx).
class WarriorsScreen extends StatefulWidget {
  const WarriorsScreen({super.key});

  @override
  State<WarriorsScreen> createState() => _WarriorsScreenState();
}

class _WarriorsScreenState extends State<WarriorsScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final warriors =
        q.isEmpty
            ? HistoryData.warriors
            : HistoryData.warriors
                .where(
                  (w) =>
                      w.name.toLowerCase().contains(q) ||
                      w.title.toLowerCase().contains(q) ||
                      w.deed.toLowerCase().contains(q),
                )
                .toList();

    return ContentPage(
      hero: const ContentHero(
        badge: '🚩 स्वराज्याचे अमर वीर शिलेदार',
        title: 'स्वराज्याचे अमर वीर व वीरांगना',
        subtitle:
            'तानाजी, बाजीप्रभू, मुरारबाजी, शिवा काशिद, हंबीरराव, संताजी-धनाजी आणि लाखो निष्ठावंत मावळे — ज्यांच्या रक्ताने हिंदवी स्वराज्याची इमारत उभी राहिली.',
      ),
      children: [
        ContentSearchField(
          hint: 'वीरांचे नाव किंवा पराक्रम शोधा (उदा. तानाजी, बाजीप्रभू)',
          onChanged: (v) => setState(() => _query = v),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: CardList(
            emptyText: 'या नावाचे वीर सापडले नाहीत.',
            children: [
              for (final w in warriors)
                InfoCard(
                  emoji: w.icon,
                  title: w.name,
                  subtitle: w.role,
                  highlight: w.title,
                  body: w.deed,
                  actionLabel:
                      w.warriorId != null ? 'सविस्तर शौर्यगाथा वाचा →' : null,
                  onAction:
                      w.warriorId != null
                          ? () => context.push('/warrior/${w.warriorId}')
                          : null,
                ),
            ],
          ),
        ),
      ],
    );
  }
}
