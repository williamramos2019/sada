
# Módulo Fornecedores

## Visão Geral
Sistema para gestão completa de fornecedores de equipamentos, incluindo dados cadastrais, histórico de relacionamento e integração com locações.

## Funcionalidades Principais

### 1. Cadastro de Fornecedores

#### Dados Básicos
- **Nome**: Razão social ou nome fantasia
- **Email**: Contato principal
- **Telefone**: Número para contato
- **Endereço**: Localização física
- **Documento**: CPF (pessoa física) ou CNPJ (pessoa jurídica)

#### Validações
- Email deve ter formato válido
- Telefone deve seguir padrão brasileiro
- Documento deve ser CPF ou CNPJ válido
- Nome é obrigatório e único

#### Campos Automáticos
- **ID**: Gerado automaticamente (UUID)
- **Data de Cadastro**: Timestamp de criação
- **Última Atualização**: Timestamp da última modificação

### 2. Gestão de Relacionamento

#### Histórico de Locações
- **Lista Completa**: Todas as locações do fornecedor
- **Valores Totais**: Soma de gastos com o fornecedor
- **Período de Relacionamento**: Primeira e última locação
- **Frequência**: Quantas locações por mês/ano

#### Métricas por Fornecedor
- **Total Gasto**: Soma de todas as locações
- **Locações Ativas**: Equipamentos atualmente alugados
- **Média por Locação**: Valor médio dos contratos
- **Tempo Médio**: Duração média das locações

### 3. Sistema de Avaliação

#### Avaliações de Fornecedores
- **Rating**: Escala de 1 a 5 estrelas
- **Comentários**: Texto livre sobre a experiência
- **Histórico**: Todas as avaliações recebidas
- **Média Geral**: Cálculo automático da nota média

#### Critérios de Avaliação
- Qualidade dos equipamentos
- Atendimento ao cliente
- Pontualidade na entrega
- Preços praticados
- Suporte técnico

### 4. Integração com Locações

#### Processo de Locação
- **Seleção**: Escolha do fornecedor na nova locação
- **Histórico**: Visualização de equipamentos já alugados
- **Preferências**: Fornecedores favoritos/mais usados
- **Contatos**: Acesso rápido aos dados de contato

#### Devolução de Equipamentos
- **Por Fornecedor**: Processo organizado por empresa
- **Múltiplos Itens**: Devolução em lote para o mesmo fornecedor
- **Confirmação**: Notificação automática para o fornecedor

## Interface de Usuário

### Página Principal de Fornecedores

#### Cards de Estatísticas
- **Total de Fornecedores**: Contagem geral
- **Fornecedores Ativos**: Com locações no último mês
- **Melhor Avaliado**: Fornecedor com maior nota
- **Maior Volume**: Fornecedor com mais gastos

#### Tabela de Fornecedores
- **Colunas**:
  - Nome da empresa
  - Contato (email + telefone)
  - Total gasto
  - Locações ativas
  - Última locação
  - Avaliação média
  - Ações

#### Filtros e Busca
- **Busca por Nome**: Campo de texto livre
- **Filtro por Estado**: Ativos, inativos, todos
- **Ordenação**: Nome, data, gastos, avaliação
- **Localização**: Filtro por cidade/estado

### Página de Detalhes do Fornecedor

#### Informações Gerais
- Dados cadastrais completos
- Estatísticas de relacionamento
- Gráfico de gastos por período
- Timeline de locações

#### Abas de Conteúdo
- **Locações**: Histórico completo
- **Avaliações**: Notas e comentários
- **Contatos**: Dados para comunicação
- **Equipamentos**: Lista de equipamentos disponíveis

### Formulários

#### Cadastro/Edição
- Formulário responsivo
- Validação em tempo real
- Campos obrigatórios destacados
- Auto-save de rascunhos

#### Campos Especiais
- **Documento**: Máscara para CPF/CNPJ
- **Telefone**: Máscara brasileira
- **CEP**: Busca automática de endereço
- **Email**: Validação de formato

## Endpoints da API

### CRUD Básico
```typescript
GET    /api/suppliers           // Listar fornecedores
GET    /api/suppliers/:id       // Buscar fornecedor específico
POST   /api/suppliers           // Criar novo fornecedor
PUT    /api/suppliers/:id       // Atualizar fornecedor
DELETE /api/suppliers/:id       // Excluir fornecedor
```

### Endpoints Especiais
```typescript
GET    /api/suppliers/:id/rentals     // Locações do fornecedor
GET    /api/suppliers/:id/stats       // Estatísticas específicas
POST   /api/suppliers/:id/review      // Avaliar fornecedor
GET    /api/suppliers/top-rated       // Melhores avaliados
GET    /api/suppliers/most-used       // Mais utilizados
```

### Compatibilidade (Customers)
```typescript
// Mantido para compatibilidade com versões anteriores
GET    /api/customers           // Alias para /api/suppliers
POST   /api/customers           // Alias para /api/suppliers
GET    /api/customers/:id       // Alias para /api/suppliers/:id
```

## Regras de Negócio

### Validações de Dados
- **Email único**: Não pode haver duplicatas
- **Documento válido**: CPF/CNPJ deve passar na validação
- **Telefone formato**: Deve seguir padrão brasileiro
- **Nome obrigatório**: Campo não pode estar vazio

### Relacionamentos
- **Não exclusão**: Fornecedor com locações não pode ser excluído
- **Arquivamento**: Fornecedores inativos são arquivados
- **Histórico preservado**: Dados de locações antigas são mantidos

### Cálculos Automáticos
- **Total gasto**: Soma das locações finalizadas
- **Média de avaliação**: Média aritmética das notas
- **Frequência**: Locações por mês dos últimos 12 meses
- **Status**: Ativo se teve locação nos últimos 6 meses

## Relatórios e Analytics

### Relatório de Fornecedores
- **Lista completa**: Todos os fornecedores cadastrados
- **Dados financeiros**: Gastos por fornecedor
- **Performance**: Avaliações e comentários
- **Atividade**: Última interação

### Análise de Relacionamento
- **Fornecedores preferenciais**: Mais utilizados
- **Evolução de gastos**: Timeline de valores
- **Satisfação**: Tendência das avaliações
- **Oportunidades**: Fornecedores subutilizados

### Ranking de Fornecedores
- **Por volume**: Maiores valores de locação
- **Por satisfação**: Melhores avaliações
- **Por atividade**: Mais locações recentes
- **Por variedade**: Mais tipos de equipamentos

## Integrações

### Com Módulo de Locações
- **Seleção automática**: Sugestão de fornecedores
- **Histórico**: Equipamentos já alugados
- **Devolução**: Processo organizado por fornecedor
- **Renovação**: Contato direto para renovações

### Com Dashboard
- **Estatísticas**: Números de fornecedores
- **Alertas**: Fornecedores sem atividade
- **Tendências**: Crescimento da base

### Com Relatórios
- **Dados agregados**: Informações consolidadas
- **Exportação**: CSV e PDF
- **Filtros**: Por período e critérios

## Comunicação

### Contatos Automáticos
- **Email de boas-vindas**: Novo cadastro
- **Lembretes**: Locações próximas ao vencimento
- **Confirmações**: Devoluções de equipamentos
- **Avaliações**: Solicitação de feedback

### Templates de Email
- Cadastro realizado com sucesso
- Nova locação iniciada
- Equipamento devolvido
- Solicitação de avaliação
- Lembrete de vencimento

## Segurança e Privacidade

### Proteção de Dados
- **LGPD**: Conformidade com lei brasileira
- **Consentimento**: Autorização para comunicação
- **Portabilidade**: Exportação de dados
- **Exclusão**: Direito ao esquecimento

### Logs de Auditoria
- **Criação**: Quem cadastrou e quando
- **Modificação**: Histórico de alterações
- **Acesso**: Log de consultas
- **Exclusão**: Tentativas de remoção
