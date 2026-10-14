# Preproducción de Venta El Bujio en Render

Este proyecto usa renderizado en servidor, Server Actions y PostgreSQL, por lo que debe desplegarse como **Web Service**, no como Static Site.

## Opción recomendada: Blueprint (`render.yaml`)

1. Sube el proyecto a GitHub.
2. En Render, crea un nuevo **Blueprint** y conecta el repositorio.
3. Render detectará `render.yaml`.
4. Cuando solicite variables no sincronizadas, introduce:

```text
ADMIN_PASSWORD = CAMBIA_ESTA_PASSWORD
NEXT_PUBLIC_SITE_URL = https://TU-SERVICIO.onrender.com
```

Para preproducción puedes usar `CAMBIA_ESTA_PASSWORD`. Antes de producción real cambia la contraseña.

5. Confirma la creación del Web Service y PostgreSQL.
6. El build ejecuta:

```text
npm ci
prisma generate
prisma migrate deploy
tsx prisma/seed.ts
next build
```

7. El servidor arranca con:

```text
npm start
```

8. Comprueba:

```text
https://TU-SERVICIO.onrender.com/api/health
```

Debe responder:

```json
{"ok":true}
```

## Si configuras Render manualmente

Crea primero un PostgreSQL y luego un Web Service.

### Web Service

```text
Runtime: Node
Build Command: npm ci && npm run render:build
Start Command: npm start
Health Check Path: /api/health
```

Variables:

```text
NODE_ENV=production
DATABASE_URL=<Internal Database URL de Render>
AUTH_SECRET=<secreto largo aleatorio>
ADMIN_EMAIL=admin@elbujio.es
ADMIN_PASSWORD=CAMBIA_ESTA_PASSWORD
NEXT_PUBLIC_SITE_URL=https://TU-SERVICIO.onrender.com
```

## Notas de preproducción

- Los Web Services gratuitos pueden entrar en reposo por inactividad y tardar en responder al primer acceso.
- PostgreSQL gratuito en Render está pensado para pruebas y caduca; para una web pública definitiva utiliza un plan persistente o un proveedor PostgreSQL con copias de seguridad.
- No copies el archivo `.env` al repositorio. Configura todos los secretos desde el panel de Render.
- Si cambias `ADMIN_PASSWORD` en Render, un nuevo despliegue vuelve a ejecutar el seed y actualiza el hash del administrador.
