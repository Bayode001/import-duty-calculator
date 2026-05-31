import React, { useState, useEffect } from 'react';
import DutyCalculator from './components/DutyCalculator';
import HistoryPanel from './components/HistoryPanel';
import MultiItemCalculator from './components/MultiItemCalculator';
import CartSummary from './components/CartSummary';
import LoginModal from './components/LoginModal';
import { useAuth } from './contexts/AuthContext';
import { calculateDuty } from './services/api';

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator');
  const [history, setHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  
  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('dutyHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
        setHistory([]);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = (result) => {
    console.log('saveToHistory called with:', result);
    if (!result) return;
    
    const historyItem = {
      ...result,
      id: result.id || Date.now().toString(),
      created_at: result.created_at || new Date().toISOString(),
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

     console.log('History item being saved:', historyItem);
    
    setHistory(prev => {
      const newHistory = [historyItem, ...prev].slice(0, 50);
      console.log('New history length:', newHistory.length);
      localStorage.setItem('dutyHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Load calculation from history
  const loadCalculation = (item) => {
    if (!item) return;
    setActiveTab('calculator');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('loadCalculation', { detail: item }));
    }, 100);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dutyHistory');
  };

  // Main calculation function
  const handleCalculate = async (payload) => {
    try {
      const response = await calculateDuty(payload);
      if (response.success && response.data) {
        const completeResult = {
          ...response.data,
          created_at: new Date().toISOString(),
          hs_code: response.data.hs_code || payload.cetCode,
          fob_value: payload.fobAmount,
          fob_currency: payload.currency,
          freight_cost: payload.freightAmount || 0,
          insurance_cost: payload.insuranceAmount || 0,
          user_id: payload.user_id || null
        };
        return completeResult;
      }
      return null;
    } catch (error) {
      console.error('Error in handleCalculate:', error);
      return null;
    }
  };

  // Single calculator - saves to history
  const handleSingleCalculate = async (payload) => {
  console.log('handleSingleCalculate called with payload:', payload);
  const result = await handleCalculate(payload);
  console.log('handleCalculate result:', result);
  if (result) {
  console.log('Saving to history...');
    saveToHistory(result);
} else {
  //  console.log('No result to save');
  }
  return result;
};

  // Cart functions
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
              <span>👋 {user.name || user.email}</span>
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
          <DutyCalculator onCalculate={handleSingleCalculate} user={user} />
        )}
        
        {activeTab === 'multi' && (
          <MultiItemCalculator onCalculate={handleCalculate} onAddToCart={addToCart} onSaveToHistory={saveToHistory} />
        )}
        
        {activeTab === 'cart' && (
          <CartSummary 
            cart={cart} 
            onRemoveItem={removeFromCart} 
            onClearCart={clearCart} 
            onSaveToHistory={saveToHistory} 
          />
        )}
        
        {activeTab === 'history' && (
          <HistoryPanel 
            history={history} 
            onLoadCalculation={loadCalculation} 
            onClearHistory={clearHistory} 
          />
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

export default AppContent;