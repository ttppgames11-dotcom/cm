import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import { canManageStaff, staffSlotsLeft, ownerQuery } from './crmUnitsHelp';

const inputStyle = { width: '100%', padding: '10px 12px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none', boxSizing: 'border-box' };
const primaryBtn = { padding: '10px 18px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.88rem' };
const ghostBtn = { padding: '6px 12px', background: '#FFF7ED', color: '#9A3412', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' };

// The team of one unit: its owner and staff. Only the owner of the unit and admins see the add box and the remove
// buttons (and the phone numbers the server sends them); the server checks every action again.
export default function StaffSection({ unit, me }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  // loads the team of the selected unit and ignores a late answer for a unit that is no longer selected
  useEffect(() => {
    let alive = true;
    setTeam(null);
    setLoading(true);
    setError('');
    setNotice('');
    apiClient.crmListStaff(unit.id)
      .then((res) => { if (alive) setTeam(res); })
      .catch((e) => { if (alive) setError(e.message || 'कर्मचारी यादी लोड करता आली नाही.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [unit.id]);

  const manage = canManageStaff(unit, me) && unit.status !== 'archived';

  const run = async (call, success) => {
    setBusy(true);
    try {
      const res = await call();
      setTeam(res);
      setNotice(success);
      setError('');
      return true;
    } catch (e) {
      setError(e.message || 'काहीतरी चुकले. पुन्हा प्रयत्न करा.');
      setNotice('');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    const query = ownerQuery(text);
    if (!query.phone && !query.member) return setError('सदस्याचा आयडी किंवा मोबाईल नंबर द्या.');
    if (await run(() => apiClient.crmAddStaff(unit.id, query), 'कर्मचारी जोडला. त्यांना सूचना गेली.')) setText('');
  };

  const remove = async (s) => {
    if (!window.confirm(`"${s.name || s.id}" यांना कर्मचारी यादीतून काढायचे? त्यांचा प्रवेश लगेच बंद होईल.`)) return;
    await run(() => apiClient.crmRemoveStaff(unit.id, s.id), 'कर्मचारी काढला.');
  };

  const left = staffSlotsLeft(team);

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #FED7AA', paddingTop: '14px' }} data-testid="staff-section">
      <h4 style={{ margin: '0 0 8px', color: '#7C2D12', fontWeight: 900 }}>
        👥 कर्मचारी (Staff){team ? ` — ${team.staff.length}/${team.max}` : ''}
      </h4>

      {loading && <p style={{ margin: 0, fontWeight: 700 }}>लोड होत आहे…</p>}
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800, margin: '6px 0' }}>{error}</div>}
      {notice && <div role="status" style={{ color: '#166534', fontWeight: 800, margin: '6px 0' }}>{notice}</div>}

      {team && (
        <>
          {team.staff.length === 0 && <p style={{ margin: 0, color: '#64748B', fontWeight: 700 }}>अजून कोणीही कर्मचारी नाही.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '6px' }}>
            {team.staff.map((s) => (
              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <span>{s.name || s.id} <span style={{ color: '#64748B' }}>({s.id}){s.phone ? ` · 📞 ${s.phone}` : ''}</span></span>
                {manage && <button type="button" style={ghostBtn} disabled={busy} onClick={() => remove(s)}>काढा</button>}
              </li>
            ))}
          </ul>

          {manage && (
            <form onSubmit={add} style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
              <label style={{ fontSize: '0.82rem', color: '#C2410C', fontWeight: 800 }}>
                नवीन कर्मचारी — सदस्य आयडी किंवा मोबाईल ({left} जागा शिल्लक)
                <input
                  aria-label="नवीन कर्मचारी" value={text} onChange={(e) => setText(e.target.value)} style={{ ...inputStyle, marginTop: '5px' }}
                  placeholder="उदा. M4521 किंवा 98765 00021" disabled={left === 0}
                />
              </label>
              <div><button type="submit" style={primaryBtn} disabled={busy || left === 0 || !text.trim()}>कर्मचारी जोडा</button></div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
