import React, { useState } from 'react';

const SimpleTest = () => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button 
        onClick={() => setShow(true)} 
        style={{ padding: '10px 20px', background: 'blue', color: 'white' }}
      >
        Open Modal
      </button>
      
      {show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            minWidth: '300px',
            textAlign: 'center'
          }}>
            <h3>Test Modal</h3>
            <p>If you see this, the modal system works!</p>
            <button onClick={() => setShow(false)} style={{ padding: '8px 16px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTest;