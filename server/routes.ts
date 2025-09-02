import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupplierSchema, insertCategorySchema, insertProductSchema, insertRentalSchema, insertInventoryMovementSchema } from "@shared/schema";
import { eq, desc, asc, like, and, gte, lte, sql, count, inArray } from "drizzle-orm";
import { rentals, suppliers } from "@shared/schema";
import { db } from "../shared/db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Supplier routes (fornecedores)
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const success = await storage.deleteSupplier(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Backward compatibility - keep customer routes working
  app.get("/api/customers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Rental routes
  app.get("/api/rentals", async (req, res) => {
    try {
      const allRentals = await db
        .select({
          id: rentals.id,
          supplierId: rentals.supplierId,
          equipmentName: rentals.equipmentName,
          equipmentType: rentals.equipmentType,
          quantity: rentals.quantity,
          startDate: rentals.startDate,
          endDate: rentals.endDate,
          dailyRate: rentals.dailyRate,
          totalAmount: rentals.totalAmount,
          status: rentals.status,
          notes: rentals.notes,
          createdAt: rentals.createdAt,
          supplier: {
            id: suppliers.id,
            name: suppliers.name,
            email: suppliers.email,
            phone: suppliers.phone,
          },
        })
        .from(rentals)
        .leftJoin(suppliers, eq(rentals.supplierId, suppliers.id))
        .orderBy(desc(rentals.createdAt));

      res.json(allRentals);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      res.status(500).json({ error: "Failed to fetch rentals" });
    }
  });

  app.get("/api/rentals/active", async (req, res) => {
    try {
      const rentals = await storage.getActiveRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active rentals" });
    }
  });

  app.get("/api/rentals/overdue", async (req, res) => {
    try {
      const rentals = await storage.getOverdueRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overdue rentals" });
    }
  });

  app.get("/api/rentals/:id", async (req, res) => {
    try {
      const rental = await storage.getRental(req.params.id);
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      res.json(rental);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rental" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const validatedData = insertRentalSchema.parse(req.body);
      const rental = await storage.createRental(validatedData);
      res.status(201).json(rental);
    } catch (error) {
      res.status(400).json({ message: "Invalid rental data" });
    }
  });

  app.put("/api/rentals/:id", async (req, res) => {
    try {
      const validatedData = insertRentalSchema.partial().parse(req.body);
      const rental = await storage.updateRental(req.params.id, validatedData);
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      res.json(rental);
    } catch (error) {
      res.status(400).json({ message: "Invalid rental data" });
    }
  });

  app.delete("/api/rentals/:id", async (req, res) => {
    try {
      const success = await storage.deleteRental(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Rental not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rental" });
    }
  });

  // Endpoint to handle equipment returns
  app.post("/api/rentals/return", async (req, res) => {
    try {
      const { supplierName, items } = req.body;

      if (!supplierName || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Dados inválidos para devolução" });
      }

      // Update rental status to completed
      await db
        .update(rentals)
        .set({ 
          status: "completed",
          updatedAt: new Date()
        })
        .where(
          and(
            inArray(rentals.id, items),
            eq(rentals.status, "active")
          )
        );

      res.json({ 
        success: true, 
        message: `${items.length} equipamento(s) devolvido(s) para ${supplierName}` 
      });
    } catch (error) {
      console.error("Error returning equipment:", error);
      res.status(500).json({ error: "Falha ao devolver equipamentos" });
    }
  });

  // Rental renewal endpoint
  app.put("/api/rentals/:id/renew", async (req, res) => {
    try {
      const { newEndDate, additionalDays } = req.body;
      const rentalId = req.params.id;

      let calculatedEndDate = newEndDate;
      if (additionalDays && !newEndDate) {
        const currentRental = await db.select().from(rentals).where(eq(rentals.id, rentalId)).limit(1);
        if (currentRental.length > 0) {
          const currentEndDate = new Date(currentRental[0].endDate);
          currentEndDate.setDate(currentEndDate.getDate() + additionalDays);
          calculatedEndDate = currentEndDate.toISOString();
        }
      }

      await db
        .update(rentals)
        .set({ 
          endDate: new Date(calculatedEndDate),
          updatedAt: new Date()
        })
        .where(eq(rentals.id, rentalId));

      res.json({ success: true, message: "Locação renovada com sucesso" });
    } catch (error) {
      console.error("Error renewing rental:", error);
      res.status(500).json({ error: "Falha ao renovar locação" });
    }
  });

  // Generate rental contract PDF
  app.get("/api/rentals/:id/contract", async (req, res) => {
    try {
      const rentalId = req.params.id;
      
      // Get rental with supplier details
      const rentalData = await db
        .select({
          rental: rentals,
          supplier: suppliers,
        })
        .from(rentals)
        .leftJoin(suppliers, eq(rentals.supplierId, suppliers.id))
        .where(eq(rentals.id, rentalId))
        .limit(1);

      if (rentalData.length === 0) {
        return res.status(404).json({ error: "Locação não encontrada" });
      }

      // Generate simple PDF contract (mock implementation)
      const contractData = `
CONTRATO DE LOCAÇÃO

Locador: ${rentalData[0].supplier.name}
Equipamento: ${rentalData[0].rental.equipmentName}
Data Início: ${rentalData[0].rental.startDate}
Data Fim: ${rentalData[0].rental.endDate}
Valor Total: R$ ${rentalData[0].rental.totalAmount}

Assinatura: _________________________
      `;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=contrato-locacao.pdf');
      res.send(Buffer.from(contractData));
    } catch (error) {
      console.error("Error generating contract:", error);
      res.status(500).json({ error: "Falha ao gerar contrato" });
    }
  });

  // Update rental notes
  app.put("/api/rentals/:id/notes", async (req, res) => {
    try {
      const { notes } = req.body;
      const rentalId = req.params.id;

      await db
        .update(rentals)
        .set({ 
          notes,
          updatedAt: new Date()
        })
        .where(eq(rentals.id, rentalId));

      res.json({ success: true, message: "Anotações atualizadas" });
    } catch (error) {
      console.error("Error updating notes:", error);
      res.status(500).json({ error: "Falha ao atualizar anotações" });
    }
  });

  // Bulk cancel rentals
  app.post("/api/rentals/bulk-cancel", async (req, res) => {
    try {
      const { rentalIds } = req.body;

      if (!rentalIds || !Array.isArray(rentalIds)) {
        return res.status(400).json({ error: "IDs de locação inválidos" });
      }

      await db
        .update(rentals)
        .set({ 
          status: "cancelled",
          updatedAt: new Date()
        })
        .where(inArray(rentals.id, rentalIds));

      res.json({ 
        success: true, 
        message: `${rentalIds.length} locação(ões) cancelada(s)` 
      });
    } catch (error) {
      console.error("Error bulk canceling rentals:", error);
      res.status(500).json({ error: "Falha ao cancelar locações" });
    }
  });

  // Supplier reviews endpoint
  app.post("/api/supplier-reviews", async (req, res) => {
    try {
      const { rentalId, supplierId, rating, comment } = req.body;

      // Here you would save to a reviews table, for now just return success
      res.json({ 
        success: true, 
        message: "Avaliação enviada com sucesso",
        data: { rentalId, supplierId, rating, comment }
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Falha ao enviar avaliação" });
    }
  });

  // Inventory movement routes
  app.get("/api/inventory-movements", async (req, res) => {
    try {
      const movements = await storage.getInventoryMovements();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory movements" });
    }
  });

  app.get("/api/inventory-movements/product/:productId", async (req, res) => {
    try {
      const movements = await storage.getInventoryMovementsByProduct(req.params.productId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product movements" });
    }
  });

  app.post("/api/inventory-movements", async (req, res) => {
    try {
      const validatedData = insertInventoryMovementSchema.parse(req.body);
      const movement = await storage.createInventoryMovement(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory movement data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}