import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:app/core/network/api_client.dart';
import 'package:app/features/auth/providers/auth_provider.dart';
import '../../domain/models/referral.dart';
import '../../domain/models/referral_stats.dart';
import '../../domain/models/referral_status.dart';
import '../providers/referral_providers.dart';
import '../widgets/referral_step_indicator.dart';

class ReferralDetailScreen extends ConsumerStatefulWidget {
  const ReferralDetailScreen({
    super.key,
    required this.referralId,
    this.initialReferral,
  });

  final String referralId;
  final Referral? initialReferral;

  @override
  ConsumerState<ReferralDetailScreen> createState() => _ReferralDetailScreenState();
}

class _ReferralDetailScreenState extends ConsumerState<ReferralDetailScreen> {
  Referral? _currentReferral;
  bool _isUpdatingStatus = false;

  @override
  void initState() {
    super.initState();
    _currentReferral = widget.initialReferral;
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return '';
    final d = dt.toLocal();
    final months = [
      'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
      'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
    ];
    final monthName = months[d.month - 1];
    return '${d.day} $monthName ${d.year}';
  }

  Future<void> _makePhoneCall(String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('tel:$cleaned');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('कॉल करता आला नाही.')),
        );
      }
    }
  }

  Future<void> _updateStatus(ReferralStatusClass targetStatus, {double? finalValue}) async {
    if (_currentReferral == null) return;
    setState(() => _isUpdatingStatus = true);

    try {
      final repo = ref.read(referralRepositoryProvider);
      final apiStatus = getStatusApiValue(targetStatus);

      final updated = await repo.updateReferralStatus(
        id: _currentReferral!.id,
        status: apiStatus,
        value: finalValue,
      );

      // Update local state and in-memory list provider
      setState(() => _currentReferral = updated);
      ref.read(referralsProvider.notifier).updateReferral(updated);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('स्थिती यशस्वीरीत्या बदलली: ${getStatusDisplayLabel(targetStatus)}'),
            backgroundColor: const Color(0xFF2E7D32),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: const Color(0xFFC62828),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('त्रुटी आली: $e'),
            backgroundColor: const Color(0xFFC62828),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUpdatingStatus = false);
      }
    }
  }

  void _showClosedDealDialog() {
    final valueCtrl = TextEditingController(
      text: (_currentReferral?.value != null && _currentReferral!.value > 0)
          ? _currentReferral!.value.toStringAsFixed(0)
          : '',
    );

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          title: const Row(
            children: [
              Icon(Icons.celebration_rounded, color: Color(0xFF2E7D32), size: 26),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'यशस्वी क्लोज (डील पूर्ण)',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'अभिनंदन! या संदर्भातून झालेला अंतिम व्यवसाय किंवा व्यवहार मूल्य (Deal Value) प्रविष्ट करा:',
                style: TextStyle(fontSize: 13, color: Color(0xFF5D4037)),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: valueCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d*'))],
                decoration: InputDecoration(
                  labelText: 'व्यवहार मूल्य ₹',
                  hintText: 'उदा. ५००००',
                  prefixIcon: const Icon(Icons.currency_rupee_rounded, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('रद्द करा', style: TextStyle(color: Color(0xFF7A6A5D))),
            ),
            ElevatedButton(
              onPressed: () {
                final double? val = double.tryParse(valueCtrl.text.trim());
                Navigator.pop(ctx);
                _updateStatus(
                  ReferralStatusClass.closed,
                  finalValue: val != null && val >= 0 ? val : 0.0,
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('क्लोज करा', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authController = ref.watch(authControllerProvider);
    final myId = authController.state.profile?.id ?? '';

    // If referral is not in local state, find it from referralsProvider list
    if (_currentReferral == null) {
      final listAsync = ref.watch(referralsProvider);
      return listAsync.when(
        loading: () => Scaffold(
          backgroundColor: const Color(0xFFFAF7F2),
          appBar: AppBar(title: const Text('तपशील')),
          body: const Center(
            child: CircularProgressIndicator(color: Color(0xFF8B1E1E)),
          ),
        ),
        error: (err, _) => Scaffold(
          backgroundColor: const Color(0xFFFAF7F2),
          appBar: AppBar(title: const Text('तपशील')),
          body: Center(
            child: Text('त्रुटी: $err'),
          ),
        ),
        data: (list) {
          final found = list.where((r) => r.id == widget.referralId).firstOrNull;
          if (found == null) {
            return Scaffold(
              backgroundColor: const Color(0xFFFAF7F2),
              appBar: AppBar(title: const Text('तपशील')),
              body: const Center(
                child: Text('हा संदर्भ आढळला नाही.'),
              ),
            );
          }
          _currentReferral = found;
          return _buildContent(myId);
        },
      );
    }

    return _buildContent(myId);
  }

  Widget _buildContent(String myId) {
    final refItem = _currentReferral!;
    final isGiver = refItem.giverId != null && refItem.giverId == myId;
    final isReceiver = refItem.recipientId != null && refItem.recipientId == myId;
    final hasNoRecipient = refItem.recipientId == null || refItem.recipientId!.isEmpty;

    // Show receiver actions when recipientId equals my id;
    // if referral has no recipientId, show them to the giver instead.
    final canUpdate = isReceiver || (hasNoRecipient && isGiver);

    // Show full phone & email only to giver and receiver
    final canViewContactDetails = isGiver || isReceiver;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF2B1B12)),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'संदर्भ तपशील',
          style: GoogleFonts.mukta(
            fontSize: 21,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF8B1E1E),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Progress Step Indicator (3 steps: New, Contacted, Closed)
            ReferralStepIndicator(
              statusClass: refItem.statusClass,
              createdAt: refItem.createdAt,
            ),

            const SizedBox(height: 14),

            // 2. Main Lead Overview Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF0E4D7)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2B1B12).withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Urgency & Category
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(
                          color: getUrgencyBgColor(refItem.urgencyLevel),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: getUrgencyColor(refItem.urgencyLevel).withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          'महत्त्व: ${getUrgencyDisplayLabel(refItem.urgencyLevel)}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: getUrgencyColor(refItem.urgencyLevel),
                          ),
                        ),
                      ),
                      if (refItem.category != null && refItem.category!.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7F1EB),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            refItem.category!,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF7A6A5D),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    refItem.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Value
                  Row(
                    children: [
                      const Text(
                        'व्यवसाय मूल्य: ',
                        style: TextStyle(fontSize: 13.5, color: Color(0xFF7A6A5D)),
                      ),
                      Text(
                        refItem.value > 0
                            ? '₹${formatIndianNumber(refItem.value.round())}'
                            : 'अंदाजे / ठरलेले नाही',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: refItem.value > 0
                              ? const Color(0xFF2E7D32)
                              : const Color(0xFF7A6A5D),
                        ),
                      ),
                    ],
                  ),

                  if (refItem.createdAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'नोंद दिनांक: ${_formatDate(refItem.createdAt)}',
                      style: const TextStyle(fontSize: 12, color: Color(0xFF9E8E81)),
                    ),
                  ],

                  if (refItem.notes != null && refItem.notes!.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    const Divider(color: Color(0xFFF0E4D7)),
                    const SizedBox(height: 8),
                    const Text(
                      'टीप व माहिती:',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF5D4037),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      refItem.notes!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4E342E),
                        height: 1.4,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 14),

            // 3. Parties Involved Card (Giver & Receiver)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF0E4D7)),
              ),
              child: Column(
                children: [
                  _buildPartyRow(
                    label: 'संदर्भ देणारा (Giver)',
                    name: refItem.giverName?.isNotEmpty == true
                        ? refItem.giverName!
                        : 'समाज सदस्य',
                    icon: Icons.upload_rounded,
                    iconColor: const Color(0xFFE65100),
                  ),
                  const Divider(color: Color(0xFFF0E4D7), height: 20),
                  _buildPartyRow(
                    label: 'संदर्भ स्वीकारणारा (Receiver)',
                    name: refItem.recipientName?.isNotEmpty == true
                        ? refItem.recipientName!
                        : (hasNoRecipient ? 'कोणत्याही सदस्याला (ओपन लीड)' : 'समाज सदस्य'),
                    icon: Icons.download_rounded,
                    iconColor: const Color(0xFF2E7D32),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // 4. Client Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF0E4D7)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ग्राहकाची संपर्क माहिती',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2B1B12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.person_rounded, size: 18, color: Color(0xFF8D7B6F)),
                      const SizedBox(width: 8),
                      Text(
                        refItem.clientName.isNotEmpty ? refItem.clientName : 'ग्राहक',
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF3E2723),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Phone number row
                  Row(
                    children: [
                      const Icon(Icons.phone_rounded, size: 18, color: Color(0xFF8D7B6F)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          canViewContactDetails
                              ? (refItem.clientPhone.isNotEmpty ? refItem.clientPhone : 'उपलब्ध नाही')
                              : refItem.maskedPhone,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF4E342E),
                          ),
                        ),
                      ),
                      // Call button for the receiver
                      if (isReceiver && refItem.clientPhone.isNotEmpty)
                        ElevatedButton.icon(
                          onPressed: () => _makePhoneCall(refItem.clientPhone),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2E7D32),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          icon: const Icon(Icons.call_rounded, size: 16),
                          label: const Text('कॉल करा', style: TextStyle(fontWeight: FontWeight.w700)),
                        ),
                    ],
                  ),

                  if (canViewContactDetails &&
                      refItem.clientEmail != null &&
                      refItem.clientEmail!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.email_outlined, size: 18, color: Color(0xFF8D7B6F)),
                        const SizedBox(width: 8),
                        Text(
                          refItem.clientEmail!,
                          style: const TextStyle(
                            fontSize: 13.5,
                            color: Color(0xFF4E342E),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 5. Receiver Actions (संपर्क साधला / यशस्वी क्लोज)
            if (canUpdate) ...[
              const Text(
                'कृती व स्थिती बदला (Actions):',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2B1B12),
                ),
              ),
              const SizedBox(height: 10),
              if (_isUpdatingStatus)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(12),
                    child: CircularProgressIndicator(color: Color(0xFF8B1E1E)),
                  ),
                )
              else
                Row(
                  children: [
                    // Button: "संपर्क साधला"
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: refItem.statusClass == ReferralStatusClass.contacted ||
                                refItem.statusClass == ReferralStatusClass.closed
                            ? null
                            : () => _updateStatus(ReferralStatusClass.contacted),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE65100),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                        label: const Text(
                          'संपर्क साधला',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Button: "यशस्वी क्लोज"
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: refItem.statusClass == ReferralStatusClass.closed
                            ? null
                            : _showClosedDealDialog,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                        label: const Text(
                          'यशस्वी क्लोज',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ],
                ),
            ],

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildPartyRow({
    required String label,
    required String name,
    required IconData icon,
    required Color iconColor,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11.5, color: Color(0xFF8D7B6F)),
              ),
              const SizedBox(height: 2),
              Text(
                name,
                style: const TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2B1B12),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
