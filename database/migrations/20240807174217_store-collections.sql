CREATE TABLE `collection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL CHECK (`name` != ''),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL
);