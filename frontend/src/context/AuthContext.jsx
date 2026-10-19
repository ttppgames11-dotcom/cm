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
    // If user is already loaded as an official from localStorage, keep session active immediately
    const saved = localStorage.getItem('cm_user_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.isCrmOfficial || ['superadmin', 'admin', 'ceo', 'district_admin', 'chapter_president', 'seva_helpdesk', 'finance_officer'].includes(parsed.role))) {
          setUser(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // Attempt to load current user from API if token exists
    const token = localStorage.getItem('cm_jwt_token');
    if (token) {
      api.auth.getMe()
        .then(res => {
          if (res && res.member) {
            setUser(res.member);
            localStorage.setItem('cm_user_data', JSON.stringify(res.member));
          } else {
            // User was not found or deleted from database
            setUser(null);
            localStorage.removeItem('cm_logged_in');
            localStorage.removeItem('cm_user_data');
            localStorage.removeItem('cm_jwt_token');
          }
        })
        .catch(err => {
          // If user deleted from DB (404) or token invalid (401/403), immediately log them out
          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('404') || msg.includes('401') || msg.includes('403') || msg.includes('not found') || msg.includes('invalid') || msg.includes('expired')) {
            setUser(null);
            localStorage.removeItem('cm_logged_in');
            localStorage.removeItem('cm_user_data');
            localStorage.removeItem('cm_jwt_token');
            localStorage.removeItem('cm_user_mobile');
          } else {
            console.log('Session token check error:', err.message);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, customProfile = null) => {
    // Only the server decides who is logged in (and with which role).
    try {
      const res = await api.auth.login(identifier, password);
      const member = res?.member || res?.data?.member || res?.data?.profile;
      if (member) {
        setUser(member);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(member));
        return { success: true, member };
      }
      return { success: false, error: res?.error || 'लॉगिन अयशस्वी' };
    } catch (err) {
      return { success: false, error: err.message || 'लॉगिन अयशस्वी' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.auth.register(formData);
      const member = res?.member || res?.data?.member || res?.data?.profile;
      if (member) {
        setUser(member);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(member));
        return { success: true, member };
      }
      return { success: false, error: res?.error || 'नोंदणी अयशस्वी झाली.' };
    } catch (err) {
      return { success: false, error: err.message || 'नोंदणी अयशस्वी झाली.' };
    }
  };

  const logout = () => {
    try {
      api.auth.logout();
    } catch {}
    localStorage.removeItem('cm_logged_in');
    localStorage.removeItem('cm_user_mobile');
    localStorage.removeItem('cm_user_data');
    localStorage.removeItem('cm_jwt_token');
    localStorage.removeItem('token');
    try {
      sessionStorage.clear();
    } catch {}
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
