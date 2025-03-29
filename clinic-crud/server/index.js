const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client'))); // Serve frontend

// SQLite Database
const db = new sqlite3.Database('./clinic.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite');
});

// Create clients table
db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    srno INTEGER PRIMARY KEY,
    patientId TEXT,
    date TEXT,
    name TEXT,
    age INTEGER,
    phone TEXT,
    diagnosis TEXT,
    caseDetails TEXT,
    remedy TEXT,
    payment INTEGER
  )
`);

// API Routes
app.get('/clients', (req, res) => {
  db.all('SELECT * FROM clients', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/clients', (req, res) => {
  const client = req.body;
  const { srno, patientId, date, name, age, phone, diagnosis, caseDetails, remedy, payment } = client;
  db.run(
    `INSERT OR REPLACE INTO clients (srno, patientId, date, name, age, phone, diagnosis, caseDetails, remedy, payment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [srno, patientId, date, name, age, phone, diagnosis, caseDetails, remedy, payment],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Client saved', srno });
    }
  );
});

app.delete('/clients/:srno', (req, res) => {
  const srno = req.params.srno;
  db.run('DELETE FROM clients WHERE srno = ?', [srno], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client deleted' });
  });
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});