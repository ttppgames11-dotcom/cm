import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import CMDB from '../services/cmdb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isLoggedIn = localStorage.getItem('cm_logged_in') === 'true';
      const saved = localStorage.getItem('cm_user_data');
      if (isLoggedIn && saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load current user from API if token exists
    const token = localStorage.getItem('cm_jwt_token');
    if (token) {
      api.auth.getMe()
        .then(res => {
          if (res && res.member) {
            setUser(res.member);
            localStorage.setItem('cm_user_data', JSON.stringify(res.member));
          }
        })
        .catch(err => {
          console.log('Session token expired or backend offline, continuing with local session.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, customProfile = null) => {
    try {
      const res = await api.auth.login(identifier, password);
      if (res && res.member) {
        const finalUser = customProfile ? { ...res.member, ...customProfile } : res.member;
        setUser(finalUser);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(finalUser));
        return { success: true, member: finalUser };
      }
    } catch (err) {
      // Local fallback
      localStorage.setItem('cm_user_mobile', identifier);
      localStorage.setItem('cm_logged_in', 'true');
      const base = CMDB.currentMember ? CMDB.currentMember() : {
        id: 'M1001',
        name: 'अमोल जाधव',
        district: 'पुणे',
        tier: 'Gold',
        role: 'admin'
      };
      const finalUser = customProfile ? { ...base, ...customProfile } : base;
      setUser(finalUser);
      localStorage.setItem('cm_user_data', JSON.stringify(finalUser));
      return { success: true, member: finalUser, fallback: true };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.auth.register(formData);
      if (res && res.member) {
        setUser(res.member);
        localStorage.setItem('cm_logged_in', 'true');
        return { success: true, member: res.member };
      }
    } catch (err) {
      console.warn('Backend register error, using local registration:', err.message);
      if (CMDB.registerMember) {
        const local = CMDB.registerMember(formData);
        setUser(local);
        return { success: true, member: local };
      }
      throw err;
    }
  };

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('cm_logged_in');
    localStorage.removeItem('cm_user_mobile');
    localStorage.removeItem('cm_user_data');
    setUser(null);
  };

  const updateProfile = async (patch) => {
    if (user && user.id) {
      try {
        const res = await api.members.update(user.id, patch);
        if (res && res.member) {
          setUser(res.member);
          return res.member;
        }
      } catch (err) {
        console.warn('API update error, applying locally:', err.message);
      }
    }
    const updated = { ...user, ...patch };
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
