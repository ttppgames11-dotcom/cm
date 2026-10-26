import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery, all, get, saveDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_JSON_PATH = path.join(__dirname, '..', 'backend', 'db.json');

async function migrate() {
  console.log('🚀 Starting JSON to SQLite (Abhay App Database) Unification...');

  if (!fs.existsSync(DB_JSON_PATH)) {
    console.error(`Cannot find ${DB_JSON_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
  const dbData = JSON.parse(raw);

  const stats = {};

  // 1. Books
  if (Array.isArray(dbData.books)) {
    let count = 0;
    for (const b of dbData.books) {
      await runQuery(`
        INSERT OR REPLACE INTO books (id, title, author, category, pages, year, publisher, price, rating, description, cover, download_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        b.id,
        b.title || '',
        b.author || '',
        b.category || '',
        parseInt(b.pages || 0, 10),
        b.year || '',
        b.publisher || '',
        b.price || '',
        b.rating || '',
        b.desc || b.description || '',
        b.cover || '',
        b.downloadUrl || '',
        b.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.books = count;
  }

  // 2. Movies
  if (Array.isArray(dbData.movies)) {
    let count = 0;
    for (const m of dbData.movies) {
      await runQuery(`
        INSERT OR REPLACE INTO movies (id, title, year, category, rating, genre, cast, desc, badge, trailer_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        m.id,
        m.title || '',
        m.year || '',
        m.category || '',
        m.rating || '',
        m.genre || '',
        m.cast || '',
        m.desc || '',
        m.badge || '',
        m.trailerId || '',
        m.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.movies = count;
  }

  // 3. Speakers
  if (Array.isArray(dbData.speakers)) {
    let count = 0;
    for (const s of dbData.speakers) {
      await runQuery(`
        INSERT OR REPLACE INTO speakers (id, name, title, topics, city, category, photo, sessions, desc, contact, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        s.id,
        s.name || '',
        s.expertise || s.title || '',
        s.topics || '',
        s.city || '',
        s.category || '',
        s.photo || '',
        s.sessions || '',
        s.desc || '',
        s.contact || '',
        s.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.speakers = count;
  }

  // 4. Officers
  if (Array.isArray(dbData.officers)) {
    let count = 0;
    for (const o of dbData.officers) {
      await runQuery(`
        INSERT OR REPLACE INTO officers (id, service, name, photo, cadre, designation, location, department, category, icon, contribution, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        o.id,
        o.service || 'IAS',
        o.name || '',
        o.photo || '',
        o.batch || o.cadre || '',
        o.designation || '',
        o.postingCity || o.location || '',
        o.department || '',
        o.category || '',
        o.icon || '🏛️',
        o.contribution || '',
        o.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.officers = count;
  }

  // 5. Organizations
  if (Array.isArray(dbData.organizations)) {
    let count = 0;
    for (const org of dbData.organizations) {
      await runQuery(`
        INSERT OR REPLACE INTO organizations (id, name, category, established, hq, presence, members, focus, icon, contact, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        org.id,
        org.name || '',
        org.category || '',
        org.established || '',
        org.city ? `${org.city}, महाराष्ट्र` : (org.hq || ''),
        org.district || org.presence || '',
        org.president ? `अध्यक्ष: ${org.president}` : (org.members || ''),
        org.workScope || org.focus || '',
        org.logo || org.icon || '🚩',
        org.contact || '',
        org.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.organizations = count;
  }

  // 6. Social Workers
  if (Array.isArray(dbData.socialWorkers)) {
    let count = 0;
    for (const sw of dbData.socialWorkers) {
      await runQuery(`
        INSERT OR REPLACE INTO social_workers (id, name, field, location, experience, impact, icon, category, phone, email, awards, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sw.id,
        sw.name || '',
        sw.field || '',
        sw.location || '',
        sw.experience || '',
        sw.impact || '',
        sw.icon || '🤝',
        sw.category || '',
        sw.phone || '',
        sw.email || '',
        sw.awards || '',
        sw.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.socialWorkers = count;
  }

  // 7. Scholarships
  if (Array.isArray(dbData.scholarships)) {
    let count = 0;
    for (const sch of dbData.scholarships) {
      await runQuery(`
        INSERT OR REPLACE INTO scholarships (id, title, org, eligible, benefit, courses, portal, last_date, badge, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sch.id,
        sch.title || sch.name || '',
        sch.org || '',
        sch.eligible || '',
        sch.benefit || '',
        sch.courses || '',
        sch.portal || '',
        sch.lastDate || sch.last_date || '',
        sch.badge || '',
        sch.category || '',
        sch.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.scholarships = count;
  }

  // 8. Doctors
  if (Array.isArray(dbData.doctors)) {
    let count = 0;
    for (const d of dbData.doctors) {
      await runQuery(`
        INSERT OR REPLACE INTO doctors (id, name, specialty, degree, category, hospital, city, phone, consultation_fee, timing, experience, rating, photo, icon, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        d.id,
        d.name || '',
        d.specialty || '',
        d.degree || '',
        d.category || '',
        d.hospital || '',
        d.city || '',
        d.phone || '',
        d.consultationFee || d.consultation_fee || '',
        d.timing || d.availability || '',
        d.experience || '',
        d.rating || '5.0 ★',
        d.photo || '',
        d.icon || '🩺',
        d.verified ? 1 : 0,
        d.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.doctors = count;
  }

  // 9. Blood Requests
  if (Array.isArray(dbData.bloodRequests)) {
    let count = 0;
    for (const br of dbData.bloodRequests) {
      await runQuery(`
        INSERT OR REPLACE INTO blood_requests (id, patient, blood_group, hospital, city, district, contact, urgency, units_needed, status, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        br.id,
        br.patient || '',
        br.bloodGroup || br.blood_group || '',
        br.hospital || '',
        br.city || '',
        br.district || '',
        br.contact || '',
        br.urgency || 'तात्काळ',
        parseInt(br.units || br.unitsNeeded || 1, 10),
        br.status || 'सक्रिय',
        br.verified ? 1 : 0,
        br.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.bloodRequests = count;
  }

  // 10. Blood Donors
  if (Array.isArray(dbData.bloodDonors)) {
    let count = 0;
    for (const bd of dbData.bloodDonors) {
      await runQuery(`
        INSERT OR REPLACE INTO blood_donors (id, user_id, name, blood_group, city, district, contact, last_donated, available, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bd.id,
        bd.userId || '',
        bd.name || '',
        bd.bloodGroup || bd.blood_group || '',
        bd.city || '',
        bd.district || '',
        bd.contact || bd.phone || '',
        bd.lastDonated || bd.last_donated || '',
        bd.available !== false ? 1 : 0,
        bd.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.bloodDonors = count;
  }

  // 11. Matrimony
  if (Array.isArray(dbData.matrimony)) {
    let count = 0;
    for (const mat of dbData.matrimony) {
      await runQuery(`
        INSERT OR REPLACE INTO matrimony_profiles (id, member_id, name, gender, birth_date, height, education, profession, income, city, district, kul, gotra, photo, contact, about, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mat.id,
        mat.memberId || '',
        mat.name || '',
        mat.gender || '',
        mat.birthDate || mat.birth_date || '',
        mat.height || '',
        mat.education || '',
        mat.profession || '',
        mat.income || '',
        mat.city || '',
        mat.district || '',
        mat.kul || '',
        mat.gotra || '',
        mat.photo || '',
        mat.contact || mat.phone || '',
        mat.about || '',
        mat.verified ? 1 : 0,
        mat.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.matrimony = count;
  }

  // 12. Bank Loans
  if (Array.isArray(dbData.bankLoans)) {
    let count = 0;
    for (const bl of dbData.bankLoans) {
      await runQuery(`
        INSERT OR REPLACE INTO bank_loans (id, bank_name, scheme_name, max_amount, interest_rate, subsidy, eligibility, purpose, documents, contact, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bl.id,
        bl.bankName || bl.bank_name || '',
        bl.schemeName || bl.title || '',
        bl.maxAmount || '',
        bl.interestRate || '',
        bl.subsidy || '',
        bl.eligibility || '',
        bl.purpose || '',
        JSON.stringify(bl.documents || []),
        bl.contact || '',
        bl.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.bankLoans = count;
  }

  // 13. Dairy
  if (Array.isArray(dbData.dairy)) {
    let count = 0;
    for (const dy of dbData.dairy) {
      await runQuery(`
        INSERT OR REPLACE INTO dairy (id, name, location, milk_type, daily_collection, rate_per_liter, contact, chilling_center, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dy.id,
        dy.name || '',
        dy.location || '',
        dy.milkType || '',
        dy.dailyCollection || '',
        dy.ratePerLiter || '',
        dy.contact || '',
        dy.chillingCenter || '',
        dy.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.dairy = count;
  }

  // 14. Manufacturers
  if (Array.isArray(dbData.manufacturers)) {
    let count = 0;
    for (const m of dbData.manufacturers) {
      await runQuery(`
        INSERT OR REPLACE INTO manufacturers (id, company_name, category, products, city, district, phone, email, turnover, employees, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        m.id,
        m.companyName || m.name || '',
        m.category || '',
        m.products || '',
        m.city || '',
        m.district || '',
        m.phone || '',
        m.email || '',
        m.turnover || '',
        m.employees || '',
        m.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.manufacturers = count;
  }

  // 15. Volunteers
  if (Array.isArray(dbData.volunteers)) {
    let count = 0;
    for (const v of dbData.volunteers) {
      await runQuery(`
        INSERT OR REPLACE INTO volunteers (id, name, phone, district, city, field, blood_group, availability, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        v.id,
        v.name || '',
        v.phone || '',
        v.district || '',
        v.city || '',
        v.field || '',
        v.bloodGroup || '',
        v.availability || '',
        v.status || 'active',
        v.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.volunteers = count;
  }

  // 16. Grievances
  if (Array.isArray(dbData.grievances)) {
    let count = 0;
    for (const g of dbData.grievances) {
      await runQuery(`
        INSERT OR REPLACE INTO grievances (id, subject, department, applicant_name, phone, district, taluka, details, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        g.id,
        g.subject || g.title || '',
        g.department || '',
        g.applicantName || g.name || '',
        g.phone || '',
        g.district || '',
        g.taluka || '',
        g.details || g.description || '',
        g.status || 'pending',
        g.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.grievances = count;
  }

  // 17. Builders
  if (Array.isArray(dbData.builders)) {
    let count = 0;
    for (const b of dbData.builders) {
      await runQuery(`
        INSERT OR REPLACE INTO builders (id, name, projects, city, district, rera_number, phone, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        b.id,
        b.name || '',
        b.projects || '',
        b.city || '',
        b.district || '',
        b.reraNumber || '',
        b.phone || '',
        b.createdAt || new Date().toISOString()
      ], false);
      count++;
    }
    stats.builders = count;
  }

  // Save changes to connect_maratha.db file
  saveDatabase();

  console.log('✅ Migration to Abhay App Database (connect_maratha.db) finished successfully:');
  console.table(stats);
}

migrate().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
