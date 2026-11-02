import React, { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../../services/apiClient';
import { activityStatus, completionPayload, planPayload, canWriteActivities, progressLabel, editableStatus } from './crmUnitsHelp';

const inputStyle = { width: '100%', padding: '8px 10px', background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '10px', color: '#0F172A', fontWeight: 700, outline: 'none', boxSizing: 'border-box' };
const primaryBtn = { padding: '9px 16px', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' };
const ghostBtn = { padding: '6px 12px', background: '#FFF7ED', color: '#9A3412', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' };
const labelStyle = { display: 'block', fontSize: '0.8rem', color: '#C2410C', fontWeight: 800 };

// The yearly activities of one unit: the plan, the list with statuses and the proof that closes an activity.
// Everyone who sees the unit reads the list; the buttons show only to those who may write (the server checks again).
export default function ActivitiesSection({ unit, me }) {
  const thisYear = new Date().getFullYear();
  const [types, setTypes] = useState([]);
  const [year, setYear] = useState(thisYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(null); // null | { kind: 'plan' | 'add' } | { kind: 'edit' | 'done', id }
  const [targets, setTargets] = useState({});
  const [form, setForm] = useState({});
  const request = useRef(0);

  const typeName = (key) => types.find((t) => t.key === key)?.mr || key;
  const typeIcon = (key) => types.find((t) => t.key === key)?.icon || '📌';
  const writer = canWriteActivities(unit, me) && unit.status !== 'archived';
  const isAdmin = me?.scopeKind === 'global';

  useEffect(() => { apiClient.crmActivityTypes().then(setTypes).catch(() => {}); }, []);

  // loads the list; an answer for an older unit or year is ignored
  const load = useCallback(async () => {
    const mine = ++request.current;
    setLoading(true);
    try {
      const res = await apiClient.crmListActivities(unit.id, { year });
      if (mine === request.current) { setData(res); setError(''); }
    } catch (e) {
      if (mine === request.current) { setData(null); setError(e.message || 'उपक्रम लोड करता आले नाहीत.'); }
    } finally {
      if (mine === request.current) setLoading(false);
    }
  }, [unit.id, year]);

  useEffect(() => { setMode(null); setNotice(''); load(); }, [load]);

  const run = async (call, success) => {
    setBusy(true);
    try {
      await call();
      setNotice(success);
      setError('');
      setMode(null);
      await load();
      return true;
    } catch (e) {
      setError(e.message || 'काहीतरी चुकले. पुन्हा प्रयत्न करा.');
      setNotice('');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const openPlan = () => {
    setTargets(Object.fromEntries(types.map((t) => [t.key, String(t.defaultTarget)])));
    setMode({ kind: 'plan' });
  };
  const openAdd = () => { setForm({ type: types[0]?.key || '', date: `${year}-01-15`, target: '' }); setMode({ kind: 'add' }); };
  const openEdit = (a) => { setForm({ date: a.scheduledDate, target: String(a.targetCount), notes: a.notes || '', status: editableStatus(a), originalStatus: editableStatus(a) }); setMode({ kind: 'edit', id: a.id }); };
  const openDone = (a) => { setForm({ attendeeCount: '', notes: '', photoUrl: '' }); setMode({ kind: 'done', id: a.id }); };

  const submitPlan = (e) => {
    e.preventDefault();
    return run(() => apiClient.crmCreatePlan(unit.id, planPayload(year, targets)), 'वार्षिक आराखडा तयार झाला.');
  };
  const submitAdd = (e) => {
    e.preventDefault();
    const body = { type: form.type, scheduled_date: form.date };
    if (String(form.target).trim() !== '') body.target_count = Number(form.target);
    return run(() => apiClient.crmAddActivity(unit.id, body), 'उपक्रम जोडला.');
  };
  const submitEdit = (e) => {
    e.preventDefault();
    const body = { scheduled_date: form.date };
    if (form.status !== form.originalStatus) body.status = form.status;
    if (String(form.target).trim() !== '') body.target_count = Number(form.target);
    if (String(form.notes).trim() !== '') body.notes = form.notes;
    return run(() => apiClient.crmUpdateActivity(unit.id, mode.id, body), 'बदल जतन झाला.');
  };
  const submitDone = (e) => {
    e.preventDefault();
    return run(() => apiClient.crmCompleteActivity(unit.id, mode.id, completionPayload(form)), 'उपक्रम पूर्ण म्हणून नोंदवला.');
  };
  const remove = async (a) => {
    if (!window.confirm(`"${a.title}" हा उपक्रम काढायचा?`)) return;
    await run(() => apiClient.crmDeleteActivity(unit.id, a.id), 'उपक्रम काढला.');
  };

  const progress = data?.progress;
  const field = (key) => ({ value: form[key] ?? '', onChange: (e) => setForm({ ...form, [key]: e.target.value }), style: inputStyle });

  return (
    <div style={{ marginTop: '16px', borderTop: '1px solid #FED7AA', paddingTop: '14px' }} data-testid="activities-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h4 style={{ margin: 0, color: '#7C2D12', fontWeight: 900 }}>📋 उपक्रम (Activities)</h4>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
          वर्ष
          <select aria-label="वर्ष" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
            {[-2, -1, 0, 1, 2].map((d) => <option key={d} value={thisYear + d}>{thisYear + d}</option>)}
          </select>
        </label>
      </div>

      {loading && <p style={{ margin: '8px 0 0', fontWeight: 700 }}>लोड होत आहे…</p>}
      {error && <div role="alert" style={{ color: '#991B1B', fontWeight: 800, margin: '6px 0' }}>{error}</div>}
      {notice && <div role="status" style={{ color: '#166534', fontWeight: 800, margin: '6px 0' }}>{notice}</div>}

      {data && (
        <>
          <div style={{ margin: '10px 0' }}>
            <div style={{ fontWeight: 800, marginBottom: '4px' }}>{progressLabel(progress)}</div>
            <div role="progressbar" aria-valuenow={progress.completionPct} aria-valuemin={0} aria-valuemax={100}
              style={{ height: '10px', background: '#FFEDD5', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress.completionPct}%`, height: '100%', background: '#EA580C' }} />
            </div>
            {progress.total > 0 && (
              <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px' }}>
                उपस्थिती {progress.achievedTotal} / लक्ष्य {progress.targetTotal}{progress.overdue ? ` · मुदत संपलेले ${progress.overdue}` : ''}
              </div>
            )}
          </div>

          {writer && !mode && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button type="button" style={primaryBtn} onClick={openPlan} disabled={busy || types.length === 0}>🗓️ आराखडा तयार करा</button>
              <button type="button" style={ghostBtn} onClick={openAdd} disabled={busy || types.length === 0}>➕ उपक्रम जोडा</button>
            </div>
          )}

          {mode?.kind === 'plan' && (
            <form onSubmit={submitPlan} style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
              <p style={{ margin: 0, color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>
                {year} साठी १२ उपक्रम (दर महिन्याला एक) तयार होतील. लक्ष्य बदलू शकता. आधीपासून असलेले प्रकार वगळले जातात.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px' }}>
                {types.map((t) => (
                  <label key={t.key} style={labelStyle}>{t.icon} {t.mr}
                    <input aria-label={`${t.mr} लक्ष्य`} type="number" min="0" value={targets[t.key] ?? ''}
                      onChange={(e) => setTargets({ ...targets, [t.key]: e.target.value })} style={inputStyle} />
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={primaryBtn} disabled={busy}>आराखडा तयार करा</button>
                <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
              </div>
            </form>
          )}

          {mode?.kind === 'add' && (
            <form onSubmit={submitAdd} style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
              <label style={labelStyle}>प्रकार
                <select aria-label="उपक्रमाचा प्रकार" required {...field('type')}>
                  {types.map((t) => <option key={t.key} value={t.key}>{t.icon} {t.mr}</option>)}
                </select>
              </label>
              <label style={labelStyle}>तारीख<input aria-label="तारीख" type="date" required {...field('date')} /></label>
              <label style={labelStyle}>लक्ष्य संख्या<input aria-label="लक्ष्य संख्या" type="number" min="0" {...field('target')} /></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={primaryBtn} disabled={busy}>जोडा</button>
                <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
              </div>
            </form>
          )}

          {data.activities.length === 0 && <p style={{ margin: 0, color: '#64748B', fontWeight: 700 }}>{year} साठी अजून उपक्रम नाहीत.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '8px' }}>
            {data.activities.map((a) => {
              const st = activityStatus(a.status);
              const editing = (mode?.kind === 'edit' || mode?.kind === 'done') && mode.id === a.id;
              return (
                <li key={a.id} style={{ border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '10px 12px', background: '#FFFDF9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 800 }}>
                      {typeIcon(a.type)} {a.title || typeName(a.type)}
                      <span style={{ color: '#64748B', fontWeight: 700 }}> · {a.scheduledDate}</span>
                    </div>
                    <span data-status={a.status} style={{ background: st.bg, color: st.fg, border: `1px solid ${st.border}`, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900 }}>{st.label}</span>
                  </div>
                  <div style={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem' }}>
                    लक्ष्य {a.targetCount}{a.status === 'done' ? ` · उपस्थिती ${a.attendeeCount}` : ''}
                    {a.notes ? ` · ${a.notes}` : ''}
                    {a.photoUrl ? <> · <a href={a.photoUrl} target="_blank" rel="noopener noreferrer">फोटो</a></> : null}
                  </div>

                  {writer && a.status !== 'done' && !mode && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <button type="button" style={ghostBtn} onClick={() => openDone(a)}>✅ पूर्ण करा</button>
                      <button type="button" style={ghostBtn} onClick={() => openEdit(a)}>✏️ बदला</button>
                      {data.canDelete && <button type="button" style={ghostBtn} disabled={busy} onClick={() => remove(a)}>🗑️ काढा</button>}
                    </div>
                  )}
                  {writer && a.status === 'done' && isAdmin && !mode && data.canDelete && (
                    <div style={{ marginTop: '8px' }}><button type="button" style={ghostBtn} disabled={busy} onClick={() => remove(a)}>🗑️ काढा</button></div>
                  )}

                  {editing && mode.kind === 'edit' && (
                    <form onSubmit={submitEdit} style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                      <label style={labelStyle}>तारीख<input aria-label="तारीख" type="date" required {...field('date')} /></label>
                      <label style={labelStyle}>लक्ष्य संख्या<input aria-label="लक्ष्य संख्या" type="number" min="0" {...field('target')} /></label>
                      <label style={labelStyle}>स्थिती
                        <select aria-label="स्थिती" {...field('status')}>
                          <option value="planned">नियोजित</option>
                          <option value="in_progress">सुरू आहे</option>
                        </select>
                      </label>
                      <label style={labelStyle}>नोंद<input aria-label="नोंद" {...field('notes')} /></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" style={primaryBtn} disabled={busy}>जतन करा</button>
                        <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
                      </div>
                    </form>
                  )}

                  {editing && mode.kind === 'done' && (
                    <form onSubmit={submitDone} style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                      <p style={{ margin: 0, color: '#64748B', fontWeight: 700, fontSize: '0.8rem' }}>पूर्ण केल्यावर बदल करता येणार नाही. पुरावा द्या.</p>
                      <label style={labelStyle}>उपस्थिती संख्या *<input aria-label="उपस्थिती संख्या" type="number" min="0" required {...field('attendeeCount')} /></label>
                      <label style={labelStyle}>नोंद (किमान ३ अक्षरे) *<input aria-label="पुराव्याची नोंद" required minLength={3} {...field('notes')} /></label>
                      <label style={labelStyle}>फोटो लिंक (ऐच्छिक)<input aria-label="फोटो लिंक" type="url" placeholder="https://…" {...field('photoUrl')} /></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" style={primaryBtn} disabled={busy}>पूर्ण म्हणून नोंदवा</button>
                        <button type="button" style={ghostBtn} onClick={() => setMode(null)}>रद्द करा</button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
