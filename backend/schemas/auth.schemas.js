/**
 * Connect Maratha - Strict Input Schemas for Authentication & User Routes
 */

export const loginSchema = {
  identifier: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 120
  },
  phone: {
    type: 'string',
    required: false,
    maxLength: 30
  },
  mobile: {
    type: 'string',
    required: false,
    maxLength: 30
  },
  email: {
    type: 'string',
    required: false,
    maxLength: 120
  },
  password: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 128
  }
};

export const registerSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    type: 'string',
    required: false,
    format: 'email',
    maxLength: 120
  },
  phone: {
    type: 'string',
    required: false,
    format: 'phone',
    minLength: 10,
    maxLength: 15
  },
  password: {
    type: 'string',
    required: false,
    minLength: 6,
    maxLength: 128
  },
  city: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  district: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  state: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  country: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  countryId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  stateId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  districtId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  talukaId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  villageId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  taluka: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  village: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  profession: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  business: {
    type: 'string',
    required: false,
    maxLength: 150
  },
  education: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  skills: {
    type: ['string', 'array'],
    required: false,
    maxLength: 500,
    maxItems: 30,
    itemRule: { type: 'string', maxLength: 50 }
  },
  about: {
    type: ['string', 'array'],
    required: false,
    maxLength: 1000
  },
  reference_id: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  referral_code: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  referred_by: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  referenceId: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  referredBy: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  referralCode: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  mobile: {
    type: 'string',
    required: false,
    maxLength: 30
  },
  organization: {
    type: 'string',
    required: false,
    maxLength: 150
  },
  legalCompliance: {
    type: 'object',
    required: false
  },
  // Mobile app sends a single selected interest as a string; web sends an array.
  interests: {
    type: ['string', 'array'],
    required: false,
    maxLength: 200,
    maxItems: 30
  },
  goals: {
    type: ['string', 'array'],
    required: false,
    maxLength: 500,
    maxItems: 30
  },
  kul: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  gotra: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  avatar: {
    type: 'string',
    required: false,
    maxLength: 250
  },
  dob: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  gender: {
    type: 'string',
    required: false,
    maxLength: 30
  },
  bloodGroup: {
    type: 'string',
    required: false,
    maxLength: 20
  },
  blood_group: {
    type: 'string',
    required: false,
    maxLength: 20
  }
};

export const googleAuthSchema = {
  googleId: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  email: {
    type: 'string',
    required: false,
    format: 'email',
    maxLength: 120
  },
  name: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100
  },
  photoUrl: {
    type: 'string',
    required: false,
    maxLength: 500
  }
};

export const forgotPasswordSchema = {
  email: {
    type: 'string',
    required: true,
    format: 'email',
    maxLength: 120
  }
};

export const verifyResetOtpSchema = {
  email: {
    type: 'string',
    required: true,
    format: 'email',
    maxLength: 120
  },
  otp: {
    type: 'string',
    required: true,
    format: 'otp'
  }
};

export const resetPasswordSchema = {
  email: {
    type: 'string',
    required: true,
    format: 'email',
    maxLength: 120
  },
  resetToken: {
    type: 'string',
    required: true,
    minLength: 20,
    maxLength: 1024
  },
  newPassword: {
    type: 'string',
    required: true,
    minLength: 6,
    maxLength: 128
  }
};

export const changePasswordSchema = {
  oldPassword: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 128
  },
  newPassword: {
    type: 'string',
    required: true,
    minLength: 6,
    maxLength: 128
  }
};

export const deleteAccountSchema = {
  confirm: {
    type: 'string',
    required: true,
    enum: ['DELETE']
  },
  password: {
    type: 'string',
    required: false,
    maxLength: 128
  },
  idToken: {
    type: 'string',
    required: false,
    maxLength: 2048
  }
};
