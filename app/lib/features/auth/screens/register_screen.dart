import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/services.dart';
import '../../../core/network/api_client.dart' show ApiException;
import '../../../core/share/copy_share.dart';
import '../../../core/share/install_referral.dart';
import '../providers/auth_provider.dart' show apiClientProvider;

import '../../../core/auth/auth_scope.dart';
import '../../../core/config/legal_urls_config.dart';
import '../../../core/profile/member_avatar.dart';
import '../../../core/profile/photo_picker_sheet.dart';
import '../../../core/profile/profile_photo.dart';
import '../../../core/routing/route_state.dart';
import '../../../core/theme/app_colors.dart';
import '../data/registration_draft.dart';
import '../data/registration_options_data.dart';
import '../models/location_item.dart';
import '../models/register_form_data.dart';
import '../models/user_role.dart';
import '../providers/location_provider.dart';

const _stepLabels = ['नोंदणी', 'प्रोफाईल', 'पूर्ण'];

/// Registration: basic details → profile (with the member's own photo) → done.
class RegisterScreen extends ConsumerStatefulWidget {
  final String? initialReferralCode;
  const RegisterScreen({super.key, this.initialReferralCode});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  int _step = 0;
  final _data = RegisterFormData();

  // Referral Controller & State
  final _referralCodeController = TextEditingController();
  bool _isVerifyingReferral = false;
  String? _verifiedReferrerName;
  // Code that _verifiedReferrerName belongs to, so an edited code is re-checked.
  String? _verifiedReferralCode;
  // Shown under the referral field when the code is wrong or can't be checked.
  String? _referralError;
  Timer? _referralDebounce;
  String? _generatedReferenceId;

  // Step 1 Controllers
  final _fullNameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _termsAccepted = false;
  bool _privacyAccepted = false;
  bool _ageConfirmed = false;

  // Step 2 (Profile Form) - Dynamic Hierarchical Location Data (5 Levels)
  List<LocationItem> _countries = [];
  List<LocationItem> _states = [];
  List<LocationItem> _districts = [];
  List<LocationItem> _talukas = [];
  List<LocationItem> _villages = [];

  LocationItem? _selectedCountry;
  LocationItem? _selectedState;
  LocationItem? _selectedDistrict;
  LocationItem? _selectedTaluka;
  LocationItem? _selectedVillage;

  bool _isLoadingCountries = false;
  bool _isLoadingStates = false;
  bool _isLoadingDistricts = false;
  bool _isLoadingTalukas = false;
  bool _isLoadingVillages = false;

  String? _countriesError;
  String? _statesError;
  String? _districtsError;
  String? _talukasError;
  String? _villagesError;

  // Other Step 2 Profile Fields
  UserRole _selectedRole = UserRole.member;
  final _skillsController = TextEditingController();
  String _selectedEducation = RegistrationOptionsData.educationOptions.first;
  String _selectedInterest = RegistrationOptionsData.interestOptions.first;
  final _aboutController = TextEditingController();

  /// The member's own photo (optional); saved on this phone after sign-up.
  String? _photoPath;

  // Result
  String? _generatedId;
  bool _isSubmitting = false;

  final _draft = RegistrationDraft();

  @override
  void initState() {
    super.initState();
    if (widget.initialReferralCode != null && widget.initialReferralCode!.isNotEmpty) {
      _referralCodeController.text = widget.initialReferralCode!;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _verifyReferralCode(widget.initialReferralCode!);
      });
    } else {
      _prefillInstallReferral();
    }
    _restoreDraft();
  }

  /// Fills in the inviter's code when the app was installed from a shared
  /// Play Store invite link, unless the member has already typed a code.
  Future<void> _prefillInstallReferral() async {
    final code = await readInstallReferralCode();
    if (code == null || !mounted || _referralCodeController.text.trim().isNotEmpty) {
      return;
    }
    _referralCodeController.text = code;
    await _verifyReferralCode(code);
  }

  Map<String, Object?> _draftFields() => {
    'name': _fullNameController.text,
    'mobile': _mobileController.text,
    'email': _emailController.text,
    'termsAccepted': _termsAccepted,
    'privacyAccepted': _privacyAccepted,
    'ageConfirmed': _ageConfirmed,
    'role': _selectedRole.name,
    'skills': _skillsController.text,
    'education': _selectedEducation,
    'interest': _selectedInterest,
    'about': _aboutController.text,
    'photo': _photoPath,
  };

  /// Android closed the app while the camera / gallery was open: put back
  /// everything the member had entered, plus the photo they picked.
  Future<void> _restoreDraft() async {
    final (Map<String, dynamic>, String)? saved;
    try {
      saved = await _draft.load();
    } catch (_) {
      return;
    }
    if (saved == null) return;
    final (fields, password) = saved;
    final recovered = await recoverLostProfilePhoto();
    await _draft.clear();
    if (!mounted) return;

    String pick(String key, List<String> options, String fallback) {
      final value = fields[key];
      return value is String && options.contains(value) ? value : fallback;
    }

    setState(() {
      _fullNameController.text = fields['name'] as String? ?? '';
      _mobileController.text = fields['mobile'] as String? ?? '';
      _emailController.text = fields['email'] as String? ?? '';
      _passwordController.text = password;
      _termsAccepted = fields['termsAccepted'] == true || fields['agreed'] == true;
      _privacyAccepted = fields['privacyAccepted'] == true;
      _ageConfirmed = fields['ageConfirmed'] == true;
      _selectedRole = UserRole.values.firstWhere(
        (r) => r.name == fields['role'],
        orElse: () => UserRole.member,
      );
      _skillsController.text = fields['skills'] as String? ?? '';
      _selectedEducation = pick(
        'education',
        RegistrationOptionsData.educationOptions,
        _selectedEducation,
      );
      _selectedInterest = pick(
        'interest',
        RegistrationOptionsData.interestOptions,
        _selectedInterest,
      );
      _aboutController.text = fields['about'] as String? ?? '';
      final previous = fields['photo'] as String?;
      _photoPath =
          recovered ??
          (previous != null && File(previous).existsSync() ? previous : null);
      _step = 1;
    });

    if (_countries.isEmpty && !_isLoadingCountries) {
      _loadCountries();
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('तुमची भरलेली माहिती परत आणली आहे. नोंदणी पूर्ण करा.'),
      ),
    );
  }

  @override
  void dispose() {
    registrationSuccessOnScreen = false;
    _referralCodeController.dispose();
    _referralDebounce?.cancel();
    _fullNameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _skillsController.dispose();
    _aboutController.dispose();
    super.dispose();
  }

  static const _referralNotFoundMsg =
      'हा रेफरल आयडी आढळला नाही. अचूक आयडी टाका किंवा ही जागा रिकामी ठेवा. / Referral ID not found. Correct it or leave it empty.';
  static const _referralOwnNumberMsg =
      'आपण स्वतःचा नंबर रेफरल म्हणून वापरू शकत नाही. / You cannot use your own number as a referral.';
  static const _referralOfflineMsg =
      'रेफरल आयडी तपासता आला नाही. इंटरनेट तपासा व पुन्हा प्रयत्न करा. / Could not check the referral ID. Check your internet and try again.';

  /// True when the referral code is the member's own mobile number.
  bool _isOwnMobile(String code) {
    final codeDigits = code.replaceAll(RegExp(r'\D'), '');
    final mobileDigits = _mobileController.text.replaceAll(RegExp(r'\D'), '');
    if (codeDigits.length < 10 || mobileDigits.length < 10) return false;
    // Only a code that is a phone number (no letters) can be the member's own.
    if (RegExp(r'[A-Za-z]').hasMatch(code)) return false;
    return codeDigits.substring(codeDigits.length - 10) ==
        mobileDigits.substring(mobileDigits.length - 10);
  }

  void _onReferralCodeChanged(String code) {
    _referralDebounce?.cancel();
    final trimmed = code.trim();
    setState(() {
      _verifiedReferrerName = null;
      _verifiedReferralCode = null;
      _referralError = null;
      _isVerifyingReferral = false;
    });
    if (trimmed.isEmpty) return;
    _referralDebounce = Timer(const Duration(milliseconds: 600), () {
      _verifyReferralCode(trimmed);
    });
  }

  Future<void> _verifyReferralCode(String code) async {
    if (!mounted || code.isEmpty) return;
    if (_isOwnMobile(code)) {
      setState(() {
        _verifiedReferrerName = null;
        _verifiedReferralCode = null;
        _referralError = _referralOwnNumberMsg;
        _isVerifyingReferral = false;
      });
      return;
    }
    setState(() {
      _isVerifyingReferral = true;
      _referralError = null;
    });
    String? name;
    String? error;
    try {
      final apiClient = ref.read(apiClientProvider);
      final res = await apiClient.get('/api/auth/referrals/verify/${Uri.encodeComponent(code)}');
      if (res['isValid'] == true && res['referrer'] is Map) {
        final r = res['referrer'] as Map;
        final referrer = (r['name'] ?? '').toString();
        final district = (r['district'] ?? r['city'] ?? '').toString();
        name = district.isNotEmpty ? '$referrer ($district)' : referrer;
      } else {
        error = _referralNotFoundMsg;
      }
    } on ApiException catch (e) {
      error = (e.statusCode == 404 || e.statusCode == 400)
          ? _referralNotFoundMsg
          : _referralOfflineMsg;
    } catch (_) {
      error = _referralOfflineMsg;
    }
    // Ignore a slow answer for a code the member has since changed.
    if (!mounted || _referralCodeController.text.trim() != code) return;
    setState(() {
      _verifiedReferrerName = name;
      _verifiedReferralCode = name != null ? code : null;
      _referralError = error;
      _isVerifyingReferral = false;
    });
  }

  /// The referral code is optional, but an entered code must belong to a real
  /// member (same rule as the website). Re-checks if it hasn't been verified.
  Future<bool> _ensureReferralValid() async {
    final code = _referralCodeController.text.trim();
    if (code.isEmpty) return true;
    _referralDebounce?.cancel();
    if (_verifiedReferrerName == null || _verifiedReferralCode != code) {
      await _verifyReferralCode(code);
      if (!mounted) return false;
    }
    if (_verifiedReferrerName != null && _verifiedReferralCode == code) {
      return true;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(_referralError ?? _referralNotFoundMsg)),
    );
    return false;
  }

  void _goBack() => setState(() => _step = (_step - 1).clamp(0, 1));

  Future<void> _handleStep0Next() async {
    if (_isVerifyingReferral) return;
    if (_fullNameController.text.trim().isEmpty ||
        _mobileController.text.trim().isEmpty ||
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('कृपया नाव, मोबाईल नंबर व पासवर्ड भरा.')),
      );
      return;
    }
    if (_passwordController.text.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('पासवर्ड किमान ८ अक्षरांचा असावा.')),
      );
      return;
    }
    if (!_termsAccepted || !_privacyAccepted || !_ageConfirmed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया सर्व अटी, गोपनीयता धोरण व वयाची पुष्टी मान्य करा.'),
        ),
      );
      return;
    }
    if (!await _ensureReferralValid()) return;
    if (!mounted) return;
    setState(() => _step = 1);
    if (_countries.isEmpty && !_isLoadingCountries) {
      _loadCountries();
    }
  }

  // Location Loading Methods
  Future<void> _loadCountries() async {
    if (_isLoadingCountries) return;
    setState(() {
      _isLoadingCountries = true;
      _countriesError = null;
    });
    try {
      final repo = ref.read(locationRepositoryProvider);
      final list = await repo.getCountries();
      if (!mounted) return;
      setState(() {
        _countries = list;
        _isLoadingCountries = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _countriesError =
            'देश लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
        _isLoadingCountries = false;
      });
    }
  }

  Future<void> _loadStates(String countryId) async {
    if (_isLoadingStates) return;
    setState(() {
      _isLoadingStates = true;
      _statesError = null;
    });
    try {
      final repo = ref.read(locationRepositoryProvider);
      final list = await repo.getStates(countryId);
      if (!mounted) return;
      setState(() {
        _states = list;
        _isLoadingStates = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _statesError = 'राज्य लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
        _isLoadingStates = false;
      });
    }
  }

  Future<void> _loadDistricts(String stateId) async {
    if (_isLoadingDistricts) return;
    setState(() {
      _isLoadingDistricts = true;
      _districtsError = null;
    });
    try {
      final repo = ref.read(locationRepositoryProvider);
      final list = await repo.getDistricts(stateId);
      if (!mounted) return;
      setState(() {
        _districts = list;
        _isLoadingDistricts = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _districtsError =
            'जिल्हा लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
        _isLoadingDistricts = false;
      });
    }
  }

  Future<void> _loadTalukas(String districtId) async {
    if (_isLoadingTalukas) return;
    setState(() {
      _isLoadingTalukas = true;
      _talukasError = null;
    });
    try {
      final repo = ref.read(locationRepositoryProvider);
      final list = await repo.getTalukas(districtId);
      if (!mounted) return;
      setState(() {
        _talukas = list;
        _isLoadingTalukas = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _talukasError =
            'तालुका लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
        _isLoadingTalukas = false;
      });
    }
  }

  Future<void> _loadVillages(String talukaId) async {
    if (_isLoadingVillages) return;
    setState(() {
      _isLoadingVillages = true;
      _villagesError = null;
    });
    try {
      final repo = ref.read(locationRepositoryProvider);
      final list = await repo.getVillages(talukaId, limit: 1000);
      if (!mounted) return;
      setState(() {
        _villages = list;
        _isLoadingVillages = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _villagesError = 'गाव लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
        _isLoadingVillages = false;
      });
    }
  }

  // Cascading Location Selection Handlers
  void _onCountryChanged(LocationItem? country) {
    if (country == _selectedCountry) return;
    setState(() {
      _selectedCountry = country;
      _selectedState = null;
      _states = [];
      _statesError = null;
      _selectedDistrict = null;
      _districts = [];
      _districtsError = null;
      _selectedTaluka = null;
      _talukas = [];
      _talukasError = null;
      _selectedVillage = null;
      _villages = [];
      _villagesError = null;
    });
    if (country != null) {
      _loadStates(country.id);
    }
  }

  void _onStateChanged(LocationItem? state) {
    if (state == _selectedState) return;
    setState(() {
      _selectedState = state;
      _selectedDistrict = null;
      _districts = [];
      _districtsError = null;
      _selectedTaluka = null;
      _talukas = [];
      _talukasError = null;
      _selectedVillage = null;
      _villages = [];
      _villagesError = null;
    });
    if (state != null) {
      _loadDistricts(state.id);
    }
  }

  void _onDistrictChanged(LocationItem? district) {
    if (district == _selectedDistrict) return;
    setState(() {
      _selectedDistrict = district;
      _selectedTaluka = null;
      _talukas = [];
      _talukasError = null;
      _selectedVillage = null;
      _villages = [];
      _villagesError = null;
    });
    if (district != null) {
      _loadTalukas(district.id);
    }
  }

  void _onTalukaChanged(LocationItem? taluka) {
    if (taluka == _selectedTaluka) return;
    setState(() {
      _selectedTaluka = taluka;
      _selectedVillage = null;
      _villages = [];
      _villagesError = null;
    });
    if (taluka != null) {
      _loadVillages(taluka.id);
    }
  }

  void _onVillageChanged(LocationItem? village) {
    setState(() {
      _selectedVillage = village;
    });
  }

  Future<void> _pickPhoto() async {
    final choice = await pickProfilePhoto(
      context,
      canRemove: _photoPath != null,
      beforeLaunch: () => _draft.save(_draftFields(), _passwordController.text),
    );
    // Back in the app normally: the safety copy is no longer needed.
    unawaited(_draft.clear().catchError((_) {}));
    if (!mounted || choice == null) return;
    setState(() {
      _photoPath = switch (choice) {
        PhotoPicked(:final path) => path,
        PhotoRemoved() => null,
      };
    });
  }

  Future<void> _submit() async {
    // Validate that all 5 location levels are selected
    if (_selectedCountry == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया देश निवडा / Please select Country.'),
        ),
      );
      return;
    }
    if (_selectedState == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया राज्य निवडा / Please select State.'),
        ),
      );
      return;
    }
    if (_selectedDistrict == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया जिल्हा निवडा / Please select District.'),
        ),
      );
      return;
    }
    if (_selectedTaluka == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया तालुका निवडा / Please select Taluka.'),
        ),
      );
      return;
    }
    if (_selectedVillage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('कृपया गाव निवडा / Please select Village.'),
        ),
      );
      return;
    }

    _data
      ..referenceId = _referralCodeController.text.trim()
      ..referredByName = _verifiedReferrerName
      ..fullName = _fullNameController.text
      ..mobile = _mobileController.text
      ..email = _emailController.text
      ..password = _passwordController.text
      ..agreedToGuidelines = _termsAccepted
      ..termsAccepted = _termsAccepted
      ..privacyAccepted = _privacyAccepted
      ..ageConfirmed = _ageConfirmed
      ..dpdpConsent = _privacyAccepted
      ..countryId = _selectedCountry!.id
      ..stateId = _selectedState!.id
      ..districtId = _selectedDistrict!.id
      ..talukaId = _selectedTaluka!.id
      ..villageId = _selectedVillage!.id
      ..country = _selectedCountry!.name
      ..state = _selectedState!.name
      ..district = _selectedDistrict!.name
      ..taluka = _selectedTaluka!.name
      ..village = _selectedVillage!.name
      ..city = '${_selectedVillage!.name}, ${_selectedTaluka!.name}'
      ..role = _selectedRole
      ..skills = _skillsController.text
      ..education = _selectedEducation
      ..interest = _selectedInterest
      ..about = _aboutController.text;

    setState(() => _isSubmitting = true);
    final auth = AuthScope.of(context);
    // Registering signs the member in; keep the router from sending them to
    // Home before they have seen the success page (cleared in dispose).
    registrationSuccessOnScreen = true;
    final success = await auth.register(_data);
    if (!success) registrationSuccessOnScreen = false;
    if (success) await markInstallReferralUsed();
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (!success) {
      final already = auth.state.errorCode == 'ALREADY_REGISTERED';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.state.errorMessage ?? 'नोंदणी अयशस्वी झाली.'),
          duration: const Duration(seconds: 6),
          action:
              already
                  ? SnackBarAction(
                    label: 'लॉगिन करा',
                    onPressed: () => context.go('/login'),
                  )
                  : null,
        ),
      );
      return;
    }

    final photo = _photoPath;
    if (photo != null) {
      try {
        await ref.read(myProfilePhotoProvider.notifier).setPhoto(photo);
      } catch (_) {
        // The account exists; the photo can still be added from Profile.
      }
      if (!mounted) return;
    }

    setState(() {
      _generatedId = auth.state.profile?.id;
      _generatedReferenceId = auth.state.profile?.displayReferenceId;
      _step = 2;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('नोंदणी यशस्वी झाली! अभिनंदन!')),
    );
  }

  void _onRoleChanged(UserRole? newRole) {
    if (newRole == null) return;
    setState(() {
      _selectedRole = newRole;
    });
  }

  void _onEducationChanged(String? newEducation) {
    if (newEducation == null) return;
    setState(() {
      _selectedEducation = newEducation;
    });
  }

  void _onInterestChanged(String? newInterest) {
    if (newInterest == null) return;
    setState(() {
      _selectedInterest = newInterest;
    });
  }

  @override
  Widget build(BuildContext context) {
    final onSuccessPage = _step == 2;
    return PopScope(
      // On the success page the member is signed in: "back" opens Home rather
      // than returning to the login form underneath.
      canPop: !onSuccessPage,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go('/home');
      },
      child: _buildScaffold(context),
    );
  }

  Widget _buildScaffold(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F2),
      appBar: AppBar(
        title: Text(
          'नोंदणी करा / Register',
          style: GoogleFonts.mukta(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF2B1B12),
        elevation: 0.5,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _StepTrack(current: _step),
              const SizedBox(height: 24),
              switch (_step) {
                0 => _Step1Basic(
                  fullNameController: _fullNameController,
                  mobileController: _mobileController,
                  emailController: _emailController,
                  passwordController: _passwordController,
                  referralCodeController: _referralCodeController,
                  isVerifyingReferral: _isVerifyingReferral,
                  verifiedReferrerName: _verifiedReferrerName,
                  referralError: _referralError,
                  onReferralChanged: _onReferralCodeChanged,
                  termsAccepted: _termsAccepted,
                  onTermsChanged:
                      (value) => setState(() => _termsAccepted = value ?? false),
                  privacyAccepted: _privacyAccepted,
                  onPrivacyChanged:
                      (value) => setState(() => _privacyAccepted = value ?? false),
                  ageConfirmed: _ageConfirmed,
                  onAgeChanged:
                      (value) => setState(() => _ageConfirmed = value ?? false),
                  onNext: _handleStep0Next,
                ),
                1 => _Step2Profile(
                  countries: _countries,
                  selectedCountry: _selectedCountry,
                  isLoadingCountries: _isLoadingCountries,
                  countriesError: _countriesError,
                  onCountryChanged: _onCountryChanged,
                  onRetryCountries: _loadCountries,

                  states: _states,
                  selectedState: _selectedState,
                  isLoadingStates: _isLoadingStates,
                  statesError: _statesError,
                  onStateChanged: _onStateChanged,
                  onRetryStates:
                      () =>
                          _selectedCountry != null
                              ? _loadStates(_selectedCountry!.id)
                              : null,

                  districts: _districts,
                  selectedDistrict: _selectedDistrict,
                  isLoadingDistricts: _isLoadingDistricts,
                  districtsError: _districtsError,
                  onDistrictChanged: _onDistrictChanged,
                  onRetryDistricts:
                      () =>
                          _selectedState != null
                              ? _loadDistricts(_selectedState!.id)
                              : null,

                  talukas: _talukas,
                  selectedTaluka: _selectedTaluka,
                  isLoadingTalukas: _isLoadingTalukas,
                  talukasError: _talukasError,
                  onTalukaChanged: _onTalukaChanged,
                  onRetryTalukas:
                      () =>
                          _selectedDistrict != null
                              ? _loadTalukas(_selectedDistrict!.id)
                              : null,

                  villages: _villages,
                  selectedVillage: _selectedVillage,
                  isLoadingVillages: _isLoadingVillages,
                  villagesError: _villagesError,
                  onVillageChanged: _onVillageChanged,
                  onRetryVillages:
                      () =>
                          _selectedTaluka != null
                              ? _loadVillages(_selectedTaluka!.id)
                              : null,

                  selectedRole: _selectedRole,
                  onRoleChanged: _onRoleChanged,
                  skillsController: _skillsController,
                  selectedEducation: _selectedEducation,
                  onEducationChanged: _onEducationChanged,
                  selectedInterest: _selectedInterest,
                  onInterestChanged: _onInterestChanged,
                  aboutController: _aboutController,
                  photoPath: _photoPath,
                  nameController: _fullNameController,
                  onPickPhoto: _pickPhoto,
                  onBack: _isSubmitting ? null : _goBack,
                  onNext: _isSubmitting ? null : _submit,
                  isSubmitting: _isSubmitting,
                ),
                _ => _Step5Success(memberId: _generatedId ?? '', referenceId: _generatedReferenceId ?? ''),
              },
            ],
          ),
        ),
      ),
    );
  }
}

class _StepTrack extends StatelessWidget {
  const _StepTrack({required this.current});
  final int current;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(_stepLabels.length, (i) {
        final isDone = i < current;
        final isActive = i == current;
        final color =
            isDone || isActive ? AppColors.saffron600 : AppColors.line;
        return Expanded(
          child: Column(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: color,
                child:
                    isDone
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : Text(
                          '${i + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
              ),
              const SizedBox(height: 4),
              Text(
                _stepLabels[i],
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  color: isActive ? AppColors.maroon900 : AppColors.muted,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _Step1Basic extends StatelessWidget {
  const _Step1Basic({
    required this.fullNameController,
    required this.mobileController,
    required this.emailController,
    required this.passwordController,
    required this.referralCodeController,
    required this.isVerifyingReferral,
    required this.verifiedReferrerName,
    this.referralError,
    required this.onReferralChanged,
    required this.termsAccepted,
    required this.onTermsChanged,
    required this.privacyAccepted,
    required this.onPrivacyChanged,
    required this.ageConfirmed,
    required this.onAgeChanged,
    required this.onNext,
  });

  final TextEditingController fullNameController;
  final TextEditingController mobileController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController referralCodeController;
  final bool isVerifyingReferral;
  final String? verifiedReferrerName;
  final String? referralError;
  final ValueChanged<String> onReferralChanged;
  final bool termsAccepted;
  final ValueChanged<bool?> onTermsChanged;
  final bool privacyAccepted;
  final ValueChanged<bool?> onPrivacyChanged;
  final bool ageConfirmed;
  final ValueChanged<bool?> onAgeChanged;
  final VoidCallback onNext;

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final canProceed = termsAccepted && privacyAccepted && ageConfirmed;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'नोंदणी करा / Create Account',
          style: GoogleFonts.mukta(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF2B1B12),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'आपली मूलभूत माहिती भरून Connect मराठा परिवारात सामील व्हा.',
          style: GoogleFonts.mukta(
            fontSize: 13,
            color: const Color(0xFF6B7280),
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          key: const Key('register_name_field'),
          controller: fullNameController,
          decoration: const InputDecoration(
            labelText: 'पूर्ण नाव / Full Name',
            hintText: 'उदा. संजय शिवाजी पाटील / Sanjay Patil',
            prefixIcon: Icon(Icons.person_outline),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          key: const Key('register_mobile_field'),
          controller: mobileController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'मोबाईल नंबर / Mobile Number',
            hintText: '+91 XXXXX XXXXX',
            prefixIcon: Icon(Icons.phone_android_rounded),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          key: const Key('register_email_field'),
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: 'ईमेल / Email (ऐच्छिक / Optional)',
            hintText: 'example@gmail.com',
            prefixIcon: Icon(Icons.email_outlined),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          key: const Key('register_password_field'),
          controller: passwordController,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'पासवर्ड सेट करा / Set Password',
            hintText: 'किमान ८ अक्षरे / Min 8 characters',
            prefixIcon: Icon(Icons.lock_outline),
          ),
        ),
        const SizedBox(height: 12),

        // Referral Code / Reference ID Field (Optional)
        TextField(
          key: const Key('register_referral_code_field'),
          controller: referralCodeController,
          textCapitalization: TextCapitalization.characters,
          onChanged: onReferralChanged,
          decoration: InputDecoration(
            labelText: 'रेफरल कोड / Reference ID (ऐच्छिक / Optional)',
            hintText: 'उदा. REF-96K-2866 किंवा मित्राचा फोन',
            prefixIcon: const Icon(Icons.card_giftcard_rounded, color: Color(0xFFE84C10)),
            suffixIcon: isVerifyingReferral
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE84C10)),
                    ),
                  )
                : verifiedReferrerName != null
                    ? const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A))
                    : referralError != null
                        ? const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626))
                        : null,
          ),
        ),
        if (referralError != null && verifiedReferrerName == null) ...[
          const SizedBox(height: 6),
          Container(
            key: const Key('register_referral_error'),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline_rounded, size: 16, color: Color(0xFFDC2626)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    referralError!,
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFFB91C1C),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        if (verifiedReferrerName != null) ...[
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF16A34A)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'सत्यापित रेफरर: $verifiedReferrerName',
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF15803D),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 12),

        // 1. Terms of Use & Community Guidelines Checkbox
        CheckboxListTile(
          key: const Key('register_terms_checkbox'),
          value: termsAccepted,
          onChanged: onTermsChanged,
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
          title: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'मी वापराच्या अटी व समुदाय मार्गदर्शक तत्त्वांशी सहमत आहे (',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF4B5563),
                ),
              ),
              InkWell(
                onTap: () => _openUrl(LegalUrlsConfig.termsOfUseUrl),
                child: Text(
                  'Terms of Use',
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFE84C10),
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
              Text(
                ' )',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF4B5563),
                ),
              ),
            ],
          ),
        ),

        // Extra in-app guidelines reading option
        Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.only(left: 32),
            child: InkWell(
              onTap: () => context.push('/guidelines'),
              child: Text(
                '📖 ॲपमधील मार्गदर्शक तत्त्वे वाचा (In-App Guidelines)',
                style: GoogleFonts.mukta(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF7A6A5D),
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 4),

        // 2. Privacy Policy & DPDP Personal Data Processing Consent Checkbox
        CheckboxListTile(
          key: const Key('register_privacy_checkbox'),
          value: privacyAccepted,
          onChanged: onPrivacyChanged,
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
          title: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                'मी गोपनीयता धोरण वाचले असून DPDP कायदा २०२३ अन्वये माझा वैयक्तिक डेटा प्रक्रिया करण्यास माझी संमती आहे (',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF4B5563),
                ),
              ),
              InkWell(
                onTap: () => _openUrl(LegalUrlsConfig.privacyPolicyUrl),
                child: Text(
                  'Privacy Policy',
                  style: GoogleFonts.mukta(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFE84C10),
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
              Text(
                ' )',
                style: GoogleFonts.mukta(
                  fontSize: 13,
                  color: const Color(0xFF4B5563),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 4),

        // 3. Age Confirmation Checkbox (18+)
        CheckboxListTile(
          key: const Key('register_age_checkbox'),
          value: ageConfirmed,
          onChanged: onAgeChanged,
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
          title: Text(
            'माझे वय १८ वर्षे किंवा त्याहून अधिक आहे (Age 18+ confirmation).',
            style: GoogleFonts.mukta(
              fontSize: 13,
              color: const Color(0xFF4B5563),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Next / Register Button — disabled until all required checkboxes are ticked
        FilledButton(
          key: const Key('register_next_button'),
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFFE84C10),
            disabledBackgroundColor: const Color(0xFFE5E7EB),
            foregroundColor: Colors.white,
            disabledForegroundColor: const Color(0xFF9CA3AF),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          onPressed: canProceed ? onNext : null,
          child: Text(
            'पुढे → / Next',
            style: GoogleFonts.mukta(fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

/// 10 Sequential Fields Profile Form implemented in Marathi & English
class _Step2Profile extends StatelessWidget {
  const _Step2Profile({
    required this.countries,
    required this.selectedCountry,
    required this.isLoadingCountries,
    required this.countriesError,
    required this.onCountryChanged,
    required this.onRetryCountries,
    required this.states,
    required this.selectedState,
    required this.isLoadingStates,
    required this.statesError,
    required this.onStateChanged,
    required this.onRetryStates,
    required this.districts,
    required this.selectedDistrict,
    required this.isLoadingDistricts,
    required this.districtsError,
    required this.onDistrictChanged,
    required this.onRetryDistricts,
    required this.talukas,
    required this.selectedTaluka,
    required this.isLoadingTalukas,
    required this.talukasError,
    required this.onTalukaChanged,
    required this.onRetryTalukas,
    required this.villages,
    required this.selectedVillage,
    required this.isLoadingVillages,
    required this.villagesError,
    required this.onVillageChanged,
    required this.onRetryVillages,
    required this.selectedRole,
    required this.onRoleChanged,
    required this.skillsController,
    required this.selectedEducation,
    required this.onEducationChanged,
    required this.selectedInterest,
    required this.onInterestChanged,
    required this.aboutController,
    required this.photoPath,
    required this.nameController,
    required this.onPickPhoto,
    required this.onBack,
    required this.onNext,
    required this.isSubmitting,
  });

  final List<LocationItem> countries;
  final LocationItem? selectedCountry;
  final bool isLoadingCountries;
  final String? countriesError;
  final ValueChanged<LocationItem?> onCountryChanged;
  final VoidCallback onRetryCountries;

  final List<LocationItem> states;
  final LocationItem? selectedState;
  final bool isLoadingStates;
  final String? statesError;
  final ValueChanged<LocationItem?> onStateChanged;
  final VoidCallback onRetryStates;

  final List<LocationItem> districts;
  final LocationItem? selectedDistrict;
  final bool isLoadingDistricts;
  final String? districtsError;
  final ValueChanged<LocationItem?> onDistrictChanged;
  final VoidCallback onRetryDistricts;

  final List<LocationItem> talukas;
  final LocationItem? selectedTaluka;
  final bool isLoadingTalukas;
  final String? talukasError;
  final ValueChanged<LocationItem?> onTalukaChanged;
  final VoidCallback onRetryTalukas;

  final List<LocationItem> villages;
  final LocationItem? selectedVillage;
  final bool isLoadingVillages;
  final String? villagesError;
  final ValueChanged<LocationItem?> onVillageChanged;
  final VoidCallback onRetryVillages;

  final UserRole selectedRole;
  final ValueChanged<UserRole?> onRoleChanged;
  final TextEditingController skillsController;
  final String selectedEducation;
  final ValueChanged<String?> onEducationChanged;
  final String selectedInterest;
  final ValueChanged<String?> onInterestChanged;
  final TextEditingController aboutController;
  final String? photoPath;
  final TextEditingController nameController;
  final VoidCallback onPickPhoto;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final bool isSubmitting;

  /// Big round photo at the top of the form: the member's own picture, or
  /// their initial until they add one. Adding a photo is optional.
  Widget _buildPhotoPicker() {
    final hasPhoto = photoPath != null;
    return Column(
      children: [
        Semantics(
          button: true,
          label: hasPhoto ? 'प्रोफाईल फोटो बदला' : 'प्रोफाईल फोटो जोडा',
          child: GestureDetector(
            onTap: onPickPhoto,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x22E84C10),
                        blurRadius: 12,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ValueListenableBuilder<TextEditingValue>(
                    valueListenable: nameController,
                    builder:
                        (_, value, __) => MemberAvatar(
                          name: value.text,
                          photo: hasPhoto ? File(photoPath!) : null,
                          size: 96,
                        ),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 2,
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE84C10),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2.5),
                    ),
                    child: Icon(
                      hasPhoto
                          ? Icons.edit_rounded
                          : Icons.photo_camera_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        TextButton(
          onPressed: onPickPhoto,
          child: Text(
            hasPhoto
                ? 'फोटो बदला / Change photo'
                : 'तुमचा फोटो जोडा / Add your photo',
            style: GoogleFonts.mukta(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: const Color(0xFFE84C10),
            ),
          ),
        ),
        Text(
          'ऐच्छिक · फोटो इतर सदस्यांना दिसेल',
          style: GoogleFonts.mukta(
            fontSize: 11.5,
            color: const Color(0xFF6B7280),
          ),
        ),
        const SizedBox(height: 18),
      ],
    );
  }

  Widget _buildFieldTitle({
    required String number,
    required String marathi,
    required String english,
    required IconData icon,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFFE84C10)),
          const SizedBox(width: 6),
          RichText(
            text: TextSpan(
              style: GoogleFonts.mukta(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1F2937),
              ),
              children: [
                TextSpan(
                  text: '$number. ',
                  style: const TextStyle(color: Color(0xFFE84C10)),
                ),
                TextSpan(text: marathi),
                TextSpan(
                  text: ' / $english',
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _dropdownDecoration() {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE84C10), width: 1.5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Stepper Header
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3EB),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.badge_rounded,
                color: Color(0xFFE84C10),
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'प्रोफाईल माहिती / Profile Form',
                    style: GoogleFonts.mukta(
                      fontSize: 19,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1F2937),
                    ),
                  ),
                  Text(
                    'तुमची माहिती भरा — समाजबांधवांना तुम्हाला ओळखता येईल.',
                    style: GoogleFonts.mukta(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        _buildPhotoPicker(),

        // 1. COUNTRY - Drop Down
        _LocationDropdownField(
          number: '१',
          marathi: 'देश',
          english: 'Country',
          icon: Icons.public_rounded,
          hint: 'देश निवडा / Select Country',
          items: countries,
          selectedItem: selectedCountry,
          isEnabled: true,
          isLoading: isLoadingCountries,
          error: countriesError,
          onChanged: onCountryChanged,
          onRetry: onRetryCountries,
        ),

        // 2. STATE - Drop Down
        _LocationDropdownField(
          number: '२',
          marathi: 'राज्य',
          english: 'State',
          icon: Icons.map_outlined,
          hint: 'राज्य निवडा / Select State',
          disabledHint: 'आधी देश निवडा / Select Country first',
          items: states,
          selectedItem: selectedState,
          isEnabled: selectedCountry != null,
          isLoading: isLoadingStates,
          error: statesError,
          onChanged: onStateChanged,
          onRetry: onRetryStates,
        ),

        // 3. DISTRICT - Drop Down
        _LocationDropdownField(
          number: '३',
          marathi: 'जिल्हा',
          english: 'District',
          icon: Icons.location_city_rounded,
          hint: 'जिल्हा निवडा / Select District',
          disabledHint: 'आधी राज्य निवडा / Select State first',
          items: districts,
          selectedItem: selectedDistrict,
          isEnabled: selectedState != null,
          isLoading: isLoadingDistricts,
          error: districtsError,
          onChanged: onDistrictChanged,
          onRetry: onRetryDistricts,
        ),

        // 4. TALUKA - Drop Down
        _LocationDropdownField(
          number: '४',
          marathi: 'तालुका',
          english: 'Taluka',
          icon: Icons.holiday_village_rounded,
          hint: 'तालुका निवडा / Select Taluka',
          disabledHint: 'आधी जिल्हा निवडा / Select District first',
          items: talukas,
          selectedItem: selectedTaluka,
          isEnabled: selectedDistrict != null,
          isLoading: isLoadingTalukas,
          error: talukasError,
          onChanged: onTalukaChanged,
          onRetry: onRetryTalukas,
        ),

        // 5. VILLAGE - Drop Down
        _LocationDropdownField(
          number: '५',
          marathi: 'गाव / शहर',
          english: 'Village / City',
          icon: Icons.home_work_rounded,
          hint: 'गाव निवडा / Select Village',
          disabledHint: 'आधी तालुका निवडा / Select Taluka first',
          items: villages,
          selectedItem: selectedVillage,
          isEnabled: selectedTaluka != null,
          isLoading: isLoadingVillages,
          error: villagesError,
          onChanged: onVillageChanged,
          onRetry: onRetryVillages,
        ),

        // 6. ROLE - Drop Down (Matching screenshot exactly)
        _buildFieldTitle(
          number: '६',
          marathi: 'भूमिका',
          english: 'Role',
          icon: Icons.badge_outlined,
        ),
        DropdownButtonFormField<UserRole>(
          value: selectedRole,
          decoration: _dropdownDecoration(),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Color(0xFFE84C10),
          ),
          items:
              RegistrationOptionsData.roles.map((item) {
                final role = item['role'] as UserRole;
                final label = item['label'] as String;
                return DropdownMenuItem<UserRole>(
                  value: role,
                  child: Text(
                    label,
                    style: GoogleFonts.mukta(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1F2937),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
          onChanged: onRoleChanged,
        ),
        const SizedBox(height: 14),

        // 7. SKILLS - Text Input
        _buildFieldTitle(
          number: '७',
          marathi: 'कौशल्ये',
          english: 'Skills',
          icon: Icons.psychology_outlined,
        ),
        TextField(
          controller: skillsController,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            hintText:
                'उदा. दुर्ग संवर्धन, व्यवसाय, इतिहास संशोधन / e.g. Fort Conservation, Business',
            hintStyle: GoogleFonts.mukta(
              fontSize: 12.5,
              color: const Color(0xFF9CA3AF),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(
                color: Color(0xFFE84C10),
                width: 1.5,
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // 8. EDUCATION - Drop Down
        _buildFieldTitle(
          number: '८',
          marathi: 'शिक्षण',
          english: 'Education',
          icon: Icons.school_outlined,
        ),
        DropdownButtonFormField<String>(
          value: selectedEducation,
          decoration: _dropdownDecoration(),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Color(0xFFE84C10),
          ),
          items:
              RegistrationOptionsData.educationOptions.map((edu) {
                return DropdownMenuItem<String>(
                  value: edu,
                  child: Text(
                    edu,
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      color: const Color(0xFF1F2937),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
          onChanged: onEducationChanged,
        ),
        const SizedBox(height: 14),

        // 9. INTEREST - Drop Down (According to project)
        _buildFieldTitle(
          number: '९',
          marathi: 'स्वारस्य व आवड',
          english: 'Interest',
          icon: Icons.auto_awesome_rounded,
        ),
        DropdownButtonFormField<String>(
          value: selectedInterest,
          decoration: _dropdownDecoration(),
          isExpanded: true,
          icon: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Color(0xFFE84C10),
          ),
          items:
              RegistrationOptionsData.interestOptions.map((inte) {
                return DropdownMenuItem<String>(
                  value: inte,
                  child: Text(
                    inte,
                    style: GoogleFonts.mukta(
                      fontSize: 13,
                      color: const Color(0xFF1F2937),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
          onChanged: onInterestChanged,
        ),
        const SizedBox(height: 14),

        // 10. ABOUT ME - Multiline Text Input
        _buildFieldTitle(
          number: '१०',
          marathi: 'माझ्याबद्दल',
          english: 'About Me',
          icon: Icons.person_pin_outlined,
        ),
        TextField(
          controller: aboutController,
          maxLines: 3,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            hintText:
                'आपल्याबद्दल व ध्येयाबद्दल थोडक्यात सांगा / Tell us briefly about yourself...',
            hintStyle: GoogleFonts.mukta(
              fontSize: 12.5,
              color: const Color(0xFF9CA3AF),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(
                color: Color(0xFFE84C10),
                width: 1.5,
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Community Notice Box
        const _NoticeBox(
          text:
              '🛡️ सदस्यत्व पूर्णतः स्वयं-ओळखीवर आधारित आहे. जात प्रमाणपत्र किंवा कोणतीही ओळख-पडताळणी कागदपत्रे अनिवार्य नाहीत.',
        ),
        const SizedBox(height: 20),

        // Navigation Buttons
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF374151),
                  side: const BorderSide(color: Color(0xFFD1D5DB)),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: onBack,
                child: Text(
                  '← मागे / Back',
                  style: GoogleFonts.mukta(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFE84C10),
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: onNext,
                child:
                    isSubmitting
                        ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                        : Text(
                          'नोंदणी पूर्ण करा / Finish',
                          style: GoogleFonts.mukta(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _Step5Success extends StatelessWidget {
  const _Step5Success({required this.memberId, this.referenceId = ''});
  final String memberId;
  final String referenceId;

  void _copyReferralLink(BuildContext context, String code) {
    final shareMsg = referralShareText(code);
    Clipboard.setData(ClipboardData(text: shareMsg));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('रेफरल मेसेज आणि Play Store लिंक कॉपी केली!'),
        backgroundColor: Color(0xFF15803D),
      ),
    );
  }

  void _shareReferralLink(String code) {
    final shareMsg = referralShareText(code);
    shareText(shareMsg, subject: 'Connect मराठा सदस्यत्व आमंत्रण');
  }

  @override
  Widget build(BuildContext context) {
    final displayRef = referenceId.isNotEmpty
        ? referenceId
        : (memberId.isNotEmpty ? 'REF-96K-${memberId.replaceAll(RegExp(r'\\D'), '')}' : '');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 12),
        const Icon(Icons.check_circle, color: AppColors.success, size: 56),
        const SizedBox(height: 12),
        Text(
          'अभिनंदन! तुमची नोंदणी पूर्ण झाली\nRegistration Completed!',
          textAlign: TextAlign.center,
          style: GoogleFonts.mukta(fontSize: 19, fontWeight: FontWeight.w900, color: const Color(0xFF2B1B12)),
        ),
        const SizedBox(height: 6),
        Text(
          'तुमचा सदस्य ID / Member ID: $memberId',
          textAlign: TextAlign.center,
          style: GoogleFonts.mukta(
            fontSize: 14,
            color: const Color(0xFF4B5563),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),

        // New Unique Reference ID & Share Card
        if (displayRef.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFED7AA), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEA580C).withValues(alpha: 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.card_giftcard_rounded, color: Color(0xFFEA580C), size: 22),
                    const SizedBox(width: 8),
                    Text(
                      'तुमचा युनिक रेफरल आयडी / Reference ID',
                      style: GoogleFonts.mukta(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF9A3412),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDBA74)),
                  ),
                  child: SelectableText(
                    displayRef,
                    style: GoogleFonts.mukta(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFFC2410C),
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'हा कोड शेअर करून आपल्या मित्रांना व नातेवाईकांना समाजात जोडा!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    color: const Color(0xFF7C2D12),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFFC2410C),
                          side: const BorderSide(color: Color(0xFFFB923C)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _copyReferralLink(context, displayRef),
                        icon: const Icon(Icons.copy_rounded, size: 16),
                        label: Text('लिंक कॉपी करा', style: GoogleFonts.mukta(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF16A34A),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _shareReferralLink(displayRef),
                        icon: const Icon(Icons.share_rounded, size: 16),
                        label: Text('शेअर करा', style: GoogleFonts.mukta(fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

        const SizedBox(height: 20),
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFFE84C10),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          onPressed: () => context.go('/home'),
          child: Text(
            'माझे डॅशबोर्ड पहा → / Go to Dashboard',
            style: GoogleFonts.mukta(fontSize: 15, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class _NoticeBox extends StatelessWidget {
  const _NoticeBox({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF9F5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFF3E0D2)),
      ),
      child: Text(
        text,
        style: GoogleFonts.mukta(fontSize: 12, color: const Color(0xFF7A2016)),
      ),
    );
  }
}

class _LocationDropdownField extends StatelessWidget {
  const _LocationDropdownField({
    required this.number,
    required this.marathi,
    required this.english,
    required this.icon,
    required this.hint,
    this.disabledHint = 'आधी वरील पर्याय निवडा / Select parent first',
    required this.items,
    required this.selectedItem,
    required this.isEnabled,
    required this.isLoading,
    required this.error,
    required this.onChanged,
    required this.onRetry,
  });

  final String number;
  final String marathi;
  final String english;
  final IconData icon;
  final String hint;
  final String disabledHint;
  final List<LocationItem> items;
  final LocationItem? selectedItem;
  final bool isEnabled;
  final bool isLoading;
  final String? error;
  final ValueChanged<LocationItem?>? onChanged;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final value =
        selectedItem != null && items.contains(selectedItem)
            ? selectedItem
            : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildTitle(),
        if (error != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            margin: const EdgeInsets.only(bottom: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFCA5A5)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 18,
                  color: Color(0xFFDC2626),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    error!,
                    style: GoogleFonts.mukta(
                      fontSize: 12,
                      color: const Color(0xFFB91C1C),
                    ),
                  ),
                ),
                if (onRetry != null)
                  TextButton(
                    onPressed: onRetry,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      'पुन्हा प्रयत्न करा / Retry',
                      style: GoogleFonts.mukta(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFFDC2626),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        DropdownButtonFormField<LocationItem>(
          value: value,
          decoration: InputDecoration(
            filled: true,
            fillColor: isEnabled ? Colors.white : const Color(0xFFF3F4F6),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5DCD0)),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(
                color: Color(0xFFE84C10),
                width: 1.5,
              ),
            ),
          ),
          isExpanded: true,
          hint: Text(
            isLoading
                ? 'लोड होत आहे... / Loading...'
                : !isEnabled
                ? disabledHint
                : items.isEmpty
                ? 'माहिती उपलब्ध नाही / No data'
                : hint,
            style: GoogleFonts.mukta(
              fontSize: 13.5,
              color: const Color(0xFF9CA3AF),
            ),
            overflow: TextOverflow.ellipsis,
          ),
          icon:
              isLoading
                  ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Color(0xFFE84C10),
                    ),
                  )
                  : Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color:
                        isEnabled
                            ? const Color(0xFFE84C10)
                            : const Color(0xFF9CA3AF),
                  ),
          items:
              (!isEnabled || isLoading)
                  ? null
                  : items.map((item) {
                    return DropdownMenuItem<LocationItem>(
                      value: item,
                      child: Text(
                        item.displayName,
                        style: GoogleFonts.mukta(
                          fontSize: 13.5,
                          color: const Color(0xFF1F2937),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
          onChanged:
              (isEnabled && !isLoading && items.isNotEmpty) ? onChanged : null,
        ),
        const SizedBox(height: 14),
      ],
    );
  }

  Widget _buildTitle() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFFE84C10)),
          const SizedBox(width: 6),
          RichText(
            text: TextSpan(
              style: GoogleFonts.mukta(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1F2937),
              ),
              children: [
                TextSpan(
                  text: '$number. ',
                  style: const TextStyle(color: Color(0xFFE84C10)),
                ),
                TextSpan(text: marathi),
                TextSpan(
                  text: ' / $english',
                  style: GoogleFonts.mukta(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
