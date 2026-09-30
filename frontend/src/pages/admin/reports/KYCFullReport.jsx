// frontend/src/pages/admin/reports/KYCFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function KYCFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });
  const [selectedApp, setSelectedApp] = useState(null);

  const kycList = useMemo(() => {
    return [
      { id: 'KYC-991', name: 'अमोल तुकाराम जाधव', memberId: 'CM-MH-9876543210', city: 'पुणे (Pune)', docType: 'Aadhaar Card + Voter ID', submittedDate: '2026-09-28', status: 'Approved', reviewer: 'Super Admin' },
      { id: 'KYC-992', name: 'सुरेश ज्ञानदेव पाटील', memberId: 'CM-MH-1102983412', city: 'सातारा (Satara)', docType: 'Aadhaar Card', submittedDate: '2026-09-29', status: 'Pending Review', reviewer: 'Verification Officer 1' },
      { id: 'KYC-993', name: 'संगीता रामराव देशमुख', memberId: 'CM-MH-3398127461', city: 'नाशिक (Nashik)', docType: 'PAN Card + Driving License', submittedDate: '2026-09-30', status: 'Documents Missing', reviewer: 'System Auto' },
      { id: 'KYC-994', name: 'महेश आनंदा कदम', memberId: 'CM-MH-8827163542', city: 'कोल्हापूर (Kolhapur)', docType: 'Aadhaar Card', submittedDate: '2026-09-27', status: 'Approved', reviewer: 'District Admin' }
    ];
  }, []);

  const filteredKyc = useMemo(() => {
    return kycList.filter(k => {
      if (filter.city !== 'all' && !k.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && k.submittedDate < filter.fromDate) return false;
      if (filter.toDate && k.submittedDate > filter.toDate) return false;
      return true;
    });
  }, [kycList, filter]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["KYC ID,Applicant,Member ID,City,Doc Type,Submitted,Status,Reviewer",
         ...filteredKyc.map(k => `${k.id},"${k.name}",${k.memberId},"${k.city}","${k.docType}",${k.submittedDate},${k.status},"${k.reviewer}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KYC_Full_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`KYC डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="🔐 KYC पडताळणी संपूर्ण अहवाल (KYC Command Center MIS)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण अर्ज (Applications)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredKyc.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>मंजूर KYC (Approved)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredKyc.filter(k => k.status === 'Approved').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित (Under Review)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>
            {filteredKyc.filter(k => k.status.includes('Pending') || k.status.includes('Review')).length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>कागदपत्रे अपूर्ण</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
            {filteredKyc.filter(k => k.status.includes('Missing')).length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            📑 KYC अर्ज यादी (KYC Applications Queue)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredKyc.length} अर्ज</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>KYC आयडी</th>
                <th style={{ padding: '12px 16px' }}>अर्जदार नाव</th>
                <th style={{ padding: '12px 16px' }}>शहर/जिल्हा</th>
                <th style={{ padding: '12px 16px' }}>कागदपत्रे (Documents)</th>
                <th style={{ padding: '12px 16px' }}>दाखल तारीख</th>
                <th style={{ padding: '12px 16px' }}>स्थिती (Status)</th>
                <th style={{ padding: '12px 16px' }}>कृती (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredKyc.map((k, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{k.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{k.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{k.memberId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{k.city}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{k.docType}</td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{k.submittedDate}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                      background: k.status === 'Approved' ? '#DCFCE7' : '#FEF3C7',
                      color: k.status === 'Approved' ? '#166534' : '#92400E'
                    }}>
                      {k.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => setSelectedApp(k)}
                      style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #EA580C', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      👁️ पडताळणी करा
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: 20 }}>
          <div style={{ background: '#FFF', borderRadius: 16, padding: 24, maxWidth: 520, width: '100%', border: '1.5px solid #FED7AA', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#431407', fontWeight: 900 }}>🔐 KYC कागदपत्रे पडताळणी</h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#EA580C' }}>✕</button>
            </div>

            <div style={{ background: '#FFF7ED', padding: 14, borderRadius: 10, fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div><strong>अर्जदार:</strong> {selectedApp.name}</div>
              <div><strong>सदस्य आयडी:</strong> {selectedApp.memberId}</div>
              <div><strong>शहर:</strong> {selectedApp.city}</div>
              <div><strong>सबमिट केलेली कागदपत्रे:</strong> {selectedApp.docType}</div>
              <div><strong>सध्याची स्थिती:</strong> {selectedApp.status}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { if (toast) toast('KYC मंजूर केले!', 'success'); setSelectedApp(null); }} style={{ background: '#16A34A', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>
                ✅ मंजूर करा (Approve)
              </button>
              <button onClick={() => setSelectedApp(null)} style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #EA580C', padding: '8px 16px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}>
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
