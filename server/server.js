const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./scheduler.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT,
    time TEXT,
    endTime TEXT,
    color TEXT,
    type TEXT,
    dateKey TEXT
  )`);
  
  // Safely add new columns if they don't exist
  db.run(`ALTER TABLE events ADD COLUMN hasAlarm INTEGER DEFAULT 0`, () => {});
  db.run(`ALTER TABLE events ADD COLUMN ringtone TEXT DEFAULT 'default'`, () => {});

  db.run(`CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habitId TEXT,
    dateKey TEXT,
    status TEXT,
    type TEXT
  )`);
});

// EVENTS API
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Convert SQLite 0/1 back to boolean for frontend
    const formattedRows = rows.map(r => ({
      ...r,
      hasAlarm: r.hasAlarm === 1
    }));
    res.json(formattedRows);
  });
});

app.post('/api/events', (req, res) => {
  const { id, title, time, endTime, color, type, dateKey, hasAlarm, ringtone } = req.body;
  const alarmInt = hasAlarm ? 1 : 0;
  const rTone = ringtone || 'default';
  
  db.run(`INSERT INTO events (id, title, time, endTime, color, type, dateKey, hasAlarm, ringtone) VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, title, time, endTime, color, type, dateKey, alarmInt, rTone], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.put('/api/events/:id', (req, res) => {
  const { title, time, endTime, color, type, dateKey, hasAlarm, ringtone } = req.body;
  const alarmInt = hasAlarm ? 1 : 0;
  const rTone = ringtone || 'default';

  db.run(`UPDATE events SET title = ?, time = ?, endTime = ?, color = ?, type = ?, dateKey = ?, hasAlarm = ?, ringtone = ? WHERE id = ?`,
    [title, time, endTime, color, type, dateKey, alarmInt, rTone, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/events/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // Also cleanup associated habit logs
    db.run('DELETE FROM habit_logs WHERE habitId = ?', [req.params.id]);
    res.json({ success: true });
  });
});

// HABITS LOGGING API
app.get('/api/habits', (req, res) => {
  db.all('SELECT * FROM habit_logs', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/habits', (req, res) => {
  const { habitId, dateKey, status, type } = req.body;
  db.run('DELETE FROM habit_logs WHERE habitId = ? AND dateKey = ?', [habitId, dateKey], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO habit_logs (habitId, dateKey, status, type) VALUES (?,?,?,?)', [habitId, dateKey, status, type], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
