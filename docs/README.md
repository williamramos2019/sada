
# Sistema de Controle de Locações e Almoxarifado

## Visão Geral

Sistema completo para gerenciamento pessoal de locações de equipamentos e controle de almoxarifado. O sistema é voltado para pessoas físicas ou pequenas empresas que **alugam equipamentos de fornecedores** e precisam controlar seu próprio estoque interno.

## Índice da Documentação

- [Funcionalidades Principais](./funcionalidades.md)
- [Módulo Dashboard](./dashboard.md)
- [Módulo Minhas Locações](./minhas-locacoes.md)
- [Módulo Almoxarifado](./almoxarifado.md)
- [Módulo Fornecedores](./fornecedores.md)
- [API Endpoints](./api.md)
- [Banco de Dados](./database.md)

## Arquitetura do Sistema

### Frontend
- **Framework**: React 18 + TypeScript
- **Roteamento**: Wouter
- **Estado**: TanStack Query (React Query)
- **UI**: shadcn/ui + Tailwind CSS
- **Formulários**: React Hook Form + Zod

### Backend
- **Framework**: Express.js + TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **API**: RESTful endpoints
- **Validação**: Zod schemas

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar migrations
npx drizzle-kit push

# Iniciar servidor de desenvolvimento
npm run dev
```

O sistema estará disponível em `http://localhost:5000`
