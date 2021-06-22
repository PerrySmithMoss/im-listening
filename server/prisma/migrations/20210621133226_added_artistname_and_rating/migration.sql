/*
  Warnings:

  - Added the required column `artistName` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `artistName` VARCHAR(255) NOT NULL,
    ADD COLUMN `rating` INTEGER NOT NULL,
    MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `firstName` VARCHAR(191) NOT NULL,
    MODIFY `lastName` VARCHAR(191) NOT NULL,
    MODIFY `username` VARCHAR(191) NOT NULL;
