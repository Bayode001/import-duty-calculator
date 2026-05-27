import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const APIKeyManager = () => {
  const { user, generateApiKey } = useAuth();
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!keyName.trim()) {
      setError('Please enter a key name');
      return;
    }
    
    setLoading(true);
    setError('');
    const result = await generateApiKey(keyName);
    
    if (result.success) {
      setGeneratedKey(result.apiKey);
      setKeyName('');
    } else {
      setError(result.error || 'Failed to generate API key');
    }
    setLoading(false);
  };

  return (
    <div className="api-key-manager">
      <h3>🔑 API Keys</h3>
      <p>Generate API keys for programmatic access to the calculator.</p>
      
      <form onSubmit={handleGenerateKey} className="api-key-form">
        <input
          type="text"
          placeholder="Key name (e.g., Production, Development)"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          className="key-name-input"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Generating...' : 'Generate New API Key'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {generatedKey && (
        <div className="new-key-warning">
          <strong>⚠️ New API Key:</strong>
          <code>{generatedKey}</code>
          <p>Copy this key now. It won't be shown again!</p>
        </div>
      )}
      
      <div className="api-key-info">
        <h4>How to use your API key</h4>
        <pre className="code-example">
          curl -X POST https://nigeria-energy.duckdns.org/webhook/calculate-duty \
          -H "Content-Type: application/json" \
          -H "X-API-Key: YOUR_API_KEY" \
          -d '{"cetCode":"7311000000","fobAmount":26400,"currency":"USD","freightAmount":6400}'
        </pre>
      </div>
    </div>
  );
};

export default APIKeyManager;