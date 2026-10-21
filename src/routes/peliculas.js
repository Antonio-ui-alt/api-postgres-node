const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res, next) => {
  const genero = typeof req.query.genero === 'string' ? req.query.genero.trim() : '';
  try {
    const { rows } = await pool.query(
      'SELECT * FROM peliculas WHERE genero ILIKE $1 ORDER BY id',
      [`%${genero}%`]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM peliculas WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Película no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { titulo, director, anio, genero, sinopsis = '', calificacion = 0 } = req.body;
  if (
    typeof titulo !== 'string' || !titulo.trim() ||
    typeof director !== 'string' || !director.trim() ||
    !Number.isInteger(anio) || anio < 1888 || anio > 2100 ||
    typeof genero !== 'string' || !genero.trim() ||
    typeof sinopsis !== 'string' ||
    typeof calificacion !== 'number' || calificacion < 0 || calificacion > 10
  ) {
    return res.status(400).json({
      error: 'Se requieren titulo, director, anio, genero; sinopsis es texto y calificacion va de 0 a 10',
    });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO peliculas (titulo, director, anio, genero, sinopsis, calificacion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titulo.trim(), director.trim(), anio, genero.trim(), sinopsis.trim(), calificacion]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una película con ese título' });
    }
    next(error);
  }
});

module.exports = router;
