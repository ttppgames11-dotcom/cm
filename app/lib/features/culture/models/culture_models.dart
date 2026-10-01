/// Data types for the Culture pages (content in culture_data.dart, generated
/// from the website sources).
library;

class CultureRegion {
  const CultureRegion({
    required this.id,
    required this.name,
    required this.icon,
    required this.marathiName,
    required this.districts,
    required this.tagline,
    required this.dialects,
    required this.lifestyle,
    required this.foodCulture,
    required this.highlights,
    required this.forts,
    required this.temples,
    required this.gramdevats,
    required this.foods,
    required this.jatras,
    required this.folkArts,
    required this.festivals,
    required this.reference,
  });

  final String id;
  final String name;
  final String icon;
  final String marathiName;
  final List<String> districts;
  final String tagline;
  final List<String> dialects;
  final String lifestyle;
  final String foodCulture;
  final List<String> highlights;
  final List<String> forts;
  final List<String> temples;
  final List<String> gramdevats;
  final List<String> foods;
  final List<String> jatras;
  final List<String> folkArts;
  final List<String> festivals;
  final String reference;
}

/// A one-day heritage route (culture hub).
class HeritageRoute {
  const HeritageRoute({
    required this.title,
    required this.region,
    required this.duration,
    required this.steps,
    required this.references,
  });

  final String title;
  final String region;
  final String duration;

  /// (time, place, description)
  final List<(String, String, String)> steps;
  final String references;
}

class FoodItem {
  const FoodItem({
    required this.id,
    required this.name,
    required this.region,
    required this.category,
    required this.ingredients,
    required this.preparation,
    required this.occasion,
    required this.community,
    required this.history,
    required this.whereToExperience,
    required this.source,
  });

  final String id;
  final String name;
  final String region;
  final String category;
  final List<String> ingredients;
  final String preparation;
  final String occasion;
  final String community;
  final String history;
  final String whereToExperience;
  final String source;
}

class Dialect {
  const Dialect({
    required this.id,
    required this.name,
    required this.region,
    required this.speakers,
    required this.characteristics,
    required this.proverb,
    required this.proverbMeaning,
    required this.sample,
    required this.english,
    required this.source,
  });

  final String id;
  final String name;
  final String region;
  final String speakers;
  final String characteristics;
  final String proverb;
  final String proverbMeaning;
  final String sample;
  final String english;
  final String source;
}

class PhraseComparison {
  const PhraseComparison({
    required this.label,
    required this.standard,
    required this.english,
    required this.variants,
  });

  final String label;
  final String standard;
  final String english;

  /// (dialect, region, text, notes)
  final List<(String, String, String, String)> variants;
}

class Gramdevat {
  const Gramdevat({
    required this.id,
    required this.name,
    required this.type,
    required this.region,
    required this.location,
    required this.deity,
    required this.originStory,
    required this.dynasty,
    required this.period,
    required this.architecture,
    required this.communities,
    required this.jatraDate,
    required this.rituals,
    required this.connectedFort,
    required this.connectedFood,
    required this.source,
  });

  final String id;
  final String name;
  final String type;
  final String region;
  final String location;
  final String deity;
  final String originStory;
  final String dynasty;
  final String period;
  final String architecture;
  final String communities;
  final String jatraDate;
  final List<String> rituals;
  final String connectedFort;
  final String connectedFood;
  final String source;
}

class FolkTradition {
  const FolkTradition({
    required this.id,
    required this.category,
    required this.name,
    required this.region,
    required this.roots,
    required this.occasion,
    required this.elements,
    required this.modernStatus,
    required this.source,
  });

  final String id;
  final String category;
  final String name;
  final String region;
  final String roots;
  final String occasion;
  final List<String> elements;
  final String modernStatus;
  final String source;

  bool get isGame => category.contains('खेळ');
}

class HeritagePlace {
  const HeritagePlace({
    required this.id,
    required this.title,
    required this.category,
    required this.region,
    required this.district,
    required this.location,
    required this.lat,
    required this.lng,
    required this.altitude,
    required this.trek,
    required this.baseVillage,
    required this.description,
    required this.significance,
    required this.connectedFort,
    required this.connectedTemple,
    required this.connectedFood,
    required this.tourRoute,
    required this.reference,
    required this.sitePlan,
  });

  final String id;
  final String title;
  final String category;
  final String region;
  final String district;
  final String location;
  final double lat;
  final double lng;
  final String altitude;
  final String trek;
  final String baseVillage;
  final String description;
  final String significance;
  final String connectedFort;
  final String connectedTemple;
  final String connectedFood;
  final String tourRoute;
  final String reference;

  /// (name, description)
  final List<(String, String)> sitePlan;
}

class EvidenceLevel {
  const EvidenceLevel({
    required this.key,
    required this.label,
    required this.badge,
    required this.color,
    required this.description,
  });

  final String key;
  final String label;
  final String badge;

  /// ARGB colour value.
  final int color;
  final String description;
}

class ShivkalFestival {
  const ShivkalFestival({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.season,
    required this.evidence,
    required this.category,
    required this.icon,
    required this.tags,
    required this.documentedFacts,
    required this.reconstruction,
    required this.modernDistinction,
    required this.places,
  });

  final String id;
  final String title;
  final String subtitle;
  final String season;

  /// Key into CultureData.evidenceLevels.
  final String evidence;
  final String category;
  final String icon;
  final List<String> tags;
  final List<String> documentedFacts;
  final List<String> reconstruction;
  final String modernDistinction;
  final List<String> places;
}

class FestivalComparison {
  const FestivalComparison({
    required this.title,
    required this.festival,
    required this.shivkalTime,
    required this.modernTime,
    required this.caution,
    required this.rows,
  });

  final String title;
  final String festival;
  final String shivkalTime;
  final String modernTime;
  final String caution;

  /// (aspect, then, now)
  final List<(String, String, String)> rows;
}

class Temple {
  const Temple({
    required this.id,
    required this.name,
    required this.category,
    required this.place,
    required this.aartiTimes,
    required this.description,
    required this.history,
    required this.icon,
  });

  final String id;
  final String name;
  final String category;
  final String place;
  final String aartiTimes;
  final String description;
  final String history;
  final String icon;
}

class Weapon {
  const Weapon({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.description,
    required this.specs,
  });

  final String name;
  final String subtitle;
  final String icon;
  final String description;

  /// (label, value)
  final List<(String, String)> specs;
}

class Book {
  const Book({
    required this.title,
    required this.author,
    required this.category,
    required this.tag,
    required this.pages,
    required this.cover,
    required this.description,
  });

  final String title;
  final String author;
  final String category;
  final String tag;
  final String pages;
  final String cover;
  final String description;
}

class Film {
  const Film({
    required this.title,
    required this.year,
    required this.category,
    required this.genre,
    required this.cast,
    required this.description,
  });

  final String title;
  final String year;
  final String category;
  final String genre;
  final String cast;
  final String description;
}
