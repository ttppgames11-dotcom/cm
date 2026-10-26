import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../services/directApi';

// After an error reply (e.g. 502 while the server restarts) the browser stops retrying
// by itself, so the stream is reopened after this delay.
const RETRY_AFTER_ERROR_MS = 10000;

// Live meeting updates (server-sent events from /api/sangam/meetings/stream).
// onChanged({ id, requesterId, recipientId, status }) receives each event (it carries no meeting content);
// onReconnect() runs after every reconnect so the page can reload what it missed.
export function useMeetingStream({ onChanged, onReconnect }) {
  const [connected, setConnected] = useState(false);
  const handlers = useRef({ onChanged, onReconnect });
  handlers.current = { onChanged, onReconnect };

  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;
    let source = null;
    let retryTimer = null;
    let stopped = false;
    let connectedBefore = false;

    const open = () => {
      source = new EventSource(apiUrl('/api/sangam/meetings/stream'));
      source.addEventListener('connected', () => {
        setConnected(true);
        if (connectedBefore) handlers.current.onReconnect?.();
        connectedBefore = true;
      });
      source.addEventListener('meeting.changed', (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return; // ignore a malformed event
        }
        handlers.current.onChanged?.(data);
      });
      source.onerror = () => {
        setConnected(false);
        if (source.readyState === EventSource.CLOSED && !stopped) {
          source.close();
          retryTimer = setTimeout(open, RETRY_AFTER_ERROR_MS);
        }
      };
    };

    open();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      if (source) source.close();
    };
  }, []);

  return { connected };
}
