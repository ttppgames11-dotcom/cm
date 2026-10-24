import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../services/directApi';

// After an error reply (e.g. 502 while the server restarts) the browser stops retrying
// by itself, so the stream is reopened after this delay.
const RETRY_AFTER_ERROR_MS = 10000;

// Live updates for the /leads page (server-sent events from /api/enquiries/stream).
// onCreated(card) and onUpdated({ id, status, quotesCount }) receive the events;
// onReconnect() runs after every reconnect so the page can reload what it missed.
export function useEnquiryStream({ onCreated, onUpdated, onReconnect }) {
  const [connected, setConnected] = useState(false);
  const handlers = useRef({ onCreated, onUpdated, onReconnect });
  handlers.current = { onCreated, onUpdated, onReconnect };

  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;
    let source = null;
    let retryTimer = null;
    let stopped = false;
    let connectedBefore = false;

    const parsed = (handle) => (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return; // ignore a malformed event
      }
      handle(data);
    };

    const open = () => {
      source = new EventSource(apiUrl('/api/enquiries/stream'));
      source.addEventListener('connected', () => {
        setConnected(true);
        if (connectedBefore) handlers.current.onReconnect?.();
        connectedBefore = true;
      });
      source.addEventListener('enquiry.created', parsed((card) => handlers.current.onCreated?.(card)));
      source.addEventListener('enquiry.updated', parsed((update) => handlers.current.onUpdated?.(update)));
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
