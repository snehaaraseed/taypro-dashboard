CREATE TABLE `insights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`report_type` text DEFAULT 'category_pulse' NOT NULL,
	`period` text,
	`metrics_json` text DEFAULT '{}' NOT NULL,
	`publish_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `insights_slug_locale_unique` ON `insights` (`slug`,`locale`);
