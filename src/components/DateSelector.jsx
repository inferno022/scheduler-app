import React, { useState, useRef } from 'react';
import { getLocalDateStr } from '../utils/dateUtils';

function DateSelector({ selectedDate, onSelectDate, tasks = [] }) {
  const [view, setView] = useState('weekly'); // 'weekly', 'monthly', 'yearly'
  const scrollRef = useRef(null);

  const today = new Date();
  
  // Calculate a 2-week strip starting from the Sunday of the selectedDate's week
  const getWeekDates = () => {
    const dates = [];
    const currentDay = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - currentDay);

    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const hasEvents = (date) => {
    const dateStr = getLocalDateStr(date);
    return tasks.some(t => t.dateKey === dateStr || t.type === 'daily');
  };

  const renderWeekly = () => {
    return (
      <div 
        className="date-selector-scroll" 
        ref={scrollRef}
        style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.5rem' }}
      >
        {weekDates.map((date, i) => {
          const active = isSameDay(date, selectedDate);
          const hasTask = hasEvents(date);
          return (
            <div 
              key={i} 
              className={`date-item ${active ? 'active' : ''}`}
              onClick={() => {
                onSelectDate(date);
                setView('weekly');
              }}
              style={{ position: 'relative' }}
            >
              <span className="day-name">{getDayName(date)}</span>
              <span className="day-number">{date.getDate()}</span>
              {hasTask && (
                <div style={{
                  width: '4px', height: '4px', backgroundColor: active ? '#000' : 'var(--fab-color)',
                  borderRadius: '50%', position: 'absolute', bottom: '6px'
                }}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthly = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="month-grid" style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
          <button onClick={() => onSelectDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>&larr;</button>
          <div className="month-header-title" style={{ margin: 0 }}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => onSelectDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>&rarr;</button>
        </div>
        <div className="weekdays-row">
          {WEEKDAYS.map(d => <div key={d} className="weekday-label">{d.charAt(0)}</div>)}
        </div>
        <div className="days-grid" style={{ gap: '0.75rem' }}>
          {blanks.map(b => <div key={`blank-${b}`} style={{ width: '32px', height: '32px' }}></div>)}
          {monthDays.map(day => {
            const d = new Date(year, month, day);
            const active = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, new Date());
            const hasTask = hasEvents(d);
            
            return (
              <div 
                key={day} 
                onClick={() => {
                  onSelectDate(d);
                  setView('weekly');
                }}
                style={{
                  width: '32px', height: '32px', display: 'flex', flexDirection: 'column', 
                  justifyContent: 'center', alignItems: 'center', borderRadius: '50%',
                  backgroundColor: active ? 'var(--color-yellow)' : (isToday ? 'rgba(255,255,255,0.1)' : 'transparent'),
                  color: active ? '#000' : '#fff', cursor: 'pointer', position: 'relative'
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: active ? 600 : 400 }}>{day}</span>
                {hasTask && (
                  <div style={{
                    width: '4px', height: '4px', backgroundColor: active ? '#000' : 'var(--fab-color)',
                    borderRadius: '50%', position: 'absolute', bottom: '2px'
                  }}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearly = () => {
    const year = selectedDate.getFullYear();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="yearly-calendar-view" style={{ backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
          <button onClick={() => onSelectDate(new Date(year - 1, 0, 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>&larr;</button>
          <div className="month-header-title" style={{ margin: 0, fontSize: '1.4rem' }}>{year}</div>
          <button onClick={() => onSelectDate(new Date(year + 1, 0, 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>&rarr;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {MONTHS.map((m, i) => {
            const isCurrentMonth = year === today.getFullYear() && i === today.getMonth();
            return (
              <div 
                key={m} 
                onClick={() => {
                  onSelectDate(new Date(year, i, 1));
                  setView('monthly');
                }}
                style={{
                  padding: '1rem 0', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                  backgroundColor: isCurrentMonth ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: isCurrentMonth ? 'var(--color-yellow)' : '#fff' }}>{m}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="date-selector-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Schedule</span>
        <select 
          className="modern-select" 
          value={view} 
          onChange={(e) => setView(e.target.value)}
          style={{ padding: '0.25rem 2rem 0.25rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'transparent', border: 'none' }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      {view === 'weekly' && renderWeekly()}
      {view === 'monthly' && renderMonthly()}
      {view === 'yearly' && renderYearly()}
    </div>
  );
}

export default DateSelector;
