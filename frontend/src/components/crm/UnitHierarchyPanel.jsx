import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

// राज्य > शाखा > विभाग > जिल्हा > तालुका: units, owner/staff logins and the yearly 12-activity plan.
// Everything shown here is filtered by the server according to the signed-in account, so the same panel
// works for the superadmin, a unit owner and a unit staff member.

const LEVELS = ['state', 'branch', 'division', 'district', 'taluka'];
const LEVEL_LABEL = {
  state: 'राज्य',
  branch: 'शाखा',
  division: 'विभाग / जिल्हा',
  district: 'जिल्हा',
  taluka: 'तालुका'
};
const LEVEL_ICON = { state: '🏛️', branch: '🏢', division: '🗺️', district: '📍', taluka: '🏘️' };
const STATUS = {
  planned: { label: 'नियोजित', bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  in_progress: { label: 'सुरू आहे', bg: '#FEF9C3', fg: '#854D0E', border: '#FDE68A' },
  done: { label: 'पूर्ण', bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  overdue: { label: 'मुदत संपली', bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' }
};
const MONTHS = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

const card = { background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '10px 12px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.82rem', color: '#C2410C', fontWeight: 800, marginBottom: '5px' };
const primaryBtn = { padding: '10px 18px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.88rem' };
const ghostBtn = { padding: '8px 14px', background: '#FFF7ED', color: '#9A3412', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' };

const unwrap = (res) => (res && res.data && typeof res.data === 'object' ? res.data : res) || {};

function ProgressBar({ pct, color = '#EA580C', height = 10, label }) {
  const v = Math.max(0, Math.min(100, Number(pct) || 0));
  return (
    <div title={label || `${v}%`} style={{ width: '100%' }}>
      <div style={{ height, background: '#FFEDD5', borderRadius: height, overflow: 'hidden' }} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${v}%`, height: '100%', background: color, borderRadius: height, transition: 'width .4s' }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.planned;
  return (
    <span data-status={status} style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function UnitHierarchyPanel({ defaultTab = 'overview', title = '🏛️ केंद्र श्रेणी व वार्षिक १२ उपक्रम' }) {
  const [me, setMe] = useState(null);
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState(defaultTab);
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [staff, setStaff] = useState({ staff: [], owner: null });
  const [rollup, setRollup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [view, setView] = useState('list');
  const [modal, setModal] = useState(null); // { type: 'complete'|'activity', activity? }
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setNotice(''); } else { setNotice(msg); setError(''); }
    setTimeout(() => { setNotice(''); setError(''); }, 6000);
  };

  const loadUnits = useCallback(async () => {
    const res = unwrap(await api.crmHierarchy.listUnits());
    setUnits(res.units || []);
    return res.units || [];
  }, []);

  // First load: who am I, the catalogue and the units I can see
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [meRes, typeRes, list] = await Promise.all([api.crmHierarchy.me(), api.crmHierarchy.activityTypes(), loadUnits()]);
        if (!alive) return;
        const meData = unwrap(meRes);
        setMe(meData);
        setTypes(unwrap(typeRes).types || []);
        const own = meData.unit?.id;
        setUnitId(prev => prev || own || list[0]?.id || '');
      } catch (e) {
        if (alive) setError(e.message || 'माहिती लोड करता आली नाही.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadUnits]);

  const unit = useMemo(() => units.find(u => u.id === unitId) || null, [units, unitId]);
  const typeMap = useMemo(() => Object.fromEntries(types.map(t => [t.key, t])), [types]);

  const myUnit = me?.unit;
  const isGlobal = me?.scopeKind === 'global';
  const readOnly = !!me?.permissions?.readOnly;
  const isOwnerOf = (u) => !!u && !!myUnit && me?.unitRole === 'owner' && (u.id === myUnit.id || (u.ancestorIds || []).includes(myUnit.id));
  const canManageSelected = !readOnly && (isGlobal || isOwnerOf(unit));
  const canManageStaff = !readOnly && !!unit && (isGlobal || (me?.unitRole === 'owner' && myUnit?.id === unit.id));
  const canWriteActivities = !readOnly && !!unit && (isGlobal || canManageSelected || myUnit?.id === unit.id);

  const refreshUnitData = useCallback(async () => {
    if (!unitId) { setSummary(null); setActivities([]); return; }
    try {
      const [sum, acts] = await Promise.all([
        api.crmHierarchy.summary({ unitId, year }),
        api.crmHierarchy.listActivities({ unitId, year })
      ]);
      setSummary(unwrap(sum));
      setActivities(unwrap(acts).activities || []);
    } catch (e) {
      flash(e.message || 'माहिती लोड करता आली नाही.', true);
    }
  }, [unitId, year]);

  useEffect(() => { refreshUnitData(); }, [refreshUnitData]);

  useEffect(() => {
    if (tab !== 'staff' || !unitId) return;
    api.crmHierarchy.listStaff(unitId).then(r => setStaff(unwrap(r))).catch(() => setStaff({ staff: [], owner: null }));
  }, [tab, unitId]);

  useEffect(() => {
    if (tab !== 'rollup') return;
    api.crmHierarchy.rollup({ year }).then(r => setRollup(unwrap(r).levels || [])).catch(() => setRollup([]));
  }, [tab, year, units.length]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const r = await fn();
      if (okMsg) flash(okMsg);
      return r;
    } catch (e) {
      flash(e.message || 'कृती अयशस्वी झाली.', true);
      return null;
    } finally {
      setBusy(false);
    }
  };

  // ---------------- Units ----------------
  const childLevels = unit ? LEVELS.filter(l => LEVELS.indexOf(l) > LEVELS.indexOf(unit.level)) : (isGlobal ? ['state'] : []);
  const [newUnit, setNewUnit] = useState({ level: '', name: '', division: '', district: '', taluka: '', address: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '' });
  useEffect(() => { setNewUnit(n => ({ ...n, level: childLevels.includes(n.level) ? n.level : (childLevels[0] || '') })); }, [unitId, me]); // eslint-disable-line

  const createUnit = async (e) => {
    e.preventDefault();
    if (newUnit.ownerPassword.length < 8) return flash('मालकाचा पासवर्ड किमान ८ अक्षरांचा असावा.', true);
    const parentId = newUnit.level === 'state' ? null : unit?.id;
    const r = await run(() => api.crmHierarchy.createUnit({
      level: newUnit.level, parentId, name: newUnit.name, division: newUnit.division, district: newUnit.district,
      taluka: newUnit.taluka, address: newUnit.address,
      owner: { name: newUnit.ownerName, phone: newUnit.ownerPhone, email: newUnit.ownerEmail || undefined, password: newUnit.ownerPassword }
    }), 'युनिट व मालक यशस्वीरीत्या तयार झाले!');
    if (r) {
      setNewUnit({ level: newUnit.level, name: '', division: '', district: '', taluka: '', address: '', ownerName: '', ownerPhone: '', ownerEmail: '', ownerPassword: '' });
      await loadUnits();
      // Nothing selected yet (first unit ever): select it. Otherwise stay on the parent so siblings can be added.
      if (!unitId) setUnitId(unwrap(r).unit?.id || '');
    }
  };

  // ---------------- Staff ----------------
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', email: '', password: '' });
  const reloadStaff = () => api.crmHierarchy.listStaff(unitId).then(r => setStaff(unwrap(r))).catch(() => { });
  const createStaff = async (e) => {
    e.preventDefault();
    if (newStaff.password.length < 8) return flash('पासवर्ड किमान ८ अक्षरांचा असावा.', true);
    const r = await run(() => api.crmHierarchy.createStaff(unitId, { ...newStaff, email: newStaff.email || undefined }), 'कर्मचारी खाते तयार झाले!');
    if (r) { setNewStaff({ name: '', phone: '', email: '', password: '' }); reloadStaff(); loadUnits(); }
  };
  const resetStaffPassword = async (s) => {
    const pw = window.prompt(`"${s.name}" साठी नवीन पासवर्ड (किमान ८ अक्षरे):`);
    if (pw === null) return;
    if (pw.length < 8) return flash('पासवर्ड किमान ८ अक्षरांचा असावा.', true);
    await run(() => api.crmHierarchy.updateStaff(unitId, s.id, { password: pw }), 'पासवर्ड बदलला!');
  };
  const toggleStaff = async (s) => {
    await run(() => api.crmHierarchy.updateStaff(unitId, s.id, { disabled: !s.disabled }), s.disabled ? 'खाते सुरू केले.' : 'खाते बंद केले.');
    reloadStaff();
  };

  // ---------------- Activities ----------------
  const generatePlan = async () => {
    const r = await run(() => api.crmHierarchy.generatePlan(unitId, { year }));
    if (r) {
      const d = unwrap(r);
      flash(d.created?.length ? `${d.created.length} उपक्रम आराखड्यात जोडले.` : 'सर्व १२ उपक्रम अगोदरच आराखड्यात आहेत.');
      refreshUnitData();
    }
  };
  const openActivityForm = (activity = null) => {
    setForm(activity
      ? { type: activity.type, scheduledDate: activity.scheduledDate, targetCount: activity.targetCount, notes: activity.notes || '', title: activity.title || '' }
      : { type: types[0]?.key || '', scheduledDate: `${year}-01-15`, targetCount: types[0]?.defaultTarget || 100, notes: '', title: '' });
    setModal({ type: 'activity', activity });
  };
  const saveActivity = async (e) => {
    e.preventDefault();
    const payload = { type: form.type, scheduledDate: form.scheduledDate, targetCount: Number(form.targetCount) || 0, notes: form.notes, title: form.title || undefined };
    const r = await run(() => modal.activity
      ? api.crmHierarchy.updateActivity(modal.activity.id, payload)
      : api.crmHierarchy.createActivity({ ...payload, unitId }), 'उपक्रम जतन झाला!');
    if (r) { setModal(null); refreshUnitData(); }
  };
  const openComplete = (activity) => {
    setForm({ attendeeCount: activity.attendeeCount || '', notes: activity.notes || '', photoUrl: activity.photoUrl || '' });
    setModal({ type: 'complete', activity });
  };
  const completeActivity = async (e) => {
    e.preventDefault();
    const r = await run(() => api.crmHierarchy.completeActivity(modal.activity.id, {
      attendeeCount: form.attendeeCount === '' ? undefined : Number(form.attendeeCount), notes: form.notes, photoUrl: form.photoUrl
    }), 'उपक्रम पूर्ण म्हणून नोंदवला!');
    if (r) { setModal(null); refreshUnitData(); }
  };
  const startActivity = async (a) => {
    await run(() => api.crmHierarchy.updateActivity(a.id, { status: 'in_progress' }), 'उपक्रम "सुरू" केला.');
    refreshUnitData();
  };
  const removeActivity = async (a) => {
    if (!window.confirm(`"${a.title}" हा उपक्रम काढायचा आहे का?`)) return;
    await run(() => api.crmHierarchy.deleteActivity(a.id), 'उपक्रम काढला.');
    refreshUnitData();
  };

  // ---------------- Render helpers ----------------
  const own = summary?.own;
  const roll = summary?.rollup;
  const byDate = useMemo(() => [...activities].sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate))), [activities]);
  const activityLabel = (a) => `${typeMap[a.type]?.icon || '📌'} ${typeMap[a.type]?.mr || a.title}`;

  if (loading) return <div style={{ ...card, textAlign: 'center', fontWeight: 800, color: '#9A3412' }}>लोड होत आहे...</div>;

  const tabs = [
    { id: 'overview', label: '📊 प्रगती (Progress)' },
    { id: 'activities', label: `🗓️ उपक्रम (${activities.length})` },
    { id: 'units', label: '🏛️ युनिट्स' },
    { id: 'staff', label: '👥 कर्मचारी' },
    { id: 'rollup', label: '📈 स्तरानुसार रोल-अप' }
  ];

  return (
    <section data-testid="unit-hierarchy-panel" style={{ display: 'grid', gap: '16px' }}>
      <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, color: '#7C2D12', fontSize: '1.25rem', fontWeight: 900 }}>{title}</h2>
          <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>
            {me?.account?.name} · {isGlobal ? 'सुपर अॅडमिन (सर्व युनिट्स)' : me?.scopeKind === 'global_read' ? 'केवळ वाचन (सर्व युनिट्स)' : myUnit ? `${LEVEL_LABEL[myUnit.level]}: ${myUnit.name} (${me.unitRole === 'owner' ? 'मालक' : 'कर्मचारी'})` : 'कार्यक्षेत्र'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <Field label="युनिट निवडा">
            <select aria-label="युनिट निवडा" value={unitId} onChange={(e) => setUnitId(e.target.value)} style={{ ...inputStyle, minWidth: '260px' }}>
              {units.length === 0 && <option value="">— युनिट नाही —</option>}
              {units.map(u => (
                <option key={u.id} value={u.id}>{'— '.repeat(LEVELS.indexOf(u.level))}{LEVEL_ICON[u.level]} {u.name} ({LEVEL_LABEL[u.level]})</option>
              ))}
            </select>
          </Field>
          <Field label="वर्ष">
            <input aria-label="वर्ष" type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} style={{ ...inputStyle, width: '100px' }} />
          </Field>
        </div>
      </div>

      {(error || notice) && (
        <div role="status" style={{ padding: '12px 16px', borderRadius: '10px', fontWeight: 800, background: error ? '#FEE2E2' : '#DCFCE7', color: error ? '#991B1B' : '#166534', border: `1px solid ${error ? '#FCA5A5' : '#BBF7D0'}` }}>
          {error || notice}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.88rem', border: tab === t.id ? '2px solid #EA580C' : '1.5px solid #FED7AA', background: tab === t.id ? 'linear-gradient(135deg, #EA580C, #C2410C)' : '#fff', color: tab === t.id ? '#fff' : '#7C2D12' }}>
            {t.label}
          </button>
        ))}
      </div>

      {units.length === 0 && (
        <div style={{ ...card, color: '#7C2D12', fontWeight: 800 }}>
          अद्याप कोणतेही युनिट नाही.{isGlobal ? ' "युनिट्स" टॅबमध्ये पहिले राज्य युनिट तयार करा.' : ' कृपया आपल्या वरिष्ठ अधिकाऱ्याशी संपर्क साधा.'}
        </div>
      )}

      {/* ===================== PROGRESS ===================== */}
      {tab === 'overview' && unit && summary?.unit && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#7C2D12' }}>{LEVEL_ICON[unit.level]} {unit.name}</div>
                <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem' }}>
                  {LEVEL_LABEL[unit.level]}{unit.parentName ? ` · वरिष्ठ: ${unit.parentName}` : ''}{unit.owner ? ` · मालक: ${unit.owner.name}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '10px', fontWeight: 900 }}>✅ पूर्ण {own?.done || 0}</span>
                <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '6px 12px', borderRadius: '10px', fontWeight: 900 }}>🗓️ नियोजित {(own?.planned || 0) + (own?.in_progress || 0)}</span>
                <span data-testid="overdue-count" style={{ background: (own?.overdue || 0) > 0 ? '#FEE2E2' : '#F1F5F9', color: (own?.overdue || 0) > 0 ? '#991B1B' : '#64748B', padding: '6px 12px', borderRadius: '10px', fontWeight: 900 }}>⏰ मुदत संपली {own?.overdue || 0}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span>वर्ष {year}: १२ पैकी {own?.typesCovered || 0} उपक्रम प्रकार पूर्ण</span><span data-testid="coverage-pct">{own?.coveragePct || 0}%</span>
                </div>
                <ProgressBar pct={own?.coveragePct} height={14} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span>नियोजित उपक्रमांपैकी पूर्ण ({own?.done || 0}/{own?.total || 0})</span><span>{own?.completionPct || 0}%</span>
                </div>
                <ProgressBar pct={own?.completionPct} color="#16A34A" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span>उपस्थिती / लाभार्थी: {own?.achievedTotal || 0} / लक्ष्य {own?.targetTotal || 0}</span>
                  <span>{own?.targetTotal ? Math.min(100, Math.round(((own?.achievedTotal || 0) / own.targetTotal) * 100)) : 0}%</span>
                </div>
                <ProgressBar pct={own?.targetTotal ? ((own?.achievedTotal || 0) / own.targetTotal) * 100 : 0} color="#0EA5E9" />
              </div>
            </div>
            {roll && roll.unitsCount > 1 && (
              <div data-testid="rollup-box" style={{ marginTop: '16px', padding: '14px', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                <div style={{ fontWeight: 900, color: '#9A3412', marginBottom: '8px' }}>⬇️ खालील {roll.unitsCount - 1} युनिट्ससह रोल-अप (एकूण {roll.unitsCount} युनिट्स)</div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontWeight: 800, fontSize: '0.88rem', color: '#7C2D12' }}>
                  <span>पूर्ण उपक्रम: <b data-testid="rollup-done">{roll.done}</b>/{roll.total}</span>
                  <span>सरासरी १२-उपक्रम कव्हरेज: <b>{roll.avgCoveragePct}%</b></span>
                  <span>१००% पूर्ण युनिट्स: <b>{roll.unitsFullyCovered}</b></span>
                  <span style={{ color: roll.overdue ? '#B91C1C' : undefined }}>मुदत संपलेले: <b>{roll.overdue}</b></span>
                  <span>उपस्थिती: <b>{roll.achievedTotal}</b>/{roll.targetTotal}</span>
                </div>
                <div style={{ marginTop: '8px' }}><ProgressBar pct={roll.avgCoveragePct} color="#C2410C" /></div>
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>🗂️ वार्षिक १२ उपक्रम</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {types.map(t => {
                const b = own?.byType?.[t.key] || { total: 0, done: 0, overdue: 0, target: 0, achieved: 0 };
                const pct = b.total ? Math.round((b.done / b.total) * 100) : 0;
                const late = b.overdue > 0;
                return (
                  <div key={t.key} data-testid={`type-${t.key}`} style={{ border: `1.5px solid ${late ? '#FCA5A5' : '#FED7AA'}`, background: late ? '#FEF2F2' : '#FFFDF9', borderRadius: '12px', padding: '12px' }}>
                    <div style={{ fontWeight: 900, color: '#7C2D12' }}>{t.icon} {t.mr}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>{t.en}</div>
                    <div style={{ margin: '8px 0 4px' }}><ProgressBar pct={pct} color={b.done ? '#16A34A' : '#EA580C'} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                      <span>{b.done}/{b.total} पूर्ण</span>
                      <span>{b.achieved}/{b.target} लाभार्थी</span>
                    </div>
                    {late && <div style={{ color: '#B91C1C', fontWeight: 900, fontSize: '0.78rem', marginTop: '4px' }}>⏰ {b.overdue} मुदत संपली</div>}
                    {!b.total && <div style={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', marginTop: '4px' }}>अद्याप नियोजित नाही</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {summary.children?.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>⬇️ खालील युनिट्सची प्रगती</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', color: '#9A3412', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>युनिट</th><th style={{ padding: '10px' }}>स्तर</th><th style={{ padding: '10px', minWidth: '160px' }}>१२-उपक्रम कव्हरेज (रोल-अप)</th>
                      <th style={{ padding: '10px' }}>पूर्ण</th><th style={{ padding: '10px' }}>मुदत संपली</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.children.map(c => (
                      <tr key={c.unit.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px', fontWeight: 800 }}>
                          <button onClick={() => setUnitId(c.unit.id)} style={{ background: 'none', border: 'none', color: '#C2410C', fontWeight: 900, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>{c.unit.name}</button>
                        </td>
                        <td style={{ padding: '10px' }}>{LEVEL_LABEL[c.unit.level]}</td>
                        <td style={{ padding: '10px' }}><ProgressBar pct={c.rollup.avgCoveragePct} /><span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{c.rollup.avgCoveragePct}% · {c.rollup.unitsCount} युनिट्स</span></td>
                        <td style={{ padding: '10px', fontWeight: 800 }}>{c.rollup.done}/{c.rollup.total}</td>
                        <td style={{ padding: '10px', fontWeight: 900, color: c.rollup.overdue ? '#B91C1C' : '#64748B' }}>{c.rollup.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== ACTIVITIES ===================== */}
      {tab === 'activities' && unit && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>🗓️ {unit.name}: उपक्रम आराखडा {year}</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button style={view === 'list' ? primaryBtn : ghostBtn} onClick={() => setView('list')}>☰ यादी</button>
              <button style={view === 'calendar' ? primaryBtn : ghostBtn} onClick={() => setView('calendar')}>📅 कॅलेंडर</button>
              {canWriteActivities && <button style={ghostBtn} disabled={busy} onClick={generatePlan}>⚡ १२ उपक्रमांचा आराखडा तयार करा</button>}
              {canWriteActivities && <button style={primaryBtn} onClick={() => openActivityForm()}>➕ उपक्रम जोडा</button>}
            </div>
          </div>
          {activities.length === 0 && <div style={{ color: '#64748B', fontWeight: 800, padding: '20px', textAlign: 'center' }}>या वर्षासाठी अद्याप उपक्रम नाहीत. "आराखडा तयार करा" दाबा.</div>}

          {view === 'list' && activities.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table data-testid="activity-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>उपक्रम</th><th style={{ padding: '10px' }}>तारीख</th><th style={{ padding: '10px' }}>लक्ष्य</th>
                    <th style={{ padding: '10px' }}>स्थिती</th><th style={{ padding: '10px' }}>पुरावा</th><th style={{ padding: '10px', textAlign: 'right' }}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {byDate.map(a => (
                    <tr key={a.id} data-status={a.status} style={{ borderBottom: '1px solid #F1F5F9', background: a.status === 'overdue' ? '#FEF2F2' : undefined }}>
                      <td style={{ padding: '10px', fontWeight: 900, color: '#0F172A' }}>{activityLabel(a)}<div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>{typeMap[a.type]?.en}</div></td>
                      <td style={{ padding: '10px', fontWeight: 800, color: a.status === 'overdue' ? '#B91C1C' : '#334155' }}>{a.scheduledDate}</td>
                      <td style={{ padding: '10px', fontWeight: 800 }}>{a.targetCount}</td>
                      <td style={{ padding: '10px' }}><StatusBadge status={a.status} /></td>
                      <td style={{ padding: '10px', fontSize: '0.82rem', color: '#475569', maxWidth: '260px' }}>
                        {a.status === 'done' ? (
                          <>
                            <div>👥 उपस्थिती: <b>{a.attendeeCount}</b></div>
                            {a.notes && <div>📝 {a.notes}</div>}
                            {a.photoUrl && <a href={a.photoUrl} target="_blank" rel="noreferrer noopener" style={{ color: '#C2410C', fontWeight: 800 }}>🖼️ फोटो</a>}
                          </>
                        ) : <span style={{ color: '#94A3B8' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        {canWriteActivities && a.status !== 'done' && (
                          <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {a.rawStatus === 'planned' && <button style={ghostBtn} onClick={() => startActivity(a)}>▶ सुरू</button>}
                            <button style={ghostBtn} onClick={() => openActivityForm(a)}>✏️</button>
                            <button style={primaryBtn} data-testid={`complete-${a.type}`} onClick={() => openComplete(a)}>✔ पूर्ण करा</button>
                          </div>
                        )}
                        {canManageSelected && <button style={{ ...ghostBtn, marginLeft: '6px', color: '#B91C1C' }} onClick={() => removeActivity(a)}>🗑️</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'calendar' && activities.length > 0 && (
            <div data-testid="activity-calendar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {MONTHS.map((m, i) => {
                const items = byDate.filter(a => Number(String(a.scheduledDate).slice(5, 7)) === i + 1);
                return (
                  <div key={m} style={{ border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '10px', background: '#FFFDF9', minHeight: '90px' }}>
                    <div style={{ fontWeight: 900, color: '#9A3412', marginBottom: '6px' }}>{m} {year}</div>
                    {items.length === 0 && <div style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>—</div>}
                    {items.map(a => (
                      <div key={a.id} style={{ marginBottom: '6px', padding: '6px 8px', borderRadius: '8px', background: STATUS[a.status].bg, border: `1px solid ${STATUS[a.status].border}`, fontSize: '0.8rem', fontWeight: 800, color: STATUS[a.status].fg }}>
                        {String(a.scheduledDate).slice(8, 10)} · {activityLabel(a)} <span style={{ opacity: 0.8 }}>({STATUS[a.status].label})</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== UNITS ===================== */}
      {tab === 'units' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>🏛️ युनिट्स (राज्य › शाखा › विभाग › जिल्हा › तालुका)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table data-testid="unit-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>युनिट</th><th style={{ padding: '10px' }}>स्तर</th><th style={{ padding: '10px' }}>मालक (Owner)</th><th style={{ padding: '10px' }}>कर्मचारी</th><th style={{ padding: '10px' }}>वरिष्ठ युनिट</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9', background: u.id === unitId ? '#FFF7ED' : undefined }}>
                      <td style={{ padding: '10px', fontWeight: 900, paddingLeft: `${10 + LEVELS.indexOf(u.level) * 14}px` }}>
                        <button onClick={() => setUnitId(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, color: '#C2410C', padding: 0 }}>{LEVEL_ICON[u.level]} {u.name}</button>
                      </td>
                      <td style={{ padding: '10px' }}>{LEVEL_LABEL[u.level]}</td>
                      <td style={{ padding: '10px' }}>{u.owner ? <>{u.owner.name}<div style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.owner.phone}{u.owner.disabled ? ' · बंद' : ''}</div></> : '—'}</td>
                      <td style={{ padding: '10px' }}>{u.staffCount}</td>
                      <td style={{ padding: '10px', color: '#64748B' }}>{u.parentName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(childLevels.length > 0 && (unit ? canManageSelected : isGlobal)) ? (
            <form onSubmit={createUnit} style={card} data-testid="create-unit-form">
              <h3 style={{ margin: '0 0 4px', color: '#7C2D12', fontWeight: 900 }}>➕ नवीन युनिट व मालक {unit && newUnit.level !== 'state' ? `— "${unit.name}" खाली` : ''}</h3>
              <p style={{ margin: '0 0 14px', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>युनिटचा मालक खरा लॉगिन खाते असतो (किमान ८ अक्षरी पासवर्ड). मालक आपल्या युनिटसाठी कर्मचारी खाते तयार करू शकतो.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                <Field label="स्तर *">
                  <select aria-label="स्तर" required value={newUnit.level} onChange={(e) => setNewUnit({ ...newUnit, level: e.target.value })} style={inputStyle}>
                    {childLevels.map(l => <option key={l} value={l}>{LEVEL_ICON[l]} {LEVEL_LABEL[l]}</option>)}
                  </select>
                </Field>
                <Field label="युनिटचे नाव *"><input aria-label="युनिटचे नाव" required value={newUnit.name} onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })} style={inputStyle} placeholder="उदा. हवेली तालुका केंद्र" /></Field>
                {newUnit.level === 'division' && <Field label="विभाग"><input aria-label="विभाग" value={newUnit.division} onChange={(e) => setNewUnit({ ...newUnit, division: e.target.value })} style={inputStyle} placeholder="उदा. पुणे विभाग" /></Field>}
                {(newUnit.level === 'district' || newUnit.level === 'taluka') && <Field label="जिल्हा *"><input aria-label="जिल्हा" required={newUnit.level === 'taluka' && !unit?.district} value={newUnit.district} onChange={(e) => setNewUnit({ ...newUnit, district: e.target.value })} style={inputStyle} placeholder={unit?.district || 'उदा. पुणे'} /></Field>}
                {newUnit.level === 'taluka' && <Field label="तालुका"><input aria-label="तालुका" value={newUnit.taluka} onChange={(e) => setNewUnit({ ...newUnit, taluka: e.target.value })} style={inputStyle} placeholder="उदा. हवेली" /></Field>}
                <Field label="पत्ता"><input aria-label="पत्ता" value={newUnit.address} onChange={(e) => setNewUnit({ ...newUnit, address: e.target.value })} style={inputStyle} /></Field>
              </div>
              <h4 style={{ margin: '16px 0 8px', color: '#9A3412' }}>👤 मालक (Owner) लॉगिन</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                <Field label="मालकाचे नाव *"><input aria-label="मालकाचे नाव" required value={newUnit.ownerName} onChange={(e) => setNewUnit({ ...newUnit, ownerName: e.target.value })} style={inputStyle} /></Field>
                <Field label="मोबाईल (लॉगिन आयडी) *"><input aria-label="मालकाचा मोबाईल" required type="tel" value={newUnit.ownerPhone} onChange={(e) => setNewUnit({ ...newUnit, ownerPhone: e.target.value })} style={inputStyle} placeholder="10 अंकी" /></Field>
                <Field label="ई-मेल"><input aria-label="मालकाचा ई-मेल" type="email" value={newUnit.ownerEmail} onChange={(e) => setNewUnit({ ...newUnit, ownerEmail: e.target.value })} style={inputStyle} /></Field>
                <Field label="पासवर्ड (किमान ८ अक्षरे) *"><input aria-label="मालकाचा पासवर्ड" required type="password" minLength={8} autoComplete="new-password" value={newUnit.ownerPassword} onChange={(e) => setNewUnit({ ...newUnit, ownerPassword: e.target.value })} style={inputStyle} /></Field>
              </div>
              <div style={{ marginTop: '14px' }}><button type="submit" style={primaryBtn} disabled={busy}>युनिट तयार करा</button></div>
            </form>
          ) : (
            unit && <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>{readOnly ? 'आपल्याकडे केवळ वाचनाचा अधिकार आहे.' : 'या युनिटखाली नवीन युनिट तयार करण्याचा अधिकार नाही.'}</div>
          )}
        </div>
      )}

      {/* ===================== STAFF ===================== */}
      {tab === 'staff' && unit && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>👥 {unit.name}: मालक व कर्मचारी</h3>
            {staff.owner && (
              <div style={{ padding: '10px 12px', background: '#FFF7ED', borderRadius: '10px', marginBottom: '10px', fontWeight: 800 }}>
                👑 मालक: {staff.owner.name} · {staff.owner.phone} <span style={{ color: '#64748B', fontSize: '0.8rem' }}>({staff.owner.role})</span>
              </div>
            )}
            {staff.staff.length === 0 ? <div style={{ color: '#64748B', fontWeight: 800 }}>अद्याप कर्मचारी खाते नाहीत.</div> : (
              <table data-testid="staff-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr style={{ background: '#FFF7ED', color: '#9A3412', textAlign: 'left' }}><th style={{ padding: '10px' }}>नाव</th><th style={{ padding: '10px' }}>मोबाईल</th><th style={{ padding: '10px' }}>भूमिका</th><th style={{ padding: '10px' }}>स्थिती</th><th style={{ padding: '10px', textAlign: 'right' }}>कृती</th></tr></thead>
                <tbody>
                  {staff.staff.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px', fontWeight: 900 }}>{s.name}</td>
                      <td style={{ padding: '10px' }}>{s.phone}</td>
                      <td style={{ padding: '10px' }}>{s.role}</td>
                      <td style={{ padding: '10px' }}>{s.disabled ? <span style={{ color: '#B91C1C', fontWeight: 900 }}>🚫 बंद</span> : <span style={{ color: '#166534', fontWeight: 900 }}>✅ सक्रिय</span>}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        {canManageStaff && (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button style={ghostBtn} onClick={() => resetStaffPassword(s)}>🔑 पासवर्ड</button>
                            <button style={ghostBtn} onClick={() => toggleStaff(s)}>{s.disabled ? '▶ सुरू करा' : '⏸ बंद करा'}</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {canManageStaff ? (
            <form onSubmit={createStaff} style={card} data-testid="create-staff-form">
              <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>➕ नवीन कर्मचारी खाते (फक्त याच युनिटसाठी)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                <Field label="नाव *"><input aria-label="कर्मचारी नाव" required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} style={inputStyle} /></Field>
                <Field label="मोबाईल (लॉगिन आयडी) *"><input aria-label="कर्मचारी मोबाईल" required type="tel" value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} style={inputStyle} /></Field>
                <Field label="ई-मेल"><input aria-label="कर्मचारी ई-मेल" type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} style={inputStyle} /></Field>
                <Field label="पासवर्ड (किमान ८ अक्षरे) *"><input aria-label="कर्मचारी पासवर्ड" required type="password" minLength={8} autoComplete="new-password" value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} style={inputStyle} /></Field>
              </div>
              <div style={{ marginTop: '14px' }}><button type="submit" style={primaryBtn} disabled={busy}>कर्मचारी खाते तयार करा</button></div>
            </form>
          ) : (
            <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>कर्मचारी खाते फक्त त्या युनिटचा मालक तयार करू शकतो.</div>
          )}
        </div>
      )}

      {/* ===================== ROLL-UP BY LEVEL ===================== */}
      {tab === 'rollup' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {rollup.length === 0 && <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>रोल-अपसाठी माहिती उपलब्ध नाही.</div>}
          {rollup.map(l => (
            <div key={l.level} style={card} data-testid={`rollup-level-${l.level}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>{LEVEL_ICON[l.level]} {LEVEL_LABEL[l.level]} ({l.unitsCount})</h3>
                <span style={{ fontWeight: 800, color: '#475569', fontSize: '0.85rem' }}>पूर्ण {l.totals.done}/{l.totals.total} · मुदत संपली {l.totals.overdue} · उपस्थिती {l.totals.achievedTotal}/{l.totals.targetTotal}</span>
              </div>
              <div style={{ margin: '8px 0 12px' }}><ProgressBar pct={l.totals.avgCoveragePct} height={12} label={`सरासरी कव्हरेज ${l.totals.avgCoveragePct}%`} /><div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9A3412' }}>सरासरी १२-उपक्रम कव्हरेज: {l.totals.avgCoveragePct}%</div></div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {l.units.map(r => (
                  <div key={r.unit.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1.2fr) 2fr auto', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => { setUnitId(r.unit.id); setTab('overview'); }} style={{ background: 'none', border: 'none', textAlign: 'left', color: '#C2410C', fontWeight: 900, cursor: 'pointer', padding: 0 }}>{r.unit.name}</button>
                    <ProgressBar pct={r.rollup.avgCoveragePct} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: r.rollup.overdue ? '#B91C1C' : '#475569' }}>{r.rollup.avgCoveragePct}% · {r.rollup.done}/{r.rollup.total}{r.rollup.overdue ? ` · ⏰${r.rollup.overdue}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== MODALS ===================== */}
      {modal && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setModal(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={modal.type === 'complete' ? completeActivity : saveActivity} style={{ ...card, width: 'min(520px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
            {modal.type === 'complete' ? (
              <>
                <h3 style={{ margin: '0 0 6px', color: '#7C2D12', fontWeight: 900 }}>✔ उपक्रम पूर्ण करा: {activityLabel(modal.activity)}</h3>
                <p style={{ margin: '0 0 12px', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>पुरावा आवश्यक: उपस्थिती संख्या व नोंद. फोटो URL ऐच्छिक.</p>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <Field label="उपस्थिती संख्या *"><input aria-label="उपस्थिती संख्या" required type="number" min="0" value={form.attendeeCount} onChange={(e) => setForm({ ...form, attendeeCount: e.target.value })} style={inputStyle} /></Field>
                  <Field label="नोंद / पुरावा *"><textarea aria-label="नोंद" required rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} /></Field>
                  <Field label="फोटो URL"><input aria-label="फोटो URL" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></Field>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 12px', color: '#7C2D12', fontWeight: 900 }}>{modal.activity ? '✏️ उपक्रम संपादन' : '➕ नवीन उपक्रम'}</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <Field label="उपक्रम प्रकार *">
                    <select aria-label="उपक्रम प्रकार" value={form.type} onChange={(e) => { const t = typeMap[e.target.value]; setForm({ ...form, type: e.target.value, targetCount: modal.activity ? form.targetCount : t?.defaultTarget || form.targetCount }); }} style={inputStyle}>
                      {types.map(t => <option key={t.key} value={t.key}>{t.icon} {t.mr} ({t.en})</option>)}
                    </select>
                  </Field>
                  <Field label="नियोजित तारीख *"><input aria-label="नियोजित तारीख" required type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} style={inputStyle} /></Field>
                  <Field label="लक्ष्य संख्या (लाभार्थी / उपस्थिती) *"><input aria-label="लक्ष्य संख्या" required type="number" min="0" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: e.target.value })} style={inputStyle} /></Field>
                  <Field label="नोंद"><textarea aria-label="नोंद" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} /></Field>
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" style={ghostBtn} onClick={() => setModal(null)}>रद्द करा</button>
              <button type="submit" style={primaryBtn} disabled={busy}>{modal.type === 'complete' ? 'पूर्ण म्हणून नोंदवा' : 'जतन करा'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
