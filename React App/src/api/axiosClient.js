// src/api/axiosClient.js

import axios from 'axios';
import { getUserId, getUsername } from '../utils/storage';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request Interceptor: Attach user info or token
axiosClient.interceptors.request.use(
  config => {
    const userId = getUserId();
    const username = getUsername();

    if (userId) {
      config.headers['X-User-ID'] = userId;
    }
    if (username) {
      config.headers['X-Username'] = username;
    }

    // Example: Add token if stored
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// 🛡️ Response Interceptor: Global error logging
axiosClient.interceptors.response.use(
  response => response,
  error => {
    console.error('[Axios Response Error]', error?.response || error);

    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Unauthorized: Redirect or clear auth');
      // Optionally: redirect to login or clear session
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
