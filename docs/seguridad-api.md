# Seguridad de la API

## SQL Injection

La inyección SQL ocurre cuando la entrada del usuario se concatena directamente en una consulta. Un atacante puede manipular la consulta para acceder a datos que no debería ver.

### Ejemplo vulnerable

```sql
-- El usuario introduce: '; DROP TABLE notes;--
const query = "SELECT * FROM notes WHERE title = '" + req.body.title + "'";
-- Resultado: SELECT * FROM notes WHERE title = ''; DROP TABLE notes;--'
```

### Solución: consultas parametrizadas

Las consultas parametrizadas envían la estructura SQL y los valores por separado. La base de datos precompila el SQL y trata los parámetros estrictamente como datos, nunca como código:

```sql
-- Seguro: el valor nunca se interpreta como código SQL
const query = "SELECT * FROM notes WHERE title = $1";
await db.query(query, [req.body.title]);
```

En esta API todas las consultas usan parámetros `$1`, `$2`, etc. para evitar SQL injection.

## Variables de entorno

Las variables de entorno son valores de configuración que se guardan fuera del código. El connection string de la base de datos nunca debe aparecer en el código porque:

- El código se sube a GitHub y es público
- Cualquiera que lo vea tendría acceso completo a la base de datos

### Cómo las usamos

En desarrollo se guardan en `.env.local` que está en el `.gitignore`: DATABASE_URL=postgresql://...

En producción se configuran en el panel de Vercel como variables de entorno seguras.

El archivo `.env.example` se sube a GitHub como plantilla con las claves vacías: DATABASE_URL=

