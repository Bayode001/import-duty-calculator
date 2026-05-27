const API_BASE_URL = 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';

export const calculateDuty = async (payload) => {
  console.log('Sending request for HS Code:', payload.cetCode);
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    // Always try to parse the response as JSON first
    const data = await response.json();
    console.log('API Response:', data);
    
    // Check if response is not OK (404, 500, etc.)
    if (!response.ok) {
      // Return the error message from the API if available
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      return { success: false, error: errorMessage };
    }
    
    // Check if the response contains an error field
    if (data.error === "true" || data.error === true || data.statusCode === 404) {
      return { success: false, error: data.message || 'HS Code not found in tariff database' };
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

export default { calculateDuty };