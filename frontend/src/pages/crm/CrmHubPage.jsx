import React from 'react';
import { Navigate } from 'react-router-dom';
import CrmGate from './CrmGate';

// /crm: the entry to the CRM. A visitor logs in first (the normal member login), a member with no place in the unit
// ladder sees the "no access" message, everyone else goes straight to their dashboard.
export default function CrmHubPage() {
  return (
    <CrmGate redirectTo="/crm">
      {() => <Navigate to="/crm/dashboard" replace />}
    </CrmGate>
  );
}
