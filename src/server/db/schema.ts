import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	pgEnum,
	real,
} from "drizzle-orm/pg-core";

// Define ENUMs first
export const severityLevelEnum = pgEnum("severity_level", [
	"Low",
	"Medium",
	"High",
	"Critical",
]);

// Define tables in dependency order (no forward references)
// export const crisis = pgTable("crisis", {
// 	crisis_id: serial("crisis_id").primaryKey(),
// 	crisis_name: text("crisis_name").notNull(),
// 	crisis_tag: text("crisis_tag"),
// 	description: text("description"),
// 	severity_level: severityLevelEnum("severity_level"),
// 	created_at: timestamp("created_at").defaultNow(),
// 	updated_at: timestamp("updated_at").defaultNow(),
// });

// export const disease = pgTable("disease", {
// 	disease_id: serial("disease_id").primaryKey(),
// 	crisis_id: integer("crisis_id").references(() => crisis.crisis_id),
// 	disease_name: text("disease_name").notNull(),
// 	description: text("description"),
// 	severity_level: severityLevelEnum("severity_level"),
// 	symptoms: text("symptoms"),
// 	common_causes: text("common_causes"),
// 	peak_months: text("peak_months"),
// 	created_at: timestamp("created_at").defaultNow(),
// 	updated_at: timestamp("updated_at").defaultNow(),
// });

export const supplement = pgTable("supplement", {
	supplement_id: serial("supplement_id").primaryKey(),
	disease_id: integer("disease_id").references(() => disease.disease_id),
	supplement_name: text("supplement_name").notNull(),
	unit: text("unit"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const hospital = pgTable("hospital", {
	hospital_id: serial("hospital_id").primaryKey(),
	name: text("name").notNull(),
	area_id: integer("area_id"), // Note: No area table defined - consider adding if needed
	specializations: text("specializations"),
	map_location: text("map_location"),
	address: text("address"),
	latitude: real("latitude"), // Changed from text to real for numeric precision
	longitude: real("longitude"), // Changed from text to real for numeric precision
	contact_number: text("contact_number"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const staff_schedule = pgTable("staff_schedule", {
	schedule_id: serial("schedule_id").primaryKey(),
	hospital_id: integer("hospital_id")
		.notNull()
		.references(() => hospital.hospital_id),
	role: text("role"),
	staff_name: text("staff_name"),
	specializations: text("specializations"),
	shift_start: timestamp("shift_start"),
	shift_end: timestamp("shift_end"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const hospital_inventory = pgTable("hospital_inventory", {
	inventory_id: serial("inventory_id").primaryKey(),
	hospital_id: integer("hospital_id")
		.notNull()
		.references(() => hospital.hospital_id),
	supplement_id: integer("supplement_id")
		.notNull()
		.references(() => supplement.supplement_id),
	supply_type: text("supply_type"),
	stock_level: integer("stock_level"),
	reorder_threshold: integer("reorder_threshold"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});


// Define the PostgreSQL ENUM for user roles
export const userRoleEnum = pgEnum("user_role", [
	"Management",
	"Doctor",
	"Nurse",
	"Inventory Manager",
	"SysAdmin",
]);

// Users table
export const users = pgTable("users", {
	user_id: serial("user_id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	// ENUM role column
	role: userRoleEnum("role").notNull(),
	// Optional: Link user to hospital if users belong to specific hospitals
	hospital_id: integer("hospital_id").references(() => hospital.hospital_id),
	// Permissions stored as CSV string
	permissions: text("permissions").notNull(),
	// example:
	// "view_dashboard,manage_users,manage_inventory,view_reports"
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});



