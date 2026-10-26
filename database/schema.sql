-- ========================================================
-- Connect Maratha (कनेक्ट मराठा) SQLite Database Schema
-- ========================================================

CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id);

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

CREATE TABLE IF NOT EXISTS talukas (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_talukas_district_id ON talukas(district_id);

CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY,
  taluka_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT
);
CREATE INDEX IF NOT EXISTS idx_villages_taluka_id ON villages(taluka_id);
CREATE INDEX IF NOT EXISTS idx_villages_name ON villages(name);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password_hash TEXT,
  avatar TEXT DEFAULT '👤',
  city TEXT,
  district TEXT,
  state TEXT DEFAULT 'महाराष्ट्र',
  country TEXT DEFAULT 'भारत',
  country_id TEXT,
  state_id TEXT,
  district_id TEXT,
  taluka_id TEXT,
  village_id TEXT,
  taluka TEXT,
  village TEXT,
  profession TEXT,
  business TEXT,
  skills TEXT DEFAULT '[]',
  education TEXT,
  interests TEXT DEFAULT '[]',
  about TEXT,
  tier TEXT DEFAULT 'Gold',
  role TEXT DEFAULT 'member',
  verified_mobile INTEGER DEFAULT 1,
  verified_email INTEGER DEFAULT 1,
  verified_profile INTEGER DEFAULT 0,
  joined TEXT,
  referred_by TEXT,
  is_vip INTEGER DEFAULT 0,
  vip_number TEXT,
  status TEXT DEFAULT 'active',   -- 'disabled' blocks login
  unit_id TEXT,                   -- CRM unit this account belongs to
  unit_role TEXT,                 -- owner | staff
  token_version INTEGER DEFAULT 0, -- bumped on password change / disable to revoke old tokens
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT,
  cat TEXT,
  city TEXT,
  district TEXT,
  photo TEXT DEFAULT '🏢',
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  hours TEXT,
  services TEXT DEFAULT '[]',
  offers TEXT,
  rating REAL DEFAULT 4.5,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS business_reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  member_name TEXT,
  rating INTEGER DEFAULT 5,
  text TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  giver_id TEXT,
  giver_name TEXT,
  recipient_id TEXT,
  recipient_name TEXT,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  status TEXT DEFAULT 'New',
  value REAL DEFAULT 0,
  notes TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  requester_id TEXT,
  requester_name TEXT,
  recipient_id TEXT,
  recipient_name TEXT,
  date TEXT,
  time TEXT,
  topic TEXT,
  status TEXT DEFAULT 'Confirmed',
  notes TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  category TEXT,
  district TEXT,
  desc TEXT,
  cover TEXT,
  members_count INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT,
  member_id TEXT,
  joined_at TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  author_id TEXT,
  author_name TEXT,
  author_avatar TEXT DEFAULT '👤',
  group_id TEXT,
  text TEXT NOT NULL,
  image TEXT,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  premium_number TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  member_id TEXT
);

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  author_id TEXT,
  author_name TEXT,
  text TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS post_shares (
  id TEXT PRIMARY KEY,
  post_id TEXT,
  member_id TEXT,
  platform TEXT DEFAULT 'internal',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS member_connections (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  status TEXT DEFAULT 'connected',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_member_conn_follower ON member_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_member_conn_following ON member_connections(following_id);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  cat TEXT,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '🚩',
  target REAL DEFAULT 1000000,
  collected REAL DEFAULT 0,
  donors INTEGER DEFAULT 0,
  cover TEXT,
  desc TEXT,
  expenses TEXT DEFAULT '[]',
  active INTEGER DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  campaign_title TEXT,
  donor_name TEXT,
  donor_id TEXT,
  amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'UPI',
  phone TEXT,
  is_anonymous INTEGER DEFAULT 0,
  tx_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  date TEXT,
  time TEXT,
  venue TEXT,
  district TEXT,
  desc TEXT,
  organizer TEXT,
  banner TEXT,
  rsvp_count INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  member_id TEXT,
  member_name TEXT,
  phone TEXT,
  seats INTEGER DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  district TEXT,
  category TEXT,
  salary TEXT,
  job_type TEXT DEFAULT 'Full-time',
  experience TEXT,
  desc TEXT,
  contact_email TEXT,
  phone TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  applicant_name TEXT,
  phone TEXT,
  email TEXT,
  resume_summary TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  details TEXT,
  created_at TEXT
);

-- ========================================================
-- 20,000-Question Maratha History & Heritage Quiz Tables
-- ========================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id TEXT PRIMARY KEY,
  language TEXT DEFAULT 'mr',
  category TEXT NOT NULL,
  sub_category TEXT,
  difficulty TEXT NOT NULL,
  question_type TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  historical_period TEXT,
  person TEXT,
  fort TEXT,
  battle TEXT,
  year INTEGER,
  source TEXT,
  source_url TEXT,
  verification_status TEXT DEFAULT 'verified',
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_quiz_category ON quiz_questions (category);
CREATE INDEX IF NOT EXISTS idx_quiz_difficulty ON quiz_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_type ON quiz_questions (question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_cat_diff ON quiz_questions (category, difficulty);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id TEXT PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  city TEXT,
  category TEXT,
  score INTEGER,
  total INTEGER,
  percentage INTEGER,
  points INTEGER,
  streak INTEGER,
  rank_title TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_points ON quiz_submissions (points DESC);

CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT PRIMARY KEY,
  otp_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- ========================================================
-- CRM Operations, Support Tickets & Commercial Ecosystem
-- ========================================================

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  subcategory TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'New',
  district TEXT,
  taluka TEXT,
  division TEXT,
  assigned_center_id TEXT,
  assigned_staff_id TEXT,
  current_owner_level TEXT DEFAULT 'taluka',
  requester_id TEXT,
  requester_name TEXT,
  requester_phone TEXT,
  sla_hours INTEGER DEFAULT 72,
  resolution_notes TEXT,
  audit_trail TEXT DEFAULT '[]',
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_district ON tickets(district);

CREATE TABLE IF NOT EXISTS business_enquiries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_phone TEXT,
  sender_email TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_business_enquiries_bid ON business_enquiries(business_id);

CREATE TABLE IF NOT EXISTS b2b_enquiries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  district TEXT,
  description TEXT,
  budget REAL DEFAULT 0,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'Open',
  author_id TEXT,
  quotes TEXT DEFAULT '[]',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_b2b_enquiries_district ON b2b_enquiries(district);

CREATE TABLE IF NOT EXISTS community_centers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  tier TEXT,
  district TEXT,
  taluka TEXT,
  division TEXT,
  address TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  partner_name TEXT,
  today_visitors INTEGER DEFAULT 0,
  daily_collection REAL DEFAULT 0,
  status TEXT DEFAULT 'सक्रिय',
  -- CRM unit hierarchy: State -> Branch -> Division -> District -> Taluka
  level TEXT,            -- state | branch | division | district | taluka
  parent_id TEXT,        -- the unit directly above (NULL for a state unit)
  ancestor_ids TEXT DEFAULT '[]', -- JSON array of every unit above, top first
  owner_id TEXT,         -- members.id of the owner login
  staff_ids TEXT DEFAULT '[]',    -- JSON array of members.id (staff logins)
  created_at TEXT
);

-- Yearly activity plan: every unit runs the 12 standard activities within the year
CREATE TABLE IF NOT EXISTS unit_activities (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL,        -- health_checkup | blood_donation | job_fair | business_expo | job_business_consultancy | matrimony | education_consultancy | childrens_games | spiritual | mahila_bachat_gat | krushi_sabha | food_expo
  title TEXT,
  scheduled_date TEXT,       -- YYYY-MM-DD
  target_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned', -- planned | in_progress | done (overdue is derived: not done and past scheduled_date)
  notes TEXT,                -- proof
  attendee_count INTEGER DEFAULT 0, -- proof
  photo_url TEXT,            -- proof
  completed_at TEXT,
  completed_by TEXT,
  created_by TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_unit_activities_unit ON unit_activities(unit_id, year);

CREATE TABLE IF NOT EXISTS organization_units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  district TEXT,
  taluka TEXT,
  division TEXT,
  head_id TEXT,
  head_name TEXT,
  active_members_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'सक्रिय',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS center_activities (
  id TEXT PRIMARY KEY,
  center_id TEXT,
  type TEXT,
  visitor_name TEXT,
  phone TEXT,
  purpose TEXT,
  desk TEXT,
  payer_name TEXT,
  category TEXT,
  amount REAL DEFAULT 0,
  payment_mode TEXT,
  collected_by TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_center_activities_center ON center_activities(center_id);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  city TEXT,
  phone TEXT NOT NULL,
  experience TEXT,
  description TEXT,
  hourly_rate TEXT,
  rating TEXT DEFAULT '5.0 ★',
  status TEXT DEFAULT 'pending_approval',
  verified INTEGER DEFAULT 0,
  submitted_by TEXT,
  provider_name TEXT,
  moderation_notes TEXT,
  moderated_by TEXT,
  moderator_name TEXT,
  moderated_at TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

CREATE TABLE IF NOT EXISTS service_bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT,
  service_category TEXT,
  professional_name TEXT,
  provider_id TEXT,
  customer_name TEXT,
  customer_id TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  requested_date TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new_booking',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_service_bookings_service ON service_bookings(service_id);

-- ========================================================
-- Connect Maratha — Seva & Emergency Response Network
-- ========================================================

CREATE TABLE IF NOT EXISTS emergency_cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT DEFAULT 'high',
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  division TEXT,
  landmark TEXT,
  lat REAL,
  lng REAL,
  radius_km REAL DEFAULT 15.0,
  reporter_id TEXT,
  reporter_name TEXT,
  reporter_phone TEXT,
  is_anonymous INTEGER DEFAULT 0,
  official_services_contacted INTEGER DEFAULT 0,
  reporting_for TEXT DEFAULT 'self',
  people_affected INTEGER DEFAULT 1,
  photo_url TEXT,
  status TEXT DEFAULT 'submitted',
  verified INTEGER DEFAULT 0,
  verified_by TEXT,
  verified_at TEXT,
  resolution_notes TEXT,
  resolved_by TEXT,
  resolved_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergency_cases(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_category ON emergency_cases(category);
CREATE INDEX IF NOT EXISTS idx_emergencies_district ON emergency_cases(district);

CREATE TABLE IF NOT EXISTS emergency_responses (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  responder_id TEXT,
  responder_name TEXT NOT NULL,
  responder_phone TEXT NOT NULL,
  eta_minutes INTEGER DEFAULT 30,
  capabilities TEXT,
  message TEXT,
  status TEXT DEFAULT 'offered',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_emergency_resp_case ON emergency_responses(case_id);

CREATE TABLE IF NOT EXISTS emergency_updates (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  note TEXT NOT NULL,
  status_change TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_emergency_upd_case ON emergency_updates(case_id);

CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  items_needed TEXT DEFAULT '[]',
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  requester_id TEXT,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  urgency TEXT DEFAULT 'moderate',
  status TEXT DEFAULT 'published',
  assigned_volunteer_id TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_help_req_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_req_cat ON help_requests(category);
CREATE INDEX IF NOT EXISTS idx_help_req_district ON help_requests(district);

CREATE TABLE IF NOT EXISTS help_offers (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  helper_id TEXT,
  helper_name TEXT NOT NULL,
  helper_phone TEXT NOT NULL,
  offered_items TEXT,
  note TEXT,
  status TEXT DEFAULT 'offered',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_help_offers_req ON help_offers(request_id);

CREATE TABLE IF NOT EXISTS service_inquiries (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  requester_id TEXT,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_service_inq_listing ON service_inquiries(listing_id);

CREATE TABLE IF NOT EXISTS moderation_reports (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reporter_id TEXT,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_mod_reports_status ON moderation_reports(status);

-- ========================================================
-- Community Portals, Culture & Healthcare Directories
-- ========================================================

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT,
  pages INTEGER,
  year TEXT,
  publisher TEXT,
  price TEXT,
  rating TEXT,
  description TEXT,
  cover TEXT,
  download_url TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT,
  category TEXT,
  rating TEXT,
  genre TEXT,
  cast TEXT,
  desc TEXT,
  badge TEXT,
  trailer_id TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_movies_category ON movies(category);

CREATE TABLE IF NOT EXISTS speakers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  topics TEXT,
  city TEXT,
  category TEXT,
  photo TEXT,
  sessions TEXT,
  desc TEXT,
  contact TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_speakers_category ON speakers(category);

CREATE TABLE IF NOT EXISTS officers (
  id TEXT PRIMARY KEY,
  service TEXT,
  name TEXT NOT NULL,
  photo TEXT,
  cadre TEXT,
  designation TEXT,
  location TEXT,
  department TEXT,
  category TEXT,
  icon TEXT,
  contribution TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_officers_category ON officers(category);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT,
  established TEXT,
  hq TEXT,
  presence TEXT,
  members TEXT,
  focus TEXT,
  icon TEXT,
  contact TEXT,
  district TEXT,
  state TEXT DEFAULT 'महाराष्ट्र',
  is_verified INTEGER DEFAULT 0,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_organizations_category ON organizations(category);

CREATE TABLE IF NOT EXISTS social_workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  field TEXT,
  location TEXT,
  district TEXT,
  specializations TEXT,
  is_verified INTEGER DEFAULT 0,
  member_id TEXT,
  experience TEXT,
  impact TEXT,
  icon TEXT,
  category TEXT,
  phone TEXT,
  email TEXT,
  awards TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_social_workers_category ON social_workers(category);

CREATE TABLE IF NOT EXISTS scholarships (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  org TEXT,
  eligible TEXT,
  benefit TEXT,
  courses TEXT,
  portal TEXT,
  last_date TEXT,
  badge TEXT,
  category TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  district TEXT,
  division TEXT,
  stream TEXT,
  stream_label TEXT,
  courses TEXT DEFAULT '[]',
  facilities TEXT DEFAULT '[]',
  rating TEXT,
  website TEXT,
  phone TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON colleges(district);
CREATE INDEX IF NOT EXISTS idx_colleges_stream ON colleges(stream);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  degree TEXT,
  category TEXT,
  hospital TEXT,
  city TEXT,
  phone TEXT,
  consultation_fee TEXT,
  timing TEXT,
  experience TEXT,
  rating TEXT,
  photo TEXT,
  icon TEXT,
  verified INTEGER DEFAULT 1,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_doctors_category ON doctors(category);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);

CREATE TABLE IF NOT EXISTS blood_requests (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  hospital TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  contact TEXT NOT NULL,
  urgency TEXT DEFAULT 'तात्काळ',
  units_needed INTEGER DEFAULT 1,
  status TEXT DEFAULT 'सक्रिय',
  verified INTEGER DEFAULT 1,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_blood_req_group ON blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_req_city ON blood_requests(city);

CREATE TABLE IF NOT EXISTS blood_donors (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  contact TEXT NOT NULL,
  last_donated TEXT,
  available INTEGER DEFAULT 1,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_blood_donors_group ON blood_donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_donors_city ON blood_donors(city);

CREATE TABLE IF NOT EXISTS matrimony_profiles (
  id TEXT PRIMARY KEY,
  member_id TEXT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT,
  height TEXT,
  education TEXT,
  profession TEXT,
  income TEXT,
  city TEXT,
  district TEXT,
  kul TEXT,
  gotra TEXT,
  photo TEXT,
  contact TEXT,
  about TEXT,
  verified INTEGER DEFAULT 1,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_matrimony_gender ON matrimony_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_matrimony_district ON matrimony_profiles(district);

CREATE TABLE IF NOT EXISTS bank_loans (
  id TEXT PRIMARY KEY,
  bank_name TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  max_amount TEXT,
  interest_rate TEXT,
  subsidy TEXT,
  eligibility TEXT,
  purpose TEXT,
  documents TEXT DEFAULT '[]',
  contact TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS dairy (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  milk_type TEXT,
  daily_collection TEXT,
  rate_per_liter TEXT,
  contact TEXT,
  chilling_center TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS manufacturers (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  category TEXT,
  products TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  email TEXT,
  turnover TEXT,
  employees TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT,
  city TEXT,
  field TEXT,
  blood_group TEXT,
  availability TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS grievances (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  department TEXT,
  applicant_name TEXT,
  phone TEXT,
  district TEXT,
  taluka TEXT,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS builders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  projects TEXT,
  city TEXT,
  district TEXT,
  rera_number TEXT,
  phone TEXT,
  created_at TEXT
);

-- ========================================================
-- CRM Operational Tables & Extended Service Ecosystem
-- ========================================================

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  branch_id TEXT,
  district TEXT,
  division TEXT,
  taluka TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_staff_district ON staff(district);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  division TEXT,
  district TEXT NOT NULL,
  taluka TEXT,
  address TEXT,
  manager_id TEXT,
  manager_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_branches_district ON branches(district);

CREATE TABLE IF NOT EXISTS branch_activities (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  amount REAL DEFAULT 0,
  logged_by TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_branch_activities_bid ON branch_activities(branch_id);

CREATE TABLE IF NOT EXISTS territory_officers (
  id TEXT PRIMARY KEY,
  officer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  territory_level TEXT DEFAULT 'taluka',
  division TEXT,
  district TEXT,
  taluka TEXT,
  jurisdiction TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_territory_officers_dist ON territory_officers(district);

CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT DEFAULT '🔧',
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS service_reviews (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  reviewer_id TEXT,
  reviewer_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  comment TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_service_reviews_sid ON service_reviews(service_id);

CREATE TABLE IF NOT EXISTS client_enquiries (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_category TEXT,
  location TEXT,
  district TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_client_enquiries_status ON client_enquiries(status);

CREATE TABLE IF NOT EXISTS business_quotes (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  amount REAL NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_business_quotes_eid ON business_quotes(enquiry_id);

CREATE TABLE IF NOT EXISTS doctor_appointments (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  preferred_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_doctor_appts_doc ON doctor_appointments(doctor_id);

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id TEXT PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  hotel_name TEXT,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  rooms INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hid ON hotel_bookings(hotel_id);

CREATE TABLE IF NOT EXISTS matrimony_interests (
  id TEXT PRIMARY KEY,
  sender_profile_id TEXT NOT NULL,
  receiver_profile_id TEXT NOT NULL,
  sender_name TEXT,
  receiver_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_matrimony_interests_rec ON matrimony_interests(receiver_profile_id);

CREATE TABLE IF NOT EXISTS blood_responses (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  donor_id TEXT,
  donor_name TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  eta_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pledged',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_blood_resp_req ON blood_responses(request_id);

CREATE TABLE IF NOT EXISTS member_referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referrer_name TEXT,
  referrer_phone TEXT,
  referee_id TEXT NOT NULL,
  referee_name TEXT NOT NULL,
  referee_phone TEXT NOT NULL,
  district TEXT,
  taluka TEXT,
  status TEXT DEFAULT 'active',
  bonus_amount REAL DEFAULT 100,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_member_referrals_ref ON member_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_member_referrals_user ON member_referrals(referee_id);

CREATE TABLE IF NOT EXISTS referral_payouts (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_ref_payouts_member ON referral_payouts(member_id);

CREATE TABLE IF NOT EXISTS direct_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  sender_avatar TEXT,
  recipient_id TEXT NOT NULL,
  recipient_name TEXT,
  recipient_avatar TEXT,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  is_read INTEGER DEFAULT 0,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_dm_conv ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id);


-- ========================================================
-- Community Static Portal Tables (New Backend Integration)
-- ========================================================

-- Maratha Organizations Directory
-- organizations is defined earlier in this file (single source of truth)
CREATE INDEX IF NOT EXISTS idx_org_district ON organizations(district);
CREATE INDEX IF NOT EXISTS idx_org_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_org_category ON organizations(category);
CREATE INDEX IF NOT EXISTS idx_org_verified ON organizations(is_verified);

-- Maratha News Media
CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  summary TEXT,
  content TEXT,
  category TEXT, -- 'Heritage', 'Business', 'Culture', 'Events', 'Achievements', 'Governance', 'Technology', 'Sports'
  tags JSON, -- Array of tags
  author_id TEXT,
  author_name TEXT,
  author_role TEXT,
  featured_image TEXT,
  gallery_images JSON, -- Array of image URLs
  district TEXT,
  state TEXT DEFAULT 'महाराष्ट्र',
  is_published INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_breaking INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_news_district ON news_articles(district);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news_articles(is_featured);

-- Women Empowerment Programs
CREATE TABLE IF NOT EXISTS women_programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  category TEXT, -- 'Education', 'Entrepreneurship', 'Health', 'Leadership', 'Legal Rights', 'Skill Development', 'Financial Literacy'
  target_audience TEXT, -- 'Students', 'Entrepreneurs', 'Homemakers', 'Professionals', 'Rural Women', 'All'
  district TEXT,
  taluka TEXT,
  venue TEXT,
  start_date TEXT,
  end_date TEXT,
  registration_deadline TEXT,
  max_participants INTEGER,
  registered_count INTEGER DEFAULT 0,
  fee_amount REAL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  organizer_id TEXT,
  organizer_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  requirements JSON, -- Array of requirements
  benefits JSON, -- Array of benefits
  schedule JSON, -- Array of session objects
  speakers JSON, -- Array of speaker objects
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  image_url TEXT,
  gallery_images JSON,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_women_cat ON women_programs(category);
CREATE INDEX IF NOT EXISTS idx_women_district ON women_programs(district);
CREATE INDEX IF NOT EXISTS idx_women_active ON women_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_women_dates ON women_programs(start_date, end_date);

-- Social Workers Directory
-- social_workers is defined earlier in this file (single source of truth)
CREATE INDEX IF NOT EXISTS idx_sw_district ON social_workers(district);
CREATE INDEX IF NOT EXISTS idx_sw_spec ON social_workers(specializations);
CREATE INDEX IF NOT EXISTS idx_sw_verified ON social_workers(is_verified);
CREATE INDEX IF NOT EXISTS idx_sw_member ON social_workers(member_id);

-- Historical Movements & Events
CREATE TABLE IF NOT EXISTS historical_movements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  type TEXT, -- 'Freedom Movement', 'Social Reform', 'Cultural Renaissance', 'Political Movement', 'Economic Movement', 'Educational Movement'
  period_start TEXT, -- Year or date
  period_end TEXT,
  key_figures JSON, -- Array of {name, role, bio}
  locations JSON, -- Array of {place, district, significance}
  outcomes TEXT,
  significance TEXT,
  related_forts JSON, -- Array of fort IDs
  related_personalities JSON, -- Array of personality IDs
  images JSON, -- Array of image URLs
  documents JSON, -- Array of document references
  "references" JSON, -- Array of citation objects
  district TEXT,
  state TEXT DEFAULT 'महाराष्ट्र',
  is_featured INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_hist_type ON historical_movements(type);
CREATE INDEX IF NOT EXISTS idx_hist_district ON historical_movements(district);
CREATE INDEX IF NOT EXISTS idx_hist_featured ON historical_movements(is_featured);
CREATE INDEX IF NOT EXISTS idx_hist_period ON historical_movements(period_start, period_end);

-- Community Oral History
CREATE TABLE IF NOT EXISTS oral_history (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  narrator_name TEXT NOT NULL,
  narrator_age INTEGER,
  narrator_village TEXT,
  narrator_district TEXT,
  narrator_taluka TEXT,
  narrator_occupation TEXT,
  interviewer_name TEXT,
  interview_date TEXT,
  language TEXT DEFAULT 'मराठी',
  dialect TEXT,
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  summary TEXT,
  keywords JSON, -- Array of keywords
  categories JSON, -- Array: 'Folklore', 'History', 'Culture', 'Traditions', 'Personal Narrative', 'Community Events', 'Festivals', 'Rituals', 'Crafts', 'Agriculture'
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  format TEXT, -- 'audio/mp3', 'video/mp4'
  is_published INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  access_level TEXT DEFAULT 'public', -- 'public', 'members', 'researchers', 'private'
  recorded_by TEXT,
  transcribed_by TEXT,
  translated_by TEXT,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_oral_district ON oral_history(narrator_district);
CREATE INDEX IF NOT EXISTS idx_oral_cat ON oral_history(categories);
CREATE INDEX IF NOT EXISTS idx_oral_published ON oral_history(is_published);
CREATE INDEX IF NOT EXISTS idx_oral_date ON oral_history(interview_date);

-- ========================================================
-- Women Empowerment (महिला सक्षमीकरण कक्ष)
-- ========================================================

CREATE TABLE IF NOT EXISTS women_entrepreneurs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  district TEXT NOT NULL,
  taluka TEXT,
  city TEXT,
  description TEXT,
  products_services TEXT,
  contact_phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  photo TEXT,
  shg_name TEXT,
  is_shg INTEGER DEFAULT 0,
  employees_count INTEGER DEFAULT 1,
  annual_turnover TEXT,
  verified INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_women_ent_district ON women_entrepreneurs(district);
CREATE INDEX IF NOT EXISTS idx_women_ent_cat ON women_entrepreneurs(category);

CREATE TABLE IF NOT EXISTS women_programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  provider TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT,
  benefits TEXT,
  duration TEXT,
  district TEXT DEFAULT 'सर्व महाराष्ट्र',
  contact_phone TEXT,
  apply_url TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_women_prg_type ON women_programs(type);

CREATE TABLE IF NOT EXISTS women_mentors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  field TEXT NOT NULL,
  experience TEXT,
  district TEXT,
  about TEXT,
  photo TEXT,
  contact_phone TEXT,
  email TEXT,
  available_modes TEXT DEFAULT 'फोन / व्हिडिओ कॉल / प्रत्यक्ष भेट',
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS women_help_cases (
  id TEXT PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  applicant_id TEXT,
  applicant_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'सामान्य',
  description TEXT NOT NULL,
  preferred_time TEXT,
  assigned_coordinator TEXT,
  coordinator_phone TEXT,
  status TEXT DEFAULT 'समीक्षेत',
  counselor_notes TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_women_help_status ON women_help_cases(status);
CREATE INDEX IF NOT EXISTS idx_women_help_district ON women_help_cases(district);

-- -------------------------------------------------------------
-- DURG SANVARDHAN & DONATIONS (दुर्ग संवर्धन व देणगी कोष)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS durg_projects (
  id TEXT PRIMARY KEY,
  fort_name TEXT NOT NULL,
  title TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT,
  category TEXT NOT NULL DEFAULT 'गडकोट संवर्धन',
  target_amount REAL NOT NULL,
  collected_amount REAL NOT NULL DEFAULT 0,
  spent_amount REAL NOT NULL DEFAULT 0,
  donors_count INTEGER NOT NULL DEFAULT 0,
  volunteers_count INTEGER NOT NULL DEFAULT 0,
  phase TEXT NOT NULL DEFAULT 'सक्रिय संवर्धन टप्पा',
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT,
  description TEXT,
  asi_approval_ref TEXT,
  lead_organization TEXT,
  coordinator_name TEXT,
  coordinator_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_durg_projects_district ON durg_projects(district);
CREATE INDEX IF NOT EXISTS idx_durg_projects_status ON durg_projects(status);

CREATE TABLE IF NOT EXISTS durg_expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  voucher_number TEXT UNIQUE NOT NULL,
  expense_title TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  invoice_ref TEXT,
  payment_mode TEXT DEFAULT 'RTGS/NEFT',
  approved_by TEXT NOT NULL,
  approval_date TEXT NOT NULL,
  audit_status TEXT NOT NULL DEFAULT 'CA Verified',
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES durg_projects(id)
);
CREATE INDEX IF NOT EXISTS idx_durg_expenses_project ON durg_expenses(project_id);

CREATE TABLE IF NOT EXISTS durg_volunteers (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  fort_name TEXT NOT NULL,
  volunteer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  blood_group TEXT,
  trek_experience TEXT,
  participated_camps INTEGER NOT NULL DEFAULT 1,
  skills TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_durg_volunteers_fort ON durg_volunteers(fort_name);

CREATE TABLE IF NOT EXISTS donation_audits (
  id TEXT PRIMARY KEY,
  financial_year TEXT NOT NULL,
  ca_firm_name TEXT NOT NULL,
  ca_membership_no TEXT NOT NULL,
  total_receipts REAL NOT NULL,
  total_expenditure REAL NOT NULL,
  surplus_balance REAL NOT NULL,
  audit_report_url TEXT,
  certificate_status TEXT NOT NULL DEFAULT 'Unqualified (Clean)',
  created_at TEXT NOT NULL
);

-- -------------------------------------------------------------
-- MARATHA ORGANIZATIONS SUITE (सामाजिक संस्था व संघटना)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_office_bearers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT,
  term_period TEXT DEFAULT '२०२४ - २०२७',
  is_primary INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE INDEX IF NOT EXISTS idx_org_bearers_org ON org_office_bearers(org_id);

CREATE TABLE IF NOT EXISTS org_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'सामाजिक परिषद',
  event_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  district TEXT NOT NULL,
  attendees_expected INTEGER DEFAULT 500,
  description TEXT,
  coordinator_name TEXT,
  coordinator_phone TEXT,
  status TEXT DEFAULT 'आगामी (Upcoming)',
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE INDEX IF NOT EXISTS idx_org_events_org ON org_events(org_id);

CREATE TABLE IF NOT EXISTS org_collaborations (
  id TEXT PRIMARY KEY,
  requesting_org_id TEXT,
  requesting_org_name TEXT NOT NULL,
  target_org_id TEXT NOT NULL,
  target_org_name TEXT NOT NULL,
  initiative_title TEXT NOT NULL,
  proposal_summary TEXT NOT NULL,
  district TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'प्रलंबित (Pending)',
  created_at TEXT NOT NULL,
  FOREIGN KEY (target_org_id) REFERENCES organizations(id)
);
CREATE INDEX IF NOT EXISTS idx_org_collab_target ON org_collaborations(target_org_id);

CREATE TABLE IF NOT EXISTS org_work_reports (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  report_year TEXT NOT NULL,
  title TEXT NOT NULL,
  beneficiaries_count INTEGER DEFAULT 0,
  events_conducted INTEGER DEFAULT 0,
  total_spend REAL DEFAULT 0,
  summary TEXT NOT NULL,
  report_file_url TEXT,
  submitted_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
CREATE INDEX IF NOT EXISTS idx_org_work_reports_org ON org_work_reports(org_id);

-- -------------------------------------------------------------
-- NISHTHAVANT SOCIAL WORKERS SUITE (निष्ठावंत समाजसेवक व मदत जुळवणी)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_help_requests (
  id TEXT PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  district TEXT NOT NULL,
  taluka TEXT,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'मध्यम',
  description TEXT NOT NULL,
  assigned_worker_id TEXT,
  assigned_worker_name TEXT,
  status TEXT NOT NULL DEFAULT 'प्रलंबित (Pending)',
  outcome_notes TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (assigned_worker_id) REFERENCES social_workers(id)
);
CREATE INDEX IF NOT EXISTS idx_social_help_worker ON social_help_requests(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_social_help_status ON social_help_requests(status);

CREATE TABLE IF NOT EXISTS social_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  lead_worker_id TEXT,
  lead_worker_name TEXT NOT NULL,
  category TEXT NOT NULL,
  district TEXT NOT NULL,
  target_goal TEXT NOT NULL,
  beneficiaries_count INTEGER DEFAULT 0,
  volunteers_engaged INTEGER DEFAULT 0,
  hours_invested INTEGER DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT DEFAULT 'सक्रिय मोहीम (Active)',
  description TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_worker_id) REFERENCES social_workers(id)
);

CREATE TABLE IF NOT EXISTS social_testimonials (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  citizen_name TEXT NOT NULL,
  citizen_city TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  impact_story TEXT,
  verified INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (worker_id) REFERENCES social_workers(id)
);
CREATE INDEX IF NOT EXISTS idx_social_testi_worker ON social_testimonials(worker_id);

-- ========================================================
-- Connect Maratha — Master Maharashtra Colleges Directory
-- ========================================================
CREATE TABLE IF NOT EXISTS maharashtra_colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district_id TEXT NOT NULL,
  city TEXT NOT NULL,
  division TEXT NOT NULL,
  stream TEXT NOT NULL,
  stream_label TEXT,
  est TEXT,
  ranking TEXT,
  courses TEXT DEFAULT '[]',
  fees TEXT,
  scholarships TEXT DEFAULT '[]',
  admission TEXT,
  website TEXT,
  phone TEXT,
  hostel TEXT,
  image TEXT,
  highlight TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_colleges_district ON maharashtra_colleges(district_id);
CREATE INDEX IF NOT EXISTS idx_colleges_stream ON maharashtra_colleges(stream);
CREATE INDEX IF NOT EXISTS idx_colleges_division ON maharashtra_colleges(division);



