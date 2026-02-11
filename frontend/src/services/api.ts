import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request (TypeScript safe)
    const url = `${config.baseURL || ''}${config.url || ''}`;
    console.log('🌐 API Request:', config.method?.toUpperCase(), url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error: AxiosError) => {
    // Safe error logging
    const url = error.config?.url || 'unknown';
    const status = error.response?.status || 'no status';
    
    console.error('❌ API Error:', url, status);
    console.error('❌ Full error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;