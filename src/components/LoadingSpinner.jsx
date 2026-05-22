import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Calculating duties...</p>
    </div>
  );
};

export default LoadingSpinner;