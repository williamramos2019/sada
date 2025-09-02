
# Módulo Almoxarifado

## Visão Geral
Sistema completo para controle de estoque interno, incluindo produtos, categorias e movimentações.

## Funcionalidades Principais

### 1. Gestão de Produtos

#### Cadastro de Produtos
- **Campos Obrigatórios**:
  - Código único do produto
  - Nome do produto
  - Categoria
  - Preço unitário
  - Quantidade inicial
  - Estoque mínimo

- **Campos Opcionais**:
  - Descrição detalhada
  - Observações
  - Se é alugável

#### Validações
- Código deve ser único no sistema
- Preço deve ser valor positivo
- Quantidade não pode ser negativa
- Estoque mínimo deve ser ≥ 0

### 2. Sistema de Categorias

#### Funcionalidades
- **Cadastro**: Nome e descrição da categoria
- **Organização**: Agrupamento lógico de produtos
- **Filtros**: Busca de produtos por categoria
- **Relatórios**: Análise por categoria

#### Categorias Sugeridas
- Ferramentas Manuais
- Equipamentos Elétricos
- Materiais de Construção
- Equipamentos de Segurança
- Peças e Componentes

### 3. Controle de Movimentações

#### Tipos de Movimentação
- **Entrada (in)**: Compra, devolução, transferência recebida
- **Saída (out)**: Venda, uso interno, transferência enviada
- **Ajuste (adjustment)**: Correções de inventário

#### Registro de Movimentação
- **Campos Obrigatórios**:
  - Produto
  - Tipo de movimentação
  - Quantidade
  - Motivo/Razão

- **Campos Opcionais**:
  - Observações
  - Usuário responsável
  - Data/hora (automática)

### 4. Alertas de Estoque

#### Produtos com Estoque Baixo
- **Critério**: quantity < minStock
- **Visualização**: Lista destacada no dashboard
- **Notificações**: Alertas visuais
- **Ações**: Link direto para reposição

#### Produtos Sem Estoque
- **Critério**: quantity = 0
- **Status**: Destacado em vermelho
- **Impacto**: Não disponível para uso/venda

## Interface de Usuário

### Página Principal do Almoxarifado

#### Cards de Estatísticas
- **Total de Produtos**: Contagem geral
- **Produtos Ativos**: Com estoque > 0
- **Estoque Baixo**: Produtos críticos
- **Valor do Estoque**: Soma total em R$

#### Tabela de Produtos
- **Colunas**:
  - Código do produto
  - Nome
  - Categoria
  - Quantidade atual
  - Estoque mínimo
  - Preço unitário
  - Status (Normal/Baixo/Vazio)
  - Ações

#### Filtros e Busca
- **Busca por Nome**: Campo de texto livre
- **Filtro por Categoria**: Dropdown de seleção
- **Filtro por Status**: Normal/Baixo/Sem estoque
- **Ordenação**: Por nome, código, quantidade, preço

### Página de Movimentações

#### Registro de Nova Movimentação
- Formulário simplificado
- Seleção de produto via dropdown
- Cálculo automático do novo estoque
- Confirmação antes de salvar

#### Histórico de Movimentações
- **Colunas**:
  - Data/Hora
  - Produto
  - Tipo de movimentação
  - Quantidade
  - Estoque anterior
  - Estoque atual
  - Motivo
  - Usuário

#### Filtros do Histórico
- **Por Produto**: Movimentações específicas
- **Por Tipo**: Entradas, saídas ou ajustes
- **Por Período**: Intervalo de datas
- **Por Usuário**: Quem fez a movimentação

## Endpoints da API

### Produtos
```typescript
GET    /api/products           // Listar todos os produtos
GET    /api/products/:id       // Buscar produto específico
POST   /api/products           // Criar novo produto
PUT    /api/products/:id       // Atualizar produto
DELETE /api/products/:id       // Excluir produto
GET    /api/products/low-stock // Produtos com estoque baixo
```

### Categorias
```typescript
GET    /api/categories         // Listar categorias
POST   /api/categories         // Criar categoria
```

### Movimentações
```typescript
GET    /api/inventory-movements                    // Todas as movimentações
GET    /api/inventory-movements/product/:productId // Por produto
POST   /api/inventory-movements                    // Nova movimentação
```

## Regras de Negócio

### Controle de Estoque
- Estoque nunca pode ficar negativo
- Movimentações de saída são bloqueadas se não há estoque suficiente
- Ajustes podem zerar o estoque (inventário)

### Cálculos Automáticos
- **Novo Estoque** = Estoque Atual ± Quantidade da Movimentação
- **Valor Total** = Quantidade × Preço Unitário
- **Status do Produto**:
  - Normal: quantity ≥ minStock
  - Baixo: 0 < quantity < minStock
  - Vazio: quantity = 0

### Validações de Negócio
- Código do produto deve ser único
- Não pode excluir produto com movimentações
- Não pode excluir categoria com produtos
- Quantidade de saída não pode exceder estoque

## Relatórios e Análises

### Relatório de Estoque Atual
- Lista completa de produtos
- Quantidades e valores
- Status de cada item
- Total geral do estoque

### Relatório de Movimentações
- Período selecionável
- Filtros por produto/categoria/tipo
- Totais de entrada e saída
- Balanço líquido

### Análise de Consumo
- Produtos mais movimentados
- Tendências de uso
- Previsão de reposição
- Produtos obsoletos

## Integrações

### Com Módulo de Locações
- Produtos marcados como "alugáveis"
- Controle de disponibilidade
- Reserva de estoque para locações

### Com Dashboard
- Alimenta estatísticas gerais
- Alertas de estoque baixo
- Métricas de inventário

## Backup e Auditoria

### Histórico Completo
- Todas as movimentações são registradas
- Não há exclusão de histórico
- Rastreabilidade total das alterações

### Logs de Sistema
- Quem fez cada movimentação
- Quando foi feita
- Estado anterior e posterior
- Motivo da alteração

## Performance

### Otimizações
- Índices no banco para busca rápida
- Cache de dados estáticos
- Paginação automática
- Lazy loading de dados pesados

### Limites Operacionais
- Máximo 100 produtos por página
- Histórico limitado a 1 ano na tela
- Backup automático semanal
- Limpeza de logs antigos (> 2 anos)
