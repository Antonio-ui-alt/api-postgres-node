require('dotenv').config({ override: true });
const express = require('express');
const pool = require('./db/pool');
const tareasRouter = require('./routes/tareas');

const app = express();
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', baseDeDatos: 'conectada' });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);
    const dbUrl = new URL(process.env.DATABASE_URL);
    res.status(503).json({
      estado: 'error',
      baseDeDatos: 'desconectada',
      codigo: error.code || 'DB_ERROR',
      destino: `${dbUrl.hostname}:${dbUrl.port}/${dbUrl.pathname.slice(1)}`,
      credencialConfigurada: dbUrl.password === 'postgres',
    });
  }
});
app.use('/api/tareas', tareasRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`API disponible en http://localhost:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);



