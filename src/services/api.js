import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';
const API_KEY = process.env.REACT_APP_API_KEY || '';

console.log('API_BASE_URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY })
  },
  timeout: 30000
});

export const calculateDuty = async (payload) => {
  console.log('=== API CALL START ===');
  console.log('Payload:', payload);
  console.log('Full URL being called:', API_BASE_URL);
  
  try {
    const response = await apiClient.post('', payload);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data type:', typeof response.data);
    console.log('Raw API response:', JSON.stringify(response.data, null, 2));
    
    // Check if response.data is a string that needs parsing
    let data = response.data;
    if (typeof data === 'string') {
      console.log('Response data is a string, attempting to parse...');
      try {
        data = JSON.parse(data);
        console.log('Parsed data:', data);
      } catch (e) {
        console.error('Failed to parse response:', e);
      }
    }
    
    if (data.error === "true" || data.error === true) {
      console.log('Error in response:', data.message);
      return { success: false, error: data.message || 'HS Code not found' };
    }
    
    console.log('Success! Returning data with total_payable:', data.total_payable);
    return { success: true, data: data };
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      return { success: false, error: error.response.data.message || 'API error occurred' };
    }
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };