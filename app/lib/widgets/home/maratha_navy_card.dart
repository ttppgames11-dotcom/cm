import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Section: Maratha Navy & Sarkhel Kanhoji Angre (मराठा आरमार व सागरी सार्वभौमत्व)
/// Highlights Father of the Indian Navy and naval forts
class MarathaNavyCard extends StatelessWidget {
  final VoidCallback? onTap;

  const MarathaNavyCard({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF38BDF8).withAlpha(80), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withAlpha(40),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF38BDF8).withAlpha(40),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text('⚓', style: TextStyle(fontSize: 20)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'मराठा आरमार व सागरी सार्वभौमत्व',
                      style: GoogleFonts.mukta(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Father of the Indian Navy • कान्होजी आंग्रे',
                      style: GoogleFonts.mukta(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF38BDF8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '“ ज्यांचे आरमार त्यांचा समुद्र! ” छत्रपती शिवरायांनी पश्चिम किनारपट्टीवर पोर्तुगीज, ब्रिटिश व सिद्दी सत्तांचा मुकाबला करण्यासाठी स्वतंत्र आरमार उभारले.',
            style: GoogleFonts.mukta(
              fontSize: 12.5,
              fontWeight: FontWeight.w500,
              color: const Color(0xFFCBD5E1),
              height: 1.35,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildPill('🌊 सिंधुदुर्ग व विजयदुर्ग'),
              _buildPill('⛵ गुराब व गलबत'),
              _buildPill('🛡️ सरखेल आंग्रे'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(25),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withAlpha(40)),
      ),
      child: Text(
        text,
        style: GoogleFonts.mukta(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: const Color(0xFFF1F5F9),
        ),
      ),
    );
  }
}
