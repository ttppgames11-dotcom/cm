import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path in backend folder
const DB_FILE = path.join(__dirname, '..', 'db.json');
const ORAL_HISTORY_FILE = path.join(__dirname, '..', 'data_oral_history.json');

class RealtimeDatabase {
  constructor() {
    this.data = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {};
      }
    } catch (err) {
      console.error('[RealtimeDB] Error reading db.json, initializing empty:', err.message);
      this.data = {};
    }

    // Ensure all 11 domains have initialized collections
    const collections = [
      'members',
      'businesses',
      'businessReviews',
      'referrals',
      'meetings',
      'groups',
      'posts',
      'postComments',
      'events',
      'eventRsvps',
      'campaigns',
      'donations',
      'jobs',
      'jobApplications',
      'services',
      'serviceBookings',
      'doctors',
      'artists',
      'officers',
      'speakers',
      'speakerBookings',
      'organizations',
      'bloodRequests',
      'bloodDonors',
      'matrimony',
      'womenHelp',
      'volunteers',
      'grievances',
      'builders',
      'builderInquiries',
      'manufacturers',
      'dairy',
      'bankLoans',
      'news',
      'oralHistory',
      'quizQuestions',
      'quizSubmissions',
      'quizLeaderboard',
      'auditLogs',
      'notifications',
      'messages',
      'otpCodes',
      'tokenBlacklist'
    ];

    for (const col of collections) {
      if (!Array.isArray(this.data[col])) {
        this.data[col] = [];
      }
    }

    // Sync oral history file if available
    try {
      if (fs.existsSync(ORAL_HISTORY_FILE)) {
        const oralRaw = fs.readFileSync(ORAL_HISTORY_FILE, 'utf8');
        const oralList = JSON.parse(oralRaw);
        if (Array.isArray(oralList) && this.data.oralHistory.length === 0) {
          this.data.oralHistory = oralList;
        }
      }
    } catch (e) {
      console.warn('[RealtimeDB] Oral history sync warning:', e.message);
    }

    // Seed default admin and initial sample data if members empty
    if (this.data.members.length === 0) {
      this.data.members.push({
        id: 'CM-96K-001',
        name: 'अखिल भारतीय मराठा महासंघ मुख्य कार्यालय',
        email: 'admin@connectmaratha.org',
        phone: '+91 98220 96000',
        password_hash: '$2a$08$91qQjU8XbF44O059O57DseK6yY44oXo7M9r/9lqB0n0yCqD9gq1ee', // 'password123'
        avatar: '🏛️',
        city: 'मुंबई',
        district: 'मुंबई शहर',
        state: 'महाराष्ट्र',
        taluka: 'दक्षिण मुंबई',
        kul: '९६ कुळी मराठा',
        gotra: 'कश्यप',
        profession: 'प्रशासन व संघटन',
        business: 'अखिल भारतीय मराठा महासंघ',
        tier: 'Royal Patron',
        role: 'admin',
        joined: new Date().toISOString().split('T')[0],
        verified: true,
        created_at: new Date().toISOString()
      });
    }

    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('[RealtimeDB] Error writing to db.json:', err.message);
      return false;
    }
  }

  getCollection(name) {
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  findById(name, id) {
    const col = this.getCollection(name);
    return col.find(item => String(item.id) === String(id) || String(item._id) === String(id));
  }

  insert(name, item) {
    const col = this.getCollection(name);
    if (!item.id) {
      item.id = `${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }
    if (!item.createdAt && !item.created_at) {
      item.createdAt = new Date().toISOString();
    }
    col.unshift(item);
    this.save();
    return item;
  }

  update(name, id, updates) {
    const col = this.getCollection(name);
    const index = col.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
    if (index === -1) return null;

    col[index] = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return col[index];
  }

  delete(name, id) {
    const col = this.getCollection(name);
    const index = col.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
    if (index === -1) return false;

    col.splice(index, 1);
    this.save();
    return true;
  }

  addAuditLog(action, performedBy, details = {}) {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy: performedBy || 'SYSTEM',
      details,
      timestamp: new Date().toISOString()
    };
    this.getCollection('auditLogs').unshift(log);
    this.save();
    return log;
  }
}

export const db = new RealtimeDatabase();
export default db;
