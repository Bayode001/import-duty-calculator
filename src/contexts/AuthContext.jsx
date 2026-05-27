import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = 'https://nigeria-energy.duckdns.org/webhook/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    // Check for existing session on load
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('sessionToken');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setSessionToken(savedToken);
    }
    setLoading(false);
  }, []);

  const register = async (email, password, fullName) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        setSessionToken(data.sessionToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionToken', data.sessionToken);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        setSessionToken(data.sessionToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionToken', data.sessionToken);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
  };

  const generateApiKey = async (keyName) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, key_name: keyName })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return { success: true, apiKey: data.api_key, keyName: data.key_name };
      } else {
        return { success: false, error: data.message || 'Failed to generate API key' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout,
      generateApiKey,
      sessionToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};