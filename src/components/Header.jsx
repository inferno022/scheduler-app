import React, { useState, useEffect } from 'react';

function Header({ onAddClick }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header" style={{ position: 'relative' }}>
      <div>
        <p>{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</h1>
      </div>
      {onAddClick && (
        <button 
          onClick={onAddClick} 
          className="fab-button"
          style={{ position: 'absolute', top: '0', right: '0', bottom: 'auto', left: 'auto', transform: 'none', zIndex: 50 }}
        >
          +
        </button>
      )}
    </header>
  );
}

export default Header;
