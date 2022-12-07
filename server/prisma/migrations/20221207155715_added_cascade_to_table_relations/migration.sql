-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `post_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `profile_ibfk_1`;

-- DropForeignKey
ALTER TABLE `SongGenre` DROP FOREIGN KEY `songgenre_ibfk_1`;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SongGenre` ADD CONSTRAINT `SongGenre_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Profile` RENAME INDEX `Profile.userId_unique` TO `Profile_userId_key`;

-- RenameIndex
ALTER TABLE `User` RENAME INDEX `User.email_unique` TO `User_email_key`;

-- RenameIndex
ALTER TABLE `User` RENAME INDEX `User.username_unique` TO `User_username_key`;
