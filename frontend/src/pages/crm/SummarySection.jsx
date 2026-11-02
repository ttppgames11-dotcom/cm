import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../services/apiClient';
import { pctBar, coverageLabel, rollupRow } from './crmUnitsHelp';

const cell = { padding: '6px 8px', textAlign: 'left', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid #FFEDD5' };
const head = { ...cell, color: '#C2410C', fontWeight: 900 };

function Bar({ pct, label }) {
  const v = pctBar(pct);
  return (
    <div title={label || `${v}%`}>
      <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}
        style={{ height: '8px', background: '#FFEDD5', borderRadius: '8px', overflow: 'hidden', minWidth: '70px' }}>
        <div style={{ width: `${v}%`, height: '100%', background: '#EA580C' }} />
      </div>
    </div>
  );
}

// The yearly summary of one unit: its own progress, the total of everything below it, the child units and the 12 types.
// Read-only; the numbers come from /api/crm-hierarchy/units/{id}/summary and stay inside the viewer's own area.
export default function SummarySection({ unit }) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);

  // an answer for an older unit or year is ignored
  useEffect(() => {
    const mine = ++request.current;
    setLoading(true);
    apiClient.crmUnitSummary(unit.id, year)
      .then((res) => { if (mine === request.current) { setData(res); setError(''); } })
      .catch((e) => { if (mine === request.current) { setData(null); setError(e.message || 'सारांश लोड करता आला नाही.'); } })
      .finally(() => { if (mine === request.current) setLoading(false); });
  }, [unit.id, year]);

  const typeName = (key) => data?.types?.find((t) => t.key === key)?.mr || key;
  const typeIcon = (key) => data?.types?.find((t) => t.key === key)?.icon || '📌';

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #FED7AA', paddingTop: '14px' }} data-testid="summary-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>📊 सारांश (Summary)</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#C2410C', fontWeight: 800 }}>
          वर्ष
          <select aria-label="सारांश वर्ष" value={year} onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: '6px 8px', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 700 }}>
            {[-2, -1, 0, 1, 2].map((d) => <option key={d} value={thisYear + d}>{thisYear + d}</option>)}
          </select>
        </label>
      </div>

      {loading && <p style={{ margin: '8px 0 0', fontWeight: 700 }}>लोड होत आहे…</p>}
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800, margin: '6px 0' }}>{error}</div>}

      {data && (
        <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[['या युनिटचे', data.own], ['या युनिट व खालील सर्व', data.rollup]].map(([title, p]) => (
              <div key={title} style={{ border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '10px 12px', background: '#FFFDF9' }}>
                <div style={{ fontWeight: 900, color: '#7C2D12' }}>{title}</div>
                <div style={{ fontWeight: 800, margin: '4px 0' }}>{p.done}/{p.total} पूर्ण · मुदत संपलेले {p.overdue}</div>
                <Bar pct={p.completionPct} label={`पूर्णता ${p.completionPct}%`} />
                <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px' }}>
                  {p.typesDone !== undefined ? coverageLabel(p) : `सरासरी कव्हरेज ${p.avgCoveragePct}% · ${p.unitsCount} युनिट्स`}
                  {' · '}उपस्थिती {p.achievedTotal} / लक्ष्य {p.targetTotal}
                </div>
              </div>
            ))}
          </div>

          {data.children.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={head}>युनिट</th><th style={head}>पूर्ण</th><th style={head}>कव्हरेज</th><th style={head}>पूर्णता</th><th style={head}>मुदत संपलेले</th></tr>
                </thead>
                <tbody>
                  {data.children.map((c) => {
                    const r = rollupRow({ unit: c.unit, own: c.rollup });
                    return (
                      <tr key={r.id}>
                        <td style={cell}>{r.name} <span style={{ color: '#64748B' }}>({r.levelLabel})</span></td>
                        <td style={cell}>{r.done}/{r.total}</td>
                        <td style={cell}>{c.rollup.avgCoveragePct}%</td>
                        <td style={cell}><Bar pct={r.completionPct} label={`${r.completionPct}%`} /></td>
                        <td style={cell}>{r.overdue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={head}>उपक्रम प्रकार</th><th style={head}>पूर्ण</th><th style={head}>मुदत संपलेले</th><th style={head}>उपस्थिती / लक्ष्य</th></tr>
              </thead>
              <tbody>
                {Object.entries(data.own.byType).map(([key, t]) => (
                  <tr key={key}>
                    <td style={cell}>{typeIcon(key)} {typeName(key)}</td>
                    <td style={cell}>{t.done}/{t.total}</td>
                    <td style={cell}>{t.overdue}</td>
                    <td style={cell}>{t.achieved} / {t.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
