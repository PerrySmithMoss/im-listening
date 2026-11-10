ALTER TABLE `Profile` ALTER COLUMN `avatar` DROP DEFAULT;
UPDATE `Profile`
SET `avatar` = NULL
WHERE `avatar` = 'https://im-listening.up.railway.app/images/default-avatar.jpg';
CREATE INDEX `Post_createdAt_id_idx` ON `Post` (`createdAt`, `id`);
