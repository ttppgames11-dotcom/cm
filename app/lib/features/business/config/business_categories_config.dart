/// Fixed category list for business creation and editing as specified in configuration.
class BusinessCategoryOption {
  final String id;
  final String labelMr;
  final String emoji;

  const BusinessCategoryOption({
    required this.id,
    required this.labelMr,
    required this.emoji,
  });
}

/// One fixed list in a config file for category dropdown in "Add Your Business".
const List<BusinessCategoryOption> kBusinessCategoryOptions = [
  BusinessCategoryOption(id: 'restaurant', labelMr: 'हॉटेल्स व केटरिंग', emoji: '🍛'),
  BusinessCategoryOption(id: 'shopping', labelMr: 'खरेदी व किरकोळ विक्री (Retail)', emoji: '🛍️'),
  BusinessCategoryOption(id: 'realestate', labelMr: 'रिअल इस्टेट व बांधकाम', emoji: '🏗️'),
  BusinessCategoryOption(id: 'healthcare', labelMr: 'आरोग्य सेवा व क्लिनिक', emoji: '🩺'),
  BusinessCategoryOption(id: 'it', labelMr: 'IT व सॉफ्टवेअर सेवा', emoji: '💻'),
  BusinessCategoryOption(id: 'manufacturing', labelMr: 'उत्पादन व उद्योग (Manufacturing)', emoji: '⚙️'),
  BusinessCategoryOption(id: 'travel', labelMr: 'प्रवास, वाहतूक व पर्यटन', emoji: '🚌'),
  BusinessCategoryOption(id: 'services', labelMr: 'व्यावसायिक व कायदेशीर सल्ला सेवा', emoji: '🤝'),
  BusinessCategoryOption(id: 'agriculture', labelMr: 'कृषी व प्रक्रिया उद्योग', emoji: '🌾'),
  BusinessCategoryOption(id: 'dairy', labelMr: 'दुग्धव्यवसाय व संकलन', emoji: '🥛'),
  BusinessCategoryOption(id: 'education', labelMr: 'शिक्षण व प्रशिक्षण संस्था', emoji: '📚'),
  BusinessCategoryOption(id: 'other', labelMr: 'इतर व्यवसाय', emoji: '✨'),
];
