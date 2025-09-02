
# Documentação do Banco de Dados

## Visão Geral
Sistema utiliza PostgreSQL como banco de dados principal, com Drizzle ORM para migrations e consultas type-safe.

## Arquitetura do Banco

### Tecnologias
- **SGBD**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Validação**: Zod schemas
- **Conexão**: Neon serverless (produção) / PostgreSQL local (desenvolvimento)

### Configuração
```typescript
// shared/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
```

## Tabelas do Sistema

### 1. users
Usuários do sistema (para futuras implementações de autenticação).

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `username`: Nome de usuário único
- `password`: Senha criptografada
- `name`: Nome completo
- `email`: Email do usuário
- `role`: Nível de acesso (user, admin)

### 2. suppliers
Fornecedores de equipamentos.

```sql
CREATE TABLE suppliers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  document TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `name`: Nome/Razão social
- `email`: Email de contato
- `phone`: Telefone
- `address`: Endereço completo
- `document`: CPF/CNPJ
- `created_at`: Data de cadastro

**Índices:**
- Índice único em `email`
- Índice de busca em `name`

### 3. categories
Categorias de produtos.

```sql
CREATE TABLE categories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `name`: Nome da categoria
- `description`: Descrição opcional

### 4. products
Produtos do almoxarifado.

```sql
CREATE TABLE products (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category_id VARCHAR REFERENCES categories(id),
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  is_rentable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `code`: Código único do produto
- `name`: Nome do produto
- `description`: Descrição detalhada
- `category_id`: Referência à categoria
- `unit_price`: Preço unitário (DECIMAL 10,2)
- `quantity`: Quantidade em estoque
- `min_stock`: Estoque mínimo
- `is_rentable`: Se pode ser alugado
- `created_at`: Data de cadastro

**Relacionamentos:**
- `category_id` → `categories.id` (FK)

**Índices:**
- Índice único em `code`
- Índice de busca em `name`
- Índice em `category_id`

### 5. rentals
Locações de equipamentos.

```sql
CREATE TABLE rentals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id VARCHAR NOT NULL REFERENCES suppliers(id),
  equipment_name TEXT NOT NULL,
  equipment_type TEXT,
  quantity INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  rental_period TEXT NOT NULL DEFAULT 'daily',
  daily_rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `supplier_id`: Referência ao fornecedor
- `equipment_name`: Nome do equipamento
- `equipment_type`: Tipo/categoria do equipamento
- `quantity`: Quantidade alugada
- `start_date`: Data de início da locação
- `end_date`: Data de fim da locação
- `rental_period`: Período (daily, weekly, biweekly, monthly)
- `daily_rate`: Taxa diária
- `total_amount`: Valor total
- `status`: Status da locação
- `notes`: Anotações
- `created_at`: Data de criação
- `updated_at`: Data de atualização

**Status Possíveis:**
- `pending`: Pendente
- `active`: Ativa
- `completed`: Finalizada
- `overdue`: Em atraso
- `cancelled`: Cancelada

**Relacionamentos:**
- `supplier_id` → `suppliers.id` (FK)

**Índices:**
- Índice em `supplier_id`
- Índice em `status`
- Índice em `start_date`
- Índice em `end_date`

### 6. inventory_movements
Movimentações de estoque.

```sql
CREATE TABLE inventory_movements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR NOT NULL REFERENCES products(id),
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  user_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (UUID)
- `product_id`: Referência ao produto
- `type`: Tipo de movimentação
- `quantity`: Quantidade movimentada
- `reason`: Motivo da movimentação
- `notes`: Observações
- `user_id`: Usuário responsável
- `created_at`: Data da movimentação

**Tipos de Movimentação:**
- `in`: Entrada
- `out`: Saída
- `adjustment`: Ajuste

**Relacionamentos:**
- `product_id` → `products.id` (FK)
- `user_id` → `users.id` (FK)

**Índices:**
- Índice em `product_id`
- Índice em `type`
- Índice em `created_at`

## Schemas Drizzle

### Definição das Tabelas
```typescript
// shared/schema.ts
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  document: text("document"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ... outras tabelas
```

### Schemas de Validação
```typescript
import { createInsertSchema } from "drizzle-zod";

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
```

### Tipos TypeScript
```typescript
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type RentalWithDetails = Rental & {
  supplier: Supplier;
};
```

## Queries Principais

### Locações com Fornecedores
```typescript
const rentalsWithSuppliers = await db
  .select({
    id: rentals.id,
    equipmentName: rentals.equipmentName,
    // ... outros campos
    supplier: {
      id: suppliers.id,
      name: suppliers.name,
      email: suppliers.email,
    },
  })
  .from(rentals)
  .leftJoin(suppliers, eq(rentals.supplierId, suppliers.id))
  .orderBy(desc(rentals.createdAt));
```

### Produtos com Estoque Baixo
```typescript
const lowStockProducts = await db
  .select()
  .from(products)
  .where(sql`${products.quantity} < ${products.minStock}`);
```

### Estatísticas do Dashboard
```typescript
const stats = {
  activeRentals: await db
    .select({ count: count() })
    .from(rentals)
    .where(eq(rentals.status, "active")),
    
  monthlyRevenue: await db
    .select({ sum: sum(rentals.totalAmount) })
    .from(rentals)
    .where(gte(rentals.createdAt, startOfMonth)),
};
```

## Migrations

### Configuração Drizzle
```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Comandos de Migration
```bash
# Gerar migration
npx drizzle-kit generate

# Aplicar migration
npx drizzle-kit push

# Visualizar schema
npx drizzle-kit studio
```

### Histórico de Migrations
- `0000_perfect_calypso.sql`: Schema inicial
- `0001_light_green_goblin.sql`: Adição do campo rental_period

## Otimizações de Performance

### Índices Estratégicos
```sql
-- Busca por fornecedores
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_email ON suppliers(email);

-- Filtros de locações
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_supplier_id ON rentals(supplier_id);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);

-- Movimentações por produto
CREATE INDEX idx_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_movements_created_at ON inventory_movements(created_at);
```

### Queries Otimizadas
- Uso de JOINs eficientes
- Limit e offset para paginação
- Agregações no banco em vez do código
- Cache de queries frequentes

## Backup e Manutenção

### Estratégia de Backup
- **Diário**: Backup automático no Neon
- **Semanal**: Export completo para arquivo
- **Mensal**: Backup verificado e testado

### Limpeza de Dados
```sql
-- Limpar logs antigos (>2 anos)
DELETE FROM inventory_movements 
WHERE created_at < NOW() - INTERVAL '2 years';

-- Arquivar locações antigas
UPDATE rentals 
SET status = 'archived' 
WHERE status = 'completed' 
AND created_at < NOW() - INTERVAL '1 year';
```

### Monitoramento
- Tamanho do banco de dados
- Performance das queries mais lentas
- Uso de índices
- Fragmentação das tabelas

## Relacionamentos e Integridade

### Chaves Estrangeiras
```sql
-- Produtos → Categorias
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id);

-- Locações → Fornecedores
ALTER TABLE rentals 
ADD CONSTRAINT fk_rentals_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- Movimentações → Produtos
ALTER TABLE inventory_movements 
ADD CONSTRAINT fk_movements_product 
FOREIGN KEY (product_id) REFERENCES products(id);
```

### Regras de Cascata
- **Fornecedores**: Não pode ser excluído se tiver locações
- **Categorias**: Não pode ser excluída se tiver produtos
- **Produtos**: Não pode ser excluído se tiver movimentações

### Triggers e Constraints
```sql
-- Constraint para evitar estoque negativo
ALTER TABLE products 
ADD CONSTRAINT chk_positive_quantity 
CHECK (quantity >= 0);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rentals_updated_at 
BEFORE UPDATE ON rentals 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
