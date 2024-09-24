CREATE TABLE `collection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL CHECK (`name` != ''),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_notes` (
	`collection` integer NOT NULL,
	`note` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	PRIMARY KEY(`collection`, `note`),
	FOREIGN KEY (`collection`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `note` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_reversible` integer DEFAULT false NOT NULL,
	`is_separable` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `note_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` integer NOT NULL,
	`value` blob NOT NULL CHECK (length(`value`) > 0),
	`hash` text NOT NULL CHECK (length(`hash`) = 44),
	`side` integer NOT NULL CHECK (`side` IN (0, 1)),
	`position` integer NOT NULL CHECK (`position` >= 0),
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`rating` integer NOT NULL CHECK (`rating` IN (0, 1, 2, 3, 4)),
	`duration` integer NOT NULL CHECK (`duration` > 0),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	`is_due_fuzzed` integer NOT NULL CHECK (`is_due_fuzzed` IN (true, false)),
	`is_learning_enabled` integer NOT NULL CHECK (`is_learning_enabled` IN (true, false)),
	`max_interval` integer NOT NULL CHECK (`max_interval` > 0),
	`retention` integer NOT NULL CHECK (
		`retention` >= 0
		AND `retention` <= 100
	),
	/**
	 * There are 19 components to the weight parameter passed to FSRS
	 * See: https://github.com/open-spaced-repetition/ts-fsrs/blob/65fd676414e23e21612b5344af947480f7dafa7e/src/fsrs/default.ts#L6-L10
	 */
	`weights` text NOT NULL CHECK (json_array_length(`weights`) >= 19),
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviewable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` integer NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviewable_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`field` integer NOT NULL,
	`side` integer NOT NULL CHECK (`side` IN (0, 1)),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`field`) REFERENCES `note_field`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviewable_snapshot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`review` integer NOT NULL,
	`difficulty` real NOT NULL CHECK (`difficulty` > 0),
	`due` integer NOT NULL,
	`stability` real NOT NULL CHECK (`stability` > 0),
	`state` integer NOT NULL CHECK (`state` IN (0, 1, 2, 3)),
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`review`) REFERENCES `review`(`id`) ON UPDATE no action ON DELETE no action
);