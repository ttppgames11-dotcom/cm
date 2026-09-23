import React, { createContext, useContext, useState, useEffect } from 'react';
import CMDB from '../services/cmdb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return CMDB.currentMember ? CMDB.currentMember() : null;
    } catch (e) {
      return null;
    }
  });

  const refreshUser = () => {
    if (CMDB.currentMember) {
      setUser({ ...CMDB.currentMember() });
    }
  };

  const login = (mobile, password) => {
    localStorage.setItem('cm_user_mobile', mobile);
    localStorage.setItem('cm_logged_in', 'true');
    refreshUser();
    return true;
  };

  const logout = () => {
    localStorage.removeItem('cm_logged_in');
    localStorage.removeItem('cm_user_mobile');
    refreshUser();
  };

  const updateProfile = (patch) => {
    if (CMDB.upsertCurrentMember) {
      const updated = CMDB.upsertCurrentMember(patch);
      setUser({ ...updated });
      return updated;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
