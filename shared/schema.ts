import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
});

// Suppliers table (fornecedores)
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  document: text("document"), // CPF/CNPJ
  createdAt: timestamp("created_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  isRentable: boolean("is_rentable").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rentals table (locações que EU faço)
export const rentals = pgTable("rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => suppliers.id),
  equipmentName: text("equipment_name").notNull(),
  equipmentType: text("equipment_type"),
  quantity: integer("quantity").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  rentalPeriod: text("rental_period").notNull().default("daily"), // daily, weekly, biweekly, monthly
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, active, completed, overdue, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory movements table
export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  type: text("type").notNull(), // in, out, adjustment
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;

export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// Extended types for frontend
export type RentalWithDetails = Rental & {
  supplier: Supplier;
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type InventoryMovementWithDetails = InventoryMovement & {
  product: Product;
  user: User | null;
};

// Keep customers as alias for backward compatibility during transition
export const customers = suppliers;
export type Customer = Supplier;
export type InsertCustomer = InsertSupplier;
export const insertCustomerSchema = insertSupplierSchema;
