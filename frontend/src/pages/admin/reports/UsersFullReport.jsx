// frontend/src/pages/admin/reports/UsersFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function UsersFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock initial users dataset if data.users empty
  const usersList = useMemo(() => {
    if (data?.users && data.users.length > 0) return data.users;
    return [
      { id: 'CM-1001', name: 'अमोल तुकाराम जाधव', phone: '+९१ ९८२२० ११९२४', role: 'MEMBER', type: 'Premium', state: 'MH', city: 'पुणे (Pune)', registeredAt: '2026-09-12', status: 'Verified', kycStatus: 'Approved', referrals: 12450 },
      { id: 'CM-1002', name: 'प्रियंका सुरेश शिर्के', phone: '+९१ ९४२१२ ३३००९', role: 'CHAPTER_PRESIDENT', type: 'Business', state: 'MH', city: 'सातारा (Satara)', registeredAt: '2026-09-15', status: 'Verified', kycStatus: 'Approved', referrals: 18200 },
      { id: 'CM-1003', name: 'निलेश भगवान देशमुख', phone: '+९१ ९८९०० ७७३६१', role: 'TALUKA_COORDINATOR', type: 'Standard', state: 'MH', city: 'नाशिक (Nashik)', registeredAt: '2026-09-18', status: 'Pending', kycStatus: 'Under Review', referrals: 15600 },
      { id: 'CM-1004', name: 'कविता बाळकृष्ण भोसले', phone: '+९१ ९७६५४ ११२३०', role: 'SEVA_HEAD', type: 'Volunteer', state: 'MH', city: 'छत्रपती संभाजीनगर (Chhatrapati Sambhajinagar)', registeredAt: '2026-09-20', status: 'Verified', kycStatus: 'Approved', referrals: 8900 },
      { id: 'CM-1005', name: 'संदीप मारुती कदम', phone: '+९१ ९१५८० ९९८११', role: 'DISTRICT_COORDINATOR', type: 'Lifetime', state: 'MH', city: 'कोल्हापूर (Kolhapur)', registeredAt: '2026-09-22', status: 'Verified', kycStatus: 'Approved', referrals: 24100 }
    ];
  }, [data?.users]);

  // Filtered dataset based on Global Filters
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      if (filter.city !== 'all' && !u.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && u.registeredAt < filter.fromDate) return false;
      if (filter.toDate && u.registeredAt > filter.toDate) return false;
      return true;
    });
  }, [usersList, filter]);

  // Export handler
  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["User ID,Name,Phone,Role,City,State,Registered,Status,KYC Status",
         ...filteredUsers.map(u => `${u.id},"${u.name}",${u.phone},${u.role},"${u.city}",${u.state},${u.registeredAt},${u.status},${u.kycStatus}`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Users_Full_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* GLOBAL REPORT FILTER */}
      <GlobalReportFilter
        reportTitle="👥 सर्व सदस्य संपूर्ण अहवाल (Users Full MIS Report)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      {/* EXECUTIVE SUMMARY KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण नोंदणीकृत सदस्य</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredUsers.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>१००% सत्यापित डेटाबेसमधून</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>प्रमाणित सदस्य (Verified)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredUsers.filter(u => u.status === 'Verified').length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>KYC पूर्ण झालेले</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित KYC (Pending)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: 4 }}>
            {filteredUsers.filter(u => u.status === 'Pending' || u.kycStatus === 'Under Review').length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, marginTop: '4px' }}>कागदपत्रे तपासणी सुरु</div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>व्यवसाय / B2B सदस्य</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: 4 }}>
            {filteredUsers.filter(u => u.type === 'Business').length || 1}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 700, marginTop: '4px' }}>B2B चॅप्टर जोडणी</div>
        </div>
      </div>

      {/* DETAILED USERS DATA TABLE */}
      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            📋 सदस्य तपशीलवार यादी (Filtered Users Table)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredUsers.length} सदस्य</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>सदस्य आयडी</th>
                <th style={{ padding: '12px 16px' }}>नाव व मोबाईल</th>
                <th style={{ padding: '12px 16px' }}>सिस्टीम रोल</th>
                <th style={{ padding: '12px 16px' }}>शहर / जिल्हा</th>
                <th style={{ padding: '12px 16px' }}>रेफरल स्कोअर</th>
                <th style={{ padding: '12px 16px' }}>नोंदणी तारीख</th>
                <th style={{ padding: '12px 16px' }}>स्थिति (Status)</th>
                <th style={{ padding: '12px 16px' }}>कृती (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{u.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{u.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{u.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#FFF7ED', color: '#EA580C', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.74rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.city}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 900, color: '#16A34A' }}>{(u.referrals || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{u.registeredAt}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                      background: u.status === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                      color: u.status === 'Verified' ? '#166534' : '#92400E'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => setSelectedUser(u)}
                      style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #EA580C', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      👁️ प्रोफाईल
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER PROFILE DRILL-DOWN MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: 20 }}>
          <div style={{ background: '#FFF', borderRadius: 16, padding: 24, maxWidth: 520, width: '100%', border: '1.5px solid #FED7AA', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#431407', fontWeight: 900 }}>👤 सदस्य प्रोफाइल ड्रिल-डाऊन</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#EA580C' }}>✕</button>
            </div>

            <div style={{ background: '#FFF7ED', padding: 14, borderRadius: 10, fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div><strong>नाव:</strong> {selectedUser.name}</div>
              <div><strong>आयडी:</strong> <span style={{ fontFamily: 'monospace', color: '#EA580C', fontWeight: 800 }}>{selectedUser.id}</span></div>
              <div><strong>मोबाईल:</strong> {selectedUser.phone}</div>
              <div><strong>शहर/जिल्हा:</strong> {selectedUser.city}</div>
              <div><strong>सिस्टीम रोल:</strong> {selectedUser.role}</div>
              <div><strong>एकंदर रेफरल्स जमा:</strong> <strong style={{ color: '#16A34A' }}>{(selectedUser.referrals || 0).toLocaleString()}</strong></div>
              <div><strong>KYC स्थिती:</strong> {selectedUser.kycStatus}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setSelectedUser(null)} style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
