import { type User, type InsertUser, type Supplier, type InsertSupplier, type Category, type InsertCategory, type Product, type InsertProduct, type Rental, type InsertRental, type InventoryMovement, type InsertInventoryMovement, type RentalWithDetails, type ProductWithCategory, type InventoryMovementWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Suppliers (fornecedores)
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getProducts(): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]>;
  getLowStockProducts(): Promise<ProductWithCategory[]>;

  // Rentals
  getRentals(): Promise<RentalWithDetails[]>;
  getRental(id: string): Promise<RentalWithDetails | undefined>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: string, rental: Partial<InsertRental>): Promise<Rental | undefined>;
  deleteRental(id: string): Promise<boolean>;
  getActiveRentals(): Promise<RentalWithDetails[]>;
  getOverdueRentals(): Promise<RentalWithDetails[]>;

  // Inventory Movements
  getInventoryMovements(): Promise<InventoryMovementWithDetails[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovementsByProduct(productId: string): Promise<InventoryMovementWithDetails[]>;

  // Dashboard
  getDashboardStats(): Promise<{
    activeRentals: number;
    monthlyRevenue: number;
    productsInStock: number;
    lowStockItems: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suppliers: Map<string, Supplier>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private rentals: Map<string, Rental>;
  private inventoryMovements: Map<string, InventoryMovement>;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.rentals = new Map();
    this.inventoryMovements = new Map();
    
    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Create default categories
    const toolsCategory: Category = {
      id: "cat-tools",
      name: "Ferramentas",
      description: "Ferramentas e equipamentos diversos"
    };
    
    const fixingCategory: Category = {
      id: "cat-fixing",
      name: "Fixação",
      description: "Parafusos, porcas e materiais de fixação"
    };
    
    this.categories.set(toolsCategory.id, toolsCategory);
    this.categories.set(fixingCategory.id, fixingCategory);

    // Create default products
    const drill: Product = {
      id: "prod-drill",
      code: "FI-001",
      name: "Furadeira Industrial",
      description: "Makita 18V",
      categoryId: toolsCategory.id,
      unitPrice: "450.00",
      quantity: 15,
      minStock: 5,
      isRentable: true,
      createdAt: new Date()
    };

    const screws: Product = {
      id: "prod-screws",
      code: "PF-M8-001",
      name: "Parafusos M8",
      description: "Aço Inox 30mm",
      categoryId: fixingCategory.id,
      unitPrice: "2.50",
      quantity: 12,
      minStock: 50,
      isRentable: false,
      createdAt: new Date()
    };

    this.products.set(drill.id, drill);
    this.products.set(screws.id, screws);

    // Create default supplier (fornecedor)
    const supplier: Supplier = {
      id: "supp-001",
      name: "Locadora ABC Equipamentos",
      email: "contato@locadoraabc.com",
      phone: "(11) 3333-4444",
      address: "Av. Industrial, 500",
      document: "12.345.678/0001-90",
      createdAt: new Date()
    };

    this.suppliers.set(supplier.id, supplier);

    // Create default rental (locação que EU faço)
    const rental: Rental = {
      id: "rent-001",
      supplierId: supplier.id,
      equipmentName: "Escavadeira Hidráulica",
      equipmentType: "Máquina Pesada",
      quantity: 1,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-20"),
      dailyRate: "350.00",
      totalAmount: "1750.00",
      status: "active",
      notes: "Para obra de terraplanagem",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rentals.set(rental.id, rental);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: insertUser.role || "user" };
    this.users.set(id, user);
    return user;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id, 
      createdAt: new Date(),
      phone: insertSupplier.phone || null,
      address: insertSupplier.address || null,
      document: insertSupplier.document || null
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...supplier };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Backward compatibility
  async getCustomers(): Promise<Supplier[]> {
    return this.getSuppliers();
  }

  async getCustomer(id: string): Promise<Supplier | undefined> {
    return this.getSupplier(id);
  }

  async createCustomer(insertCustomer: InsertSupplier): Promise<Supplier> {
    return this.createSupplier(insertCustomer);
  }

  async updateCustomer(id: string, customer: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    return this.updateSupplier(id, customer);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.deleteSupplier(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getProducts(): Promise<ProductWithCategory[]> {
    const products = Array.from(this.products.values());
    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date(),
      description: insertProduct.description || null,
      categoryId: insertProduct.categoryId || null,
      quantity: insertProduct.quantity || 0,
      minStock: insertProduct.minStock || 0,
      isRentable: insertProduct.isRentable ?? true
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    const products = await this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  async getLowStockProducts(): Promise<ProductWithCategory[]> {
    const products = await this.getProducts();
    return products.filter(product => product.quantity <= product.minStock);
  }

  async getRentals(): Promise<RentalWithDetails[]> {
    const rentals = Array.from(this.rentals.values());
    return rentals.map(rental => ({
      ...rental,
      supplier: this.suppliers.get(rental.supplierId)!
    }));
  }

  async getRental(id: string): Promise<RentalWithDetails | undefined> {
    const rental = this.rentals.get(id);
    if (!rental) return undefined;
    
    return {
      ...rental,
      supplier: this.suppliers.get(rental.supplierId)!
    };
  }

  async createRental(insertRental: InsertRental): Promise<Rental> {
    const id = randomUUID();
    const rental: Rental = { 
      ...insertRental, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date(),
      status: insertRental.status || "pending",
      notes: insertRental.notes || null
    };
    this.rentals.set(id, rental);
    return rental;
  }

  async updateRental(id: string, rental: Partial<InsertRental>): Promise<Rental | undefined> {
    const existing = this.rentals.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...rental, updatedAt: new Date() };
    this.rentals.set(id, updated);
    return updated;
  }

  async deleteRental(id: string): Promise<boolean> {
    return this.rentals.delete(id);
  }

  async getActiveRentals(): Promise<RentalWithDetails[]> {
    const rentals = await this.getRentals();
    return rentals.filter(rental => rental.status === "active");
  }

  async getOverdueRentals(): Promise<RentalWithDetails[]> {
    const rentals = await this.getRentals();
    const now = new Date();
    return rentals.filter(rental => 
      rental.status === "active" && new Date(rental.endDate) < now
    );
  }

  async getInventoryMovements(): Promise<InventoryMovementWithDetails[]> {
    const movements = Array.from(this.inventoryMovements.values());
    return movements.map(movement => ({
      ...movement,
      product: this.products.get(movement.productId)!,
      user: movement.userId ? this.users.get(movement.userId) || null : null
    }));
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const id = randomUUID();
    const movement: InventoryMovement = { 
      ...insertMovement, 
      id, 
      createdAt: new Date(),
      notes: insertMovement.notes || null,
      userId: insertMovement.userId || null
    };
    this.inventoryMovements.set(id, movement);
    
    // Update product quantity
    const product = this.products.get(insertMovement.productId);
    if (product) {
      const quantityChange = insertMovement.type === "in" ? insertMovement.quantity : -insertMovement.quantity;
      product.quantity += quantityChange;
      this.products.set(product.id, product);
    }
    
    return movement;
  }

  async getInventoryMovementsByProduct(productId: string): Promise<InventoryMovementWithDetails[]> {
    const movements = await this.getInventoryMovements();
    return movements.filter(movement => movement.productId === productId);
  }

  async getDashboardStats(): Promise<{
    activeRentals: number;
    monthlyRevenue: number;
    productsInStock: number;
    lowStockItems: number;
  }> {
    const activeRentals = await this.getActiveRentals();
    const products = await this.getProducts();
    const lowStockProducts = await this.getLowStockProducts();
    
    // Calculate monthly revenue from active rentals
    const monthlyRevenue = activeRentals.reduce((total, rental) => {
      return total + parseFloat(rental.totalAmount);
    }, 0);
    
    return {
      activeRentals: activeRentals.length,
      monthlyRevenue,
      productsInStock: products.reduce((total, product) => total + product.quantity, 0),
      lowStockItems: lowStockProducts.length
    };
  }
}

export const storage = new MemStorage();
