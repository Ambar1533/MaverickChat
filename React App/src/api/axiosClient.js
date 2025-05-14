// src/api/axiosClient.js

import axios from 'axios';
import { getUserId, getUsername, getStorage } from '../utils/storage';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ✅ Set in .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor: Attach user metadata and auth token
axiosClient.interceptors.request.use(
  config => {
    const userId = getUserId();
    const username = getUsername();
    const token = getStorage('token');

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

    // 🔒 Handle auth failure
    if (status === 401) {
      console.warn('⚠️ Unauthorized - Possibly expired or missing token.');
      // Optional: Redirect to login or clear session
    }

    // 🚫 Handle precondition failure
    if (status === 412) {
      console.warn('🚫 Precondition Failed - Likely a validation error (e.g., username taken).');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
