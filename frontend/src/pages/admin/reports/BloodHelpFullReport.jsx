// frontend/src/pages/admin/reports/BloodHelpFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function BloodHelpFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });

  const sevaList = useMemo(() => {
    if (data?.blood && Array.isArray(data.blood) && data.blood.length > 0) {
      return data.blood.map((b, i) => ({
        id: b.id || `SEVA-${i + 501}`,
        requester: b.patient || b.patientName || 'मराठा बांधव',
        category: `Blood (${b.bloodGroup || 'सर्व गट'})`,
        city: b.city || b.district || 'पुणे',
        hospital: b.hospital || 'जिल्हा सामान्य रुग्णालय',
        priority: b.urgency || 'Emergency',
        date: (b.createdAt || b.time || '2026-10-10').slice(0, 10),
        status: (b.status || 'Active').includes('Fulfilled') ? 'Resolved' : 'Open'
      }));
    }
    return [];
  }, [data?.blood]);

  const filteredSeva = useMemo(() => {
    return sevaList.filter(s => {
      if (filter.city !== 'all' && !s.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && s.date < filter.fromDate) return false;
      if (filter.toDate && s.date > filter.toDate) return false;
      return true;
    });
  }, [sevaList, filter]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Seva ID,Requester,Category,City,Hospital,Priority,Date,Status",
         ...filteredSeva.map(s => `${s.id},"${s.requester}","${s.category}","${s.city}","${s.hospital}",${s.priority},${s.date},"${s.status}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Seva_Help_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`सेवा मदत डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="🩸 २४x७ आपत्कालीन रक्तपेढी व समाजसेवा मदत अहवाल (Seva Center MIS)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      {/* KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण सेवा विनंत्या (Total Seva)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>{filteredSeva.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>आपत्कालीन (Emergency Requests)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
            {filteredSeva.filter(s => s.priority === 'Emergency').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>यशस्वी सोडवल्या (Resolved)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredSeva.filter(s => s.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#EA580C' }}>
            🩺 आपत्कालीन रक्तदाता व सेवा विनंती नोंदणी (Seva Log Table)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredSeva.length} विनंत्या</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#EA580C', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>विनंती आयडी</th>
                <th style={{ padding: '12px 16px' }}>अर्जदार नाव</th>
                <th style={{ padding: '12px 16px' }}>सेवा वर्गवारी (Category)</th>
                <th style={{ padding: '12px 16px' }}>शहर / हॉस्पिटल</th>
                <th style={{ padding: '12px 16px' }}>प्राधान्य (Priority)</th>
                <th style={{ padding: '12px 16px' }}>तारीख</th>
                <th style={{ padding: '12px 16px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeva.map((s, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{s.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1E293B' }}>{s.requester}</td>
                  <td style={{ padding: '12px 16px', color: '#DC2626', fontWeight: 800 }}>{s.category}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700 }}>{s.city}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{s.hospital}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                      background: s.priority === 'Emergency' ? '#FEE2E2' : '#FEF3C7',
                      color: s.priority === 'Emergency' ? '#991B1B' : '#92400E'
                    }}>
                      {s.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{s.date}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800,
                      background: s.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7',
                      color: s.status === 'Resolved' ? '#166534' : '#92400E'
                    }}>
                      {s.status}
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
