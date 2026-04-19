import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('afc_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('afc_token');
      localStorage.removeItem('afc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signup = async (name, email, password, rfidUID) => {
  const { data } = await api.post('/auth/signup', { name, email, password, rfidUID });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const getWallet = async () => {
  const { data } = await api.get('/wallet');
  return data;
};

export const recharge = async (amount) => {
  const { data } = await api.post('/wallet/recharge', { amount });
  return data;
};

// ─── Trips ────────────────────────────────────────────────────────────────────
export const tapIn = async (rfidUID, lat, lng) => {
  const { data } = await api.post('/trip/tap-in', { rfidUID, lat, lng });
  return data;
};

export const tapOut = async (rfidUID, lat, lng) => {
  const { data } = await api.post('/trip/tap-out', { rfidUID, lat, lng });
  return data;
};

export const getTrips = async (page = 1, limit = 10, status = '') => {
  const params = { page, limit };
  if (status) params.status = status;
  const { data } = await api.get('/trip/history', { params });
  return data;
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAdminUsers = async (page = 1, search = '') => {
  const { data } = await api.get('/admin/users', { params: { page, search } });
  return data;
};

export const getAdminTransactions = async (page = 1) => {
  const { data } = await api.get('/admin/transactions', { params: { page } });
  return data;
};

export const getAdminTrips = async (page = 1) => {
  const { data } = await api.get('/admin/trips', { params: { page } });
  return data;
};

export default api;
