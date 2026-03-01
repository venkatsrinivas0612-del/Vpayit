import { supabase } from './supabaseClient';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(method, path, body) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
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
    list:      ()    => api.get('/banks'),
    authUrl:   ()    => api.get('/banks/auth-url'),
    callback:  (code) => api.post('/banks/callback', { code }),
    sync:      (id)  => api.post(`/banks/${id}/sync`),
    remove:    (id)  => api.delete(`/banks/${id}`),
  },
  bills: {
    list:    (params = {}) => api.get(`/bills?${new URLSearchParams(params)}`),
    detect:  ()            => api.post('/bills/detect'),
    get:     (id)          => api.get(`/bills/${id}`),
    update:  (id, body)    => api.patch(`/bills/${id}`, body),
  },
  savings: {
    list:     ()     => api.get('/savings'),
    generate: ()     => api.post('/savings/generate'),
    update:   (id, status) => api.patch(`/savings/${id}`, { status }),
  },
  transactions: {
    list:    (params = {}) => api.get(`/transactions?${new URLSearchParams(params)}`),
    bills:   ()            => api.get('/transactions/bills'),
    summary: (month)       => api.get(`/transactions/summary${month ? `?month=${month}` : ''}`),
  },
};
