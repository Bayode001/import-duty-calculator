import React, { useState } from 'react';

const HSLookupModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchHS = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://nigeria-energy.duckdns.org/webhook/hs-lookup?q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setResults(data);
      if (data.length === 0) {
        setError('No matching HS codes found. Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSelect = (hsCode, description) => {
    onSelect(hsCode, description);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 Search HS Code by Product Description</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Enter what you want to import (e.g., "rice", "gas cylinder", "horses")</p>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="e.g., rice, gas containers, live horses, argon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchHS()}
              autoFocus
            />
            <button onClick={searchHS} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading">Searching database...</div>}

          {results.length > 0 && (
            <div className="search-results">
              <div className="results-header">
                <span>HS Code</span>
                <span>Description</span>
                <span>Duty Rate</span>
              </div>
              {results.map((item) => (
                <div 
                  key={item.hs_code} 
                  className="search-result-item"
                  onClick={() => handleSelect(item.hs_code, item.description)}
                >
                  <span className="hs-code">{item.hs_code}</span>
                  <span className="hs-desc">{item.description}</span>
                  <span className="hs-rate">{item.duty_rate}%</span>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="search-tip">
              💡 Click on any result to automatically fill the HS code
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HSLookupModal;