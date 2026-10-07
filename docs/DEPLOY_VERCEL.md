# Actualización en Vercel

Este proyecto ya incluye `vercel-build`:

```bash
npm run vercel-build
```

Si el repositorio de GitHub ya está conectado a Vercel, no es necesario crear un proyecto nuevo.

## Publicar esta revisión

```bash
git status
git add .
git commit -m "Actualiza carta, menu del dia y navegacion"
git push
```

Vercel detectará el `push` a `main` y creará un nuevo deployment.

La migración `20261007193000_seed_catalog_and_daily_menu` se ejecutará durante `prisma migrate deploy` y cargará la carta y el menú del día de ejemplo en la PostgreSQL remota.

## Variables necesarias en Vercel

```text
DATABASE_URL
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
NEXT_PUBLIC_SITE_URL
```

`DATABASE_URL` debe apuntar a PostgreSQL en Internet, no a `localhost`.

## Comprobar después del deployment

```text
/
/carta
/carta/alergenos
/menu-del-dia
/contacto
/admin/login
/api/health
```

Si la base es completamente nueva y no existe todavía el administrador:

```bash
vercel env run -e production -- npm run db:seed
```
