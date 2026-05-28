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
    console.log('Response ok:', response.ok);
    
    // Try to parse JSON, but handle non-JSON responses
    let data;
    try {
      data = await response.json();
      console.log('API Response:', data);
    } catch (jsonError) {
      // If response is not JSON (e.g., HTML error page)
      console.error('Response is not JSON:', jsonError);
      return { success: false, error: 'Server error. Please try again.' };
    }
    
    // Check for error in response
    if (!response.ok || data.error === true || data.statusCode === 401 || data.statusCode === 404) {
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