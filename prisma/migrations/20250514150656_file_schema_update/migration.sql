/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientEmail` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderEmail` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_senderId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "expiresAt",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
DROP COLUMN "url",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "recipientEmail" TEXT NOT NULL,
ADD COLUMN     "senderEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_senderEmail_fkey" FOREIGN KEY ("senderEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_recipientEmail_fkey" FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
