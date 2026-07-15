import React from 'react';
import { getLocalDateStr } from '../utils/dateUtils';

function ScheduleList({ tasks, logs, currentDateKey, onDelete, onToggle, onEditClick }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No events here. Tap + to add one.</div>;
  }

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${m} ${ampm}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const isTodayDate = currentDateKey === todayStr;

  return (
    <div className="schedule-list">
      {sortedTasks.map(task => {
        const isCompleted = logs.some(l => l.habitId === task.id && l.dateKey === currentDateKey && l.status === 'done');
        
        let canTick = true;
        let warningMsg = '';

        // Only enforce time/date locks if this task isn't already completed (can always untick)
        if (!isCompleted) {
          if (!isTodayDate) {
            canTick = false;
            warningMsg = 'Cannot tick tasks in the past or future';
          } else {
            const timeToCompare = task.endTime || task.time;
            if (timeToCompare) {
              const [h, m] = timeToCompare.split(':');
              const now = new Date();
              const compareTime = new Date();
              compareTime.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
              
              if (now < compareTime) {
                canTick = false;
                warningMsg = `Cannot tick until after ${formatTime(timeToCompare)}`;
              }
            }
          }
        }

        return (
          <div 
            key={task.id} 
            className={`event-card bg-${task.color} ${isCompleted ? 'completed' : ''}`}
            onClick={() => {
              if (canTick) onToggle(task);
              else if (warningMsg) alert(warningMsg);
            }}
            style={{ cursor: canTick ? 'pointer' : 'not-allowed', opacity: isCompleted ? 0.6 : 1 }}
          >
            <div className="event-content-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div 
                className="checkbox" 
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', 
                  border: `2px solid ${canTick || isCompleted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`, 
                  display: 'flex', 
                  justifyContent: 'center', alignItems: 'center', flexShrink: 0,
                  backgroundColor: isCompleted ? '#fff' : 'transparent',
                  opacity: canTick || isCompleted ? 1 : 0.5
                }}
              >
                {!canTick && !isCompleted && <span style={{fontSize:'10px', color:'rgba(255,255,255,0.4)'}}>🔒</span>}
                {isCompleted && <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--bg-dark)', borderRadius: '50%' }}></div>}
              </div>
              
              <div className="event-info" style={{ flexGrow: 1 }}>
                <span className="event-time">
                  {formatTime(task.time)} 
                  {task.endTime ? ` - ${formatTime(task.endTime)}` : ''} 
                  {task.type === 'daily' ? ' 🔁' : ''}
                </span>
                <h3 className="event-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  className="icon-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(task);
                  }}
                  title="Edit event"
                >
                  ✎
                </button>
                <button 
                  className="icon-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  title="Delete event"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleList;
