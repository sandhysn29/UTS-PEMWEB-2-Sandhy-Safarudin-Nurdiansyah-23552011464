const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`${req.method} ${req.url} - ${time}`);
  next();
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task_manager',
  password: '123',
  port: 5432,
});

// endpoint awal untuk cek server hidup atau tidak
app.get('/', (req, res) => {
  res.send('SERVER HIDUP');
});

// ambil semua data task dari database
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

// ambil data task berdasarkan ID
app.get('/tasks/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id=$1', [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Task tidak ditemukan' });
  }

  res.json(result.rows[0]);
});

// tambah task baru
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title tidak boleh kosong' });
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, description) VALUES ($1,$2) RETURNING *',
    [title, description]
  );

  res.status(201).json(result.rows[0]);
});

// update task berdasarkan ID
app.put('/tasks/:id', async (req, res) => {
  const { title, description, is_completed } = req.body;

  const result = await pool.query(
    'UPDATE tasks SET title=$1, description=$2, is_completed=$3 WHERE id=$4 RETURNING *',
    [title, description, is_completed, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Task tidak ditemukan' });
  }

  res.json(result.rows[0]);
});

// hapus task berdasarkan ID
app.delete('/tasks/:id', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id=$1 RETURNING *',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Task tidak ditemukan' });
  }

  res.json({ message: 'Task berhasil dihapus' });
});

app.listen(3000, () => {
  console.log('Server jalan di http://localhost:3000');
});