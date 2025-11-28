import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const hospital = pgTable("hospital", {
	hospital_id: serial("hospital_id").primaryKey(),
	name: text("name"),
	area_id: integer("area_id"),
	specializations: text("specializations"),
	map_location: text("map_location"),
	address: text("address"),
	latitude: text("latitude"),
	longitude: text("longitude"),
	contact_number: text("contact_number"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const staff_schedules = pgTable("staff_schedules", {
	schedule_id: serial("schedule_id").primaryKey(),
	hospital_id: integer("hospital_id").references(() => hospital.hospital_id),
	role: text("role"),
	staff_name: text("staff_name"),
	specializations: text("specializations"),
	shift_start: timestamp("shift_start"),
	shift_end: timestamp("shift_e nd"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

export const hospital_inventory = pgTable("hospital_inventory", {
	inventory_id: serial("inventory_id").primaryKey(),
	hospital_id: integer("hospital_id").references(() => hospital.hospital_id),
	supply_type: text("supply_type"),
	stock_level: integer("stock_level"),
	avg_daily_use: integer("avg_daily_use"),
	reorder_threshold: integer("reorder_threshold"),
	last_updated: timestamp("last_updated"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

// TODO: add supplement table
