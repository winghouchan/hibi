create table `collection` (
  `id` integer primary key autoincrement not null,
  `name` text not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  constraint "collection_name_not_empty_string"
    check ("collection"."name" != '')
);
-- > statement-breakpoint
create table `collection_notes` (
  `collection` integer not null,
  `note` integer not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  primary key (`collection`, `note`),
  foreign key (`collection`) references `collection` (`id`)
    on update no action
    on delete no action,
  foreign key (`note`) references `note` (`id`)
    on update no action
    on delete no action
);
-- > statement-breakpoint
create table `note` (
  `id` integer primary key autoincrement not null,
  `is_reversible` integer default false not null,
  `is_separable` integer default false not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null
);
-- > statement-breakpoint
create table `note_field` (
  `id` integer primary key autoincrement not null,
  `note` integer not null,
  `value` blob not null,
  `hash` text not null,
  `side` integer not null,
  `position` integer not null,
  `is_archived` integer default false not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  foreign key (`note`) references `note` (`id`)
    on update no action
    on delete no action,
  constraint "note_field_value_not_empty"
    check (length("note_field"."value") > 0),
  constraint "note_field_hash_length" check (length("note_field"."hash") = 44),
  constraint "note_field_side_is_valid" check ("note_field"."side" in (0, 1)),
  constraint "note_field_position_is_not_negative"
    check ("note_field"."position" >= 0),
  constraint "note_field_archived_is_boolean"
    check ("note_field"."is_archived" in (true, false))
);
-- > statement-breakpoint
create table `review` (
  `id` integer primary key autoincrement not null,
  `reviewable` integer not null,
  `rating` integer not null,
  `duration` integer not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  `created_at_offset` text default (
    replace(
      replace(
        timediff(datetime('now', 'localtime'), datetime('now')),
        '0000-00-00 ',
        ''
      ),
      ':00.000',
      ''
    )
  ) not null,
  `is_due_fuzzed` integer not null,
  `is_learning_enabled` integer not null,
  `max_interval` integer not null,
  `retention` integer not null,
  `weights` text not null,
  foreign key (`reviewable`) references `reviewable` (`id`)
    on update no action
    on delete no action,
  constraint "review_created_at_offset_is_valid"
    check (
      glob('[+-][0-1][0-9]:[0-5][0-9]', "review"."created_at_offset")
      or glob('[+-]2[0-3]:[0-5][0-9]', "review"."created_at_offset")
    ),
  constraint "review_rating_is_valid"
    check ("review"."rating" in (0, 1, 2, 3, 4)),
  constraint "review_duration_greater_than_zero"
    check ("review"."duration" > 0),
  constraint "review_is_due_fuzzed_is_boolean"
    check ("review"."is_due_fuzzed" in (true, false)),
  constraint "review_is_learning_enabled_is_boolean"
    check ("review"."is_learning_enabled" in (true, false)),
  constraint "review_max_interval_greater_than_zero"
    check ("review"."max_interval" > 0),
  constraint "review_retention_in_range"
    check ("review"."retention" >= 0 and "review"."retention" <= 100),
  constraint "review_weights_is_valid"
    check (json_array_length("review"."weights") >= 19)
);
-- > statement-breakpoint
create table `reviewable` (
  `id` integer primary key autoincrement not null,
  `note` integer not null,
  `is_archived` integer default false not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  foreign key (`note`) references `note` (`id`)
    on update no action
    on delete no action,
  constraint "reviewable_archived_is_boolean"
    check ("reviewable"."is_archived" in (true, false))
);
-- > statement-breakpoint
create table `reviewable_field` (
  `id` integer primary key autoincrement not null,
  `reviewable` integer not null,
  `field` integer not null,
  `side` integer not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  foreign key (`reviewable`) references `reviewable` (`id`)
    on update no action
    on delete no action,
  foreign key (`field`) references `note_field` (`id`)
    on update no action
    on delete no action,
  constraint "reviewable_field_side_is_valid"
    check ("reviewable_field"."side" in (0, 1))
);
-- > statement-breakpoint
create index `index_reviewable_field_reviewable` on `reviewable_field` (
  `reviewable`
); -- > statement-breakpoint
create table `reviewable_snapshot` (
  `id` integer primary key autoincrement not null,
  `reviewable` integer not null,
  `review` integer not null,
  `difficulty` real not null,
  `due` integer not null,
  `stability` real not null,
  `state` integer not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  foreign key (`reviewable`) references `reviewable` (`id`)
    on update no action
    on delete no action,
  foreign key (`review`) references `review` (`id`)
    on update no action
    on delete no action,
  constraint "reviewable_snapshot_difficulty_greater_than_zero"
    check ("reviewable_snapshot"."difficulty" > 0),
  constraint "reviewable_snapshot_stability_greater_than_zero"
    check ("reviewable_snapshot"."stability" > 0),
  constraint "reviewable_snapshot_state_is_valid"
    check ("reviewable_snapshot"."state" in (0, 1, 2, 3))
);
-- > statement-breakpoint
create index `index_reviewable_snapshot_reviewable` on `reviewable_snapshot` (
  `reviewable`
); -- > statement-breakpoint
create table `user` (
  `id` integer primary key autoincrement not null,
  `created_at` integer default (unixepoch('now', 'subsec') * 1000) not null,
  `is_onboarded` integer default false not null
);
