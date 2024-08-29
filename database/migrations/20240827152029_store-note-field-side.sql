ALTER TABLE `note_field` ADD `side` integer NOT NULL CHECK (`side` IN (0, 1));
--> statement-breakpoint
ALTER TABLE `reviewable_field` ADD `side` integer NOT NULL CHECK (`side` IN (0, 1));