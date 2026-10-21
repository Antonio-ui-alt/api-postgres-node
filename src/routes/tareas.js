const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tareas ORDER BY id');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tareas WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || !titulo.trim()) {
    return res.status(400).json({ error: 'El campo titulo es obligatorio' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING *',
      [titulo.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const { titulo, completada } = req.body;
  if (typeof titulo !== 'string' || !titulo.trim() || typeof completada !== 'boolean') {
    return res.status(400).json({ error: 'Se requieren titulo (texto) y completada (booleano)' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE tareas SET titulo = $1, completada = $2 WHERE id = $3 RETURNING *',
      [titulo.trim(), completada, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tareas WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
