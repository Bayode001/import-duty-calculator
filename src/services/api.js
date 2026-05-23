import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';
const API_KEY = process.env.REACT_APP_API_KEY || 'dev_key_123';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  withCredentials: false,  // Change to false
  timeout: 30000
});

export const calculateDuty = async (payload) => {
  console.log('Sending request to:', API_BASE_URL);
  console.log('With payload:', payload);
  
  try {
    const response = await apiClient.post('', payload);
    console.log('Response received:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      console.log('Error response data:', error.response.data);
      return { success: false, error: error.response.data.message || 'API error occurred' };
    }
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };