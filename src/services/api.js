const API_BASE_URL = 'http://129.151.190.142:5678/webhook/calculate-duty';

export const calculateDuty = async (payload) => {
  console.log('📤 Sending request to:', API_BASE_URL);
  console.log('📦 Payload:', payload);
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Success! Data received:', data);
    console.log('💰 Total payable:', data.total_payable);
    
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return { success: false, error: error.message };
  }
};

export default { calculateDuty };