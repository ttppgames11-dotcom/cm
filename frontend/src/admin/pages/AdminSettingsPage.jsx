import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function AdminSettingsPage() {
  const { settings, setSettings, addToast } = useMagazineAdmin();
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    addToast('प्रशासकीय सेटिंग्ज यशस्वीरित्या जतन केल्या.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
      {/* Page Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            ⚙️ प्रणाली सेटिंग्ज (System & Publication Settings)
          </h1>
          <p className="cm-page-subtitle">
            मासिक प्रकाशन चक्र, प्रशासकीय प्रोफाइल, सूचना प्राधान्ये व सुरक्षा सेटिंग्ज नियंत्रित करा.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Admin Profile Box */}
        <div className="cm-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
            👤 प्रशासकीय प्रोफाइल (Admin Profile)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>प्रशासकाचे नाव *</label>
              <input 
                type="text" 
                required 
                className="cm-input" 
                value={formData.adminName || ''} 
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>ईमेल पत्ता *</label>
              <input 
                type="email" 
                required 
                className="cm-input" 
                value={formData.email || ''} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
          </div>
        </div>

        {/* Publication Preferences */}
        <div className="cm-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
            📖 मासिक प्रकाशन प्राधान्ये (Publication Settings)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>मासिकाचे नाव</label>
              <input 
                type="text" 
                className="cm-input" 
                value={formData.magazineTitle || ''} 
                onChange={(e) => setFormData({ ...formData, magazineTitle: e.target.value })} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>प्रकाशन चक्र (Cycle)</label>
              <input 
                type="text" 
                className="cm-input" 
                value={formData.publishingCycle || ''} 
                onChange={(e) => setFormData({ ...formData, publishingCycle: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#1E293B', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.emailNotifications || false} 
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '16px', height: '16px' }} 
              />
              नवीन लेख किंवा जाहिरात चौकशी आल्यास तत्काळ ईमेल सूचना पाठवा.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#1E293B', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.allowPublicComments || false} 
                onChange={(e) => setFormData({ ...formData, allowPublicComments: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '16px', height: '16px' }} 
              />
              डिजिटल वाचकांसाठी लेखांवर थेट अभिप्राय / कमेंट्सची परवानगी द्या.
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#1E293B', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={formData.autoArchiveOldIssues || false} 
                onChange={(e) => setFormData({ ...formData, autoArchiveOldIssues: e.target.checked })} 
                style={{ accentColor: '#F4510B', width: '16px', height: '16px' }} 
              />
              नवीन अंक प्रकाशित झाल्यावर मागील अंक सुरक्षितपणे अर्काईव्हमध्ये ठेवा (कधीही नष्ट होणार नाही).
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button type="submit" className="cm-btn cm-btn-primary" style={{ padding: '12px 24px', fontSize: '0.92rem' }}>
            💾 बदल जतन करा (Save Settings)
          </button>
        </div>
      </form>
    </div>
  );
}
