import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'website_home_features_data.dart';

/// Section: Fort Architecture Classification (मराठा गडकोट स्थापत्यशास्त्र — त्रिविध वर्गीकरण)
/// Giri Durg, Jala Durg, and Bhuikot cards matching the website
class FortArchitectureSection extends StatelessWidget {
  final List<FortArchitecture> types;
  final ValueChanged<String>? onExploreForts;

  const FortArchitectureSection({
    super.key,
    this.types = FortArchitecture.types,
    this.onExploreForts,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 18,
                decoration: BoxDecoration(
                  color: const Color(0xFFE84C10),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'मराठा गडकोट स्थापत्यशास्त्र',
                  style: GoogleFonts.mukta(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF2B1B12),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'त्रिविध वर्गीकरण',
                style: GoogleFonts.mukta(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFD97706),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'सह्याद्री ते अरबी समुद्रापर्यंत पसरलेली ३५०+ अभेद्य लष्करी दुर्गांची रचना',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF7A6A5D),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 168,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: types.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final item = types[index];
                return InkWell(
                  onTap: () => onExploreForts?.call(item.categoryName),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    width: 220,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFFF2E6D8),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2B1B12).withAlpha(12),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(item.iconEmoji, style: const TextStyle(fontSize: 20)),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.categoryName,
                                  style: GoogleFonts.mukta(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF1F2937),
                                  ),
                                ),
                                Text(
                                  item.englishName,
                                  style: GoogleFonts.mukta(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF9CA3AF),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.description,
                          style: GoogleFonts.mukta(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF6B7280),
                            height: 1.25,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Spacer(),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: [
                            for (final fort in item.famousForts.take(3))
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFDF4EB),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFFFCE0C7)),
                                ),
                                child: Text(
                                  fort,
                                  style: GoogleFonts.mukta(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF9E360B),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
