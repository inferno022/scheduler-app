import React, { useState, useEffect } from 'react';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

function FocusMode({ activeTask, onLockdownChange }) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (onLockdownChange) {
      onLockdownChange(isActive);
    }
  }, [isActive, onLockdownChange]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Auto-switch modes when timer hits 0
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(breakMinutes * 60);
        setIsActive(false); // Stop so they can choose to start break
      } else {
        setMode('work');
        setTimeLeft(workMinutes * 60);
        setIsActive(false); // Stop so they can choose to start work
      }
      
      // Native vibe: could vibrate device here if we install Haptics
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([200, 100, 200]);
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
    }
    // No pause allowed!
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const skipSession = () => {
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(breakMinutes * 60);
    } else {
      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
    setIsActive(false);
  };

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Calculate progress circle
  const totalSeconds = (mode === 'work' ? workMinutes : breakMinutes) * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="focus-container">
      <div className="focus-header">
        <h2 className="section-title">Focus Mode</h2>
        {!isActive && (
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
              onClick={() => { setMode('work'); setTimeLeft(workMinutes * 60); setIsActive(false); }}
            >
              Work
            </button>
            <button 
              className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
              onClick={() => { setMode('break'); setTimeLeft(breakMinutes * 60); setIsActive(false); }}
            >
              Break
            </button>
          </div>
        )}
      </div>

      <div className="active-task-display">
        {activeTask ? (
          <div className="task-pill">
            <span className="task-pill-label">Focusing on:</span>
            <span className="task-pill-title">{activeTask.title}</span>
          </div>
        ) : (
          <div className="task-pill empty">
            <span>No specific task selected. Just focusing!</span>
          </div>
        )}
      </div>

      <div className="timer-display-wrapper">
        <div className={`timer-circle ${mode}`}>
          <svg className="progress-ring" viewBox="0 0 100 100">
            <circle className="progress-ring-circle bg" cx="50" cy="50" r="45"></circle>
            <circle 
              className="progress-ring-circle fg" 
              cx="50" cy="50" r="45"
              style={{ strokeDasharray: 283, strokeDashoffset: 283 - (283 * progressPercent) / 100 }}
            ></circle>
          </svg>
          <div className="timer-text">
            {timeString}
          </div>
          <div className="timer-status">
            {mode === 'work' ? 'Deep Work' : 'Relax'}
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {!isActive && (
          <button className="control-btn secondary" onClick={resetTimer}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        )}
        
        <button className={`control-btn primary ${isActive ? 'active' : ''}`} onClick={toggleTimer} style={{ cursor: isActive ? 'not-allowed' : 'pointer' }}>
          {isActive ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
        </button>

        {!isActive && (
          <button className="control-btn secondary" onClick={skipSession}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        )}
      </div>

      {!isActive && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Work (min)
            <input type="number" min="1" max="120" value={workMinutes} 
              style={{ background: 'var(--bg-card)', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '8px', marginTop: '0.25rem', width: '70px', textAlign: 'center' }}
              onChange={e => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setWorkMinutes(val);
                if (mode === 'work') setTimeLeft(val * 60);
              }} 
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Break (min)
            <input type="number" min="1" max="60" value={breakMinutes} 
              style={{ background: 'var(--bg-card)', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '8px', marginTop: '0.25rem', width: '70px', textAlign: 'center' }}
              onChange={e => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setBreakMinutes(val);
                if (mode === 'break') setTimeLeft(val * 60);
              }} 
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default FocusMode;
