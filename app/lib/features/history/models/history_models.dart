/// Data types for the History part 2 pages (content in history_part2_data.dart).
library;

class DnyankoshEntry {
  const DnyankoshEntry({
    required this.id,
    required this.name,
    required this.category,
    required this.icon,
    required this.meta,
    this.route,
  });

  final String id;
  final String name;
  final String category;
  final String icon;
  final String meta;

  /// App page for this entry, when one exists.
  final String? route;
}

class Granth {
  const Granth({
    required this.id,
    required this.title,
    required this.author,
    required this.category,
    required this.level,
    required this.description,
    required this.pages,
    required this.language,
    required this.tag,
  });

  final String id;
  final String title;
  final String author;
  final String category;
  final String level;
  final String description;
  final String pages;
  final String language;
  final String tag;
}

/// A minister of the Ashtapradhan council.
class Pradhan {
  const Pradhan({
    required this.id,
    required this.postMr,
    required this.postEn,
    required this.persianTitle,
    required this.sanskritTitle,
    required this.name,
    required this.period,
    required this.salary,
    required this.motto,
    required this.color,
    required this.category,
    required this.icon,
    required this.duties,
    required this.powers,
    required this.subordinates,
    required this.source,
  });

  final String id;
  final String postMr;
  final String postEn;
  final String persianTitle;
  final String sanskritTitle;
  final String name;
  final String period;
  final String salary;
  final String motto;

  /// ARGB colour value.
  final int color;
  final String category;
  final String icon;
  final String duties;
  final List<String> powers;
  final List<String> subordinates;
  final String source;
}

class Movement {
  const Movement({
    required this.id,
    required this.category,
    required this.categoryLabel,
    required this.title,
    required this.period,
    required this.participants,
    required this.locations,
    required this.description,
    required this.demands,
    required this.outcomes,
  });

  final String id;
  final String category;
  final String categoryLabel;
  final String title;
  final String period;
  final String participants;
  final String locations;
  final String description;
  final List<String> demands;
  final List<String> outcomes;
}

/// A historical event and everything linked to it (people, places, route…).
class KnowledgeEvent {
  const KnowledgeEvent({
    required this.id,
    required this.title,
    required this.date,
    required this.epoch,
    required this.location,
    required this.summary,
    required this.confidence,
    required this.source,
    required this.people,
    required this.places,
    required this.artifacts,
    required this.route,
    required this.cuisine,
  });

  final String id;
  final String title;
  final String date;
  final String epoch;
  final String location;
  final String summary;
  final String confidence;
  final String source;

  /// (name, role)
  final List<(String, String)> people;

  /// (name, type, district)
  final List<(String, String, String)> places;
  final List<String> artifacts;
  final List<String> route;
  final List<String> cuisine;
}

class HeritageTrail {
  const HeritageTrail({
    required this.id,
    required this.title,
    required this.route,
    required this.region,
    required this.difficulty,
    required this.difficultyColor,
    required this.time,
    required this.distance,
    required this.description,
    required this.forts,
    required this.highlights,
    required this.bestSeason,
  });

  final String id;
  final String title;
  final String route;
  final String region;
  final String difficulty;

  /// ARGB colour value.
  final int difficultyColor;
  final String time;
  final String distance;
  final String description;
  final List<String> forts;
  final String highlights;
  final String bestSeason;
}

class QuizQuestion {
  const QuizQuestion({
    required this.id,
    required this.category,
    required this.question,
    required this.options,
    required this.correct,
    required this.explanation,
    required this.source,
    this.hint,
  });

  final String id;

  /// One of the website's quiz category ids (see quizCategoryLabels).
  final String category;
  final String question;
  final List<String> options;

  /// Index into [options].
  final int correct;
  final String? hint;
  final String explanation;
  final String source;
}
