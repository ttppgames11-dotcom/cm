import React, { createContext, useContext, useState } from 'react';
import CMDB from '../services/cmdb';

const ScopeContext = createContext(null);

export function ScopeProvider({ children }) {
  const [currentScope, setCurrentScope] = useState('state');

  const scopes = CMDB.getOrganizationalScopes ? CMDB.getOrganizationalScopes() : [];
  const metrics = CMDB.getScopedDashboardMetrics ? CMDB.getScopedDashboardMetrics(currentScope) : null;

  return (
    <ScopeContext.Provider value={{ currentScope, setCurrentScope, scopes, metrics }}>
      {children}
    </ScopeContext.Provider>
  );
}

export function useScope() {
  return useContext(ScopeContext);
}
