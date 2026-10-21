require('dotenv').config({ override: true });
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const pool = require('./db/pool');
const tareasRouter = require('./routes/tareas');
const peliculasRouter = require('./routes/peliculas');

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    mensaje: 'API de tareas con Node.js y PostgreSQL',
    endpoints: {
      salud: '/api/health',
      tareas: '/api/tareas',
      peliculas: '/api/peliculas',
    },
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', baseDeDatos: 'conectada' });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);
    res.status(503).json({
      estado: 'error',
      baseDeDatos: 'desconectada',
      codigo: error.code || 'DB_ERROR',
    });
  }
});
app.use('/api/tareas', tareasRouter);
app.use('/api/peliculas', peliculasRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = Number(process.env.PORT) || 3000;
let server;

async function start() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    server = app.listen(port, () => {
      console.log(`API disponible en el puerto ${port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la API:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

start();

async function shutdown() {
  if (!server) {
    await pool.end();
    return process.exit(0);
  }
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);



