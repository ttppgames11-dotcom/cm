import 'package:flutter/material.dart';

import '../../history/widgets/content_kit.dart';
import '../data/culture_data.dart';

/// मराठा पुस्तक संग्रह — a reading list (website: BooksLiteraturePage.jsx).
///
/// The website presents this as a shop (prices, ratings, "order placed,
/// delivered in 3–5 days", member discount) but no ordering exists behind it,
/// so the app shows the books without any of that.
class BooksScreen extends StatefulWidget {
  const BooksScreen({super.key});

  @override
  State<BooksScreen> createState() => _BooksScreenState();
}

class _BooksScreenState extends State<BooksScreen> {
  int _category = 0;

  @override
  Widget build(BuildContext context) {
    final cat = CultureData.bookCategories[_category];
    final books =
        _category == 0
            ? CultureData.books
            : CultureData.books.where((b) => b.category == cat).toList();

    return ContentPage(
      hero: const ContentHero(
        gradient: [Color(0xFF4E342E), Color(0xFF6D4C41)],
        badge: '📚 वाचा मराठ्यांचा अभिमान',
        title: 'मराठा पुस्तक संग्रह व साहित्य दालन',
        subtitle:
            'इतिहास, चरित्र, प्रेरणादायी आणि संशोधन ग्रंथांचे अमोल दालन — वाचा... समजा... अभिमानाने जगा !',
      ),
      children: [
        const SizedBox(height: 16),
        FilterChipBar(
          labels: CultureData.bookCategories,
          selected: _category,
          onSelected: (i) => setState(() => _category = i),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: CardList(
            emptyText: 'या विभागात पुस्तके नाहीत.',
            children: [
              for (final b in books)
                InfoCard(
                  emoji: b.cover,
                  title: b.title,
                  subtitle: '✍️ ${b.author}',
                  tag: b.tag,
                  body: b.description,
                  facts: [('विभाग', b.category), ('पृष्ठे', b.pages)],
                ),
            ],
          ),
        ),
        ContentSection(
          title: 'मराठा लेखक – साहित्याचे प्रेरणास्थान',
          subtitle:
              'शब्दांच्या शक्तीने समाजजागृती करणारे मराठी साहित्याचे शिल्पकार',
          child: CardList(
            children: [
              for (final a in CultureData.authors)
                InfoCard(emoji: '✒️', title: a.$1, subtitle: a.$2, tag: a.$3),
            ],
          ),
        ),
      ],
    );
  }
}
