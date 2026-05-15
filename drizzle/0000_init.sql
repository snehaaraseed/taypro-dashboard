CREATE TABLE IF NOT EXISTS `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`bio` text NOT NULL,
	`avatar_url` text,
	`linkedin_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `authors_slug_unique` ON `authors` (`slug`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `blogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`featured_image` text DEFAULT '' NOT NULL,
	`author` text DEFAULT 'Taypro Team' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`publish_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `blogs_slug_unique` ON `blogs` (`slug`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`details` text DEFAULT '[]' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `projects_slug_unique` ON `projects` (`slug`);
