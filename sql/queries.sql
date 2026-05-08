-- NOTAS
-- Obtener todas las notas
SELECT * FROM notes
ORDER BY created_at DESC;

-- Obtener una nota por id
SELECT * FROM notes
WHERE id = $1;

-- Crear una nota
INSERT INTO notes (title, content)
VALUES ($1, $2)
RETURNING *;

-- Editar una nota
UPDATE notes 
SET title = COALESCE($1, title), 
    content = COALESCE($2, content), 
    archived = COALESCE($3, archived),
    updated_at = NOW()
WHERE id = $4
RETURNING *;

-- Eliminar una nota
DELETE FROM notes WHERE id = $1;


-- IDEAS
-- Obtener todas las ideas con sus tags
SELECT i.*, 
  COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
FROM ideas i
LEFT JOIN idea_tags it ON i.id = it.idea_id
GROUP BY i.id
ORDER BY i.created_at DESC;

-- Obtener una idea por id con sus tags
SELECT i.*, 
  COALESCE(json_agg(it.tag) FILTER (WHERE it.id IS NOT NULL), '[]') as tags
FROM ideas i
LEFT JOIN idea_tags it ON i.id = it.idea_id
WHERE i.id = $1
GROUP BY i.id;

-- Crear una idea
INSERT INTO ideas (title, content, color)
VALUES ($1, $2, $3)
RETURNING *;

-- Editar una idea
UPDATE ideas 
SET title = COALESCE($1, title),
    content = COALESCE($2, content),
    color = COALESCE($3, color),
    archived = COALESCE($4, archived),
    updated_at = NOW()
WHERE id = $5
RETURNING *;

-- Eliminar una idea
DELETE FROM ideas WHERE id = $1;

-- Añadir tag a una idea
INSERT INTO idea_tags (idea_id, tag)
VALUES ($1, $2);

-- Borrar todos los tags de una idea (antes de actualizar)
DELETE FROM idea_tags WHERE idea_id = $1;


-- TAREAS
-- Obtener todas las tareas con sus items
SELECT c.*, 
  COALESCE(
    json_agg(
      json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)
    ) FILTER (WHERE ci.id IS NOT NULL), 
    '[]'
  ) as items
FROM checklists c
LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
GROUP BY c.id
ORDER BY c.created_at DESC;

-- Obtener una tarea por id con sus items
SELECT c.*, 
  COALESCE(
    json_agg(
      json_build_object('id', ci.id, 'text', ci.text, 'isCompleted', ci.is_completed)
    ) FILTER (WHERE ci.id IS NOT NULL), 
    '[]'
  ) as items
FROM checklists c
LEFT JOIN checklist_items ci ON c.id = ci.checklist_id
WHERE c.id = $1
GROUP BY c.id;

-- Crear una tarea
INSERT INTO checklists (title)
VALUES ($1)
RETURNING *;

-- Editar una tarea
UPDATE checklists
SET title = COALESCE($1, title),
    archived = COALESCE($2, archived),
    updated_at = NOW()
WHERE id = $3
RETURNING *;

-- Eliminar una tarea
DELETE FROM checklists WHERE id = $1;

-- Añadir item a una tarea
INSERT INTO checklist_items (checklist_id, text, is_completed)
VALUES ($1, $2, $3);

-- Borrar todos los items de una tarea (antes de actualizar)
DELETE FROM checklist_items WHERE checklist_id = $1;