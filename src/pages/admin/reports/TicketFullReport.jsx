// src/pages/admin/reports/TicketFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function TicketFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });

  const ticketList = useMemo(() => {
    return [
      { id: 'TKT-301', user: 'अमोल जाधव', dept: 'Membership & KYC', priority: 'High', city: 'पुणे (Pune)', createdDate: '2026-09-29', slaStatus: 'Within SLA', status: 'In Progress' },
      { id: 'TKT-302', user: 'प्रियंका शिर्के', dept: 'Business Directory', priority: 'Medium', city: 'सातारा (Satara)', createdDate: '2026-09-25', slaStatus: 'SLA Breached ⚠️', status: 'Open' },
      { id: 'TKT-303', user: 'निलेश देशमुख', dept: 'Technical & App Support', priority: 'Critical', city: 'नाशिक (Nashik)', createdDate: '2026-09-28', slaStatus: 'Within SLA', status: 'Resolved' }
    ];
  }, []);

  const filteredTickets = useMemo(() => {
    return ticketList.filter(t => {
      if (filter.city !== 'all' && !t.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && t.createdDate < filter.fromDate) return false;
      if (filter.toDate && t.createdDate > filter.toDate) return false;
      return true;
    });
  }, [ticketList, filter]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Ticket ID,User,Department,Priority,City,Created Date,SLA Status,Status",
         ...filteredTickets.map(t => `${t.id},"${t.user}","${t.dept}",${t.priority},"${t.city}",${t.createdDate},"${t.slaStatus}","${t.status}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Helpdesk_Tickets_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`तिकीट डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="🎫 तक्रार व हेल्पडेस्क निवारण संपूर्ण अहवाल (Helpdesk MIS Report)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण तक्रारी (Total Tickets)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredTickets.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>SLA उल्लंघन (Breached)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
            {filteredTickets.filter(t => t.slaStatus.includes('Breached')).length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>सोडवलेल्या (Resolved)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredTickets.filter(t => t.status === 'Resolved').length}
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            🎟️ हेल्पडेस्क तिकीट लॉग (Helpdesk MIS Table)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredTickets.length} तक्रारी</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>तिकीट आयडी</th>
                <th style={{ padding: '12px 16px' }}>युझर नाव</th>
                <th style={{ padding: '12px 16px' }}>विभाग (Dept)</th>
                <th style={{ padding: '12px 16px' }}>शहर</th>
                <th style={{ padding: '12px 16px' }}>प्राधान्य</th>
                <th style={{ padding: '12px 16px' }}>SLA स्थिती</th>
                <th style={{ padding: '12px 16px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight 800, fontFamily: 'monospace', color: '#EA580C' }}>{t.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight 800, color: '#1E293B' }}>{t.user}</td>
                  <td style={{ padding: '12px 16px', fontWeight 700 }}>{t.dept}</td>
                  <td style={{ padding: '12px 16px' }}>{t.city}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, background: t.priority === 'Critical' ? '#FEE2E2' : '#FFF7ED', color: t.priority === 'Critical' ? '#991B1B' : '#C2410C' }}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight 700, color: t.slaStatus.includes('Breached') ? '#DC2626' : '#16A34A' }}>{t.slaStatus}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.74rem', fontWeight 800, background: t.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7', color: t.status === 'Resolved' ? '#166534' : '#92400E' }}>
                      {t.status}
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
