import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// War Cry Banner & Rajmudra Motif matching the website's grand top strip
class WarCryBanner extends StatelessWidget {
  const WarCryBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2E1308), Color(0xFF4A1E0D), Color(0xFF2E1308)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE84C10).withAlpha(120), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFE84C10).withAlpha(40),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFE84C10).withAlpha(60),
            ),
            child: const Text('🔥', style: TextStyle(fontSize: 14)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '|| जय भवानी, जय शिवाजी || प्रौढप्रताप पुरंधर, क्षत्रियकुलावतंस, सिंहासनाधीश्वर छत्रपती शिवाजी महाराज की जय!',
              style: GoogleFonts.mukta(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFFFFE8D6),
                letterSpacing: 0.2,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFE84C10).withAlpha(60),
            ),
            child: const Text('🚩', style: TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }
}
