// React App\src\utils\chatHttpServer.js

import axiosClient from '../api/axiosClient';
import {
  getUserId,
  getUsername,
  setStorage,
  getStorage,
  removeStorage,
} from './storage';

class ChatHttpServer {
  // Local Storage Getters
  getUserId() {
    return getUserId();
  }

  getUsername() {
    return getUsername();
  }

  // Local Storage Setters
  setLS(key, value) {
    return setStorage(key, value);
  }

  getLS(key) {
    return getStorage(key);
  }

  removeLS() {
    return removeStorage();
  }

  // HTTP Calls

  async login(userCredential) {
    try {
      const response = await axiosClient.post('/login', userCredential);
      const { token } = response.data;
      if (token) {
        setStorage('token', token);  // ✅ Save token
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async checkUsernameAvailability(username) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post('/usernameAvailable', { username }, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userCredential) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post('/register', userCredential, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async userSessionCheck(userId) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post('/userSessionCheck', { userId }, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(userId, toUserId) {
    try {
      const token = getStorage('token');
      const response = await axiosClient.post('/getMessages', {
        userId,
        toUserId,
      }, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Upload file (image/pdf)
  async uploadFile(formData) {
    try {
      const response = await axiosClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const instance = new ChatHttpServer();
export default instance;

