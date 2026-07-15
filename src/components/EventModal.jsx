import React, { useState, useEffect } from 'react';

function EventModal({ isOpen, onClose, onAdd, onEdit, editingTask }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [color, setColor] = useState('blue');
  const [isDaily, setIsDaily] = useState(false);
  const [hasAlarm, setHasAlarm] = useState(false);
  const [ringtone, setRingtone] = useState('default');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setTime(editingTask.time || '09:00');
      setEndTime(editingTask.endTime || '09:30');
      setColor(editingTask.color || 'blue');
      setIsDaily(editingTask.type === 'daily');
      setHasAlarm(editingTask.hasAlarm || false);
      setRingtone(editingTask.ringtone || 'default');
    } else {
      setTitle('');
      setTime('09:00');
      setEndTime('09:30');
      setColor('blue');
      setIsDaily(false);
      setHasAlarm(false);
      setRingtone('default');
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData = { 
      title, 
      time, 
      endTime, 
      color, 
      type: isDaily ? 'daily' : 'once',
      hasAlarm,
      ringtone
    };
    
    if (editingTask) {
      onEdit({ ...editingTask, ...taskData });
    } else {
      onAdd(taskData);
    }
    onClose();
  };

  const ALL_COLORS = ['blue', 'red', 'orange', 'purple', 'green', 'pink', 'teal', 'cyan', 'lime', 'indigo'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="e.g. Daily Walk or Meeting" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Start Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>End Time</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Repeat</label>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={isDaily}
                  onChange={e => setIsDaily(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Daily Task
              </label>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Alert</label>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={hasAlarm}
                  onChange={e => setHasAlarm(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Set Alarm
              </label>
            </div>
          </div>

          {hasAlarm && (
            <div className="form-group">
              <label>Ringtone</label>
              <select 
                className="modern-select" 
                value={ringtone}
                onChange={e => setRingtone(e.target.value)}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                <option value="default">Default</option>
                <option value="chime">Chime</option>
                <option value="bell">Bell</option>
                <option value="electronic">Electronic</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Color (Red for negative tasks)</label>
            <div className="color-options">
              {ALL_COLORS.map(c => (
                <div 
                  key={c}
                  className={`color-circle ${c} ${color === c ? 'selected' : ''}`}
                  onClick={() => setColor(c)}
                ></div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={!title.trim()}>{editingTask ? 'Save Changes' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
