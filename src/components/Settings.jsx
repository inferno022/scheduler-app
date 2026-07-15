import React from 'react';
import { getLocalDateStr } from '../utils/dateUtils';

function Settings({ 
  oledMode, 
  setOledMode, 
  accentColor, 
  setAccentColor,
  onWipeData,
  tasks,
  logs
}) {

  const handleExport = () => {
    const data = {
      tasks,
      logs,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduler-backup-${getLocalDateStr(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestAlarm = () => {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification("Notifications Enabled!", {
          body: "Your alarms will ring here."
        });
      } else {
        alert("Notifications were blocked by your browser settings.");
      }
    });

    // Test Web Audio API
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      alert("Audio failed to play.");
    }
  };

  const THEME_COLORS = [
    { id: 'blue', label: 'Classic Blue' },
    { id: 'red', label: 'Ruby Red' },
    { id: 'orange', label: 'Sunset Orange' },
    { id: 'purple', label: 'Deep Purple' },
    { id: 'green', label: 'Emerald Green' },
    { id: 'pink', label: 'Hot Pink' },
    { id: 'teal', label: 'Ocean Teal' },
    { id: 'cyan', label: 'Electric Cyan' },
    { id: 'lime', label: 'Neon Lime' },
    { id: 'indigo', label: 'Midnight Indigo' }
  ];

  return (
    <div className="settings-container">
      
      <div className="settings-group">
        <h3 className="settings-subtitle">Appearance</h3>
        
        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-label">OLED Dark Mode</span>
            <span className="settings-desc">Use true black background to save battery</span>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={oledMode} 
              onChange={e => setOledMode(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div className="settings-info">
            <span className="settings-label">Accent Color</span>
            <span className="settings-desc">Personalize your app's main color</span>
          </div>
          <div className="color-options" style={{ padding: '0.5rem 0' }}>
            {THEME_COLORS.map(c => (
              <div 
                key={c.id}
                title={c.label}
                className={`color-circle ${c.id} ${accentColor === c.id ? 'selected' : ''}`}
                onClick={() => setAccentColor(c.id)}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="settings-subtitle">System</h3>
        
        <div className="settings-item clickable" onClick={handleTestAlarm}>
          <div className="settings-info">
            <span className="settings-label">Test Notifications & Audio</span>
            <span className="settings-desc">Grant permissions and play a test chime</span>
          </div>
          <span className="settings-icon">🔔</span>
        </div>
        
        <div className="settings-item clickable" onClick={handleExport}>
          <div className="settings-info">
            <span className="settings-label">Export Data</span>
            <span className="settings-desc">Download a backup of all tasks and habits</span>
          </div>
          <span className="settings-icon">📥</span>
        </div>

        <div 
          className="settings-item clickable danger" 
          onClick={() => {
            if(window.confirm('Are you sure you want to delete all tasks and habit logs? This cannot be undone.')) {
              onWipeData();
            }
          }}
        >
          <div className="settings-info">
            <span className="settings-label">Wipe Data</span>
            <span className="settings-desc">Permanently delete all data from this device</span>
          </div>
          <span className="settings-icon">🗑️</span>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2rem' }}>
        Scheduler v1.0 • Running Offline (LocalStorage)
      </p>

    </div>
  );
}

export default Settings;
