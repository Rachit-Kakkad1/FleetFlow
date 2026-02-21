import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('ff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Interceptor to catch 401 globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token is invalid, expired, or user deleted 
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
