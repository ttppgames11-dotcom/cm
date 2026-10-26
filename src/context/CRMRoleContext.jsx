import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../services/apiClient';

const CRMRoleContext = createContext(null);

export const CRM_TIER_ROLES = [
  { key: 'superadmin', label: 'सर्वोच्च प्रशासक (SuperAdmin)', level: 'apex', color: '#ea580c', path: '/admin' },
  { key: 'ceo', label: 'कार्याध्यक्ष (CEO)', level: 'state', color: '#2563eb', path: '/crm/ceo' },
  { key: 'state_admin', label: 'राज्य अध्यक्ष (State Owner)', level: 'state', color: '#4f46e5', path: '/crm/state' },
  { key: 'division_admin', label: 'विभागीय अध्यक्ष (Division Owner)', level: 'division', color: '#7c3aed', path: '/crm/division' },
  { key: 'district_admin', label: 'जिल्हा अध्यक्ष (District Owner)', level: 'district', color: '#0284c7', path: '/crm/district' },
  { key: 'taluka_admin', label: 'तालुका अध्यक्ष (Taluka Owner)', level: 'taluka', color: '#16a34a', path: '/crm/taluka' },
  { key: 'branch_admin', label: 'शाखाध्यक्ष (Branch Owner)', level: 'branch', color: '#c026d3', path: '/crm/branch' },
  { key: 'center_admin', label: 'केंद्र संचालक (Center Owner)', level: 'center', color: '#f97316', path: '/crm/center' },
  { key: 'center_manager', label: 'केंद्र व्यवस्थापक (Operations Manager)', level: 'staff', color: '#059669', path: '/crm/operations-desk' },
  { key: 'finance_officer', label: 'वित्त अधिकारी (Finance Officer)', level: 'finance', color: '#eab308', path: '/crm/finance' },
  { key: 'seva_helpdesk', label: 'सेवा व मदत कक्ष (Seva Helpdesk)', level: 'seva', color: '#dc2626', path: '/crm/helpdesk' },
  { key: 'chapter_president', label: 'चॅप्टर अध्यक्ष (Chapter B2B)', level: 'chapter', color: '#0d9488', path: '/crm/chapter' }
];

export function CRMRoleProvider({ children }) {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState(user?.role || 'district_admin');
  const [activeUnit, setActiveUnit] = useState(null);
  const [unitsList, setUnitsList] = useState([]);
  const [selectedState, setSelectedState] = useState('महाराष्ट्र');
  const [selectedDivision, setSelectedDivision] = useState('पुणे विभाग');
  const [selectedDistrict, setSelectedDistrict] = useState('पुणे');
  const [selectedTaluka, setSelectedTaluka] = useState('हवेली');
  const [viewPerspective, setViewPerspective] = useState('owner'); // 'owner' | 'manager'

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  // Load units
  useEffect(() => {
    apiClient.getCrmUnits().then(res => {
      const u = res?.data?.units || res?.units || [];
      setUnitsList(u);
      if (u.length > 0 && !activeUnit) {
        setActiveUnit(u[0]);
      }
    }).catch(() => {});
  }, []);

  const switchRoleContext = (roleKey) => {
    setActiveRole(roleKey);
  };

  const value = {
    activeRole,
    setActiveRole: switchRoleContext,
    activeUnit,
    setActiveUnit,
    unitsList,
    selectedState,
    setSelectedState,
    selectedDivision,
    setSelectedDivision,
    selectedDistrict,
    setSelectedDistrict,
    selectedTaluka,
    setSelectedTaluka,
    viewPerspective,
    setViewPerspective,
    allRoles: CRM_TIER_ROLES
  };

  return (
    <CRMRoleContext.Provider value={value}>
      {children}
    </CRMRoleContext.Provider>
  );
}

export function useCRMRole() {
  const context = useContext(CRMRoleContext);
  if (!context) {
    // Return graceful fallback so components don't crash if used outside provider
    return {
      activeRole: 'district_admin',
      setActiveRole: () => {},
      selectedState: 'महाराष्ट्र',
      setSelectedState: () => {},
      selectedDistrict: 'पुणे',
      setSelectedDistrict: () => {},
      viewPerspective: 'owner',
      setViewPerspective: () => {},
      allRoles: CRM_TIER_ROLES
    };
  }
  return context;
}
