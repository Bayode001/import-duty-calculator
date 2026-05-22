import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://129.151.190.142:5678';
const API_KEY = process.env.REACT_APP_API_KEY || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY })
  },
  timeout: 30000
});

export const calculateDuty = async (payload) => {
  try {
    const response = await apiClient.post('/webhook/calculate-duty', payload);
    console.log('Raw API response:', response.data);
    
    // Check if response contains error
    if (response.data.error === "true" || response.data.error === true) {
      return { success: false, error: response.data.message || 'HS Code not found' };
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      return { success: false, error: error.response.data.message || 'API error occurred' };
    }
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };