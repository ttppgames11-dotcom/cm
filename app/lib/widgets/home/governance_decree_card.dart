import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Section: Governance & Environmental Decree (शिवकालीन सुशासन व पर्यावरण आज्ञापत्र)
/// Celebrates "रयतेचे स्वराज्य", water management, and the historic decree on protecting trees
class GovernanceDecreeCard extends StatelessWidget {
  final VoidCallback? onTap;

  const GovernanceDecreeCard({super.key, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF3DEC8), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2B1B12).withAlpha(12),
            blurRadius: 12,
            offset: const Offset(0, 4),
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
                  color: const Color(0xFFFDF0E2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFCDDC0)),
                ),
                child: const Text('📜', style: TextStyle(fontSize: 20)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'शिवकालीन सुशासन व पर्यावरण आज्ञापत्र',
                      style: GoogleFonts.mukta(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF2B1B12),
                      ),
                    ),
                    Text(
                      'रयतेचे कल्याण व वृक्ष संवर्धन नीति',
                      style: GoogleFonts.mukta(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFE84C10),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFEDE3D8)),
            ),
            child: Text(
              '“ झाडे तोडू नयेत. आंब्या-फणसासारखी फळझाडे ही प्रजेने वर्षानुवर्षे जपलेली असतात. ती तोडल्यास प्रजेस दुःख होते. आरमारासाठी लाकूड हवे असल्यास वाळलेली व जीर्ण झालेलीच झाडे घ्यावीत. ”',
              style: GoogleFonts.mukta(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF4A3E38),
                height: 1.4,
                fontStyle: FontStyle.italic,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _buildFeatureBadge('🌱 वृक्ष संवर्धन'),
              _buildFeatureBadge('💧 पाण्याचे नियोजन'),
              _buildFeatureBadge('🌾 शेतकरी संरक्षण'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFDF4EC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFDE1C8)),
      ),
      child: Text(
        label,
        style: GoogleFonts.mukta(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF9E360B),
        ),
      ),
    );
  }
}
