import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CrmGate from './CrmGate';
import SummarySection from './SummarySection';
import StaffSection from './StaffSection';
import ActivitiesSection from './ActivitiesSection';
import RollupPanel from './RollupPanel';
import { levelLabel } from './crmUnitsHelp';

const card = { background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' };
const ghostBtn = { padding: '6px 12px', background: '#FFF7ED', color: '#9A3412', border: '1.5px solid #FED7AA', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' };

// The three sections of one unit: summary, team, activities. A version counter makes the summary load again after a change.
function UnitSections({ unit, me, version, onChanged }) {
  return (
    <div style={card}>
      <SummarySection key={`sum-${unit.id}`} unit={unit} version={version} />
      <StaffSection key={`staff-${unit.id}`} unit={unit} me={me} />
      <ActivitiesSection key={`act-${unit.id}`} unit={unit} me={me} onChanged={onChanged} />
    </div>
  );
}

function Dashboard({ me, dash }) {
  const [version, setVersion] = useState(0);
  const [pickedId, setPickedId] = useState('');
  const [picked, setPicked] = useState(null);
  const [pickError, setPickError] = useState('');
  const request = useRef(0);
  const bump = () => setVersion((v) => v + 1);

  // admin and CEO: the unit clicked in the roll-up; an answer for a unit that is no longer picked is ignored
  useEffect(() => {
    const mine = ++request.current;
    setPicked(null);
    setPickError('');
    if (!pickedId) return;
    apiClient.crmGetUnit(pickedId)
      .then((res) => { if (mine === request.current) setPicked(res.unit); })
      .catch((e) => { if (mine === request.current) setPickError(e.message || 'हे युनिट सापडले नाही'); });
  }, [pickedId]);

  const unit = dash.showRollup ? picked : me.unit;
  const role = me.unitRole === 'owner' ? 'मालक' : me.unitRole === 'staff' ? 'कर्मचारी' : '';

  return (
    <div style={{ display: 'grid', gap: '16px' }} data-testid="crm-dashboard">
      <div style={{ ...card, borderColor: dash.color, borderWidth: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, color: dash.color, fontWeight: 900 }}>{dash.icon} {dash.title}</h2>
            {me.unit && !dash.showRollup && (
              <p style={{ margin: '4px 0 0', fontWeight: 800, color: '#7C2D12' }}>
                {me.unit.name} <span style={{ color: '#64748B' }}>({levelLabel(me.unit.level)}{role ? ` · ${role}` : ''})</span>
              </p>
            )}
            {dash.childLabel && <p style={{ margin: '4px 0 0', color: '#64748B', fontWeight: 700, fontSize: '0.82rem' }}>खालील {dash.childLabel} खाली दिसतील.</p>}
          </div>
          {dash.canManageUnits && <Link to="/crm/units" style={{ ...ghostBtn, textDecoration: 'none' }}>युनिट्स व्यवस्थापन →</Link>}
        </div>
        {dash.readOnly && dash.showRollup && <p style={{ margin: '8px 0 0', color: '#64748B', fontWeight: 800 }}>आपल्याकडे केवळ वाचनाचा अधिकार आहे.</p>}
      </div>

      {dash.showRollup && <RollupPanel onSelect={setPickedId} version={version} alwaysShow />}
      {dash.showRollup && !pickedId && <div style={{ ...card, color: '#64748B', fontWeight: 800 }}>तपशील पाहण्यासाठी वरील तक्त्यातील युनिटच्या नावावर क्लिक करा.</div>}
      {pickError && <div role="alert" style={{ ...card, color: '#991B1B', fontWeight: 800 }}>{pickError}</div>}

      {dash.showRollup && picked && (
        <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 900, color: '#7C2D12' }}>{picked.name} <span style={{ color: '#64748B' }}>({levelLabel(picked.level)})</span></div>
          <button type="button" style={ghostBtn} onClick={() => setPickedId('')}>बंद करा</button>
        </div>
      )}

      {unit && <UnitSections unit={unit} me={me} version={version} onChanged={bump} />}
    </div>
  );
}

// /crm/dashboard: the dashboard for the signed-in person, chosen from /me (see dashboardFor).
export default function CrmDashboardPage() {
  return (
    <CrmGate redirectTo="/crm/dashboard">
      {(me, dash) => <Dashboard me={me} dash={dash} />}
    </CrmGate>
  );
}
