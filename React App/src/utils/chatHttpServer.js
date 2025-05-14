// React App/src/utils/chatHttpServer.js

import axiosClient from '../api/axiosClient';
import {
  getUserId,
  getUsername,
  setStorage,
  getStorage,
  removeStorage,
} from './storage';

class ChatHttpServer {
  // 🔐 Local Storage Helpers
  getUserId() {
    return getUserId();
  }

  getUsername() {
    return getUsername();
  }

  setLS(key, value) {
    return setStorage(key, value);
  }

  getLS(key) {
    return getStorage(key);
  }

  removeLS() {
    return removeStorage();
  }

  // 🔗 API Methods

  async login(userCredential) {
    try {
      const response = await axiosClient.post('/login', userCredential);
      const { token } = response.data;
      if (token) setStorage('token', token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async checkUsernameAvailability(username) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post(
        '/usernameAvailable',
        { username },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Username check failed:', error);
      throw error;
    }
  }

  async register(userCredential) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post(
        '/register',
        userCredential,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async userSessionCheck(userId) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post(
        '/userSessionCheck',
        { userId },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Session check failed:', error);
      throw error;
    }
  }

  async getMessages(userId, toUserId) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post(
        '/getMessages',
        { userId, toUserId },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get messages failed:', error);
      throw error;
    }
  }

  async uploadFile(formData) {
    try {
      const response = await axiosClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}

const instance = new ChatHttpServer();
export default instance;
