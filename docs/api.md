
# Documentação da API

## Visão Geral
API RESTful para o sistema de controle de locações e almoxarifado, construída com Express.js e TypeScript.

## Configuração Base

### URL Base
- **Desenvolvimento**: `http://localhost:5000/api`
- **Produção**: `https://[seu-dominio]/api`

### Headers Obrigatórios
```http
Content-Type: application/json
Accept: application/json
```

### Padrões de Resposta
```typescript
// Sucesso
{
  "data": any,
  "message": string,
  "timestamp": string
}

// Erro
{
  "error": string,
  "message": string,
  "statusCode": number,
  "timestamp": string
}
```

## Endpoints do Dashboard

### GET /api/dashboard/stats
Retorna estatísticas gerais do sistema.

**Resposta:**
```typescript
{
  "activeRentals": number,      // Locações ativas
  "monthlyRevenue": number,     // Gasto mensal
  "productsInStock": number,    // Produtos em estoque
  "lowStockItems": number       // Itens com estoque baixo
}
```

## Endpoints de Fornecedores

### GET /api/suppliers
Lista todos os fornecedores.

**Query Parameters:**
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 50)
- `search`: busca por nome
- `active`: apenas ativos (true/false)

**Resposta:**
```typescript
{
  "data": Supplier[],
  "total": number,
  "page": number,
  "limit": number
}
```

### GET /api/suppliers/:id
Busca fornecedor específico.

**Parâmetros:**
- `id`: ID do fornecedor

**Resposta:**
```typescript
{
  "id": string,
  "name": string,
  "email": string,
  "phone": string,
  "address": string,
  "document": string,
  "createdAt": Date
}
```

### POST /api/suppliers
Cria novo fornecedor.

**Body:**
```typescript
{
  "name": string,           // Obrigatório
  "email": string,          // Obrigatório
  "phone": string?,         // Opcional
  "address": string?,       // Opcional
  "document": string?       // Opcional
}
```

### PUT /api/suppliers/:id
Atualiza fornecedor existente.

**Body:** Todos os campos são opcionais
```typescript
{
  "name": string?,
  "email": string?,
  "phone": string?,
  "address": string?,
  "document": string?
}
```

### DELETE /api/suppliers/:id
Exclui fornecedor (apenas se não tiver locações).

## Endpoints de Produtos

### GET /api/products
Lista todos os produtos.

**Query Parameters:**
- `page`: número da página
- `limit`: itens por página
- `search`: busca por nome/código
- `category`: filtro por categoria
- `lowStock`: apenas com estoque baixo (true/false)

### GET /api/products/:id
Busca produto específico.

### GET /api/products/low-stock
Lista produtos com estoque abaixo do mínimo.

### POST /api/products
Cria novo produto.

**Body:**
```typescript
{
  "code": string,           // Obrigatório, único
  "name": string,           // Obrigatório
  "description": string?,   // Opcional
  "categoryId": string?,    // Opcional
  "unitPrice": number,      // Obrigatório
  "quantity": number,       // Obrigatório
  "minStock": number,       // Obrigatório
  "isRentable": boolean?    // Opcional, default true
}
```

### PUT /api/products/:id
Atualiza produto existente.

### DELETE /api/products/:id
Exclui produto (apenas se não tiver movimentações).

## Endpoints de Categorias

### GET /api/categories
Lista todas as categorias.

### POST /api/categories
Cria nova categoria.

**Body:**
```typescript
{
  "name": string,           // Obrigatório
  "description": string?    // Opcional
}
```

## Endpoints de Locações

### GET /api/rentals
Lista todas as locações com dados dos fornecedores.

**Query Parameters:**
- `page`: número da página
- `limit`: itens por página
- `status`: filtro por status
- `supplier`: filtro por fornecedor
- `startDate`: data de início mínima
- `endDate`: data de fim máxima

**Resposta:**
```typescript
{
  "data": RentalWithDetails[],
  "total": number
}

interface RentalWithDetails {
  id: string,
  supplierId: string,
  equipmentName: string,
  equipmentType: string,
  quantity: number,
  startDate: Date,
  endDate: Date,
  rentalPeriod: "daily" | "weekly" | "biweekly" | "monthly",
  dailyRate: number,
  totalAmount: number,
  status: "pending" | "active" | "completed" | "overdue" | "cancelled",
  notes: string,
  createdAt: Date,
  supplier: {
    id: string,
    name: string,
    email: string,
    phone: string
  }
}
```

### GET /api/rentals/active
Lista apenas locações ativas.

### GET /api/rentals/overdue
Lista locações em atraso.

### GET /api/rentals/:id
Busca locação específica.

### POST /api/rentals
Cria nova locação.

**Body:**
```typescript
{
  "supplierId": string,         // Obrigatório
  "equipmentName": string,      // Obrigatório
  "equipmentType": string?,     // Opcional
  "quantity": number,           // Obrigatório
  "startDate": Date,            // Obrigatório
  "endDate": Date,              // Obrigatório
  "rentalPeriod": string,       // Obrigatório
  "dailyRate": number,          // Obrigatório
  "totalAmount": number,        // Obrigatório
  "notes": string?              // Opcional
}
```

### PUT /api/rentals/:id
Atualiza locação existente.

### DELETE /api/rentals/:id
Exclui locação.

## Endpoints Especiais de Locações

### POST /api/rentals/return
Devolve equipamentos de um fornecedor.

**Body:**
```typescript
{
  "supplierName": string,       // Nome do fornecedor
  "items": string[]             // Array de IDs das locações
}
```

### PUT /api/rentals/:id/renew
Renova uma locação específica.

**Body:**
```typescript
{
  "newEndDate": string?,        // Nova data de fim
  "additionalDays": number?     // Dias extras
}
```

### GET /api/rentals/:id/contract
Gera e baixa contrato em PDF.

**Resposta:** Arquivo PDF para download

### PUT /api/rentals/:id/notes
Atualiza anotações da locação.

**Body:**
```typescript
{
  "notes": string
}
```

### POST /api/rentals/bulk-cancel
Cancela múltiplas locações.

**Body:**
```typescript
{
  "rentalIds": string[]         // Array de IDs para cancelar
}
```

## Endpoints de Avaliações

### POST /api/supplier-reviews
Avalia um fornecedor.

**Body:**
```typescript
{
  "rentalId": string,           // ID da locação
  "supplierId": string,         // ID do fornecedor
  "rating": number,             // 1-5 estrelas
  "comment": string             // Comentário
}
```

## Endpoints de Movimentações de Estoque

### GET /api/inventory-movements
Lista todas as movimentações.

**Query Parameters:**
- `page`: número da página
- `limit`: itens por página
- `productId`: filtro por produto
- `type`: tipo de movimentação (in/out/adjustment)
- `startDate`: data inicial
- `endDate`: data final

### GET /api/inventory-movements/product/:productId
Lista movimentações de um produto específico.

### POST /api/inventory-movements
Registra nova movimentação.

**Body:**
```typescript
{
  "productId": string,          // Obrigatório
  "type": "in" | "out" | "adjustment", // Obrigatório
  "quantity": number,           // Obrigatório
  "reason": string,             // Obrigatório
  "notes": string?,             // Opcional
  "userId": string?             // Opcional
}
```

## Códigos de Status HTTP

### Sucesso
- `200 OK`: Operação realizada com sucesso
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Operação de exclusão bem-sucedida

### Erros do Cliente
- `400 Bad Request`: Dados inválidos enviados
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: código duplicado)

### Erros do Servidor
- `500 Internal Server Error`: Erro interno do servidor
- `503 Service Unavailable`: Serviço temporariamente indisponível

## Validações

### Fornecedores
- Nome: obrigatório, máximo 255 caracteres
- Email: formato válido de email
- Telefone: formato brasileiro opcional
- Documento: CPF/CNPJ válido

### Produtos
- Código: obrigatório, único, máximo 50 caracteres
- Nome: obrigatório, máximo 255 caracteres
- Preço: número positivo
- Quantidade: número não negativo
- Estoque mínimo: número não negativo

### Locações
- Data início: não pode ser anterior a hoje
- Data fim: deve ser posterior à data início
- Quantidade: número positivo
- Valor: número positivo

## Rate Limiting

### Limites por Endpoint
- **GET requests**: 100 por minuto
- **POST/PUT requests**: 30 por minuto
- **DELETE requests**: 10 por minuto

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Exemplos de Uso

### Criar Nova Locação
```bash
curl -X POST http://localhost:5000/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supp-001",
    "equipmentName": "Furadeira Bosch",
    "equipmentType": "Ferramenta",
    "quantity": 1,
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-20T00:00:00Z",
    "rentalPeriod": "daily",
    "dailyRate": 25.00,
    "totalAmount": 125.00
  }'
```

### Devolver Equipamentos
```bash
curl -X POST http://localhost:5000/api/rentals/return \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Locadora ABC",
    "items": ["rent-001", "rent-002"]
  }'
```

### Buscar Produtos com Estoque Baixo
```bash
curl -X GET "http://localhost:5000/api/products/low-stock"
```
