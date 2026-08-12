/*
  Warnings:

  - You are about to drop the column `publicationId` on the `ShoppingCartItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShoppingCartItem" DROP CONSTRAINT "ShoppingCartItem_publicationId_fkey";

-- DropIndex
DROP INDEX "ShoppingCartItem_publicationId_idx";

-- AlterTable
ALTER TABLE "ShoppingCartItem" DROP COLUMN "publicationId";
