# El Bujio — web responsive + carta + administración

Aplicación web para **El Bujio**, desarrollada con **Next.js + React + TypeScript**, preparada para móvil y escritorio y pensada para compartir en redes sociales.

Esta versión **no incluye el sistema de reservas en la web ni en el panel de administración**. La estructura de base de datos de reservas se conserva desactivada para poder implementarla más adelante sin rehacer el modelo de datos.

## Cambios incluidos en esta revisión

- Nueva paleta de color más profesional y distinta a la carta original.
- El negocio pasa a presentarse como **Venta** en vez de bar/restaurante.
- En el menú lateral aparece solo **Carta**.
- Se añade la categoría **Postres** en la carta.
- El **menú del día** se organiza en **Primeros**, **Segundos** y **Postres**.
- El menú del día **no muestra precio**.
- El administrador puede añadir, editar o quitar platos del menú del día en cualquiera de esas secciones.
- Se actualiza el contacto con:
  - teléfono `956 71 60 77`
  - enlace a Google Maps
  - horario editable
- La tarjeta de mapa del contacto se puede pulsar para abrir Google Maps.
- El pie de página muestra el año de forma dinámica automáticamente.
- El `seed` crea/actualiza el usuario administrador indicado en `.env`.

## Funcionalidades actuales

### Web pública

- Inicio responsive.
- Navegación lateral en escritorio y menú móvil.
- Menú del día.
- Carta organizada por categorías.
- Categoría de **postres**.
- Precios independientes para **tapa / media ración / plato**.
- Detalle desplegable de cada plato con ingredientes y alérgenos.
- Ofertas del día.
- Contacto con teléfono, dirección, horario y acceso a Google Maps.
- Botón para compartir la web.
- Metadatos SEO/Open Graph.
- `sitemap.xml` y `robots.txt`.

### Panel de administración

Ruta:

```text
/admin/login
```

El administrador puede:

- iniciar sesión mediante correo y contraseña;
- añadir, editar, ocultar y eliminar platos;
- cambiar precios de tapa, media y plato;
- editar ingredientes y alérgenos;
- gestionar el menú del día por secciones;
- gestionar ofertas;
- editar teléfono, dirección, horario, texto de contacto y enlace de Google Maps;
- revisar un resumen del contenido publicado.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript.
- **Backend:** Server Components + Server Actions de Next.js.
- **Base de datos:** PostgreSQL.
- **ORM:** Prisma.
- **Autenticación admin:** JWT en cookie HTTP-only con `jose` + hash `bcryptjs`.
- **Estilos:** CSS responsive propio.
- **Docker:** no se utiliza.

## Puesta en marcha en Visual Studio Code

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear `.env`

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Después edita `.env`:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/el_bujio?schema=public"
AUTH_SECRET="una-clave-aleatoria-larga-de-al-menos-32-caracteres"
ADMIN_EMAIL="admin@elbujio.es"
ADMIN_PASSWORD="CambiaEstaClave123!"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Para generar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"
```

### 3. Preparar la base de datos

```bash
npm run setup
```

Ese comando ejecuta:

- `prisma generate`
- `prisma migrate deploy`
- `tsx prisma/seed.ts`

### 4. Usuario administrador

El `seed` crea o actualiza automáticamente el usuario administrador definido en `.env`.

Por defecto:

```text
Email: admin@elbujio.es
Password: la que pongas en ADMIN_PASSWORD
```

Si quieres volver a recrearlo:

```bash
npm run db:seed
```

### 5. Arrancar el proyecto

```bash
npm run dev
```

Abre en el navegador:

```text
Web pública:          http://localhost:3000
Carta:                http://localhost:3000/carta
Menú del día:         http://localhost:3000/menu-del-dia
Ofertas:              http://localhost:3000/ofertas
Contacto:             http://localhost:3000/contacto
Administración:       http://localhost:3000/admin/login
```

### 6. Comprobar antes de subir a Git

```bash
npm run verify
```

## Estructura principal

```text
el-bujio-web-final/
├── docs/
│   └── RESERVAS_FUTURO.md
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── menu-original.jpg
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── .env.example
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Notas

- La base PostgreSQL mantiene la estructura de reservas solo para una futura fase.
- Los ingredientes y alérgenos cargados inicialmente son orientativos y el administrador puede corregirlos.
- La nueva migración añade la categoría **POSTRES** y la configuración de **Google Maps** y **horario** en contacto.
