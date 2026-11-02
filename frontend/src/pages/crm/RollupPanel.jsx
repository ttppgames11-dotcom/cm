import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../services/apiClient';
import { pctBar, rollupRow } from './crmUnitsHelp';

const cell = { padding: '6px 8px', textAlign: 'left', fontWeight: 700, fontSize: '0.82rem', borderBottom: '1px solid #FFEDD5' };
const head = { ...cell, color: '#C2410C', fontWeight: 900 };
const card = { background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' };

// The roll-up by level: one table per level with a row per unit and the totals of the level. Read-only; the server only
// sends the units the member may see, and the panel stays hidden when there is nothing to compare (one unit or none).
export default function RollupPanel({ onSelect }) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef(0);

  useEffect(() => {
    const mine = ++request.current;
    setLoading(true);
    apiClient.crmRollup({ year })
      .then((res) => { if (mine === request.current) { setData(res); setError(''); } })
      .catch((e) => { if (mine === request.current) { setData(null); setError(e.message || 'रोल-अप लोड करता आला नाही.'); } })
      .finally(() => { if (mine === request.current) setLoading(false); });
  }, [year]);

  const unitCount = (data?.levels || []).reduce((n, l) => n + l.unitsCount, 0);
  if (!loading && !error && unitCount <= 1) return null;

  return (
    <div style={card} data-testid="rollup-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>📈 स्तरानुसार रोल-अप</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#C2410C', fontWeight: 800 }}>
          वर्ष
          <select aria-label="रोल-अप वर्ष" value={year} onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: '6px 8px', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 700 }}>
            {[-2, -1, 0, 1, 2].map((d) => <option key={d} value={thisYear + d}>{thisYear + d}</option>)}
          </select>
        </label>
      </div>

      {loading && <p style={{ margin: '8px 0 0', fontWeight: 700 }}>लोड होत आहे…</p>}
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800, margin: '6px 0' }}>{error}</div>}

      {data?.levels.map((level) => (
        <div key={level.level} style={{ marginTop: '14px', overflowX: 'auto' }}>
          <div style={{ fontWeight: 900, color: '#9A3412', marginBottom: '4px' }}>{level.levelLabel} ({level.unitsCount})</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={head}>युनिट</th><th style={head}>पूर्ण</th><th style={head}>कव्हरेज</th><th style={head}>पूर्णता</th><th style={head}>मुदत संपलेले</th><th style={head}>उपस्थिती / लक्ष्य</th></tr>
            </thead>
            <tbody>
              {level.units.map((entry) => {
                const r = rollupRow(entry);
                return (
                  <tr key={r.id}>
                    <td style={cell}>
                      {onSelect
                        ? <button type="button" onClick={() => onSelect(r.id)} style={{ background: 'none', border: 'none', color: '#C2410C', fontWeight: 800, cursor: 'pointer', padding: 0 }}>{r.name}</button>
                        : r.name}
                    </td>
                    <td style={cell}>{r.done}/{r.total}</td>
                    <td style={cell}>{r.coveragePct}%</td>
                    <td style={cell}>
                      <div role="progressbar" aria-valuenow={pctBar(r.completionPct)} aria-valuemin={0} aria-valuemax={100}
                        title={`${r.completionPct}%`} style={{ height: '8px', background: '#FFEDD5', borderRadius: '8px', overflow: 'hidden', minWidth: '70px' }}>
                        <div style={{ width: `${pctBar(r.completionPct)}%`, height: '100%', background: '#EA580C' }} />
                      </div>
                    </td>
                    <td style={cell}>{r.overdue}</td>
                    <td style={cell}>{r.achieved} / {r.target}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#FFF7ED' }}>
                <td style={{ ...cell, fontWeight: 900 }}>एकूण</td>
                <td style={{ ...cell, fontWeight: 900 }}>{level.totals.done}/{level.totals.total}</td>
                <td style={{ ...cell, fontWeight: 900 }}>{level.totals.avgCoveragePct}%</td>
                <td style={{ ...cell, fontWeight: 900 }}>{level.totals.completionPct}%</td>
                <td style={{ ...cell, fontWeight: 900 }}>{level.totals.overdue}</td>
                <td style={{ ...cell, fontWeight: 900 }}>{level.totals.achievedTotal} / {level.totals.targetTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
