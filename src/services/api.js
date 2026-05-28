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
    
    console.log('Response status:', response.status);
    
    // Try to get the response text
    const text = await response.text();
    console.log('Raw response:', text);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If not JSON, check if it's an error message
      if (!response.ok) {
        return { success: false, error: `Error ${response.status}: ${response.statusText}` };
      }
      return { success: false, error: 'Server error' };
    }
    
    // Check for error in response
    if (!response.ok || data.error === true) {
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