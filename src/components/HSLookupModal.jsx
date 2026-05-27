import React, { useState } from 'react';

const HSLookupModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchHS = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a product description');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const response = await fetch(
        `https://nigeria-energy.duckdns.org/webhook/hs-lookup?q=${encodeURIComponent(searchTerm)}`
      );
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.success && data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setError(data.message || 'No matching HS codes found. Try different keywords.');
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
    <div className="hs-modal-overlay" onClick={onClose}>
      <div className="hs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="hs-modal-header">
          <h2>🔍 Search HS Code by Product Description</h2>
          <button className="hs-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="hs-modal-body">
          <p>Enter what you want to import (e.g., "rice", "gas cylinder", "horses")</p>
          
          <div className="hs-search-box">
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

          {error && <div className="hs-error-message">{error}</div>}

          {loading && <div className="hs-loading">Searching database...</div>}

          {results.length > 0 && (
            <div className="hs-search-results">
              <div className="hs-results-header">
                <span>HS Code</span>
                <span>Description</span>
                <span>Duty Rate</span>
              </div>
              <div className="hs-results-list">
                {results.map((item, index) => (
                  <div 
                    key={index} 
                    className="hs-result-item"
                    onClick={() => handleSelect(item.hs_code, item.description)}
                  >
                    <span className="hs-result-code">{item.hs_code}</span>
                    <span className="hs-result-desc">{item.description}</span>
                    <span className="hs-result-rate">{item.duty_rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="hs-search-tip">
              💡 Click on any result to automatically fill the HS code
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HSLookupModal;