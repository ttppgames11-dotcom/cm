import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';
import '../models/culture_models.dart';

/// महाराष्ट्र वारसा स्थळे (website: InteractiveHeritageMapPage.jsx).
///
/// On a phone the places are listed, each with its GPS location opening in
/// the maps app, instead of a drawn map.
class HeritagePlacesScreen extends StatefulWidget {
  const HeritagePlacesScreen({super.key});

  @override
  State<HeritagePlacesScreen> createState() => _HeritagePlacesScreenState();
}

class _HeritagePlacesScreenState extends State<HeritagePlacesScreen> {
  int _layer = 0;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final layer = CultureData.placeLayers[_layer].$1;
    final q = _query.trim().toLowerCase();
    final places =
        CultureData.heritagePlaces.where((p) {
          final matchLayer = layer == 'all' || p.category == layer;
          final matchQuery =
              q.isEmpty ||
              p.title.toLowerCase().contains(q) ||
              p.district.toLowerCase().contains(q) ||
              p.location.toLowerCase().contains(q);
          return matchLayer && matchQuery;
        }).toList();

    return ContentPage(
      hero: const ContentHero(
        imageAsset: 'assets/images/rajgad_carousel_4.webp',
        badge: '🗺️ महाराष्ट्र वारसा नकाशा',
        title: 'महाराष्ट्र वारसा, गड-किल्ले व सांस्कृतिक स्थळे',
        subtitle:
            'किल्ले, प्राचीन लेणी, मंदिरे, ग्रामदैवते, युनेस्को जागतिक वारसास्थळे आणि स्थानिक खाद्यसंस्कृती — अचूक GPS स्थान, अंतर्गत स्थापत्य आराखडा व पायथा गाव मार्गदर्शनासह.',
      ),
      children: [
        ContentSearchField(
          hint: 'स्थळ, जिल्हा किंवा गाव शोधा',
          onChanged: (v) => setState(() => _query = v),
        ),
        const SizedBox(height: 12),
        FilterChipBar(
          labels: [for (final l in CultureData.placeLayers) l.$2],
          selected: _layer,
          onSelected: (i) => setState(() => _layer = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText:
                'कोणतेही स्थळ आढळले नाही. कृपया इतर शोध शब्द किंवा विभाग निवडा.',
            children: [
              for (final p in places)
                InfoCard(
                  emoji: _icon(p.category),
                  title: p.title,
                  subtitle: '📍 ${p.location}',
                  tag: p.region,
                  body: p.description,
                  actionLabel: 'सविस्तर माहिती व नकाशा →',
                  onAction: () => _showPlace(context, p),
                ),
            ],
          ),
        ),
      ],
    );
  }

  static String _icon(String category) => switch (category) {
    'forts' => '🏰',
    'temples' => '🛕',
    'gramdevat' => '🙏',
    'unesco' => '🏛️',
    'food' => '🍲',
    'jatra' => '🎉',
    _ => '📍',
  };

  Future<void> _openInMaps(HeritagePlace p) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}',
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('नकाशा उघडता आला नाही.')));
    }
  }

  void _showPlace(BuildContext context, HeritagePlace p) {
    showContentSheet(
      context,
      title: '${_icon(p.category)} ${p.title}',
      subtitle: '📍 ${p.location} • ${p.region}',
      children: [
        const SizedBox(height: 10),
        FilledButton.icon(
          onPressed: () => _openInMaps(p),
          icon: const Icon(Icons.map_rounded),
          label: const Text('Google Maps मध्ये उघडा'),
          style: FilledButton.styleFrom(
            backgroundColor: HeritageColors.maroon,
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
        const SizedBox(height: 10),
        InfoCard(
          title: 'स्थळ माहिती',
          facts: [
            if (p.altitude.isNotEmpty) ('उंची', p.altitude),
            if (p.trek.isNotEmpty) ('चढाई', p.trek),
            if (p.baseVillage.isNotEmpty) ('पायथा गाव', p.baseVillage),
            ('GPS', '${p.lat}, ${p.lng}'),
          ],
        ),
        const MiniHeading('📜 ऐतिहासिक महत्त्व'),
        BodyText(p.significance.isEmpty ? p.description : p.significance),
        if (p.sitePlan.isNotEmpty) ...[
          const MiniHeading('🏰 अंतर्गत स्थापत्य आराखडा (Site Plan)'),
          CardList(
            children: [
              for (final s in p.sitePlan) InfoCard(title: s.$1, body: s.$2),
            ],
          ),
        ],
        if (p.tourRoute.isNotEmpty) ...[
          const MiniHeading('🚗 प्रवास मार्ग'),
          BodyText(p.tourRoute),
        ],
        if (p.connectedFort.isNotEmpty ||
            p.connectedTemple.isNotEmpty ||
            p.connectedFood.isNotEmpty) ...[
          const MiniHeading('🔗 जवळील वारसा'),
          InfoCard(
            title: 'संबंधित ठिकाणे व खाद्य',
            facts: [
              if (p.connectedFort.isNotEmpty) ('किल्ले', p.connectedFort),
              if (p.connectedTemple.isNotEmpty) ('मंदिरे', p.connectedTemple),
              if (p.connectedFood.isNotEmpty) ('खाद्य', p.connectedFood),
            ],
          ),
        ],
        if (p.reference.isNotEmpty) ...[
          const MiniHeading('📖 संदर्भ'),
          BodyText(p.reference),
        ],
      ],
    );
  }
}
