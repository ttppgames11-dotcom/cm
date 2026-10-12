// frontend/src/pages/admin/reports/EventsFullReport.jsx
import React, { useState, useMemo } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function EventsFullReport({ data, toast }) {
  const [filter, setFilter] = useState({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });

  const eventList = useMemo(() => {
    return [
      { id: 'EVT-701', title: 'महाराष्ट्र राज्य मराठा व्यवसाय संगम २०२२', organizer: 'मध्यवर्ती कार्यकारिणी', city: 'पुणे (Pune)', date: '2026-09-15', registrations: 1250, attendance: 1180, status: 'Completed' },
      { id: 'EVT-702', title: 'शिवछत्रपती शिवचरित्र कथा महोत्सव', organizer: 'युवा व क्रीडा आघाडी', city: 'सातारा (Satara)', date: '2026-09-22', registrations: 850, attendance: 810, status: 'Completed' },
      { id: 'EVT-703', title: 'जिजाऊ महिला सबलीकरण मेळावा व गृहउद्योग प्रदर्शन', organizer: 'महिला व युवती आघाडी', city: 'छत्रपती संभाजीनगर (Chhatrapati Sambhajinagar)', date: '2026-09-29', registrations: 620, attendance: 600, status: 'Completed' }
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    return eventList.filter(e => {
      if (filter.city !== 'all' && !e.city.includes(filter.city.split(' ')[0])) return false;
      if (filter.fromDate && e.date < filter.fromDate) return false;
      if (filter.toDate && e.date > filter.toDate) return false;
      return true;
    });
  }, [eventList, filter]);

  const handleExport = (format) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Event ID,Title,Organizer,City,Date,Registrations,Attendance,Status",
         ...filteredEvents.map(e => `${e.id},"${e.title}","${e.organizer}","${e.city}",${e.date},${e.registrations},${e.attendance},"${e.status}"`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Events_Full_Report_${format}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast) toast(`कार्यक्रम डेटा ${format.toUpperCase()} फॉरमॅटमध्ये एक्सपोर्ट झाला! 📁`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlobalReportFilter
        reportTitle="📅 कार्यक्रम व मेळावे संपूर्ण अहवाल (Events MIS Report)"
        onApply={(f) => setFilter(f)}
        onExport={handleExport}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण कार्यक्रम (Total Events)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#431407', marginTop: '4px' }}>{filteredEvents.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>एकूण उपस्थिती (Total Attendees)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
            {filteredEvents.reduce((a, b) => a + b.attendance, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(234,88,12,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #FED7AA', background: '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#431407' }}>
            📅 कार्यक्रम व मेळावे यादी (Events Analytics Table)
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#EA580C', fontWeight: 800 }}>एकूण {filteredEvents.length} कार्यक्रम</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#FFFDF9', borderBottom: '1px solid #FED7AA', color: '#431407', fontWeight: 800 }}>
                <th style={{ padding: '12px 16px' }}>आयडी</th>
                <th style={{ padding: '12px 16px' }}>कार्यक्रम नाव व आयोजक</th>
                <th style={{ padding: '12px 16px' }}>शहर</th>
                <th style={{ padding: '12px 16px' }}>तारीख</th>
                <th style={{ padding: '12px 16px' }}>नोंदणी / उपस्थिती</th>
                <th style={{ padding: '12px 16px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#EA580C' }}>{e.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{e.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>आयोजक: {e.organizer}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{e.city}</td>
                  <td style={{ padding: '12px 16px', color: '#64748B' }}>{e.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, color: '#16A34A' }}>{e.attendance} / {e.registrations}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, background: '#DCFCE7', color: '#166534' }}>
                      {e.status}
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
