CREATE TABLE `day_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`gap_reason` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `day_logs_journey_day_uniq` ON `day_logs` (`journey_id`,`day_number`);--> statement-breakpoint
CREATE TABLE `journeys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`calendar_type` text NOT NULL,
	`start_input` text NOT NULL,
	`end_input` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`total_days` integer NOT NULL,
	`deadline_label` text,
	`deadline_date` text,
	`closing_note` text,
	`completion_shown_at` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE TABLE `milestones_seen` (
	`journey_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`shown_at` text NOT NULL,
	PRIMARY KEY(`journey_id`, `day_number`),
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`task_id` text NOT NULL,
	`day_number` integer NOT NULL,
	`completed_at` text NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_completions_task_day_uniq` ON `task_completions` (`task_id`,`day_number`);--> statement-breakpoint
CREATE INDEX `task_completions_journey_day_idx` ON `task_completions` (`journey_id`,`day_number`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`kind` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active_from_day` integer DEFAULT 1 NOT NULL,
	`active_to_day` integer,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tasks_journey_id_idx` ON `tasks` (`journey_id`);