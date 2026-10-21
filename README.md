# API REST con Node.js y PostgreSQL

API de tareas con Express y `pg`. Usa la imagen `postgres:17` y conserva los datos en el volumen existente `postgres_data`.

## Iniciar en Visual Studio Code

1. Abre esta carpeta en VS Code: `C:\Users\an194\Documents\Codex\2026-10-21\ha\api-postgres-node`.
2. Abre la terminal integrada y ejecuta `.\setup.ps1`.
3. El script detiene el contenedor Docker antiguo `postgres`, reutiliza su volumen en un contenedor nuevo `api-postgres-db` y publica PostgreSQL en `localhost:5433`. El PostgreSQL 18 instalado en Windows permanece en el puerto 5432.
4. El script conserva la tabla `tareas`, sincroniza la contraseña local de desarrollo e inicia la API si el puerto 3000 está libre.

La API queda en `http://localhost:3000`; Docker PostgreSQL escucha en `localhost:5433`.

## Desplegar en Render

El archivo `render.yaml` define la API y una base de datos PostgreSQL administrada. Conecta el repositorio de GitHub a Render como Blueprint y Render aplicará esa configuración. El plan gratuito de PostgreSQL de Render vence después de 30 días y elimina la base si no se actualiza; úsalo solo para una demo temporal.

## Endpoints

- `GET /api/health` — estado de la API y PostgreSQL
- `GET /api/tareas` — lista tareas
- `GET /api/tareas/:id` — obtiene una tarea
- `POST /api/tareas` — crea una tarea; JSON: `{ "titulo": "Estudiar Node" }`
- `PUT /api/tareas/:id` — actualiza título y estado; JSON: `{ "titulo": "Estudiar Node", "completada": true }`
- `DELETE /api/tareas/:id` — elimina una tarea

Las consultas SQL están parametrizadas. Las credenciales actuales son solo para desarrollo local; no las uses en producción.
