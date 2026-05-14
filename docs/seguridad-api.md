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

## JWT (JSON Web Token)

JWT es un estándar para transmitir información de forma segura entre cliente y servidor. Se usa para autenticar al usuario sin necesidad de guardar sesiones en el servidor.

### Cómo funciona

1. El usuario hace login con email y contraseña
2. El servidor verifica las credenciales y genera un token firmado con `JWT_SECRET`
3. La app guarda el token con `expo-secure-store`
4. En cada petición la app envía el token en el header `Authorization: Bearer <token>`
5. El servidor verifica el token antes de procesar la petición

### Estructura del token

Un JWT tiene tres partes separadas por puntos: header.payload.signature

- **Header** — algoritmo de firma
- **Payload** — datos del usuario (id, email)
- **Signature** — firma criptográfica con `JWT_SECRET`

### Por qué expo-secure-store

`expo-secure-store` cifra el token en el keychain del dispositivo. Es más seguro que `AsyncStorage` que guarda los datos en texto plano.