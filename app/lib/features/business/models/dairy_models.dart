/// A retail dairy product, ported from the website's `MarathaDairyPage.jsx`
/// (`productsData`).
class DairyProduct {
  const DairyProduct({
    required this.name,
    required this.size,
    required this.price,
    required this.category,
    required this.icon,
    required this.note,
  });

  final String name;
  final String size;
  final String price;
  final String category;
  final String icon;
  final String note;
}

/// A milk collection center where local farmers deliver their produce,
/// ported from `MarathaDairyPage.jsx` (`collectionCentersData`).
class CollectionCenter {
  const CollectionCenter({
    required this.name,
    required this.location,
    required this.phone,
    required this.timing,
    required this.dailyCollection,
    required this.avgFat,
    required this.farmers,
  });

  final String name;
  final String location;
  final String phone;
  final String timing;
  final String dailyCollection;
  final String avgFat;
  final String farmers;
}

const dairyProducts = [
  DairyProduct(
    name: 'ताजे गाईचे दूध (५०० मि.ली.)',
    size: '500 ml',
    price: '₹२८',
    category: 'दूध',
    icon: '🥛',
    note: '३.८% फॅट',
  ),
  DairyProduct(
    name: 'ताजे गाईचे दूध (१ लिटर)',
    size: '1 Litre',
    price: '₹५४',
    category: 'दूध',
    icon: '🥛',
    note: '३.८% फॅट',
  ),
  DairyProduct(
    name: 'ताजे गोड दही (५०० ग्रॅम)',
    size: '500 gm',
    price: '₹३०',
    category: 'दही',
    icon: '🥣',
    note: 'नैसर्गिक चव',
  ),
  DairyProduct(
    name: 'शुद्ध मलाई पनीर (२०० ग्रॅम)',
    size: '200 gm',
    price: '₹३०',
    category: 'पनीर',
    icon: '🧀',
    note: 'उच्च प्रोटिन',
  ),
  DairyProduct(
    name: 'शुद्ध गाईचे तूप (५०० मि.ली.)',
    size: '500 ml',
    price: '₹३२०',
    category: 'तूप',
    icon: '🧈',
    note: 'पारंपरिक दाणेदार',
  ),
  DairyProduct(
    name: 'मसाला ताक / लस्सी (२५० मि.ली.)',
    size: '250 ml',
    price: '₹२५',
    category: 'लस्सी / ताक',
    icon: '🥤',
    note: 'थंडगार पाचक',
  ),
];

const collectionCenters = [
  CollectionCenter(
    name: 'संकलन केंद्र - इस्लामपूर',
    location: 'इस्लामपूर, ता. वाळवा, जि. सांगली, महाराष्ट्र',
    phone: '9865432100',
    timing: 'सकाळी ५:०० ते ११:००',
    dailyCollection: '१,२५० लिटर',
    avgFat: '४.२%',
    farmers: '३१० शेतकरी',
  ),
  CollectionCenter(
    name: 'संकलन केंद्र - शिरोळ',
    location: 'शिरोळ, ता. शिरोळ, जि. कोल्हापूर, महाराष्ट्र',
    phone: '9422087654',
    timing: 'सकाळी ५:३० ते ११:३०',
    dailyCollection: '९८० लिटर',
    avgFat: '४.३%',
    farmers: '२४० शेतकरी',
  ),
  CollectionCenter(
    name: 'संकलन केंद्र - कागल',
    location: 'कागल, ता. कागल, जि. कोल्हापूर, महाराष्ट्र',
    phone: '9158011223',
    timing: 'सकाळी ६:०० ते ११:००',
    dailyCollection: '७६५ लिटर',
    avgFat: '४.१%',
    farmers: '१९५ शेतकरी',
  ),
  CollectionCenter(
    name: 'संकलन केंद्र - हातकणंगले',
    location: 'हातकणंगले, ता. हातकणंगले, जि. कोल्हापूर, महाराष्ट्र',
    phone: '8805699887',
    timing: 'सकाळी ५:०० ते १०:३०',
    dailyCollection: '१,१२० लिटर',
    avgFat: '४.२%',
    farmers: '२८५ शेतकरी',
  ),
];
