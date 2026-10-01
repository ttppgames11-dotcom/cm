import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'website_home_features_data.dart';

/// Section: Ashtapradhan Council (छत्रपती शिवाजी महाराजांचे अष्टप्रधान मंडळ)
/// Displays the 8 ministers and ministries of Swarajya in a smooth horizontal scroll
class AshtapradhanSection extends StatelessWidget {
  final List<AshtapradhanMember> members;
  final VoidCallback? onSeeAll;

  const AshtapradhanSection({
    super.key,
    this.members = AshtapradhanMember.council,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
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
                        'अष्टप्रधान मंडळ (मंत्रिमंडळ)',
                        style: GoogleFonts.mukta(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF2B1B12),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (onSeeAll != null)
                GestureDetector(
                  onTap: onSeeAll,
                  child: Text(
                    'सर्व ८ पदे →',
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFE84C10),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '१६७४ च्या राज्याभिषेकानंतर शिवरायांनी स्थापन केलेले आधुनिक प्रशासन',
            style: GoogleFonts.mukta(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF7A6A5D),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 148,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              itemCount: members.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final item = members[index];
                return Container(
                  width: 200,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: const Color(0xFFF0E4D7),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF2B1B12).withAlpha(10),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF2EC),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              item.icon,
                              size: 16,
                              color: const Color(0xFFE84C10),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.designation,
                                  style: GoogleFonts.mukta(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF1F2937),
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  item.englishDesignation,
                                  style: GoogleFonts.mukta(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: const Color(0xFF9CA3AF),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDF6EE),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFFEEAD4)),
                        ),
                        child: Text(
                          item.historicPerson,
                          style: GoogleFonts.mukta(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF9E360B),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        item.portfolio,
                        style: GoogleFonts.mukta(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF6B7280),
                          height: 1.25,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
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
