import React from 'react';

const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="error-alert">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{message}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>×</button>
      )}
    </div>
  );
};

export default ErrorAlert;