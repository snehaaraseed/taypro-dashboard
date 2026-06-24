ALTER TABLE `projects` ADD `codename` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_codename_en_unique` ON `projects` (`codename`) WHERE `locale` = 'en' AND `codename` IS NOT NULL;
