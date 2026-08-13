import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
});

// Injeta token em toda requisição
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('padaria_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('padaria_token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
