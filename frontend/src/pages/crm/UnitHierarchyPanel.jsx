import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../services/apiClient';
import StaffSection from './StaffSection';
import ActivitiesSection from './ActivitiesSection';
import SummarySection from './SummarySection';
import RollupPanel from './RollupPanel';
import {
  LEVELS, levelLabel, childLevels, canEditUnit, canManageAbove, unitPayload, breadcrumb
} from './crmUnitsHelp';

// राज्य > शाखा > विभाग > जिल्हा > तालुका: the units this account may see, with their owners.
// The server filters everything by the signed-in account (see /api/crm-hierarchy); the buttons here only follow
// what /me says, the server checks every action again.

const LEVEL_ICON = { state: '🏛️', branch: '🏢', division: '🗺️', district: '📍', taluka: '🏘️' };
const card = { background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '10px 12px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.82rem', color: '#C2410C', fontWeight: 800, marginBottom: '5px' };
const primaryBtn = { padding: '10px 18px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.88rem' };
const ghostBtn = { padding: '8px 14px', background: '#FFF7ED', color: '#9A3412', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' };

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const emptyForm = { name: '', address: '', owner: '' };

export default function UnitHierarchyPanel({ me }) {
  // bumped after every change, so the summary and the roll-up numbers load again
  const [version, setVersion] = useState(0);
  const [units, setUnits] = useState([]);
  const [selectedId, setSelectedId] = useState(me?.unit?.id || '');
  const [detail, setDetail] = useState(null); // { unit, ancestors } of the selected unit
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState(null); // null | 'edit' | 'owner'
  const [create, setCreate] = useState({ level: '', ...emptyForm });
  const [edit, setEdit] = useState({ name: '', address: '' });
  const [newOwner, setNewOwner] = useState('');

  const permissions = me?.permissions;

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setNotice(''); } else { setNotice(msg); setError(''); }
  };

  const loadUnits = useCallback(async () => {
    const list = await apiClient.crmListUnits();
    setUnits(list);
    return list;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await loadUnits();
        if (alive && !selectedId && list.length === 1) setSelectedId(list[0].id);
      } catch (e) {
        if (alive) flash(e.message || 'माहिती लोड करता आली नाही.', true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadUnits]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDetail = useCallback(async (id) => {
    if (!id) { setDetail(null); return; }
    try {
      setDetail(await apiClient.crmGetUnit(id));
    } catch (e) {
      setDetail(null);
      flash(e.message || 'हे युनिट सापडले नाही', true);
    }
  }, []);

  useEffect(() => { loadDetail(selectedId); setMode(null); }, [selectedId, loadDetail]);

  const unit = detail?.unit || null;
  const levels = useMemo(() => childLevels(unit?.level || null, permissions), [unit, permissions]);
  useEffect(() => {
    setCreate((c) => ({ ...c, level: levels.includes(c.level) ? c.level : levels[0] || '' }));
  }, [levels]);

  // runs a call, shows its message and reloads the list and the selected unit
  const run = async (call, success) => {
    setBusy(true);
    try {
      const res = await call();
      flash(success);
      setVersion((v) => v + 1);
      await loadUnits();
      await loadDetail(selectedId);
      return res;
    } catch (e) {
      flash(e.message || 'काहीतरी चुकले. पुन्हा प्रयत्न करा.', true);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const res = await run(
      () => apiClient.crmCreateUnit(unitPayload({ ...create, parentId: unit?.id })),
      'युनिट तयार झाले! मालकाला सूचना गेली.'
    );
    if (res) {
      setCreate({ level: create.level, ...emptyForm });
      if (!selectedId && res.unit?.id) setSelectedId(res.unit.id);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const res = await run(() => apiClient.crmUpdateUnit(unit.id, unitPayload(edit)), 'बदल जतन झाला.');
    if (res) setMode(null);
  };

  const toggleArchive = async () => {
    const archived = unit.status === 'archived';
    if (!archived && !window.confirm(`"${unit.name}" संग्रहित करायचे? मालकाचा प्रवेश लगेच बंद होईल.`)) return;
    await run(() => apiClient.crmUpdateUnit(unit.id, { status: archived ? 'active' : 'archived' }),
      archived ? 'युनिट पुन्हा सुरू केले.' : 'युनिट संग्रहित केले.');
  };

  const submitOwner = async (e) => {
    e.preventDefault();
    const body = unitPayload({ owner: newOwner }).owner;
    if (!body) return flash('सदस्याचा आयडी किंवा मोबाईल नंबर द्या.', true);
    const res = await run(() => apiClient.crmChangeOwner(unit.id, body), 'मालक बदलला. दोघांना सूचना गेली.');
    if (res) { setMode(null); setNewOwner(''); }
  };

  const startEdit = () => { setEdit({ name: unit.name || '', address: unit.address || '' }); setMode('edit'); };

  if (loading) return <div style={{ ...card, fontWeight: 800 }}>लोड होत आहे…</div>;

  const showCreate = levels.length > 0;
  const crumbs = breadcrumb(unit, detail?.ancestors);

  return (
    <div style={{ display: 'grid', gap: '16px' }} data-testid="unit-hierarchy-panel">
      <div>
        <h2 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>🏛️ CRM युनिट्स</h2>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontWeight: 700, fontSize: '0.85rem' }}>
          राज्य → शाखा → विभाग → जिल्हा → तालुका. आपल्या प्रवेशाप्रमाणे येथे फक्त आपले युनिट व त्याखालील युनिट दिसतात.
        </p>
      </div>

      {error && <div role="alert" style={{ ...card, borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B', fontWeight: 800 }}>{error}</div>}
      {notice && <div role="status" style={{ ...card, borderColor: '#BBF7D0', background: '#F0FDF4', color: '#166534', fontWeight: 800 }}>{notice}</div>}
      {permissions?.readOnly && <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>आपल्याकडे केवळ वाचनाचा अधिकार आहे.</div>}

      <RollupPanel onSelect={setSelectedId} version={version} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
            <h3 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>युनिट्स ({units.length})</h3>
            {permissions?.canCreateState && (
              <button type="button" style={ghostBtn} onClick={() => setSelectedId('')}>➕ नवीन राज्य</button>
            )}
          </div>
          {units.length === 0 && <p style={{ color: '#64748B', fontWeight: 700 }}>अजून कोणतेही युनिट नाही.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '6px' }}>
            {units.map((u) => {
              const depth = Math.max(0, LEVELS.findIndex((l) => l.value === u.level) - LEVELS.findIndex((l) => l.value === (me?.unit?.level || 'state')));
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(u.id)}
                    aria-current={u.id === selectedId}
                    style={{
                      ...ghostBtn, width: '100%', textAlign: 'left', marginLeft: `${depth * 14}px`, maxWidth: `calc(100% - ${depth * 14}px)`,
                      background: u.id === selectedId ? '#FFEDD5' : '#FFF7ED', opacity: u.status === 'archived' ? 0.6 : 1
                    }}
                  >
                    {LEVEL_ICON[u.level]} {u.name} <span style={{ color: '#64748B' }}>· {levelLabel(u.level)}{u.status === 'archived' ? ' · संग्रहित' : ''}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {unit && (
            <div style={card} data-testid="unit-detail">
              <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem' }}>{crumbs.join(' › ')}</div>
              <h3 style={{ margin: '4px 0', color: '#7C2D12', fontWeight: 900 }}>
                {LEVEL_ICON[unit.level]} {unit.name} <span style={{ color: '#64748B', fontSize: '0.8rem' }}>({levelLabel(unit.level)})</span>
              </h3>
              {unit.status === 'archived' && <p style={{ color: '#991B1B', fontWeight: 800, margin: '4px 0' }}>🗄️ हे युनिट संग्रहित आहे.</p>}
              {unit.address && <p style={{ margin: '4px 0', fontWeight: 700 }}>📍 {unit.address}</p>}
              <p style={{ margin: '4px 0', fontWeight: 700 }}>
                👤 मालक: {unit.owner ? `${unit.owner.name || unit.owner.id} (${unit.owner.id})` : '—'}
                {unit.owner?.phone ? ` · 📞 ${unit.owner.phone}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {canEditUnit(unit, me) && <button type="button" style={ghostBtn} onClick={startEdit}>✏️ बदला</button>}
                {canManageAbove(unit, me) && unit.status !== 'archived' && (
                  <button type="button" style={ghostBtn} onClick={() => setMode('owner')}>🔁 मालक बदला</button>
                )}
                {canManageAbove(unit, me) && (
                  <button type="button" style={ghostBtn} disabled={busy} onClick={toggleArchive}>
                    {unit.status === 'archived' ? '♻️ पुन्हा सुरू करा' : '🗄️ संग्रहित करा'}
                  </button>
                )}
              </div>

              {mode === 'edit' && (
                <form onSubmit={submitEdit} style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                  <Field label="युनिटचे नाव *">
                    <input aria-label="युनिटचे नाव" required minLength={2} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="पत्ता">
                    <input aria-label="पत्ता" value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} style={inputStyle} />
                  </Field>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" style={primaryBtn} disabled={busy}>जतन करा</button>
                    <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
                  </div>
                </form>
              )}

              {mode === 'owner' && (
                <form onSubmit={submitOwner} style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                  <Field label="नवीन मालक — सदस्य आयडी किंवा मोबाईल *">
                    <input aria-label="नवीन मालक" required value={newOwner} onChange={(e) => setNewOwner(e.target.value)} style={inputStyle} placeholder="उदा. M4521 किंवा 98765 00021" />
                  </Field>
                  <p style={{ margin: 0, color: '#64748B', fontWeight: 700, fontSize: '0.8rem' }}>जुन्या मालकाचा प्रवेश लगेच बंद होईल.</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" style={primaryBtn} disabled={busy}>मालक बदला</button>
                    <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
                  </div>
                </form>
              )}

              <StaffSection key={`staff-${unit.id}`} unit={unit} me={me} />
              <ActivitiesSection key={`act-${unit.id}`} unit={unit} me={me} onChanged={() => setVersion((v) => v + 1)} />
              <SummarySection key={`sum-${unit.id}`} unit={unit} version={version} />
            </div>
          )}

          {showCreate ? (
            <form onSubmit={submitCreate} style={card} data-testid="create-unit-form">
              <h3 style={{ margin: '0 0 4px', color: '#7C2D12', fontWeight: 900 }}>➕ नवीन युनिट {unit ? `— "${unit.name}" खाली` : ''}</h3>
              <p style={{ margin: '0 0 14px', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>
                मालक हा आधीपासून Connect Maratha चा सदस्य असावा. त्याचा सदस्य आयडी किंवा मोबाईल नंबर द्या.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                <Field label="स्तर *">
                  <select aria-label="स्तर" required value={create.level} onChange={(e) => setCreate({ ...create, level: e.target.value })} style={inputStyle}>
                    {levels.map((l) => <option key={l} value={l}>{LEVEL_ICON[l]} {levelLabel(l)}</option>)}
                  </select>
                </Field>
                <Field label="युनिटचे नाव *">
                  <input aria-label="नवीन युनिटचे नाव" required minLength={2} value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} style={inputStyle} placeholder="उदा. पुणे शाखा" />
                </Field>
                <Field label="पत्ता">
                  <input aria-label="नवीन युनिटचा पत्ता" value={create.address} onChange={(e) => setCreate({ ...create, address: e.target.value })} style={inputStyle} />
                </Field>
                <Field label="मालक — सदस्य आयडी किंवा मोबाईल *">
                  <input aria-label="मालक" required value={create.owner} onChange={(e) => setCreate({ ...create, owner: e.target.value })} style={inputStyle} placeholder="उदा. M4521 किंवा 98765 00021" />
                </Field>
              </div>
              <div style={{ marginTop: '14px' }}><button type="submit" style={primaryBtn} disabled={busy}>युनिट तयार करा</button></div>
            </form>
          ) : (
            unit && !permissions?.readOnly && unit.level === 'taluka' && (
              <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>तालुका हा सर्वात खालचा स्तर आहे; त्याखाली युनिट तयार होत नाही.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
