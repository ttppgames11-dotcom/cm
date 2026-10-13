import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CRMRoleHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/crm/login', { replace: true });
      return;
    }

    const role = user.role;
    if (role === 'superadmin') {
      navigate('/superadmin', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'ceo' || role === 'pradesh_head') {
      navigate('/ceo', { replace: true });
    } else if (role === 'division_admin' || role === 'division_head' || role === 'division') {
      navigate('/crm/division', { replace: true });
    } else if (role === 'district_admin' || role === 'district_head' || role === 'district') {
      navigate('/crm/district', { replace: true });
    } else if (role === 'taluka_admin' || role === 'taluka_head' || role === 'taluka') {
      navigate('/crm/taluka', { replace: true });
    } else if (role === 'branch_head' || role === 'branch_admin' || role === 'branch') {
      navigate('/crm/branch', { replace: true });
    } else if (role === 'center_manager' || role === 'center_admin' || role === 'center' || role === 'center_partner') {
      navigate('/crm/center', { replace: true });
    } else if (role === 'chapter_president' || role === 'chapter_head' || role === 'chapter') {
      navigate('/crm/chapter', { replace: true });
    } else if (role === 'seva_helpdesk' || role === 'helpdesk_admin') {
      navigate('/crm/helpdesk', { replace: true });
    } else if (role === 'finance_officer' || role === 'finance') {
      navigate('/crm/finance', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F5F0' }}>
      <div style={{ textAlign: 'center', color: '#7c2d12', padding: '30px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚙️ 🚩</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>आपल्या अधिकृत CRM डॅशबोर्डवर नेले जात आहे...</div>
        <div style={{ fontSize: '0.85rem', color: '#ea580c', marginTop: '6px' }}>Redirecting to your official dashboard...</div>
      </div>
    </div>
  );
}
