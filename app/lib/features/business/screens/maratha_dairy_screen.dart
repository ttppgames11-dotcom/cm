import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';
import '../models/dairy_models.dart';

/// "मराठा दूध व संकलन केंद्र" — retail product catalogue plus a list of
/// farmer milk-collection centers. Ported from `MarathaDairyPage.jsx`.
class MarathaDairyScreen extends StatefulWidget {
  const MarathaDairyScreen({super.key});

  @override
  State<MarathaDairyScreen> createState() => _MarathaDairyScreenState();
}

class _MarathaDairyScreenState extends State<MarathaDairyScreen> {
  int _tab = 0; // 0 = products, 1 = centers

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
    return Scaffold(
      backgroundColor: HomeTheme.bgWarmCream,
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [HomeTheme.accentGreen, Color(0xFF1B5E20)],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () {
                      if (Navigator.of(context).canPop()) {
                        Navigator.of(context).pop();
                      } else {
                        context.go('/home');
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(60),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.arrow_back_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '🥛 मराठा दूध व संकलन केंद्र',
                    style: HomeTheme.headerSerif(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'शेतकऱ्यांकडून थेट, भेसळमुक्त दुग्धजन्य पदार्थ.',
                    style: HomeTheme.marathiBody(
                      fontSize: 12.5,
                      color: Colors.white.withAlpha(230),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _TabChip(
                          label: '🛒 उत्पादने',
                          selected: _tab == 0,
                          onTap: () => setState(() => _tab = 0),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _TabChip(
                          label: '🏭 संकलन केंद्रे',
                          selected: _tab == 1,
                          onTap: () => setState(() => _tab = 1),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(child: _tab == 0 ? _buildProducts() : _buildCenters()),
          ],
        ),
      ),
    );
  }

  Widget _buildProducts() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      physics: const BouncingScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.82,
      ),
      itemCount: dairyProducts.length,
      itemBuilder: (context, i) {
        final p = dairyProducts[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: HomeTheme.softShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(p.icon, style: const TextStyle(fontSize: 30)),
              const SizedBox(height: 8),
              Text(
                p.name,
                style: HomeTheme.marathiHeading(fontSize: 12.5),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                p.note,
                style: HomeTheme.marathiBody(
                  fontSize: 10.5,
                  color: HomeTheme.textMuted,
                ),
              ),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    p.price,
                    style: HomeTheme.marathiHeading(
                      fontSize: 14,
                      color: HomeTheme.accentGreen,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _showMessage('${p.name} कार्टमध्ये टाकले 🛒'),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1B5E20),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.add_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCenters() {
    return ListView(
      padding: const EdgeInsets.all(16),
      physics: const BouncingScrollPhysics(),
      children:
          collectionCenters
              .map(
                (c) => Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: HomeTheme.softShadow,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c.name,
                        style: HomeTheme.marathiHeading(fontSize: 15),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '📍 ${c.location}',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          color: HomeTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '⏰ ${c.timing}',
                        style: HomeTheme.marathiBody(
                          fontSize: 11.5,
                          color: HomeTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: _MiniStat(
                              label: 'दैनंदिन संकलन',
                              value: c.dailyCollection,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _MiniStat(
                              label: 'सरासरी फॅट',
                              value: c.avgFat,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _MiniStat(label: 'शेतकरी', value: c.farmers),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: GestureDetector(
                          onTap:
                              () => _showMessage(
                                '${c.name} ला कॉल करत आहे... 📞',
                              ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 9),
                            decoration: BoxDecoration(
                              color: HomeTheme.accentGreen,
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
                  ),
                ),
              )
              .toList(),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 9),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? Colors.white : Colors.white.withAlpha(40),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: HomeTheme.marathiBody(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: selected ? HomeTheme.accentGreen : Colors.white,
          ),
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
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
              fontSize: 12,
              color: HomeTheme.accentGreen,
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
