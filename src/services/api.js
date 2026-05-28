const API_BASE_URL = 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken;
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
    
    // If response is not OK (401, 404, etc.)
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const data = await response.json();
        errorMessage = data.message || data.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      return { success: false, error: errorMessage };
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};
export default { calculateDuty };