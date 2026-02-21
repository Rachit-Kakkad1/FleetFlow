/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `expenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `maintenance_logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `trips` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `drivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `maintenance_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "maintenance_logs" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "technician" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "drivers_code_key" ON "drivers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_code_key" ON "expenses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_logs_code_key" ON "maintenance_logs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trips_code_key" ON "trips"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_code_key" ON "vehicles"("code");
