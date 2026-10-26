import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import { PERIODS, formatRupees, formatWinRate, barWidths, reportPath } from '../referralReport';

// The admin referral report: headline numbers, how the referrals are spread over the stages, and the top
// referrers and receivers for a chosen period. Everything comes from the server (admins only); when the
// report cannot be loaded the server's message is shown, never zeros as if they were real.

const card = { background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: 14, padding: 18 };
const th = { textAlign: 'left', padding: '8px 10px', fontSize: '0.75rem', color: '#9A3412', borderBottom: '1px solid #FED7AA' };
const td = { padding: '8px 10px', fontSize: '0.88rem', color: '#431407', borderBottom: '1px solid #FFEDD5' };

function Tile({ label, value }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: 14 }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C2410C' }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function TopTable({ title, rows, totalKey, totalLabel }) {
  return (
    <div style={{ ...card, flex: 1, minWidth: 300 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#7C2D12' }}>{title}</h3>
      {rows.length === 0 ? (
        <div style={{ color: '#78350F', fontSize: '0.88rem' }}>या कालावधीत कोणी नाही (nobody in this period)</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>सदस्य (Member)</th>
              <th style={th}>{totalLabel}</th>
              <th style={th}>यशस्वी (Won)</th>
              <th style={th}>मूल्य (Value)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.memberId}>
                <td style={td}>{m.name || m.memberId}</td>
                <td style={td}>{m[totalKey]}</td>
                <td style={td}>{m.won}</td>
                <td style={td}>{formatRupees(m.wonValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ReferralReportPanel() {
  const [period, setPeriod] = useState('all');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    apiClient.get(reportPath(period))
      .then((res) => { if (!cancelled) setReport(res); })
      .catch((err) => {
        if (!cancelled) {
          setReport(null);
          setError(err.message || 'अहवाल लोड करता आला नाही.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const s = report?.summary;

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#7C2D12' }}>📊 व्यवसाय संदर्भ अहवाल (Referral Report)</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #FDBA74', background: '#FFF7ED', fontWeight: 700 }}>
          {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {loading && <div style={{ ...card, color: '#78350F' }}>अहवाल लोड होत आहे... (loading)</div>}

      {!loading && error && (
        <div style={{ ...card, background: '#FFEBEE', color: '#C62828', fontWeight: 700 }}>⚠️ {error}</div>
      )}

      {!loading && !error && s && (
        <>
          {s.given === 0 && (
            <div style={{ ...card, marginBottom: 14, color: '#78350F' }}>
              या कालावधीत अद्याप कोणताही संदर्भ नाही (No referrals in this period yet)
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 14 }}>
            <Tile label="दिलेले (Given)" value={s.given} />
            <Tile label="यशस्वी (Won)" value={s.won} />
            <Tile label="अयशस्वी (Lost)" value={s.lost} />
            <Tile label="चालू (Open)" value={s.open} />
            <Tile label="यश दर (Win rate)" value={formatWinRate(s.winRate)} />
            <Tile label="एकूण मूल्य (Won value)" value={formatRupees(s.wonValue)} />
          </div>

          <div style={{ ...card, marginBottom: 14 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#7C2D12' }}>टप्प्यानुसार (By stage)</h3>
            {barWidths(report.byStatus).map((row) => (
              <div key={row.status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 90, fontSize: '0.82rem', color: '#431407', fontWeight: 700 }}>{row.status}</div>
                <div style={{ flex: 1, background: '#FFEDD5', borderRadius: 6, height: 14 }}>
                  <div style={{ width: row.widthPercent + '%', background: '#EA580C', borderRadius: 6, height: 14 }} />
                </div>
                <div style={{ width: 36, textAlign: 'right', fontSize: '0.82rem', color: '#431407' }}>{row.count}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <TopTable title="🏆 सर्वाधिक संदर्भ देणारे (Top referrers)" rows={report.topReferrers || []} totalKey="given" totalLabel="दिलेले (Given)" />
            <TopTable title="🤝 सर्वाधिक संदर्भ मिळवणारे (Top receivers)" rows={report.topReceivers || []} totalKey="received" totalLabel="मिळालेले (Received)" />
          </div>
        </>
      )}
    </section>
  );
}
