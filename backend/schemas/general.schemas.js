/**
 * Connect Maratha - Strict Input Schemas for General Resources (Doctors, Blood Requests)
 */

export const doctorSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  specialty: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  phone: {
    type: 'string',
    required: false,
    format: 'phone',
    minLength: 10,
    maxLength: 15
  },
  hospital: {
    type: 'string',
    required: false,
    maxLength: 150
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
  degree: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  experience: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  address: {
    type: 'string',
    required: false,
    maxLength: 250
  }
};

export const bloodRequestSchema = {
  patientName: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  bloodGroup: {
    type: 'string',
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: {
    type: 'number',
    required: false,
    integer: true,
    min: 1,
    max: 20
  },
  hospital: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 150
  },
  city: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  district: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  contactPhone: {
    type: 'string',
    required: true,
    format: 'phone',
    minLength: 10,
    maxLength: 15
  },
  urgency: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  date: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  notes: {
    type: 'string',
    required: false,
    maxLength: 500
  }
};
