// src/utils/storage.js

// 🔍 Get user ID from localStorage
export const getUserId = () => {
  try {
    return localStorage.getItem('userid');
  } catch (error) {
    console.error('Error getting user ID from storage:', error);
    return null;
  }
};

// 🔍 Get username from localStorage
export const getUsername = () => {
  try {
    return localStorage.getItem('username');
  } catch (error) {
    console.error('Error getting username from storage:', error);
    return null;
  }
};

// 🔍 Generic getter for any key (e.g., token)
export const getStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
};

// 💾 Set any key in localStorage
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in storage:`, error);
  }
};

// ❌ Remove all session-related keys
export const removeStorage = () => {
  try {
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('token');  // ✅ Remove token on logout
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
