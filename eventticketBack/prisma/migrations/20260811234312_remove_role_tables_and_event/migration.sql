/*
  Warnings:

  - You are about to drop the column `eventId` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `ShoppingCart` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Concierge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organizer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `externalEventId` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ShoppingCart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_fkey";

-- DropForeignKey
ALTER TABLE "Concierge" DROP CONSTRAINT "Concierge_userId_fkey";

-- DropForeignKey
ALTER TABLE "Organizer" DROP CONSTRAINT "Organizer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Publication" DROP CONSTRAINT "Publication_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Publication" DROP CONSTRAINT "Publication_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingCart" DROP CONSTRAINT "ShoppingCart_clientId_fkey";

-- DropIndex
DROP INDEX "Publication_eventId_idx";

-- DropIndex
DROP INDEX "Publication_organizerId_idx";

-- DropIndex
DROP INDEX "ShoppingCart_clientId_idx";

-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "eventId",
DROP COLUMN "organizerId",
ADD COLUMN     "externalEventId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShoppingCart" DROP COLUMN "clientId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Concierge";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Organizer";

-- CreateIndex
CREATE INDEX "Publication_userId_idx" ON "Publication"("userId");

-- CreateIndex
CREATE INDEX "Publication_externalEventId_idx" ON "Publication"("externalEventId");

-- CreateIndex
CREATE INDEX "ShoppingCart_userId_idx" ON "ShoppingCart"("userId");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
