import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import { 
  Settings, 
  User, 
  BookOpen, 
  Bell, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  Mail, 
  Globe, 
  Database,
  Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings, setSettings, addToast } = useMagazineAdmin();
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('प्रशासकीय व प्रकाशन सेटिंग्ज यशस्वीरित्या जतन केल्या.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '920px' }}>
      {/* Page Header */}
      <div className="cm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#FFF1E8', color: '#F4510B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
              System Configuration
            </span>
            <span style={{ color: '#777777', fontSize: '0.8rem' }}>Publication & Security Engine</span>
          </div>
          <h1 className="cm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={26} color="#F4510B" />
            प्रणाली व प्रकाशन सेटिंग्ज (System & Publication Settings)
          </h1>
          <p className="cm-page-subtitle">
            मासिक प्रकाशन चक्र, प्रशासकीय प्रोफाइल, सूचना प्राधान्ये व सुरक्षा सेटिंग्ज नियंत्रित करा.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Admin Profile Box */}
        <div className="cm-card" style={{ padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <User size={20} color="#F4510B" />
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#252525', margin: 0 }}>
              प्रशासकीय प्रोफाइल (Admin Profile)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#252525', marginBottom: '6px' }}>
                प्रशासकाचे नाव *
              </label>
              <input 
                type="text" 
                required 
                className="cm-input" 
                value={formData.adminName || ''} 
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} 
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#252525', marginBottom: '6px' }}>
                ईमेल पत्ता (Admin Email) *
              </label>
              <input 
                type="email" 
                required 
                className="cm-input" 
                value={formData.email || ''} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* 2. Publication Preferences */}
        <div className="cm-card" style={{ padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} color="#F4510B" />
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#252525', margin: 0 }}>
              मासिक प्रकाशन प्राधान्ये (Publication Settings)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#252525', marginBottom: '6px' }}>
                मासिकाचे नाव (Magazine Title)
              </label>
              <input 
                type="text" 
                className="cm-input" 
                value={formData.magazineTitle || ''} 
                onChange={(e) => setFormData({ ...formData, magazineTitle: e.target.value })} 
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#252525', marginBottom: '6px' }}>
                प्रकाशन चक्र (Publishing Cycle)
              </label>
              <input 
                type="text" 
                className="cm-input" 
                value={formData.publishingCycle || ''} 
                onChange={(e) => setFormData({ ...formData, publishingCycle: e.target.value })} 
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #F2E5DC', paddingTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#252525', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.emailNotifications || false} 
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '17px', height: '17px' }} 
              />
              नवीन लेख किंवा जाहिरात चौकशी आल्यास प्रशासकीय ईमेलवर तात्काळ सूचना पाठवा.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#252525', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.allowPublicComments || false} 
                onChange={(e) => setFormData({ ...formData, allowPublicComments: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '17px', height: '17px' }} 
              />
              डिजिटल वाचकांसाठी लेखांवर थेट अभिप्राय / कमेंट्सची परवानगी द्या.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#252525', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.autoArchiveOldIssues || false} 
                onChange={(e) => setFormData({ ...formData, autoArchiveOldIssues: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '17px', height: '17px' }} 
              />
              नवीन मासिक अंक प्रकाशित झाल्यावर मागील अंक सुरक्षितपणे अर्काईव्हमध्ये ठेवा (डेटा कधीही नष्ट होणार नाही).
            </label>
          </div>
        </div>

        {/* 3. Security & Database Note */}
        <div className="cm-card" style={{ padding: '20px', background: '#FFF9F5', border: '1.5px solid #F2E5DC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={20} color="#059669" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#252525', margin: 0 }}>
              सुरक्षा व डेटा बॅकअप (Enterprise Security)
            </h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#777777', margin: 0, lineHeight: 1.5 }}>
            सर्व मासिक डेटा, लेखक प्रोफाईल्स, वर्गणीदार नोंदी व महसूल रेकॉर्ड्स स्थानिक पातळीवर कूटबद्ध (Local Encrypted State) पद्धतीने जतन केले जातात.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button 
            type="submit" 
            className="cm-btn cm-btn-primary" 
            style={{ padding: '12px 28px', fontSize: '0.94rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} />
            <span>बदल जतन करा (Save Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
