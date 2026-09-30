// src/pages/admin/reports/GlobalReportFilter.jsx
import React, { useState, useEffect } from 'react';

const MAHARASHTRA_DISTRICTS_CITIES = [
  'पुणे (Pune)', 'मुंबई (Mumbai)', 'ठाणे (Thane)', 'नाशिक (Nashik)',
  'छत्रपती संभाजीनगर (Chhatrapati Sambhajinagar)', 'नागपूर (Nagpur)',
  'सातारा (Satara)', 'कोल्हापूर (Kolhapur)', 'सोलापूर (Solapur)',
  'अहमदनगर (Ahilya Nagar / Ahmednagar)', 'अमरावती (Amravati)',
  'नांदेड (Nanded)', 'सांगली (Sangli)', 'जळगाव (Jalgaon)', 'लातूर (Latur)'
];

const STATES = [
  { id: 'MH', name: 'महाराष्ट्र (Maharashtra)' },
  { id: 'KA', name: 'कर्नाटक (Karnataka)' },
  { id: 'GA', name: 'गोवा (Goa)' },
  { id: 'GJ', name: 'गुजरात (Gujarat)' },
  { id: 'MP', name: 'मध्य प्रदेश (Madhya Pradesh)' },
  { id: 'DL', name: 'दिल्ली (Delhi NCR)' }
];

export default function GlobalReportFilter({ onApply, onExport, reportTitle = 'अहवाल' }) {
  const [selectedState, setSelectedState] = useState('MH');
  const [selectedCity, setSelectedCity] = useState('all');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-30');
  const [dateError, setDateError] = useState('');

  // Validate dates
  useEffect(() => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError('⚠️ "पासून ची तारीख" (From Date) ही "पर्यंत ची तारीख" (To Date) पेक्षा कमी किंवा समान असावी.');
    } else {
      setDateError('');
    }
  }, [fromDate, toDate]);

  const handleApply = (e) => {
    e.preventDefault();
    if (dateError) return;
    if (onApply) {
      onApply({
        state: selectedState,
        city: selectedCity,
        fromDate,
        toDate
      });
    }
  };

  const handleReset = () => {
    setSelectedState('MH');
    setSelectedCity('all');
    setFromDate('2026-09-01');
    setToDate('2026-09-30');
    setDateError('');
    if (onApply) {
      onApply({ state: 'MH', city: 'all', fromDate: '2026-09-01', toDate: '2026-09-30' });
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #FED7AA',
      borderRadius: '14px',
      padding: '18px 22px',
      marginBottom: '22px',
      boxShadow: '0 4px 15px rgba(234,88,12,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            GLOBAL FILTERS & MIS REPORT ENGINE
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', color: '#431407', fontWeight: 900 }}>
            📊 {reportTitle} — सर्वसमावेशक फिल्टर व निर्यात कन्सोल
          </h3>
        </div>

        {/* EXPORT BUTTONS */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onExport && onExport('excel')}
            style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
          >
            📊 Excel Export
          </button>
          <button
            type="button"
            onClick={() => onExport && onExport('csv')}
            style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
          >
            📁 CSV Export
          </button>
          <button
            type="button"
            onClick={() => onExport && onExport('pdf')}
            style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
          >
            📕 PDF Export
          </button>
        </div>
      </div>

      <form onSubmit={handleApply} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
        {/* STATE DROPDOWN */}
        <div>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#431407', marginBottom: '4px' }}>
            राज्य (State)
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.82rem', fontWeight: 700, background: '#FFF' }}
          >
            {STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* CITY DROPDOWN (Dynamic based on state) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#431407', marginBottom: '4px' }}>
            शहर / जिल्हा (City / District)
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.82rem', fontWeight: 700, background: '#FFF' }}
          >
            <option value="all">सर्व शहरे (All Cities)</option>
            {selectedState === 'MH' ? (
              MAHARASHTRA_DISTRICTS_CITIES.map((c, i) => <option key={i} value={c}>{c}</option>)
            ) : (
              <option value="capital">राजधानी शहर (Capital City)</option>
            )}
          </select>
        </div>

        {/* FROM DATE */}
        <div>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#431407', marginBottom: '4px' }}>
            पासून ची तारीख (From Date)
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.82rem', fontWeight: 700 }}
          />
        </div>

        {/* TO DATE */}
        <div>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#431407', marginBottom: '4px' }}>
            पर्यंत ची तारीख (To Date)
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.82rem', fontWeight: 700 }}
          />
        </div>

        {/* BUTTONS */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={!!dateError}
            style={{
              flex: 1,
              background: dateError ? '#94A3B8' : 'linear-gradient(135deg, #EA580C, #D97706)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: dateError ? 'not-allowed' : 'pointer'
            }}
          >
            🔍 फिल्टर लागू करा
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              background: '#FFF7ED',
              color: '#C2410C',
              border: '1px solid #FED7AA',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ↺ रिसेट
          </button>
        </div>
      </form>

      {/* DATE ERROR MESSAGE */}
      {dateError && (
        <div style={{ color: '#DC2626', fontSize: '0.78rem', fontWeight: 800, marginTop: '8px' }}>
          {dateError}
        </div>
      )}
    </div>
  );
}
