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
    
    // Always try to parse as JSON first
    let data;
    try {
      data = await response.json();
      console.log('Parsed data:', data);
    } catch (jsonError) {
      // If not JSON, check status
      if (!response.ok) {
        return { success: false, error: `Error ${response.status}: ${response.statusText}` };
      }
      return { success: false, error: 'Server error' };
    }
    
    // Check for error in response
    if (data.error === true || data.statusCode === 401) {
      return { success: false, error: data.message || 'Please login' };
    }
    
    if (!response.ok) {
      return { success: false, error: data.message || `HTTP error! status: ${response.status}` };
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };