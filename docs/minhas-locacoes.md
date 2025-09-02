
# Módulo Minhas Locações

## Visão Geral
Módulo completo para gestão de equipamentos alugados de fornecedores, incluindo 10 funcionalidades avançadas.

## Funcionalidades Principais

### 1. Gestão Básica de Locações

#### Cadastro de Nova Locação
- **Rota**: `/rentals/new`
- **Campos Obrigatórios**:
  - Fornecedor (seleção de lista)
  - Nome do equipamento
  - Tipo de equipamento
  - Quantidade
  - Data de início
  - Data de fim
  - Período de locação (diário, semanal, quinzenal, mensal)
  - Taxa diária
  - Valor total (calculado automaticamente)

#### Tipos de Período
- **Diário**: Cobrança por dia
- **Semanal**: Cobrança por semana (7 dias)
- **Quinzenal**: Cobrança quinzenal (15 dias)
- **Mensal**: Cobrança mensal (30 dias)

### 2. Sistema de Devolução Inteligente

#### Processo de Devolução
1. **Seleção de Empresa**: Escolha do fornecedor
2. **Sugestão de Itens**: Sistema lista equipamentos ativos daquela empresa
3. **Seleção Múltipla**: Checkbox para escolher quais devolver
4. **Confirmação**: Processo de baixa automática

#### Endpoint da Devolução
```typescript
POST /api/rentals/return
{
  "supplierName": string,
  "items": string[] // Array de rental IDs
}
```

## 10 Funcionalidades Avançadas

### 1. Renovação Automática de Locações
- **Propósito**: Estender prazo de locações ativas
- **Funcionalidades**:
  - Definir nova data de fim
  - Adicionar dias extras
  - Cálculo automático de custos adicionais
- **Endpoint**: `PUT /api/rentals/:id/renew`

### 2. Sistema de Avaliação de Fornecedores
- **Propósito**: Avaliar experiência com fornecedores
- **Funcionalidades**:
  - Rating de 1 a 5 estrelas
  - Comentários detalhados
  - Histórico de avaliações
- **Endpoint**: `POST /api/supplier-reviews`

### 3. Geração de Contratos em PDF
- **Propósito**: Documentos formais de locação
- **Funcionalidades**:
  - PDF automático com dados da locação
  - Download direto
  - Template padrão de contrato
- **Endpoint**: `GET /api/rentals/:id/contract`

### 4. Histórico de Anotações
- **Propósito**: Comentários e observações por locação
- **Funcionalidades**:
  - Campo de texto livre
  - Histórico de modificações
  - Busca por anotações
- **Endpoint**: `PUT /api/rentals/:id/notes`

### 5. Ações em Lote
- **Propósito**: Operações múltiplas simultâneas
- **Funcionalidades**:
  - Seleção múltipla via checkbox
  - Cancelamento em lote
  - Outras ações futuras
- **Endpoint**: `POST /api/rentals/bulk-cancel`

### 6. Filtros Avançados Multi-Critério
- **Filtros Disponíveis**:
  - Status da locação
  - Fornecedor (busca por nome)
  - Tipo de equipamento
  - Faixa de preço (R$ 0-100, R$ 100-500, etc.)
  - Período de datas
  - Apenas locações atrasadas
- **Funcionalidade**: Combinação de múltiplos filtros

### 7. Ordenação Personalizável
- **Campos de Ordenação**:
  - Data de criação
  - Data de início
  - Data de fim
  - Valor da locação
  - Nome do equipamento
- **Direções**: Crescente/Decrescente
- **Interface**: Dropdown + botão de direção

### 8. Alertas de Vencimento Automáticos
- **Tipos de Alerta**:
  - **Locações em Atraso**: Passou da data de fim
  - **Vencendo em 3 dias**: Alerta preventivo
- **Visual**: Cards coloridos no topo da página
- **Contadores**: Quantidade de locações por tipo

### 9. Estatísticas de Gastos Detalhadas
- **Métricas Calculadas**:
  - Total gasto (soma de todas as locações)
  - Total de locações (contagem)
  - Média por locação (total ÷ quantidade)
  - Fornecedor favorito (mais usado)
- **Cards Visuais**: 4 cards com ícones e cores específicas

### 10. Exportação de Relatórios
- **Formato**: CSV
- **Dados Exportados**:
  - Fornecedor
  - Equipamento
  - Tipo
  - Datas de início e fim
  - Valor
  - Status
  - Período de locação
- **Funcionalidade**: Download direto do arquivo

## Interface de Usuário

### Tabela Principal
- **Colunas**:
  - Checkbox (seleção em lote)
  - Favorito (estrela clicável)
  - Fornecedor (nome + email)
  - Equipamento (nome + tipo + período)
  - Data início
  - Data fim (+ badge se vencido)
  - Valor (formatado em R$)
  - Status (badge colorido)
  - Ações (botões de operação)

### Botões de Ação por Locação
- **Visualizar**: Ícone de olho (azul)
- **Renovar**: Ícone de repetir (verde) - apenas ativas
- **Contrato**: Ícone de documento (roxo)
- **Anotações**: Ícone de mensagem (índigo)
- **Avaliar**: Ícone de estrela (amarelo) - apenas finalizadas
- **Devolver**: Ícone de pacote (laranja) - apenas ativas

### Estados Visuais
- **Loading**: Skeleton animation
- **Empty State**: Mensagem "Nenhuma locação encontrada"
- **Error State**: Toast de erro
- **Success State**: Toast de sucesso

## Status de Locações

### Tipos de Status
- **pending**: Locação criada, aguardando início
- **active**: Equipamento em uso
- **completed**: Equipamento devolvido com sucesso
- **overdue**: Passou da data de devolução
- **cancelled**: Locação cancelada

### Cores dos Status
- **pending**: Amarelo
- **active**: Verde
- **completed**: Azul
- **overdue**: Vermelho
- **cancelled**: Cinza

## Validações e Regras de Negócio

### Validações de Campo
- Data de início não pode ser anterior à hoje
- Data de fim deve ser posterior à data de início
- Valor deve ser positivo
- Quantidade deve ser maior que zero

### Regras de Status
- Apenas locações "active" podem ser renovadas
- Apenas locações "completed" podem ser avaliadas
- Locações "overdue" são calculadas automaticamente
- Status pode ser alterado via devolução ou ações admin

## Performance

### Otimizações
- Paginação automática para muitos registros
- Cache de dados via React Query
- Debounce nos filtros de busca
- Lazy loading de componentes pesados

### Limites
- Máximo 50 locações por página
- Cache de 5 minutos para dados estáticos
- Timeout de 30 segundos para operações
