const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';
const API_KEY = process.env.REACT_APP_API_KEY || 'dev_key_123';

export const calculateDuty = async (payload) => {
  console.log('Sending request to:', API_BASE_URL);
  console.log('With payload:', payload);
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Fetch response status:', response.status);
    console.log('Fetch response ok?', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Parsed response data:', data);
    console.log('Total payable:', data.total_payable);
    
    if (data.error === "true" || data.error === true) {
      return { success: false, error: data.message || 'HS Code not found' };
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };