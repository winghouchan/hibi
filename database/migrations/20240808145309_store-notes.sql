CREATE TABLE `collection_notes` (
	`collection` integer NOT NULL,
	`note` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	PRIMARY KEY(`collection`, `note`),
	FOREIGN KEY (`collection`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` integer NOT NULL,
	`value` blob NOT NULL CHECK (length(`value`) > 0),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL
);