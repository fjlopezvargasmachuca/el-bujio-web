# Venta El Bujio — v1.5

Aplicación web de Venta El Bujio desarrollada con **Next.js 15 + React 19 + TypeScript + Prisma + PostgreSQL**.

Esta revisión está preparada para continuar desplegándose en **Vercel** desde GitHub. El sistema de reservas sigue desactivado, aunque su estructura de base de datos permanece preparada para una fase futura.

## Cambios de esta versión

- Carta inicial sincronizada con la fotografía facilitada por la venta.
- Precios de la fotografía cargados como precio de plato/ración.
- Ingredientes iniciales y alérgenos normalizados para cada plato.
- Menú del día de ejemplo en base de datos con primeros, segundos y postres.
- Precio inicial del menú del día: **18 €**, editable desde administración.
- Recuperación automática del horario público si la configuración estuviera vacía.
- Enlace **Administración** restaurado en el pie de página público.
- Botón de contraer/expandir el menú lateral de escritorio con icono profesional de tres líneas.
- Inicio simplificado: Carta, Menú del día, Ofertas y Contacto usan ahora el mismo estilo.
- Eliminado el acceso duplicado al menú del día/ofertas de la portada.
- Eliminado el acceso directo a alérgenos de la portada; sigue disponible dentro de Carta.
- La migración `20261007193000_seed_catalog_and_daily_menu` carga estos datos automáticamente una sola vez en cada base.

## Carta inicial

La fotografía original contiene un único precio por producto. Por ello se almacena como `pricePlatoCents`. Tapa y media quedan vacíos para que el administrador los añada solo si el restaurante decide utilizarlos.

Los postres de ejemplo de versiones anteriores se conservan y son editables desde administración.

## Desarrollo local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar `.env`

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/el_bujio?schema=public"
AUTH_SECRET="TU_SECRETO_LARGO"
ADMIN_EMAIL="admin@elbujio.es"
ADMIN_PASSWORD="Bujio2026!"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Generar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

### 3. Aplicar migraciones y preparar datos

```bash
npm run setup
```

### 4. Arrancar

```bash
npm run dev
```

Rutas principales:

```text
http://localhost:3000
http://localhost:3000/carta
http://localhost:3000/carta/alergenos
http://localhost:3000/menu-del-dia
http://localhost:3000/ofertas
http://localhost:3000/contacto
http://localhost:3000/admin/login
```

## Comprobaciones

```bash
npm run typecheck
npm run build
```

O:

```bash
npm run verify
```

## Actualizar la versión desplegada en Vercel

Si el repositorio ya está conectado a Vercel, basta con subir esta versión a GitHub:

```bash
git status
git add .
git commit -m "Actualiza carta, menu del dia y navegacion"
git push
```

Vercel ejecutará:

```text
npm run vercel-build
```

El script incluye:

```text
prisma generate
prisma migrate deploy
next build
```

La nueva migración se aplicará automáticamente a la PostgreSQL configurada en Vercel. Esa migración:

- garantiza que existan los datos básicos de contacto/horario;
- carga o sincroniza los platos de la carta de la fotografía;
- carga un menú del día de ejemplo;
- establece 18 € como precio de ejemplo si todavía no existe precio.

Después de aplicarse una vez, Prisma la registra como ejecutada y no volverá a sobrescribir los cambios que haga el administrador en despliegues posteriores.

### Si una base nueva todavía no tiene usuario administrador

El hash de contraseña no se incluye en las migraciones. Para una base completamente nueva ejecuta una vez el seed con las variables de producción de Vercel:

```bash
vercel env run -e production -- npm run db:seed
```

## Seguridad

- `.env` está excluido mediante `.gitignore`.
- Sesión administrativa mediante cookie HTTP-only.
- `Secure` en producción y `SameSite=Strict`.
- Contraseñas almacenadas con bcrypt.
- Operaciones administrativas verificadas en servidor.
- Validación de URLs configurables.
- Los alérgenos se seleccionan de un listado normalizado, no mediante texto libre.

Antes de publicar como versión definitiva, los ingredientes y alérgenos deben ser confirmados por cocina frente a las recetas reales y posibles contaminaciones cruzadas.

## Nota sobre reservas

Las tablas de reservas siguen presentes en Prisma/PostgreSQL para una posible ampliación futura, pero no existe interfaz pública ni administrativa de reservas en esta versión.
