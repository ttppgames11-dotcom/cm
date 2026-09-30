// src/pages/admin/reports/B2BReferralFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function B2BReferralFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });

  const refList = useMemo(() => {
    return [
      { id: 'REF-8801', referrer: 'अमोल तुकाराम जाधव', targetBiz: 'रायगड कन्स्ट्रक्शन', fromCity: 'पुणे (Pune)', toCity: 'मुंबई (Mumbai)', dealValue: 4500000, date: '2026-09-12', status: 'Converted / Closed' },
      { id: 'REF-8802', referrer: 'प्रियंका सुरेश शिर्के', targetBiz: 'सह्याद्री आयटी सोल्युशन्स', fromCity: 'सातारा (Satara)', toCity: 'पुणे (Pune)', dealValue: 1200000, date: '2026-09-18', status: 'In Progress' },
      { id: 'REF-8803', referrer: 'निलेश भगवान देशमुख', targetBiz: 'मराठा ऑटोमोबाईल्स', fromCity: 'नाशिक (Nashik)', toCity: 'नाशिक (Nashik)', dealValue: 850000, date: '2026-09-24', status: 'Assigned' }
    ];
  }, []);

  const filteredRef = useMemo(() => {
    return refList.filter(r => {
      if (filter.city !== 'all' && !r.fromCity.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && r.date < filter.fromDate) return false;
      if (filter.toDate && r.date > filter.toDate) return false;
      return true;
    });
  }, [refList, filter]);

  const totalClosedValue = useMemo(() => {
    return filteredRef.filter(r => r.status.includes('Converted')).reduce((acc, curr) => acc + curr.dealValue, 0);
  }, [filteredRef]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Referral ID,Referrer,Target Business,From City,To City,Deal Value,Date,Status",
         ...filteredRef.map(r => `${r.id},"${r.referrer}","${r.targetBiz}","${r.fromCity}","${r.toCity}",${r.dealValue},${r.date},"${r.status}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `B2B_Referrals_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`B2B रेफरल डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="🤝 B2B रेफरल व व्यवसाय व्यवहार संपूर्ण अहवाल (B2B CRM MIS)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण B2B संदर्भा (Total Referrals)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredRef.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>यशस्वी व्यवहार मुल्य (Closed Value)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            ₹{(totalClosedValue / 100000).toFixed(1)} लाख
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>चालू व्यवहार (In Progress)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
            {filteredRef.filter(r => r.status.includes('Progress') || r.status.includes('Assigned')).length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            🤝 B2B संदर्भ व्यवहार ट्रॅकर (Referral CRM Funnel Table)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredRef.length} संदर्भ</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>रेफरल आयडी</th>
                <th style={{ padding: '12px 16px' }}>संदर्भ देणारा</th>
                <th style={{ padding: '12px 16px' }}>लक्ष्यित व्यवसाय</th>
                <th style={{ padding: '12px 16px' }}>मार्ग (Route)</th>
                <th style={{ padding: '12px 16px' }}>अंदाजित मूल्य</th>
                <th style={{ padding: '12px 16px' }}>तारीख</th>
                <th style={{ padding: '12px 16px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {filteredRef.map((r, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{r.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight 800, color: '#1E293B' }}>{r.referrer}</td>
                  <td style={{ padding: '12px 16px', color: '#0369A1', fontWeight 700 }}>{r.targetBiz}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{r.fromCity} ➔ {r.toCity}</td>
                  <td style={{ padding: '12px 16px', fontWeight 900, color: '#16A34A' }}>₹{r.dealValue.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{r.date}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                      background: r.status.includes('Converted') ? '#DCFCE7' : '#FEF3C7',
                      color: r.status.includes('Converted') ? '#166534' : '#92400E'
                    }}>
                      {r.status}
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
