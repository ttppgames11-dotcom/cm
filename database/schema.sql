-- ========================================================
-- Connect Maratha (कनेक्ट मराठा) SQLite Database Schema
-- ========================================================

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
  verified_profile INTEGER DEFAULT 1,
  joined TEXT,
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

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  district TEXT,
  category TEXT DEFAULT 'Hotel',
  star_rating REAL DEFAULT 4.0,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rooms_count INTEGER DEFAULT 10,
  amenities TEXT DEFAULT '[]',
  price_range TEXT,
  photo TEXT DEFAULT '🏨',
  verified INTEGER DEFAULT 1,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS information_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  author TEXT,
  summary TEXT,
  content TEXT,
  tags TEXT DEFAULT '[]',
  image_url TEXT,
  featured INTEGER DEFAULT 0,
  created_at TEXT
);

