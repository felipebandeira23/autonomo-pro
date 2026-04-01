/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CORP_ADMIN', 'UNIT_OPERATOR', 'AUDITOR');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "convenio" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "status" "ProfessionalStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'UNIT_OPERATOR',
ALTER COLUMN "tenantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExternalInssSource" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "competence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalInssSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDeduction" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalAuditLog" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "performedById" TEXT NOT NULL,
    "snapshotMap" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionalAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_code_key" ON "Payment"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalInssSource" ADD CONSTRAINT "ExternalInssSource_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDeduction" ADD CONSTRAINT "LegalDeduction_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalAuditLog" ADD CONSTRAINT "ProfessionalAuditLog_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalAuditLog" ADD CONSTRAINT "ProfessionalAuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
