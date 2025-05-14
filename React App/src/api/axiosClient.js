// src/api/axiosClient.js

import axios from 'axios';
import { getUserId, getUsername } from '../utils/storage';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ✅ Make sure this is defined in your .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor: Attach user metadata and auth token
axiosClient.interceptors.request.use(
  config => {
    const userId = getUserId();
    const username = getUsername();
    const token = localStorage.getItem('token');

    if (userId) config.headers['X-User-ID'] = userId;
    if (username) config.headers['X-Username'] = username;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;

    return config;
  },
  error => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// 🛡️ Response Interceptor: Global error handling
axiosClient.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;

    console.error('[Axios Response Error]', error?.response || error);

    // Handle auth errors globally
    if (status === 401) {
      console.warn('⚠️ Unauthorized - Consider redirecting to login.');
      // Optional: logout logic or redirect
    }

    // Handle precondition failure (e.g., username taken)
    if (status === 412) {
      console.warn('🚫 Precondition Failed - Possibly invalid username.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
