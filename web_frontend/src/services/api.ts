import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '');

export const api = axios.create({
  baseURL: rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EconoWay:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});