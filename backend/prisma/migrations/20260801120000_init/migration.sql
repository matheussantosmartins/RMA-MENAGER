-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "RmaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_REPAIR', 'REPAIRED', 'REPLACED', 'REFUNDED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RmaPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rmas" (
    "id" TEXT NOT NULL,
    "rmaNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "issueDescription" TEXT NOT NULL,
    "status" "RmaStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "RmaPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolutionNotes" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rma_images" (
    "id" TEXT NOT NULL,
    "rmaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rma_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rma_status_history" (
    "id" TEXT NOT NULL,
    "rmaId" TEXT NOT NULL,
    "fromStatus" "RmaStatus",
    "toStatus" "RmaStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rma_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rmas_rmaNumber_key" ON "rmas"("rmaNumber");

-- CreateIndex
CREATE INDEX "rmas_status_idx" ON "rmas"("status");

-- CreateIndex
CREATE INDEX "rmas_priority_idx" ON "rmas"("priority");

-- CreateIndex
CREATE INDEX "rmas_customerId_idx" ON "rmas"("customerId");

-- CreateIndex
CREATE INDEX "rmas_productId_idx" ON "rmas"("productId");

-- CreateIndex
CREATE INDEX "rmas_createdAt_idx" ON "rmas"("createdAt");

-- CreateIndex
CREATE INDEX "rma_status_history_rmaId_idx" ON "rma_status_history"("rmaId");

-- AddForeignKey
ALTER TABLE "rmas" ADD CONSTRAINT "rmas_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rmas" ADD CONSTRAINT "rmas_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rmas" ADD CONSTRAINT "rmas_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rmas" ADD CONSTRAINT "rmas_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rma_images" ADD CONSTRAINT "rma_images_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rma_status_history" ADD CONSTRAINT "rma_status_history_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rma_status_history" ADD CONSTRAINT "rma_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
