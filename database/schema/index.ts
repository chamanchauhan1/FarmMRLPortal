import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // 'farmer' or 'inspector'
  email: text("email").notNull().unique(),
  farmId: varchar("farm_id"),
});

export const farms = pgTable("farms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  ownerName: text("owner_name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  totalAnimals: integer("total_animals").notNull().default(0),
});

export const animals = pgTable("animals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").notNull(),
  tagNumber: text("tag_number").notNull().unique(),
  name: text("name").notNull(),
  species: text("species").notNull(), // cattle, sheep, goat, pig, poultry
  breed: text("breed"),
  dateOfBirth: text("date_of_birth"),
  weight: decimal("weight"),
  status: text("status").notNull().default("active"), // active, quarantine, sold, deceased
});

export const treatmentRecords = pgTable("treatment_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animalId: varchar("animal_id").notNull(),
  farmId: varchar("farm_id").notNull(),
  medicineName: text("medicine_name").notNull(),
  antimicrobialType: text("antimicrobial_type").notNull(), // penicillin, tetracycline, sulfonamide, etc.
  dosage: text("dosage").notNull(),
  unit: text("unit").notNull(), // mg, ml, g, etc.
  administeredBy: text("administered_by").notNull(),
  administeredDate: text("administered_date").notNull(),
  withdrawalPeriodDays: integer("withdrawal_period_days").notNull(),
  withdrawalEndDate: text("withdrawal_end_date").notNull(),
  purposeOfTreatment: text("purpose_of_treatment").notNull(),
  mrlLevel: decimal("mrl_level"), // measured residue level in ppb
  complianceStatus: text("compliance_status").notNull().default("pending"), // compliant, warning, violation, pending
  notes: text("notes"),
  recordedBy: varchar("recorded_by").notNull(), // user ID
});

export const farmReports = pgTable("farm_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, excel, csv
  fileSize: integer("file_size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  reportType: text("report_type").notNull(), // compliance, inspection, veterinary
  description: text("description"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  email: true,
  farmId: true,
}).extend({
  role: z.enum(["farmer", "inspector"]),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertFarmSchema = createInsertSchema(farms).omit({
  id: true,
  totalAnimals: true,
});

export const insertAnimalSchema = createInsertSchema(animals).omit({
  id: true,
}).extend({
  species: z.enum(["cattle", "sheep", "goat", "pig", "poultry"]),
  status: z.enum(["active", "quarantine", "sold", "deceased"]).optional(),
});

export const insertTreatmentRecordSchema = createInsertSchema(treatmentRecords).omit({
  id: true,
  complianceStatus: true,
}).extend({
  complianceStatus: z.enum(["compliant", "warning", "violation", "pending"]).optional(),
});

export const insertFarmReportSchema = createInsertSchema(farmReports).omit({
  id: true,
  uploadedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farms.$inferSelect;

export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type Animal = typeof animals.$inferSelect;

export type InsertTreatmentRecord = z.infer<typeof insertTreatmentRecordSchema>;
export type TreatmentRecord = typeof treatmentRecords.$inferSelect;

export type InsertFarmReport = z.infer<typeof insertFarmReportSchema>;
export type FarmReport = typeof farmReports.$inferSelect;
