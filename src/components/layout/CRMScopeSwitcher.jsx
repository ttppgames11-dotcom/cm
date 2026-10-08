import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ============================================================
   🚩 CONNECT MARATHA — CRM SEPARATE DASHBOARDS SWITCHER
   Quick Navigation between Dedicated Organizational & Center CRMs
   ============================================================ */

export default function CRMScopeSwitcher({ currentScope = '' }) {
  const location = useLocation();

  const dashboards = [
    { id: 'pradesh', label: 'प्रदेशाध्यक्ष', icon: '🚩', path: '/crm/pradesh', badge: 'STATE' },
    { id: 'division', label: 'विभागीय अध्यक्ष', icon: '🟣', path: '/crm/division', badge: 'DIVISION' },
    { id: 'district', label: 'जिल्हाध्यक्ष', icon: '🔵', path: '/crm/district', badge: 'DISTRICT' },
    { id: 'taluka', label: 'तालुकाध्यक्ष', icon: '🟢', path: '/crm/taluka', badge: 'TALUKA' },
    { id: 'branch', label: 'शाखाध्यक्ष', icon: '🔴', path: '/crm/branch', badge: 'SHAKHA' },
    { id: 'center', label: 'कम्युनिटी सेंटर', icon: '🏢', path: '/crm/center', badge: 'CENTER' },
    { id: 'operations', label: 'युनिफाइड ऑपरेशन्स', icon: '⚡', path: '/crm/operations', badge: 'OPERATIONS' },
    { id: 'ceo', label: 'CEO मॅक्रो', icon: '🦅', path: '/ceo', badge: 'APEX' }
  ];

  return (
    <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', overflowX: 'auto' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '950px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🏛️</span> स्वतंत्र डॅशबोर्ड्स:
        </span>
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          {dashboards.map(d => {
            const isActive = location.pathname === d.path || currentScope === d.id;
            return (
              <Link
                key={d.id}
                to={d.path}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : '#cbd5e1',
                  border: isActive ? '1px solid #ea580c' : '1px solid rgba(255,255,255,0.08)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
                <span style={{ fontSize: '9px', background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                  {d.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
