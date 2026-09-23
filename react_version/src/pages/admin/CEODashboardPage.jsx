import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const scopeProfiles = {
  maharashtra: {
    badge: 'EXECUTIVE OVERVIEW • MAHARASHTRA STATE',
    title: '📊 मराठा समाज व व्यवसाय संगम महासंघ — राज्यस्तरीय CEO Dashboard',
    sub: 'एकूण ६ महसूल विभाग, ३६ जिल्हे, ३५८ तालुके व ३,२००+ शाखांचे एकत्रित नियंत्रण केंद्र',
    revenue: '₹ १८४.६ कोटी (Cr)',
    members: '२४,८२०',
    businesses: '८,४२१',
    mandals: '१८४',
    active: '१७,४२०',
    referrals: '३२,८४१',
    jobs: '४,२८०',
    events: '३२८',
    notice: 'सध्या आपण राज्य अध्यक्ष (महाराष्ट्र राज्य) म्हणून सर्व ३६ जिल्हे, ६ विभाग व १८४ व्यवसाय मंडळांचा एकत्रित डेटा पाहत आहात.'
  },
  pune_div: {
    badge: 'DIVISIONAL EXECUTIVE • PUNE DIVISION',
    title: '🏢 पुणे विभाग — विभागीय अध्यक्ष नियंत्रण केंद्र',
    sub: 'पुणे, सातारा, कोल्हापूर, सांगली, सोलापूर — ५ जिल्ह्यांचे थेट पर्यवेक्षण',
    revenue: '₹ ४८.२ कोटी (Cr)',
    members: '१२,४००',
    businesses: '३,९१०',
    mandals: '४२',
    active: '८,८५०',
    referrals: '१४,२९०',
    jobs: '१,८५०',
    events: '११२',
    notice: 'सध्या आपण विभागीय अध्यक्ष (पुणे विभाग) म्हणून पश्चिम महाराष्ट्रातील ५ जिल्ह्यांचा थेट डेटा पाहत आहात.'
  },
  sangli_dist: {
    badge: 'DISTRICT EXECUTIVE • SANGLI DISTRICT',
    title: '📍 सांगली जिल्हा — जिल्हा अध्यक्ष डॅशबोर्ड',
    sub: '१० तालुके, ४ व्यवसाय चॅप्टर्स, ११०+ शाखा व स्थानिक उपक्रम',
    revenue: '₹ १४.८ कोटी (Cr)',
    members: '३,२५०',
    businesses: '८९०',
    mandals: '१०',
    active: '२,३००',
    referrals: '४,१२०',
    jobs: '४९०',
    events: '३४',
    notice: 'सध्या आपण जिल्हा अध्यक्ष (सांगली जिल्हा) म्हणून जिल्ह्यातील सर्व शाखा व मंडळांचे काम पाहत आहात.'
  }
};

const topMandals = [
  { name: 'पुणे – शिवनेरी व्यवसाय मंडळ', district: 'पुणे', members: 48, refs: '१,४२०', rev: '₹८.४ कोटी', grade: 'A+ Elite' },
  { name: 'मुंबई – दादर व्यवसाय मंडळ', district: 'मुंबई उपनगर', members: 45, refs: '१,२९०', rev: '₹९.१ कोटी', grade: 'A+ Elite' },
  { name: 'पिंपरी-चिंचवड औद्योगिक मंडळ', district: 'पुणे', members: 55, refs: '१,८९०', rev: '₹१२.५ कोटी', grade: 'A+ Platinum' },
  { name: 'ठाणे – आनंद दिघे व्यापार संगम', district: 'ठाणे', members: 50, refs: '१,५४०', rev: '₹१०.८ कोटी', grade: 'A+ Platinum' },
  { name: 'कोल्हापूर – शाहू महाराज व्यापार मंडळ', district: 'कोल्हापूर', members: 46, refs: '१,३५०', rev: '₹८.९ कोटी', grade: 'A Grade' },
];

export default function CEODashboardPage() {
  const [selectedRole, setSelectedRole] = useState('state_president');
  const [selectedArea, setSelectedArea] = useState('maharashtra');

  const currentProfile = scopeProfiles[selectedArea] || scopeProfiles.maharashtra;

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div className="wrap" style={{ maxWidth: '1240px', padding: '0 20px' }}>
        
        {/* Breadcrumb / Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Link to="/" style={{ color: 'var(--maroon-900)', textDecoration: 'none', fontWeight: 600 }}>🏠 होम</Link>
            <span style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
            <Link to="/admin" style={{ color: 'var(--maroon-900)', textDecoration: 'none', fontWeight: 600 }}>प्रशासकीय नियंत्रण</Link>
            <span style={{ margin: '0 8px', color: '#9ca3af' }}>›</span>
            <span style={{ color: 'var(--muted)', fontWeight: 700 }}>कार्याध्यक्ष (CEO) डॅशबोर्ड</span>
          </div>
          <Link to="/admin" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.84rem' }}>
            ← Admin ERP वर परत जा
          </Link>
        </div>

        {/* Scope Control Bar */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #E65100',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#E65100', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⚡ RBAC + Organizational Scope Engine (अधिकार क्षेत्र नियंत्रण)
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937', marginTop: '2px', fontFamily: 'Baloo 2' }}>
                सक्रिय भूमिका व अधिकार क्षेत्र (Active Role + Scope Engine)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: '3px' }}>भूमिका (Role)</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <option value="state_president">🚩 राज्य अध्यक्ष (State President)</option>
                  <option value="divisional_president">🏢 विभागीय अध्यक्ष (Divisional President)</option>
                  <option value="district_president">📍 जिल्हा अध्यक्ष (District President)</option>
                  <option value="taluka_president">🌾 तालुका अध्यक्ष (Taluka President)</option>
                  <option value="chapter_president">💼 चॅप्टर अध्यक्ष (Chapter President)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: '3px' }}>अधिकार क्षेत्र (Scope)</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  <option value="maharashtra">महाराष्ट्र राज्य (Maharashtra State)</option>
                  <option value="pune_div">पुणे विभाग (Pune Division)</option>
                  <option value="sangli_dist">सांगली जिल्हा (Sangli District)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#4b5563', borderTop: '1px dashed #e5e7eb', paddingTop: '10px' }}>
            👁️ <strong>थेट माहिती:</strong> {currentProfile.notice}
          </div>
        </div>

        {/* Macro Summary Header */}
        <div style={{
          background: 'linear-gradient(135deg, #991b1b, #c2410c)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(153,27,27,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{
                background: '#FFFFFF',
                color: '#991b1b',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                {currentProfile.badge}
              </span>
              <h1 style={{ color: '#ffffff', margin: '12px 0 6px', fontFamily: 'Baloo 2', fontSize: '1.9rem' }}>
                {currentProfile.title}
              </h1>
              <p style={{ opacity: 0.9, margin: 0, fontSize: '0.95rem' }}>
                {currentProfile.sub}
              </p>
            </div>

            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '16px 24px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>अधिकार क्षेत्रातील एकूण व्यवसाय उलाढाल</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
                {currentProfile.revenue}
              </div>
            </div>
          </div>

          {/* 7 Macro KPIs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
            marginTop: '24px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>नोंदणीकृत सदस्य</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.members}</div>
              <small style={{ color: '#86efac' }}>↑ १२% वाढ</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>नोंदणीकृत व्यवसाय</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.businesses}</div>
              <small style={{ color: '#86efac' }}>↑ ९% वाढ</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>सक्रिय व्यवसाय मंडळे</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.mandals}</div>
              <small style={{ color: '#86efac' }}>३६ जिल्ह्यांत</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>सक्रिय सदस्य</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.active}</div>
              <small style={{ color: '#86efac' }}>७०% सहभाग</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>एकूण संदर्भ (Referrals)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.referrals}</div>
              <small style={{ color: '#86efac' }}>८८% यशस्वी</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>रोजगार संधी (Jobs)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.jobs}</div>
              <small style={{ color: '#86efac' }}>भरती सुरू</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '14px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>आयोजित कार्यक्रम</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px', fontFamily: 'Baloo 2' }}>{currentProfile.events}</div>
              <small style={{ color: '#86efac' }}>राज्यव्यापी</small>
            </div>
          </div>
        </div>

        {/* Top 5 Performing Mandals */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>
            🏆 अग्रगण्य ५ व्यवसाय मंडळे (Top Performing Chapters)
          </h3>
          <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: '0.88rem' }}>
            उलाढाल, संदर्भ देवाणघेवाण आणि शिस्त या निकषांवर उच्च कामगिरी करणारी मंडळे
          </p>

          <div className="admin-table-wrap">
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>मंडळाचे नाव</th>
                  <th>जिल्हा</th>
                  <th>सदस्य संख्या</th>
                  <th>संदर्भ देवाणघेवाण</th>
                  <th>व्युत्पन्न महसूल (Revenue)</th>
                  <th>कामगिरी ग्रेड</th>
                </tr>
              </thead>
              <tbody>
                {topMandals.map((m, i) => (
                  <tr key={i}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.district}</td>
                    <td>{m.members} सदस्य</td>
                    <td>{m.refs}</td>
                    <td style={{ color: 'var(--saffron-700)', fontWeight: 800 }}>{m.rev}</td>
                    <td>
                      <span className="admin-badge ok" style={{ fontSize: '0.78rem' }}>{m.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
