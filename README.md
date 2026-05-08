# Noteflow API

API REST para la app Noteflow. Gestiona notas, ideas y tareas con base de datos PostgreSQL en Neon.

## Stack

- **Next.js** — framework para la API
- **PostgreSQL** — base de datos relacional
- **Neon** — PostgreSQL serverless en la nube
- **Zod** — validación de datos

## Setup

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env.local` con tu connection string de Neon:
DATABASE_URL=postgresql://...

4. Ejecuta el schema en Neon desde `sql/schema.sql`

5. Arranca el servidor:
```bash
npm run dev
```

## Estructura del proyecto

noteflow-api/
app/
api/
notes/          → endpoints de notas
ideas/          → endpoints de ideas
checklists/     → endpoints de tareas

lib/
db.ts             → conexión a la base de datos

sql/
schema.sql        → definición de tablas
queries.sql       → consultas SQL documentadas

docs/
backend-teoria.md → arquitectura, REST y SQL
seguridad-api.md  → SQL injection y variables de entorno

## Endpoints

### Notas

#### `GET /api/notes`
Devuelve todas las notas ordenadas por fecha de creación.

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "title": "Mi nota",
    "content": "Contenido de la nota",
    "archived": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /api/notes`
Crea una nota nueva.

**Body:**
```json
{
  "title": "Mi nota",
  "content": "Contenido de la nota"
}
```

**Respuesta:** `201 Created`

```json
{
  "id": "uuid",
  "title": "Mi nota",
  "content": "Contenido de la nota",
  "archived": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/notes/:id`
Devuelve una nota por su id.

#### `PATCH /api/notes/:id`
Edita una nota. Todos los campos son opcionales.

#### `DELETE /api/notes/:id`
Elimina una nota. Respuesta: `204 No Content`

---

### Ideas

#### `GET /api/ideas`
Devuelve todas las ideas con sus tags.

```json
[
  {
    "id": "uuid",
    "title": "Mi idea",
    "content": "Descripción",
    "color": "#ff0000",
    "archived": false,
    "tags": ["tag1", "tag2"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### `POST /api/ideas`
Crea una idea nueva.

#### `PATCH /api/ideas/:id`
Edita una idea.

#### `DELETE /api/ideas/:id`
Elimina una idea y sus tags.

---

### Tareas

#### `GET /api/checklists`
Devuelve todas las tareas con sus items.

#### `POST /api/checklists`
Crea una tarea nueva con items.

#### `PATCH /api/checklists/:id`
Edita una tarea.

#### `DELETE /api/checklists/:id`
Elimina una tarea.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| DATABASE_URL | Connection string de Neon PostgreSQL |

## Despliegue

https://noteflow-api.vercel.app

Para desplegar:
1. Conecta el repo en Vercel
2. Añade `DATABASE_URL`
3. Deploy
