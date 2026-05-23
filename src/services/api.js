const API_BASE_URL = 'https://nigeria-energy.duckdns.org/webhook/calculate-duty';

export const calculateDuty = async (payload) => {
    
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
     
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { success: false, error: error.message };
  }
};

export default { calculateDuty };