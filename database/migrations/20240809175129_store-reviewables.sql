CREATE TABLE `reviewable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviewable_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`field` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`field`) REFERENCES `note_field`(`id`) ON UPDATE no action ON DELETE no action
);