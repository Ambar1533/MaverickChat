// React App\src\utils\uploadAPI.js

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('image', file); // ✅ Must match the field name used in multer middleware

  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
