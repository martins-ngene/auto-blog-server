/*
  Warnings:

  - You are about to drop the column `introduction` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_postId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "introduction",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "Section";
