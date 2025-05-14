// React App/src/utils/uploadAPI.js

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Upload a file (image/pdf/etc.) to the backend.
 * @param {File} file - The file to upload.
 * @returns {Object} - Response data containing file URL or error.
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('image', file); // ✅ Must match multer field name

  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
        // Optional: add auth token if backend expects it
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ File upload failed:', error.response || error);
    throw error;
  }
};
