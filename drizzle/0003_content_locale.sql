-- Per-locale CMS rows (same slug, different locale)
ALTER TABLE `blogs` ADD COLUMN `locale` text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD COLUMN `locale` text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
DROP INDEX IF EXISTS `blogs_slug_unique`;
--> statement-breakpoint
DROP INDEX IF EXISTS `projects_slug_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `blogs_slug_locale_unique` ON `blogs` (`slug`, `locale`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `projects_slug_locale_unique` ON `projects` (`slug`, `locale`);
