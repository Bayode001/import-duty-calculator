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
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Get the response text first to see what's coming back
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed JSON data:', data);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return { success: false, error: 'Invalid response from server' };
    }
    
    // Check for error in response
    if (!response.ok || data.error === "true" || data.error === true || data.statusCode === 404) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      console.log('Error message:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};