import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { timeAgo } from '../community/bloodHelp';
import { notificationLink, notificationIcon, markedRead, announceNotificationsChanged } from './notificationList';

// The member's real notifications (meetings, chapters, blood help, enquiries) from the server.
export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.getMyNotifications();
      setNotifications(res.notifications);
      setUnread(res.unread);
      setError('');
    } catch (err) {
      setError(err.message || 'सूचना लोड करता आल्या नाहीत');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = async (n) => {
    if (!n.read) {
      try {
        const res = await apiClient.markNotificationRead(n.id);
        setNotifications((list) => markedRead(list, n.id));
        setUnread(res.unread ?? Math.max(0, unread - 1));
        announceNotificationsChanged();
      } catch (err) {
        setError(err.message);
      }
    }
    const link = notificationLink(n.type);
    if (link) navigate(link);
  };

  const markAll = async () => {
    setBusy(true);
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((list) => markedRead(list));
      setUnread(0);
      announceNotificationsChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const shown = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.6rem' }}>🔔</span>
              <h1 style={{ fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#3D0D0D', margin: 0 }}>
                सूचना केंद्र (Notifications)
              </h1>
              {unread > 0 && (
                <span style={{ background: '#EA580C', color: '#FFF', fontSize: '0.78rem', fontWeight: 800, padding: '2px 10px', borderRadius: '12px' }}>
                  {unread} नवीन
                </span>
              )}
            </div>
            <p style={{ color: '#666', fontSize: '0.88rem', margin: 0 }}>
              बैठका, चॅप्टर्स, रक्तदान मदत व चौकशी यांबद्दलच्या आपल्या सूचना.
            </p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} disabled={busy} style={{
              padding: '9px 14px', background: '#FFF', border: '1.5px solid #DD8A2E', color: '#C9701C',
              borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: busy ? 'wait' : 'pointer'
            }}>
              सर्व वाचले ✓
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[{ id: 'all', label: `सर्व (${notifications.length})` }, { id: 'unread', label: `न वाचलेल्या (${notifications.filter((n) => !n.read).length})` }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              background: filter === f.id ? '#EA580C' : '#FFF', color: filter === f.id ? '#FFF' : '#555',
              border: filter === f.id ? 'none' : '1px solid #E6DDCE'
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}
        {loading && <p style={{ color: '#666' }}>लोड होत आहे...</p>}
        {!loading && shown.length === 0 && !error && (
          <div style={{ background: '#FFF', border: '1px solid #E6DDCE', borderRadius: '14px', padding: '48px 16px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🔕</div>
            {filter === 'unread' ? 'सर्व सूचना वाचल्या आहेत' : 'अद्याप कोणतीही सूचना नाही'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shown.map((n) => {
            const link = notificationLink(n.type);
            return (
              <div
                key={n.id}
                role={link || !n.read ? 'button' : undefined}
                tabIndex={link || !n.read ? 0 : undefined}
                onClick={() => open(n)}
                onKeyDown={(e) => { if (e.key === 'Enter') open(n); }}
                style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', borderRadius: '14px',
                  background: n.read ? '#FFF' : '#FFF7ED', border: n.read ? '1px solid #E6DDCE' : '1.5px solid #FDBA74',
                  cursor: link || !n.read ? 'pointer' : 'default'
                }}
              >
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{notificationIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#3D0D0D', fontSize: '0.95rem' }}>{n.title}</strong>
                    <span style={{ color: '#888', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</span>
                  </div>
                  <div style={{ color: '#555', fontSize: '0.88rem', marginTop: '4px', wordBreak: 'break-word' }}>{n.message}</div>
                  {link && <div style={{ color: '#C2410C', fontSize: '0.8rem', fontWeight: 700, marginTop: '6px' }}>उघडा →</div>}
                </div>
                {!n.read && <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EA580C', marginTop: '6px', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
