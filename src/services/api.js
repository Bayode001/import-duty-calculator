const API_BASE_URL = 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const sessionToken = localStorage.getItem('sessionToken');
  const apiKey = process.env.REACT_APP_API_KEY;
  
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken;
  } else if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  return headers;
};

export const calculateDuty = async (payload) => {
  console.log('Sending request for HS Code:', payload.cetCode);
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (!response.ok || data.error === "true" || data.error === true || data.statusCode === 404) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };