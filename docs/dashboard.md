
# Módulo Dashboard

## Visão Geral
O Dashboard é a página inicial do sistema, oferecendo uma visão executiva de todas as operações de locação e estoque.

## Componentes Principais

### 1. Cards de Estatísticas

#### Equipamentos Alugados
- **Descrição**: Número total de equipamentos atualmente em locação
- **Cálculo**: Count de locações com status "active"
- **Tendência**: Comparação com período anterior
- **Cor**: Azul (indica atividade positiva)

#### Gasto Mensal
- **Descrição**: Total gasto com locações no mês atual
- **Cálculo**: Soma dos valores de locações ativas no mês
- **Formato**: Moeda brasileira (R$)
- **Cor**: Vermelho (indica saída de dinheiro)

#### Produtos em Estoque
- **Descrição**: Quantidade total de produtos no almoxarifado
- **Cálculo**: Soma das quantidades de todos os produtos
- **Cor**: Roxo (neutro, informativo)

#### Itens com Estoque Baixo
- **Descrição**: Produtos abaixo do estoque mínimo
- **Cálculo**: Count de produtos onde quantity < minStock
- **Alerta**: Requer atenção imediata
- **Cor**: Vermelho (alerta crítico)

### 2. Seção de Locações Recentes

#### Funcionalidades
- Lista das 3 locações mais recentes
- Informações por item:
  - Nome do equipamento
  - Fornecedor responsável
  - Status atual da locação
  - Data de vencimento
- Ícones dinâmicos baseados no tipo de equipamento
- Link para visualização completa

#### Status Possíveis
- **Pendente**: Locação criada mas ainda não iniciada
- **Ativa**: Equipamento em uso
- **Finalizada**: Equipamento devolvido
- **Atrasada**: Passou da data de devolução
- **Cancelada**: Locação cancelada

### 3. Seção de Produtos com Estoque Baixo

#### Funcionalidades
- Lista dos 3 produtos com menor estoque
- Informações por produto:
  - Nome e código do produto
  - Categoria
  - Quantidade atual
  - Estoque mínimo configurado
- Indicador visual de criticidade
- Link para gerenciamento do produto

## Dados e Métricas

### Fonte dos Dados
- **API Endpoint**: `/api/dashboard/stats`
- **Atualização**: Tempo real via React Query
- **Cache**: 30 segundos para otimizar performance

### Cálculos Realizados
```typescript
interface DashboardStats {
  activeRentals: number;      // COUNT(rentals WHERE status = 'active')
  monthlyRevenue: number;     // SUM(totalAmount WHERE month = current)
  productsInStock: number;    // COUNT(products WHERE quantity > 0)
  lowStockItems: number;      // COUNT(products WHERE quantity < minStock)
}
```

## Interface de Usuário

### Layout Responsivo
- **Desktop**: Grid 4 colunas para cards de estatísticas
- **Tablet**: Grid 2 colunas
- **Mobile**: Grid 1 coluna (stack vertical)

### Cores e Temas
- **Background**: Tema claro/escuro baseado na preferência
- **Cards**: Sombras sutis e bordas arredondadas
- **Ícones**: Cores específicas por tipo de informação
- **Typography**: Hierarquia clara entre títulos e valores

### Interatividade
- **Hover Effects**: Cards respondem ao mouse
- **Loading States**: Skeleton durante carregamento
- **Error States**: Mensagens claras em caso de erro
- **Links**: Navegação direta para seções específicas

## Performance e Otimização

### Estratégias de Cache
- React Query para cache automático
- Invalidação inteligente quando dados mudam
- Prefetch de dados relacionados

### Lazy Loading
- Componentes carregados sob demanda
- Imagens otimizadas automaticamente
- Dados paginados quando necessário

## Testes e Qualidade

### Data Test IDs
Todos os elementos possuem identificadores únicos para testes:
- `stats-card-{type}`
- `rental-item-{id}`
- `low-stock-item-{id}`

### Acessibilidade
- Semantic HTML
- ARIA labels apropriados
- Contraste adequado
- Navegação por teclado
