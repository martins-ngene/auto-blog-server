/*
  Warnings:

  - You are about to drop the column `organizer_email` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Post_organizer_email_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "organizer_email";
