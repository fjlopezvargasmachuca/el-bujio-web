-- CreateEnum
CREATE TYPE "Area" AS ENUM ('INTERIOR', 'EXTERIOR');
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED');
CREATE TYPE "ReservationSource" AS ENUM ('PUBLIC', 'ADMIN');
CREATE TYPE "MenuCategory" AS ENUM ('ENTRANTES', 'PESCADO', 'CARNES', 'BOCADILLOS', 'OTROS');
CREATE TYPE "SpecialType" AS ENUM ('MENU_DIA', 'OFERTA');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "restaurantName" TEXT NOT NULL DEFAULT 'El Bujio',
    "phone" TEXT NOT NULL DEFAULT '+34 900 000 000',
    "address" TEXT NOT NULL DEFAULT 'Edita la dirección desde administración',
    "contactText" TEXT NOT NULL DEFAULT 'Reserva tu mesa o llámanos para cualquier consulta.',
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "reservationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingDurationMinutes" INTEGER NOT NULL DEFAULT 90,
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiningTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" "Area" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DiningTable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "area" "Area" NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "source" "ReservationSource" NOT NULL DEFAULT 'PUBLIC',
    "notes" TEXT,
    "publicCode" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "MenuCategory" NOT NULL,
    "ingredients" TEXT[],
    "allergens" TEXT[],
    "priceTapaCents" INTEGER,
    "priceMediaCents" INTEGER,
    "pricePlatoCents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpecialItem" (
    "id" TEXT NOT NULL,
    "type" "SpecialType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "section" TEXT,
    "priceCents" INTEGER,
    "ingredients" TEXT[],
    "allergens" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SpecialItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "DiningTable_name_key" ON "DiningTable"("name");
CREATE INDEX "DiningTable_area_active_idx" ON "DiningTable"("area", "active");
CREATE UNIQUE INDEX "Reservation_publicCode_key" ON "Reservation"("publicCode");
CREATE INDEX "Reservation_dateKey_area_status_idx" ON "Reservation"("dateKey", "area", "status");
CREATE INDEX "Reservation_tableId_dateKey_status_idx" ON "Reservation"("tableId", "dateKey", "status");
CREATE INDEX "MenuItem_category_active_sortOrder_idx" ON "MenuItem"("category", "active", "sortOrder");
CREATE INDEX "SpecialItem_type_active_sortOrder_idx" ON "SpecialItem"("type", "active", "sortOrder");

-- Foreign key
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
