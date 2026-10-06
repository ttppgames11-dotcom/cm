import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const CRM_AUTHORIZED_ROLES = [
  'superadmin',
  'admin',
  'ceo',
  'district_admin',
  'district',
  'chapter_president',
  'chapter',
  'seva_helpdesk',
  'helpdesk_admin',
  'finance_officer',
  'finance'
];

/**
 * CRMProtectedRoute: Protects CRM and Admin routes.
 * Ensures the user is logged in AND possesses an authorized CRM/administrative role.
 * Regular users (or unauthenticated visitors) are redirected to /crm/login.
 */
export default function CRMProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Rehydrate from localStorage immediately so deployed routes don't kick out active sessions
  let activeUser = user;
  if (!activeUser) {
    try {
      const saved = localStorage.getItem('cm_user_data');
      if (saved && localStorage.getItem('cm_logged_in') === 'true') {
        activeUser = JSON.parse(saved);
      }
    } catch {}
  }

  if (loading && !activeUser) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        color: '#EA580C'
      }}>
        <div style={{ fontSize: '2.5rem' }}>🔒</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#EA580C' }}>प्रशासकीय सुरक्षा पडताळणी सुरू आहे...</div>
        <div style={{ color: '#7C2D12', fontSize: '0.9rem' }}>Verifying CRM credentials & security tokens</div>
      </div>
    );
  }

  // If user is not logged in at all, redirect to the dedicated CRM Login
  if (!activeUser || !activeUser.id) {
    return <Navigate to="/admin/crm-login" state={{ from: location, reason: 'login_required' }} replace />;
  }

  // Check if current user has an authorized staff/CRM role
  const isCrmStaff = CRM_AUTHORIZED_ROLES.includes(activeUser.role);

  if (!isCrmStaff) {
    // User is logged in, but only as a standard member or general public account
    return <Navigate to="/admin/crm-login" state={{ from: location, reason: 'unauthorized_member' }} replace />;
  }

  // If this specific CRM page requires specific roles (e.g. only SuperAdmin or only CEO)
  if (allowedRoles && allowedRoles.length > 0) {
    // SuperAdmin and general admin have universal access across all CRM modules
    const isSuperOrAdmin = activeUser.role === 'superadmin' || activeUser.role === 'admin';
    const hasSpecificRole = allowedRoles.includes(activeUser.role);

    if (!isSuperOrAdmin && !hasSpecificRole) {
      // Officer is logged into CRM, but does not have permission for this specific sub-module
      return <Navigate to="/crm" state={{ reason: 'role_mismatch', currentRole: activeUser.role }} replace />;
    }
  }

  return children;
}
