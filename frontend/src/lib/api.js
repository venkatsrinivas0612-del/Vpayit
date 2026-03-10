import { supabase } from './supabaseClient';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function getToken() {
  // Primary: read the cached session (no network round-trip)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  // Fallback: session missing from storage (e.g. after OAuth redirect or
  // hard reload before Supabase has written to localStorage) — force a
  // server-side refresh to recover it.
  const { data: { session: refreshed } } = await supabase.auth.refreshSession();
  return refreshed?.access_token ?? null;
}

async function request(method, path, body) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const json = await res.json().catch(() => ({ error: res.statusText }));

  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

export const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),

  // Convenience wrappers
  auth: {
    me:            ()       => api.get('/auth/me'),
    upsertProfile: (body)   => api.post('/auth/profile', body),
    updateProfile: (body)   => api.patch('/auth/me', body),
  },
  banks: {
    list:      ()     => api.get('/banks'),
    authUrl:   ()     => api.get('/banks/auth-url'),
    callback:  (code) => api.post('/banks/callback', { code }),
    sync:      (id)   => api.post(`/banks/${id}/sync`),
    remove:    (id)   => api.delete(`/banks/${id}`),
  },
  bills: {
    list:    (params = {}) => api.get(`/bills?${new URLSearchParams(params)}`),
    detect:  ()            => api.post('/bills/detect'),
    get:     (id)          => api.get(`/bills/${id}`),
    update:  (id, body)    => api.patch(`/bills/${id}`, body),
    history: (id)          => api.get(`/bills/${id}/history`),
  },
  savings: {
    list:     ()            => api.get('/savings'),
    generate: ()            => api.post('/savings/generate'),
    update:   (id, status)  => api.patch(`/savings/${id}`, { status }),
  },
  transactions: {
    list:    (params = {}) => api.get(`/transactions?${new URLSearchParams(params)}`),
    bills:   ()            => api.get('/transactions/bills'),
    summary: (month)       => api.get(`/transactions/summary${month ? `?month=${month}` : ''}`),
  },
  notifications: {
    billReminders: () => api.post('/notifications/bill-reminders'),
  },
  reports: {
    // Returns a signed URL string for PDF download (token appended by caller)
    pdfUrl: (months = 6) => `${BASE}/reports/export?months=${months}`,
  },
};
