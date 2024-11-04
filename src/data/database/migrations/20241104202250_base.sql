CREATE TABLE `collection` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	CONSTRAINT "collection_name_not_empty_string" CHECK("collection"."name" != '')
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
	`value` blob NOT NULL,
	`hash` text NOT NULL,
	`side` integer NOT NULL,
	`position` integer NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "note_field_value_not_empty" CHECK(length("note_field"."value") > 0),
	CONSTRAINT "note_field_hash_length" CHECK(length("note_field"."hash") = 44),
	CONSTRAINT "note_field_side_is_valid" CHECK("note_field"."side" IN (0, 1)),
	CONSTRAINT "note_field_position_is_not_negative" CHECK("note_field"."position" >= 0),
	CONSTRAINT "note_field_archived_is_boolean" CHECK("note_field"."is_archived" IN (true, false))
);
--> statement-breakpoint
CREATE TABLE `review` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`rating` integer NOT NULL,
	`duration` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	`is_due_fuzzed` integer NOT NULL,
	`is_learning_enabled` integer NOT NULL,
	`max_interval` integer NOT NULL,
	`retention` integer NOT NULL,
	`weights` text NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "review_rating_is_valid" CHECK("review"."rating" IN (0, 1, 2, 3, 4)),
	CONSTRAINT "review_duration_greater_than_zero" CHECK("review"."duration" > 0),
	CONSTRAINT "review_is_due_fuzzed_is_boolean" CHECK("review"."is_due_fuzzed" IN (true, false)),
	CONSTRAINT "review_is_learning_enabled_is_boolean" CHECK("review"."is_learning_enabled" IN (true, false)),
	CONSTRAINT "review_max_interval_greater_than_zero" CHECK("review"."max_interval" > 0),
	CONSTRAINT "review_retention_in_range" CHECK("review"."retention" >= 0 AND "review"."retention" <= 100),
	CONSTRAINT "review_weights_is_valid" CHECK(json_array_length("review"."weights") >= 19)
);
--> statement-breakpoint
CREATE TABLE `reviewable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note` integer NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`note`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reviewable_archived_is_boolean" CHECK("reviewable"."is_archived" IN (true, false))
);
--> statement-breakpoint
CREATE TABLE `reviewable_field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`field` integer NOT NULL,
	`side` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`field`) REFERENCES `note_field`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reviewable_field_side_is_valid" CHECK("reviewable_field"."side" IN (0, 1))
);
--> statement-breakpoint
CREATE TABLE `reviewable_snapshot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reviewable` integer NOT NULL,
	`review` integer NOT NULL,
	`difficulty` real NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`state` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	FOREIGN KEY (`reviewable`) REFERENCES `reviewable`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`review`) REFERENCES `review`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "reviewable_snapshot_difficulty_greater_than_zero" CHECK("reviewable_snapshot"."difficulty" > 0),
	CONSTRAINT "reviewable_snapshot_stability_greater_than_zero" CHECK("reviewable_snapshot"."stability" > 0),
	CONSTRAINT "reviewable_snapshot_state_is_valid" CHECK("reviewable_snapshot"."state" IN (0, 1, 2, 3))
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now', 'subsec') * 1000) NOT NULL,
	`is_onboarded` integer DEFAULT false NOT NULL
);
