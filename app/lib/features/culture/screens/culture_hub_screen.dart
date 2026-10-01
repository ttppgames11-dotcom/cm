import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';
import '../models/culture_models.dart';

/// महाराष्ट्र संस्कृती दालन — regions, one-day heritage routes and links to
/// every Culture page (website: MaharashtraCultureHubPage.jsx).
///
/// The website's "trip planner" only matches keywords to four fixed routes,
/// so the app lists those routes directly.
class CultureHubScreen extends StatelessWidget {
  const CultureHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ContentPage(
      hero: const ContentHero(
        imageAsset: 'assets/images/heritage_hero.webp',
        badge: '🏛️ महाराष्ट्र संस्कृती दालन',
        title: 'महाराष्ट्राची संस्कृती, बोली, खाद्य व लोकपरंपरा',
        subtitle:
            'कोकण ते विदर्भ — प्रदेशनिहाय जीवनशैली, ग्रामदैवते, जत्रा, सण-उत्सव, बोलीभाषा आणि अस्सल खाद्यसंस्कृती एकाच ठिकाणी.',
      ),
      children: [
        ContentSection(
          title: 'संस्कृती दालने',
          child: HubTileGrid(
            tiles: [
              HubTile(
                emoji: '🚩',
                title: 'शिवकालीन उत्सव',
                description: '१३ सण — पुरावे व परंपरा',
                onTap: () => context.push('/culture/shivkal-festivals'),
              ),
              HubTile(
                emoji: '🛕',
                title: 'ग्रामदैवत व जत्रा',
                description: 'कुलदैवते, जत्रा, नाट्य व देशी खेळ',
                onTap: () => context.push('/culture/gramdevat'),
              ),
              HubTile(
                emoji: '🙏',
                title: 'मंदिरे व तीर्थक्षेत्रे',
                description: 'कुलदैवते व अहिल्याबाईंचा वारसा',
                onTap: () => context.push('/culture/temples'),
              ),
              HubTile(
                emoji: '🍲',
                title: 'खाद्यसंस्कृती',
                description: 'प्रदेशनिहाय पारंपरिक पदार्थ',
                onTap: () => context.push('/culture/food'),
              ),
              HubTile(
                emoji: '🗣️',
                title: 'बोली व भाषा',
                description: 'एका वाक्याची प्रादेशिक रूपे',
                onTap: () => context.push('/culture/dialects'),
              ),
              HubTile(
                emoji: '🌊',
                title: 'आगरी-कोळी समाज',
                description: 'सागरी वारसा व कोळीवाडा',
                onTap: () => context.push('/culture/agri-koli'),
              ),
              HubTile(
                emoji: '🗺️',
                title: 'वारसा स्थळे',
                description: 'GPS सह किल्ले, लेणी व मंदिरे',
                onTap: () => context.push('/culture/heritage-places'),
              ),
              HubTile(
                emoji: '⚔️',
                title: 'शस्त्रे व प्रतीके',
                description: 'दांडपट्टा, वाघनखे, भवानी तलवार',
                onTap: () => context.push('/culture/symbols'),
              ),
              HubTile(
                emoji: '📚',
                title: 'पुस्तके व साहित्य',
                description: 'वाचनीय ग्रंथ व लेखक',
                onTap: () => context.push('/culture/books'),
              ),
              HubTile(
                emoji: '🎬',
                title: 'मराठी चित्रपट',
                description: 'ऐतिहासिक व लोकप्रिय चित्रपट',
                onTap: () => context.push('/culture/films'),
              ),
            ],
          ),
        ),
        ContentSection(
          title: 'प्रदेशनिहाय सांस्कृतिक ओळख',
          subtitle:
              'प्रदेश निवडा — बोली, किल्ले, ग्रामदैवते, जत्रा व खाद्यपदार्थ',
          child: CardList(
            children: [
              for (final r in CultureData.regions)
                InfoCard(
                  emoji: r.icon,
                  title: r.name,
                  subtitle: r.marathiName,
                  body: r.tagline,
                  actionLabel: 'प्रदेशाची सविस्तर ओळख →',
                  onAction: () => _showRegion(context, r),
                ),
            ],
          ),
        ),
        ContentSection(
          title: 'एक-दिवसीय वारसा मार्ग',
          subtitle:
              'किल्ले, मंदिरे व अस्सल स्थानिक जेवण — प्रदेशनिहाय सुचवलेले मार्ग',
          child: CardList(
            children: [
              for (final r in CultureData.heritageRoutes)
                InfoCard(
                  emoji: '🚗',
                  title: r.title,
                  subtitle: [
                    r.region,
                    r.duration,
                  ].where((s) => s.isNotEmpty).join(' • '),
                  footer: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 8),
                      for (final step in r.steps)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: DateEventCard(
                            date: step.$1,
                            title: step.$2,
                            body: step.$3,
                          ),
                        ),
                      Text(
                        'संदर्भ: ${r.references}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: HeritageColors.body,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  void _showRegion(BuildContext context, CultureRegion r) {
    showContentSheet(
      context,
      title: '${r.icon} ${r.name}',
      subtitle: r.marathiName,
      children: [
        const SizedBox(height: 8),
        BodyText(r.tagline),
        const MiniHeading('🏡 जीवनशैली'),
        BodyText(r.lifestyle),
        if (r.foodCulture.isNotEmpty) ...[
          const MiniHeading('🍲 खाद्यसंस्कृती'),
          BodyText(r.foodCulture),
        ],
        const MiniHeading('📍 जिल्हे'),
        TagWrap(tags: r.districts),
        const MiniHeading('🗣️ प्रमुख बोली'),
        TagWrap(tags: r.dialects),
        const MiniHeading('✨ सांस्कृतिक वैशिष्ट्ये'),
        BulletList(items: r.highlights),
        const MiniHeading('🏰 गड-किल्ले'),
        TagWrap(tags: r.forts),
        const MiniHeading('🛕 मंदिरे'),
        TagWrap(tags: r.temples),
        const MiniHeading('🙏 ग्रामदैवते'),
        TagWrap(tags: r.gramdevats),
        const MiniHeading('🎉 जत्रा'),
        BulletList(items: r.jatras),
        if (r.festivals.isNotEmpty) ...[
          const MiniHeading('🪔 सण-उत्सव'),
          TagWrap(tags: r.festivals),
        ],
        const MiniHeading('🎭 लोककला'),
        TagWrap(tags: r.folkArts),
        const MiniHeading('🍛 मुख्य खाद्यपदार्थ'),
        TagWrap(tags: r.foods),
        const MiniHeading('📖 संदर्भ'),
        BodyText(r.reference),
      ],
    );
  }
}
