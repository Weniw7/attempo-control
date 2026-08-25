CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_thread_id` text,
	`channel` text DEFAULT 'instagram' NOT NULL,
	`contact_name` text NOT NULL,
	`contact_type` text NOT NULL,
	`supplier_id` integer,
	`last_message` text,
	`summary` text,
	`suggested_reply` text,
	`approval_status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'medium',
	`updated_at` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversations_external_thread_id_unique` ON `conversations` (`external_thread_id`);--> statement-breakpoint
CREATE TABLE `cost_scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`supplier_id` integer,
	`base_garment` real NOT NULL,
	`decoration` real DEFAULT 0,
	`packaging` real DEFAULT 0,
	`freight_and_duties` real DEFAULT 0,
	`fees` real DEFAULT 0,
	`retail_price` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`stage` text DEFAULT 'evaluation' NOT NULL,
	`expected_revenue` real,
	`committed_cost` real,
	`probability` integer,
	`next_action` text,
	`due_date` text,
	`owner_email` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`country` text,
	`website` text,
	`contact_name` text,
	`unit_price` real,
	`currency` text DEFAULT 'EUR',
	`moq` integer,
	`gsm_min` integer,
	`gsm_max` integer,
	`lead_time_days` integer,
	`sample_cost` real,
	`quality_score` integer,
	`risk_score` integer,
	`status` text DEFAULT 'lead' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
