// frontend/src/pages/admin/reports/BusinessFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function BusinessFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });

  const bizList = useMemo(() => {
    return [
      { id: 'BIZ-101', name: 'सह्याद्री आयटी सोल्युशन्स', owner: 'अमोल तुकाराम जाधव', category: 'IT & Software', city: 'पुणे (Pune)', registeredDate: '2026-09-10', status: 'Verified', chapter: 'पुणे – शिवनेरी चॅप्टर' },
      { id: 'BIZ-102', name: 'रायगड कन्स्ट्रक्शन व बिल्डर्स', owner: 'विक्रमसिंह मारुती कदम', category: 'Real Estate & Builders', city: 'मुंबई (Mumbai)', registeredDate: '2026-09-14', status: 'Verified', chapter: 'मुंबई – किल्ले रायगड चॅप्टर' },
      { id: 'BIZ-103', name: 'शिवनेरी टेक्स्टाईल्स व गारमेंट्स', owner: 'प्रियंका सुरेश शिर्के', category: 'Textiles & Fashion', city: 'सातारा (Satara)', registeredDate: '2026-09-18', status: 'Verified', chapter: 'सातारा – प्रतापगड चॅप्टर' },
      { id: 'BIZ-104', name: 'मराठा ऑटोमोबाईल्स स्पअर्स', owner: 'निलेश भगवान देशमुख', category: 'Manufacturing & Industrial', city: 'नाशिक (Nashik)', registeredDate: '2026-09-22', status: 'Pending Verification', chapter: 'नाशिक – रामशेज चॅप्टर' }
    ];
  }, []);

  const filteredBiz = useMemo(() => {
    return bizList.filter(b => {
      if (filter.city !== 'all' && !b.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && b.registeredDate < filter.fromDate) return false;
      if (filter.toDate && b.registeredDate > filter.toDate) return false;
      return true;
    });
  }, [bizList, filter]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Biz ID,Business Name,Owner,Category,City,Registered,Status,Chapter",
         ...filteredBiz.map(b => `${b.id},"${b.name}","${b.owner}","${b.category}","${b.city}",${b.registeredDate},${b.status},"${b.chapter}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Business_Full_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`व्यवसाय डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="🏢 व्यवसाय डिरेक्टरी व B2B नेटवर्क संपूर्ण अहवाल (Business Directory MIS)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण नोंदणीकृत व्यवसाय</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredBiz.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>सत्यापित (Verified Businesses)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredBiz.filter(b => b.status === 'Verified').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>प्रलंबित पडताळणी</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>
            {filteredBiz.filter(b => b.status.includes('Pending')).length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            💼 नोंदणीकृत व्यवसाय डिरेक्टरी (Businesses Master List)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredBiz.length} व्यवसाय</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>आयडी</th>
                <th style={{ padding: '12px 16px' }}>व्यवसाय नाव व मालक</th>
                <th style={{ padding: '12px 16px' }}>वर्गवारी (Category)</th>
                <th style={{ padding: '12px 16px' }}>शहर / चॅप्टर</th>
                <th style={{ padding: '12px 16px' }}>नोंदणी तारीख</th>
                <th style={{ padding: '12px 16px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {filteredBiz.map((b, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{b.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{b.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>मालक: {b.owner}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#FFF7ED', color: '#EA580C', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.74rem' }}>
                      {b.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700 }}>{b.city}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{b.chapter}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{b.registeredDate}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                      background: b.status === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                      color: b.status === 'Verified' ? '#166534' : '#92400E'
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
