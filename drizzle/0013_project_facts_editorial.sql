ALTER TABLE `projects` ADD `facts_json` text;
--> statement-breakpoint
ALTER TABLE `projects` ADD `sections_json` text;
--> statement-breakpoint
ALTER TABLE `projects` ADD `editorial_status` text DEFAULT 'legacy' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `seo_keyword` text;
