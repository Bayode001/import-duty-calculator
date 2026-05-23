import React, { useState } from 'react';

const MultiItemCalculator = ({ onCalculate, onAddToCart }) => {
  const [items, setItems] = useState([
    { id: Date.now(), cetCode: '', fobAmount: '', freightAmount: '', insuranceAmount: 0, currency: 'USD', levyBasis: 'FOB' }
  ]);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState([]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      cetCode: '', 
      fobAmount: '', 
      freightAmount: '', 
      insuranceAmount: 0,
      currency: 'USD',
      levyBasis: 'FOB'
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateAll = async () => {
  setCalculating(true);
  setResults([]);
  const calculatedResults = [];
  
  for (const item of items) {
    if (item.cetCode && item.fobAmount) {
      const payload = {
        cetCode: item.cetCode.trim(),
        fobAmount: parseFloat(item.fobAmount),
        currency: item.currency,
        freightAmount: parseFloat(item.freightAmount) || 0,
        insuranceAmount: parseFloat(item.insuranceAmount) || 0,
        levyBasis: item.levyBasis,
        user_id: null
      };
      
      const result = await onCalculate(payload);
      if (result) {
        calculatedResults.push({
          ...item,
          result: result
        });
      }
    }
  }
  
  setResults(calculatedResults);
  setCalculating(false);
};

const addToCart = () => {
  if (results.length > 0) {
    // The results already contain the calculated data
    // They should already be in history because onCalculate saves them
    onAddToCart(results);
    alert(`${results.length} item(s) added to cart!`);
  }
};


  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-NG').format(num);
  };

  // Calculate grand total
  const grandTotal = results.reduce((sum, item) => {
    const totalPayable = parseFloat(item.result?.total_payable || 0);
    return sum + totalPayable;
  }, 0);

  return (
    <div className="multi-item-panel">
      <h3>📦 Multiple Items Calculator</h3>
      
      <div className="items-list">
        {items.map((item, index) => {
          const resultItem = results.find(r => r.id === item.id);
          const itemTotal = resultItem?.result?.total_payable || 0;
          
          return (
            <div key={item.id} className="multi-item-row">
              <div className="item-header">
                <span className="item-number">Item {index + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="btn-remove">
                    ✕
                  </button>
                )}
              </div>
              <div className="item-fields">
                <input
                  type="text"
                  placeholder="HS Code *"
                  value={item.cetCode}
                  onChange={(e) => updateItem(item.id, 'cetCode', e.target.value)}
                  className="item-input"
                />
                <input
                  type="number"
                  placeholder="FOB Value *"
                  value={item.fobAmount}
                  onChange={(e) => updateItem(item.id, 'fobAmount', e.target.value)}
                  className="item-input"
                />
                <input
                  type="number"
                  placeholder="Freight"
                  value={item.freightAmount}
                  onChange={(e) => updateItem(item.id, 'freightAmount', e.target.value)}
                  className="item-input"
                />
                <select
                  value={item.currency}
                  onChange={(e) => updateItem(item.id, 'currency', e.target.value)}
                  className="item-input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="ZAR">ZAR</option>
                </select>
                <select
                  value={item.levyBasis}
                  onChange={(e) => updateItem(item.id, 'levyBasis', e.target.value)}
                  className="item-input"
                >
                  <option value="FOB">Levy on FOB</option>
                  <option value="CIF">Levy on CIF</option>
                </select>
              </div>
              {resultItem && (
                <div className="item-result">
                  Total: ₦{formatNumber(parseFloat(itemTotal))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="multi-item-actions">
        <button onClick={addItem} className="btn-add-item">
          + Add Another Item
        </button>
        <button onClick={calculateAll} disabled={calculating} className="btn-calculate-all">
          {calculating ? 'Calculating...' : 'Calculate All Items'}
        </button>
        {results.length > 0 && (
          <button onClick={addToCart} className="btn-add-to-cart">
            Add {results.length} Item(s) to Cart
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="results-summary">
          <h4>Results Summary</h4>
          {results.map((item, idx) => {
            const totalPayable = parseFloat(item.result?.total_payable || 0);
            return (
              <div key={idx} className="summary-item">
                <span>{item.cetCode}</span>
                <span>₦{formatNumber(totalPayable)}</span>
              </div>
            );
          })}
          <div className="summary-total">
            <strong>Grand Total:</strong>
            <strong>₦{formatNumber(grandTotal)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiItemCalculator;