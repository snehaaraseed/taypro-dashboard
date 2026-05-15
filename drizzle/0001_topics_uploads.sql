CREATE TABLE IF NOT EXISTS `published_topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`publish_date` text NOT NULL,
	`category` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`file_name` text NOT NULL,
	`file_path` text NOT NULL,
	`mime_type` text,
	`size` integer NOT NULL,
	`uploaded_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `uploads_url_unique` ON `uploads` (`url`);
