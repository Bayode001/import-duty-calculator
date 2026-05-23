import React, { useState, useEffect } from 'react';
import DutyCalculator from './components/DutyCalculator';
import HistoryPanel from './components/HistoryPanel';
import MultiItemCalculator from './components/MultiItemCalculator';
import CartSummary from './components/CartSummary';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { calculateDuty } from './services/api';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator');
  const [history, setHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('dutyHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse history:', e);
        setHistory([]);
      }
    }
  }, []);

  const saveToHistory = (result) => {
  if (!result) return;
  
  
  // Preserve ALL fields from the API response
  const historyItem = {
    ...result,  // This spreads ALL fields from the API response
    // Ensure these are numbers for sorting/display
    total_payable: parseFloat(result.total_payable || 0),
    fob_value: parseFloat(result.fob_value || 0),
    fob_rate: parseFloat(result.fob_rate || 1),
    cif_ngn: parseFloat(result.cif_ngn || 0),
    import_duty: parseFloat(result.import_duty || 0),
    surcharge: parseFloat(result.surcharge || 0),
    fcs: parseFloat(result.fcs || 0),
    etls: parseFloat(result.etls || 0),
    levy: parseFloat(result.levy || 0),
    vat_base: parseFloat(result.vat_base || 0),
    vat: parseFloat(result.vat || 0),
    duty_rate: parseFloat(result.duty_rate || 0),
    freight_cost: parseFloat(result.freight_cost || 0),
    insurance_cost: parseFloat(result.insurance_cost || 0)
  };
  
  const newHistory = [historyItem, ...history].slice(0, 50);
  setHistory(newHistory);
  localStorage.setItem('dutyHistory', JSON.stringify(newHistory));
};

  const loadCalculation = (item) => {
  if (!item) return;
  
  setActiveTab('calculator');
  
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('loadCalculation', { 
      detail: item  // Pass the entire item, not a subset
    }));
  }, 100);
};

  const handleCalculate = async (payload) => {
  console.log('🔵 handleCalculate called with:', payload.cetCode);
  
  try {
    const response = await calculateDuty(payload);
    console.log('🔵 Response success:', response.success);
    
    if (response.success && response.data) {
      const completeResult = {
        id: response.data.id || Date.now().toString(),
        created_at: new Date().toISOString(),
        hs_code: response.data.hs_code || payload.cetCode,
        tariff_description: response.data.tariff_description || '',
        user_id: payload.user_id || null,
        fob_value: payload.fobAmount,
        fob_currency: payload.currency,
        fob_rate: response.data.fob_rate || 1,
        cif_ngn: response.data.cif_ngn || 0,
        duty_rate: response.data.duty_rate || 0,
        import_duty: response.data.import_duty || 0,
        surcharge: response.data.surcharge || 0,
        fcs: response.data.fcs || 0,
        etls: response.data.etls || 0,
        levy: response.data.levy || 0,
        vat_base: response.data.vat_base || 0,
        vat: response.data.vat || 0,
        vat_exempt: response.data.vat_exempt || false,
        total_payable: response.data.total_payable || response.data.total_customs_charges || 0,
        freight_cost: payload.freightAmount || 0,
        insurance_cost: payload.insuranceAmount || 0,
        disclaimer: response.data.disclaimer || 'Advisory only.'
      };
      
      console.log('🟢 Saving to history for:', completeResult.hs_code);
      saveToHistory(completeResult);
      console.log('🟢 Returning result for:', completeResult.hs_code);
      return completeResult;
    } else {
      console.log('🔴 Response failed for:', payload.cetCode);
      return null;
    }
  } catch (error) {
    console.error('🔴 Error in handleCalculate:', error);
    return null;
  }
};


  const addToCart = (items) => {
    if (!items || !Array.isArray(items)) return;
    setCart([...cart, ...items]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🇳🇬 Nigeria Import Duty Calculator</h1>
        <p>Calculate customs duties, VAT, and total charges for imports into Nigeria</p>
        <div className="header-actions">
          {user ? (
            <div className="user-info">
              <span>👋 {user.name}</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn-login">Login</button>
          )}
        </div>
      </header>
      
      <div className="tabs">
        <button className={activeTab === 'calculator' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('calculator')}>
          🧮 Calculator
        </button>
        <button className={activeTab === 'multi' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('multi')}>
          📦 Multiple Items
        </button>
        <button className={activeTab === 'cart' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('cart')}>
          🛒 Cart ({cart.length})
        </button>
        <button className={activeTab === 'history' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('history')}>
          📜 History ({history.length})
        </button>
      </div>
      
      <main className="app-main">
        {activeTab === 'calculator' && (
          <DutyCalculator onCalculate={handleCalculate} />
        )}
        
        {activeTab === 'multi' && (
          <MultiItemCalculator onCalculate={handleCalculate} onAddToCart={addToCart} />
        )}
        
        {activeTab === 'cart' && (
          <CartSummary cart={cart} onRemoveItem={removeFromCart} onClearCart={clearCart} />
        )}
        
        {activeTab === 'history' && (
          <HistoryPanel history={history} onLoadCalculation={loadCalculation} onClearHistory={clearHistory} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Advisory rates only. Final assessment by Nigeria Customs Service may differ.</p>
        <p>© 2026 Pearl 12-77 Limited</p>
      </footer>
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;