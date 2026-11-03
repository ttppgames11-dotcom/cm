import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { dashboardFor } from './crmUnitsHelp';

const box = { background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '24px', fontWeight: 800, color: '#7C2D12' };

// Everything a CRM page needs before it shows content: the login prompt for a visitor, loading and error states, the
// "no access" message for someone without a place in the unit ladder, and the page background. `children` is called with
// the /me answer and the dashboard chosen for it only when the person may be here.
export default function CrmGate({ redirectTo, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return undefined; }
    let alive = true;
    setLoading(true);
    apiClient.crmMe()
      .then((res) => { if (alive) { setMe(res); setError(''); } })
      .catch((e) => { if (alive) setError(e.message || 'माहिती लोड करता आली नाही.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);

  const dash = dashboardFor(me);
  let body;
  if (!user) {
    body = (
      <div style={box}>
        <p style={{ margin: '0 0 12px' }}>कृपया प्रथम लॉगिन करा.</p>
        <button type="button" onClick={() => navigate('/login?redirect=' + encodeURIComponent(redirectTo))}
          style={{ padding: '10px 18px', background: '#EA580C', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, cursor: 'pointer' }}>
          लॉगिन करा
        </button>
      </div>
    );
  } else if (loading) {
    body = <div style={box}>लोड होत आहे…</div>;
  } else if (error) {
    body = <div role="alert" style={{ ...box, color: '#991B1B', borderColor: '#FCA5A5' }}>{error}</div>;
  } else if (!dash) {
    body = <div style={box}>या विभागासाठी आपल्याकडे प्रवेश नाही</div>;
  } else {
    body = children(me, dash);
  }

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
        {body}
      </div>
    </div>
  );
}
