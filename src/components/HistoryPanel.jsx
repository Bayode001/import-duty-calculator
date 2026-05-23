import React, { useState, useEffect } from 'react';

const HistoryPanel = ({ history, onLoadCalculation, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    if (!history || history.length === 0) {
      setFilteredHistory([]);
      return;
    }

    try {
      const filtered = history.filter(item => {
        const hsCode = item?.hs_code || '';
        const description = item?.tariff_description || '';
        const searchLower = searchTerm.toLowerCase();
        
        return hsCode.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower);
      });
      setFilteredHistory(filtered);
    } catch (error) {
      console.error('Error filtering history:', error);
      setFilteredHistory([]);
    }
  }, [searchTerm, history]);

  if (!history || history.length === 0) {
    return (
      <div className="history-panel">
        <div className="history-header">
          <h3>📜 Calculation History</h3>
        </div>
        <div className="history-empty">
          <p>No calculations yet. Start by calculating duty above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>📜 Calculation History ({history.length})</h3>
        <div className="history-actions">
          <input
            type="text"
            placeholder="Search by HS Code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {history.length > 0 && (
            <button onClick={onClearHistory} className="btn-clear">
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {filteredHistory.length === 0 ? (
        <div className="history-empty">
          <p>No matching calculations found.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredHistory.map((item, index) => {
            try {
              const hsCode = item?.hs_code || 'N/A';
              const description = item?.tariff_description || 'No description';
              const totalPayable = parseFloat(item?.total_payable || 0);
              const createdDate = item?.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown date';
              
              return (
                <div key={item?.id || index} className="history-item">
                  <div className="history-item-header">
                    <span className="history-date">{createdDate}</span>
                    <div className="history-item-actions">
                      <button onClick={() => onLoadCalculation(item)} className="btn-load">
                        Load
                      </button>
                    </div>
                  </div>
                  <div className="history-item-details">
                    <span className="history-hs">HS Code: {hsCode}</span>
                    <span className="history-desc">{description.substring(0, 50)}...</span>
                    <span className="history-total">₦{totalPayable.toLocaleString()}</span>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering history item:', error);
              return null;
            }
          }).filter(item => item !== null)}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;