import 'user_role.dart';

/// Fields collected across the registration stepper, matching
/// `cm-register.html` steps 1–2 (basic info + profile details).
class RegisterFormData {
  RegisterFormData({
    this.fullName = '',
    this.mobile = '',
    this.email = '',
    this.password = '',
    this.agreedToGuidelines = false,
    this.countryId,
    this.country = '',
    this.stateId,
    this.state = '',
    this.districtId,
    this.district = '',
    this.talukaId,
    this.taluka = '',
    this.villageId,
    this.village = '',
    this.role = UserRole.member,
    this.city = '',
    this.profession = '',
    this.businessName = '',
    this.skills = '',
    this.education = 'पदवीधर (Graduate / Bachelor\'s Degree)',
    this.interest = 'दुर्ग संवर्धन व गडभ्रमण (Fort Conservation & Trekking)',
    this.about = '',
    this.membershipTier = 'Basic',
  });

  String fullName;
  String mobile;
  String email;
  String password;
  bool agreedToGuidelines;
  String? countryId;
  String country;
  String? stateId;
  String state;
  String? districtId;
  String district;
  String? talukaId;
  String taluka;
  String? villageId;
  String village;
  UserRole role;
  String city;
  String profession;
  String businessName;
  String skills;
  String education;
  String interest;
  String about;
  String membershipTier;
}
