# Backend Teoría

## Arquitectura cliente-servidor

Una app móvil nunca debe conectarse directamente a una base de datos. Si las credenciales estuviesen en el código de la app, cualquiera que la descompile tendría acceso completo.

El patrón es cliente-servidor:
- **Cliente**: la app Expo
- **Servidor**: la API Next.js
- **Base de datos**: PostgreSQL en Neon

Cada capa tiene una responsabilidad única. La API actúa como guardián: valida los datos y comprueba que el cliente tiene permiso para hacer lo que pide.

## API REST

Una API REST es una forma estándar de comunicar cliente y servidor usando HTTP. Los métodos HTTP mapean a operaciones de datos:

| Método | Operación | Ejemplo |
|--------|-----------|---------|
| GET | Leer datos | Obtener todas las notas |
| POST | Crear datos | Crear una nota nueva |
| PATCH | Modificar parcialmente | Editar el título de una nota |
| DELETE | Eliminar datos | Borrar una nota |

## Códigos de estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

Nunca devuelvas el error real de la base de datos al cliente — es información interna que un atacante podría usar.

## Bases de datos relacionales

Las bases de datos relacionales organizan los datos en tablas con filas y columnas. Cada tabla representa una entidad del dominio.

### ACID

Las propiedades ACID garantizan que las transacciones son fiables:
- **Atomicidad**: una operación se completa entera o no se completa
- **Consistencia**: los datos siempre quedan en un estado válido
- **Aislamiento**: las transacciones no se interfieren entre sí
- **Durabilidad**: los datos guardados persisten aunque falle el sistema

### Primary Key

Identificador único e irrepetible de cada fila. En esta app usamos UUID porque el cliente puede generar el ID antes de conectarse a la red, lo que permite crear notas offline.

### Foreign Key

Columna que referencia la primary key de otra tabla. `ON DELETE CASCADE` significa que al borrar una tarea, sus checklist items se borran automáticamente.

### DDL vs DML

- **DDL** (Data Definition Language): define la estructura con `CREATE`, `ALTER` y `DROP`
- **DML** (Data Manipulation Language): manipula los datos con `SELECT`, `INSERT`, `UPDATE` y `DELETE`

## Diagrama entidad-relación

notes
  id, title, content, archived, created_at, updated_at

ideas
  id, title, content, color, archived, created_at, updated_at
  └── idea_tags (idea_id → ideas.id)
        id, idea_id, tag

checklists
  id, title, archived, created_at, updated_at
  └── checklist_items (checklist_id → checklists.id)
        id, checklist_id, text, is_completed

## JOINs

Un **LEFT JOIN** devuelve todas las filas de la tabla izquierda y las coincidentes de la derecha. Si no hay coincidencia, devuelve NULL.

Usamos LEFT JOIN para traer ideas con sus tags porque una idea puede no tener tags:

SELECT i.*, json_agg(it.tag) as tags
FROM ideas i
LEFT JOIN idea_tags it ON i.id = it.idea_id
GROUP BY i.id;

Un **INNER JOIN** solo devuelve las filas que tienen coincidencia en ambas tablas. Lo usaríamos si quisiéramos solo las ideas que tienen al menos un tag.
