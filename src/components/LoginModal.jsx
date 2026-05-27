import React, { useState } from 'react';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isLogin ? '/webhook/auth/login' : '/webhook/auth/register';
    const payload = isLogin ? { email, password } : { email, password, full_name: fullName };
    
    try {
      const response = await fetch(`https://nigeria-energy.duckdns.org${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store authentication data
        localStorage.setItem('sessionToken', data.sessionToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call the success callback
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        onClose();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? '🔐 Login' : '📝 Register'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
          
          <button type="button" className="btn-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;