import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ onClose }) => {
  const { register, login } = useAuth();
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
    
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(email, password, fullName);
    }
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Authentication failed');
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