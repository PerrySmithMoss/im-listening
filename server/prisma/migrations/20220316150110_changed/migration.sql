/*
  Warnings:

  - Made the column `rating` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Post` MODIFY `rating` DECIMAL(10, 1) NOT NULL,
    MODIFY `previewSongUrl` VARCHAR(255);
