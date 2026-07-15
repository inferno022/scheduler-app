import { useEffect, useRef } from 'react';
import { getLocalDateStr } from '../utils/dateUtils';

export function useAlarms(tasks) {
  const rungAlarms = useRef(new Set());

  // Web Audio API for 100% offline synthetic ringtones
  const playSyntheticAudio = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // A4
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1);
      } else if (type === 'bell') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      } else if (type === 'electronic') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } else {
        // Default
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gainNode.gain.setValueAtTime(1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.error('Web Audio API blocked. User must interact with page first.', e);
    }
  };

  useEffect(() => {
    // Request permission early if not done
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = getLocalDateStr(now);
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      tasks.forEach(task => {
        if (!task.hasAlarm) return;
        
        const isToday = task.type === 'daily' || task.dateKey === todayStr;
        if (!isToday) return;

        // Check if time matches exactly
        if (task.time === timeStr) {
          const alarmKey = `${task.id}-${todayStr}`;
          if (!rungAlarms.current.has(alarmKey)) {
            rungAlarms.current.add(alarmKey);
            triggerAlarm(task);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks]);

  const triggerAlarm = (task) => {
    if (Notification.permission === "granted") {
      new Notification(`Time for: ${task.title}`, {
        body: `It is ${task.time}.`,
      });
    }

    // Play synthetic offline audio
    playSyntheticAudio(task.ringtone);
  };
}
