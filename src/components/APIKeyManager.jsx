import React, { useState } from 'react';

const APIKeyManager = ({ user }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKey, setNewKey] = useState(null);

  const generateKey = async () => {
    const response = await fetch('https://nigeria-energy.duckdns.org/auth/api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, key_name: 'New Key' })
    });
    const data = await response.json();
    if (data.key_value) {
      setNewKey(data.key_value);
      alert(`Your new API key: ${data.key_value}\nSave it now - you won't see it again!`);
    }
  };

  return (
    <div className="api-key-manager">
      <h3>API Keys</h3>
      <button onClick={generateKey}>Generate New API Key</button>
      {newKey && (
        <div className="new-key-warning">
          <strong>New API Key:</strong> {newKey}
          <p>Copy this key now. It won't be shown again!</p>
        </div>
      )}
    </div>
  );
};

export default APIKeyManager;