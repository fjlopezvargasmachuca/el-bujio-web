# Reservas — base preparada para una fase futura

La versión actual de la web de **El Bujio** no expone ningún sistema de reservas.

Se han retirado de la aplicación pública y del panel de administración:

- páginas de reserva y cancelación;
- formularios de reserva;
- consulta de disponibilidad;
- endpoints API relacionados con reservas;
- generación del QR de reservas;
- gestión de reservas desde administración;
- ajustes de duración, intervalos y activación de reservas.

## Qué se conserva en PostgreSQL

Para no tener que rediseñar la base de datos cuando el restaurante decida activar esta función, se mantienen en `prisma/schema.prisma`:

- `DiningTable`;
- `Reservation`;
- `Area`;
- `ReservationStatus`;
- `ReservationSource`;
- `SiteSettings.reservationEnabled`;
- `SiteSettings.bookingDurationMinutes`;
- `SiteSettings.slotMinutes`.

La semilla también conserva las 4 mesas exteriores y las 3 interiores que se definieron como ejemplo. El campo `reservationEnabled` se inicializa en `false`.

## Cómo reactivar esta función en el futuro

Cuando se decida implementar reservas se puede trabajar sobre estas tablas sin modificar el resto del CMS de carta, menú, ofertas y contacto. Habrá que volver a añadir la capa de servicio de disponibilidad, las rutas API, la interfaz pública, el panel de administración y, si se desea, el QR.

Antes de activar reservas en producción conviene confirmar con el restaurante:

- número real de mesas;
- capacidad de cada mesa;
- horarios de comida y cena;
- duración media de una reserva;
- tiempo de cortesía;
- política de cancelación;
- si el interior/exterior se elige o se solicita;
- teléfono o email que se pedirá al cliente;
- aviso legal y política de privacidad para esos datos.
