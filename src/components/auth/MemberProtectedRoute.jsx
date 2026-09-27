import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * MemberProtectedRoute: Guards private member accounts, personal dashboard,
 * private messages, notifications, business referrals, and personal settings.
 * Unauthenticated visitors are redirected to /login with return intent.
 */
export default function MemberProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
        color: '#7C1D05'
      }}>
        <div style={{ fontSize: '2rem' }}>👤</div>
        <div style={{ fontWeight: 700 }}>खाते सुरक्षा पडताळणी सुरू आहे...</div>
      </div>
    );
  }

  if (!user || !user.id) {
    return <Navigate to="/login" state={{ from: location, reason: 'login_required' }} replace />;
  }

  return children;
}
