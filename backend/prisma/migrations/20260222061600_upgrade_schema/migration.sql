/*
  Warnings:

  - The values [FINANCIAL_ANALYST] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [DISPATCHED] on the enum `TripStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'DRIVER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'DISPATCHER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TripStatus_new" AS ENUM ('DRAFT', 'PENDING_SAFETY_APPROVAL', 'APPROVED', 'ON_TRIP', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."trips" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "trips" ALTER COLUMN "status" TYPE "TripStatus_new" USING ("status"::text::"TripStatus_new");
ALTER TYPE "TripStatus" RENAME TO "TripStatus_old";
ALTER TYPE "TripStatus_new" RENAME TO "TripStatus";
DROP TYPE "public"."TripStatus_old";
ALTER TABLE "trips" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mustResetPassword" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "delivery_proofs" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "notes" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signatures" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "signatureUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_anomalies" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "expectedFuel" DOUBLE PRECISION NOT NULL,
    "loggedFuel" DOUBLE PRECISION NOT NULL,
    "difference" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_inspections" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "declinedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_alerts" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sos_alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_anomalies" ADD CONSTRAINT "fuel_anomalies_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_inspections" ADD CONSTRAINT "safety_inspections_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
