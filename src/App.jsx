import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DateSelector from './components/DateSelector';
import ScheduleList from './components/ScheduleList';
import EventModal from './components/EventModal';
import BottomNav from './components/BottomNav';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { getLocalDateStr } from './utils/dateUtils';
import { useAlarms } from './hooks/useAlarms';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyMode, setDailyMode] = useState(false);
  
  // Initialize from localStorage instead of backend
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('scheduler_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('scheduler_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('scheduler_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('scheduler_logs', JSON.stringify(logs));
  }, [logs]);

  // Initialize Alarms
  useAlarms(tasks);

  // Theme Settings
  const [oledMode, setOledMode] = useState(() => {
    return localStorage.getItem('premium_scheduler_oled') === 'true';
  });
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('premium_scheduler_accent') || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('premium_scheduler_oled', oledMode);
    localStorage.setItem('premium_scheduler_accent', accentColor);
  }, [oledMode, accentColor]);

  const handleAddEvent = (eventData) => {
    const newTask = {
      id: Date.now().toString(),
      dateKey: getLocalDateStr(selectedDate),
      ...eventData
    };
    setTasks([...tasks, newTask]);
  };

  const handleEditEvent = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteEvent = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    // Also remove associated logs
    setLogs(logs.filter(l => l.habitId !== id));
  };

  const handleToggleComplete = (task) => {
    if (dailyMode) return;

    const dateStr = getLocalDateStr(selectedDate);
    const isCompleted = logs.some(l => l.habitId === task.id && l.dateKey === dateStr && l.status === 'done');
    const nextStatus = isCompleted ? 'none' : 'done';

    const newLog = { habitId: task.id, dateKey: dateStr, status: nextStatus, type: task.color === 'red' ? 'negative' : 'positive' };
    setLogs([...logs.filter(l => !(l.habitId === task.id && l.dateKey === dateStr)), newLog]);
  };

  const handleWipeData = async () => {
    setTasks([]);
    setLogs([]);
  };

  const selectedDateStr = getLocalDateStr(selectedDate);
  const currentDayTasks = tasks.filter(
    t => t.type === 'daily' || t.dateKey === selectedDateStr
  );

  return (
    <div className={`app-container ${oledMode ? 'oled-mode' : ''} accent-${accentColor}`}>
      <div className="main-content">
        
        {deferredPrompt && (
          <div style={{ backgroundColor: 'var(--fab-color)', color: '#fff', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Install App to Home Screen</span>
            <button onClick={handleInstallClick} style={{ background: '#fff', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Install</button>
          </div>
        )}

        {activeTab === 'home' && (
          <>
            <Header onAddClick={() => { setEditingTask(null); setIsModalOpen(true); }} />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="checkbox" 
                  checked={dailyMode}
                  onChange={e => setDailyMode(e.target.checked)}
                />
                Manage Daily Templates
              </label>
            </div>

            {!dailyMode && (
              <DateSelector 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
                tasks={tasks}
              />
            )}
            
            <ScheduleList 
              tasks={dailyMode ? tasks.filter(t => t.type === 'daily') : currentDayTasks} 
              logs={logs}
              currentDateKey={selectedDateStr}
              onDelete={handleDeleteEvent}
              onToggle={handleToggleComplete}
              onEditClick={(task) => { setEditingTask(task); setIsModalOpen(true); }}
            />
          </>
        )}
        {activeTab === 'analytics' && <Analytics tasks={tasks} logs={logs} />}
        {activeTab === 'profile' && (
          <Settings 
            oledMode={oledMode}
            setOledMode={setOledMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            onWipeData={handleWipeData}
            tasks={tasks}
            logs={logs}
          />
        )}
      </div>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
        onAdd={handleAddEvent}
        onEdit={handleEditEvent}
        editingTask={editingTask}
      />
    </div>
  );
}

export default App;
