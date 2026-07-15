import React, { useState, useEffect } from 'react';
import { getLocalDateStr } from '../utils/dateUtils';

function TrackerCard({ widget, tasks, logs, updateWidget, removeWidget }) {
  const { id, taskId, viewType } = widget;
  
  // Logic to calculate color for a specific day
  const getColorForDay = (date) => {
    const dayStr = getLocalDateStr(date);
    
    if (taskId === 'all') {
      // Find all tasks active on this day
      const activeTasks = tasks.filter(t => t.type === 'daily' || t.dateKey === dayStr);
      if (activeTasks.length === 0) return 'empty';
      
      const completedCount = logs.filter(l => 
        l.dateKey === dayStr && 
        l.status === 'done' && 
        activeTasks.some(t => t.id === l.habitId)
      ).length;
      
      const percentage = completedCount / activeTasks.length;
      if (percentage === 1) return 'green';
      if (percentage > 0.5) return 'yellow';
      if (percentage > 0) return 'orange';
      return 'red';
    } else {
      // Tracking a specific task
      const targetTask = tasks.find(t => t.id === taskId);
      if (!targetTask) return 'empty';
      
      const isTaskActive = targetTask.type === 'daily' || targetTask.dateKey === dayStr;
      if (!isTaskActive) return 'empty';
      
      const log = logs.find(l => l.habitId === taskId && l.dateKey === dayStr);
      if (log && log.status === 'done') {
        return targetTask.color || 'blue';
      }
      return 'empty';
    }
  };

  // Generate grids based on viewType
  const today = new Date();
  
  let gridContent = null;

  if (viewType === 'weekly') {
    // 7 days
    const weekDates = [];
    for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      weekDates.push(d);
    }
    gridContent = (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        {weekDates.map(d => (
          <div key={d.toISOString()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
            <div className={`dot ${getColorForDay(d)}`} style={{ width: '28px', height: '28px', borderRadius: '50%' }}></div>
          </div>
        ))}
      </div>
    );
  } else if (viewType === 'monthly') {
    // Current month 
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDates = [];
    for(let i=1; i<=daysInMonth; i++) {
      monthDates.push(new Date(year, month, i));
    }
    gridContent = (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '1rem', justifyContent: 'center' }}>
        {monthDates.map(d => (
          <div key={d.toISOString()} className={`dot ${getColorForDay(d)}`} style={{ width: '18px', height: '18px', borderRadius: '4px' }}></div>
        ))}
      </div>
    );
  } else if (viewType === 'yearly') {
    // 12 months grids
    const year = today.getFullYear();
    const months = [];
    for(let m=0; m<12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const monthDates = [];
      for(let i=1; i<=daysInMonth; i++) monthDates.push(new Date(year, m, i));
      months.push({ name: new Date(year, m, 1).toLocaleDateString('en-US', { month: 'short' }), dates: monthDates });
    }
    
    gridContent = (
      <div className="yearly-months-grid" style={{ marginTop: '1rem' }}>
        {months.map(m => (
          <div key={m.name} className="mini-month-block">
            <span className="mini-month-title">{m.name}</span>
            <div className="mini-days-grid">
              {m.dates.map(d => (
                <div key={d.toISOString()} className={`dot ${getColorForDay(d)}`} style={{ width: '8px', height: '8px' }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter tasks to show in dropdown (Only Daily tasks + "All")
  const trackableTasks = tasks.filter(t => t.type === 'daily');

  return (
    <div className="tracker-card" style={{ position: 'relative' }}>
      <button 
        onClick={() => removeWidget(id)}
        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
      >✕</button>
      
      <div className="tracker-header" style={{ marginBottom: '0.5rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingRight: '20px' }}>
        <select 
          className="modern-select" 
          value={taskId} 
          onChange={(e) => updateWidget(id, 'taskId', e.target.value)}
          style={{ flex: 1, minWidth: '120px' }}
        >
          <option value="all">All Tasks</option>
          {trackableTasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        
        <select 
          className="modern-select" 
          value={viewType} 
          onChange={(e) => updateWidget(id, 'viewType', e.target.value)}
          style={{ width: '110px' }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {gridContent}
    </div>
  );
}

function Analytics({ tasks, logs }) {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('scheduler_widgets');
    return saved ? JSON.parse(saved) : [{ id: 'w1', taskId: 'all', viewType: 'weekly' }];
  });

  useEffect(() => {
    localStorage.setItem('scheduler_widgets', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = () => {
    setWidgets([...widgets, { id: Date.now().toString(), taskId: 'all', viewType: 'weekly' }]);
  };

  const updateWidget = (id, field, value) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  return (
    <div className="analytics-container">
      <h2 className="section-title">Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Configure widgets to track your daily progress.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {widgets.map(w => (
          <TrackerCard 
            key={w.id} 
            widget={w} 
            tasks={tasks} 
            logs={logs} 
            updateWidget={updateWidget} 
            removeWidget={removeWidget} 
          />
        ))}
      </div>

      <button 
        onClick={addWidget}
        style={{
          marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
          color: '#fff', border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1rem',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%'
        }}
      >
        <span>+</span> Add Widget
      </button>
    </div>
  );
}

export default Analytics;
