import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/home_theme.dart';
import '../widgets/business_page_header.dart';

class _HubItem {
  const _HubItem(this.label, this.icon, {this.route, this.message});
  final String label;
  final IconData icon;
  final String? route;
  final String? message;

  bool get isComingSoon => route == null;
}

class _HubGroup {
  const _HubGroup(this.title, this.accentColor, this.items);
  final String title;
  final Color accentColor;
  final List<_HubItem> items;
}

/// "व्यवसाय व संधी" hub — mirrors the website's mega-menu under that name:
/// Business Sangam, Industry & Networking, Jobs & Education, and
/// Industry/Bank/Developers. Each item either opens its ported screen or,
/// for the larger workflow pages not yet built (jobs board, meetings,
/// referrals, service booking), is marked "लवकरच" (coming soon) and shows
/// a message on tap — consistent with how the rest of the app handles
/// unfinished features.
class BusinessHubScreen extends StatelessWidget {
  const BusinessHubScreen({super.key});

  static const _groups = [
    _HubGroup('बिझनेस संगम', HomeTheme.accentOrange, [
      _HubItem(
        'व्यवसाय निर्देशिका',
        Icons.storefront_rounded,
        route: '/business/directory',
      ),
      _HubItem(
        'चेंबर्स व लीडरशिप',
        Icons.groups_rounded,
        route: '/business/sangam',
      ),
      _HubItem(
        'सेवा बुकिंग विझार्ड',
        Icons.event_available_rounded,
        message: 'सेवा बुकिंग विझार्ड लवकरच येत आहे',
      ),
    ]),
    _HubGroup('उद्योग व नेटवर्किंग', HomeTheme.accentBlue, [
      _HubItem(
        'व्यवसाय संधी व सौदे',
        Icons.trending_up_rounded,
        route: '/business/directory',
      ),
      _HubItem(
        'रेफरल व व्यवसाय देवाणघेवाण',
        Icons.sync_alt_rounded,
        message: 'रेफरल व व्यवसाय देवाणघेवाण लवकरच येत आहे',
      ),
      _HubItem(
        '1-to-1 व्यावसायिक बैठका',
        Icons.calendar_month_rounded,
        message: '1-to-1 बैठका बुकिंग लवकरच येत आहे',
      ),
    ]),
    _HubGroup('रोजगार व शिक्षण', HomeTheme.accentGreen, [
      _HubItem(
        'रोजगार व करिअर केंद्र',
        Icons.work_rounded,
        message: 'रोजगार व करिअर केंद्र लवकरच येत आहे',
      ),
      _HubItem(
        'उच्च शिक्षण व शिष्यवृत्ती',
        Icons.school_rounded,
        message: 'उच्च शिक्षण व शिष्यवृत्ती विभाग लवकरच येत आहे',
      ),
      _HubItem(
        'प्रोफेशनल्स डिरेक्टरी',
        Icons.badge_rounded,
        route: '/community',
      ),
    ]),
    _HubGroup('उद्योग व डेव्हलपर्स', HomeTheme.accentRed, [
      _HubItem(
        'मराठा बिल्डर्स व डेव्हलपर्स',
        Icons.apartment_rounded,
        route: '/business/builders',
      ),
      _HubItem(
        'मराठा दूध व संकलन केंद्र',
        Icons.water_drop_rounded,
        route: '/business/dairy',
      ),
      _HubItem(
        'मराठा मॅन्युफॅक्चरर्स',
        Icons.precision_manufacturing_rounded,
        route: '/business/manufacturers',
      ),
      _HubItem(
        'B2B संधी व सौदे',
        Icons.handshake_rounded,
        route: '/business/directory',
      ),
    ]),
  ];

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
              title: 'व्यवसाय व संधी',
              subtitle:
                  'निर्देशिका, नेटवर्किंग, रोजगार आणि उद्योग सेवा — सर्व एका ठिकाणी.',
              icon: Icons.storefront_rounded,
              accentColor: HomeTheme.primaryOrange,
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
                physics: const BouncingScrollPhysics(),
                children:
                    _groups
                        .map(
                          (group) => Padding(
                            padding: const EdgeInsets.only(bottom: 20),
                            child: _GroupSection(
                              group: group,
                              onTap: (item) {
                                if (item.route != null) {
                                  context.push(item.route!);
                                } else if (item.message != null) {
                                  _showMessage(context, item.message!);
                                }
                              },
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

class _GroupSection extends StatelessWidget {
  const _GroupSection({required this.group, required this.onTap});

  final _HubGroup group;
  final void Function(_HubItem) onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 16,
              decoration: BoxDecoration(
                color: group.accentColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Text(group.title, style: HomeTheme.marathiHeading(fontSize: 15)),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: HomeTheme.softShadow,
          ),
          child: Column(
            children: [
              for (var i = 0; i < group.items.length; i++)
                InkWell(
                  onTap: () => onTap(group.items[i]),
                  borderRadius: BorderRadius.vertical(
                    top: i == 0 ? const Radius.circular(16) : Radius.zero,
                    bottom:
                        i == group.items.length - 1
                            ? const Radius.circular(16)
                            : Radius.zero,
                  ),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 13,
                    ),
                    decoration: BoxDecoration(
                      border:
                          i == group.items.length - 1
                              ? null
                              : const Border(
                                bottom: BorderSide(color: Color(0xFFF2EAE0)),
                              ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: group.accentColor.withAlpha(22),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            group.items[i].icon,
                            color: group.accentColor,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            group.items[i].label,
                            style: HomeTheme.marathiBody(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (group.items[i].isComingSoon)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'लवकरच',
                              style: HomeTheme.marathiBody(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: HomeTheme.textMuted,
                              ),
                            ),
                          )
                        else
                          const Icon(
                            Icons.chevron_right_rounded,
                            color: HomeTheme.textMuted,
                            size: 20,
                          ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
