# Overview

This is a full-stack personal rental and inventory management system built with React, TypeScript, and Express.js. The application helps individuals or small businesses manage equipment rentals they make from suppliers (not rentals they provide to customers) and their own warehouse/inventory control. Key features include tracking active rentals from suppliers, managing supplier relationships, monitoring personal inventory levels, and generating reports. The system uses a PostgreSQL database with Drizzle ORM for data management and includes a modern UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.
User Context: Personal/small business use - user rents equipment from suppliers rather than providing rentals to customers.
Perspective: Consumer of rental services, not provider.

# Recent Changes

## January 2025 - Context Adaptation
- **System Perspective**: Changed from rental provider to rental consumer
- **Schema Changes**: Renamed "customers" to "suppliers" throughout the system
- **Rental Model**: Updated to track equipment rented FROM suppliers
- **Interface Updates**: Modified UI labels and terminology for consumer perspective
- **Dashboard**: Changed "Revenue" to "Expenses" to reflect rental costs
- **Navigation**: Updated sidebar to reflect personal use context

# System Architecture

## Frontend Architecture
The client is built with React 18 using TypeScript and Vite as the build tool. The application uses a component-based architecture with:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation
- **Layout**: Main layout with sidebar navigation and header components

The frontend follows a page-based structure with dedicated pages for dashboard, rentals, inventory management, and reporting.

## Backend Architecture
The server is built with Express.js using TypeScript and follows a REST API pattern:

- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints organized by resource (suppliers, products, rentals, etc.)
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling middleware
- **Development**: Vite integration for hot module replacement in development

## Database Layer
The application uses PostgreSQL as the primary database with Drizzle ORM:

- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Shared schema definitions between client and server

Key entities include users, suppliers (formerly customers), categories, products, rentals (equipment rented from suppliers), and inventory movements with proper foreign key relationships.

## Data Access Pattern
The system implements a storage abstraction layer:

- **Interface**: IStorage interface defining all database operations
- **Implementation**: Concrete storage implementation (not fully visible in provided files)
- **Operations**: CRUD operations for all entities plus specialized queries for dashboard stats, low stock alerts, and overdue rentals

## Authentication & Session Management
The application includes user authentication with:

- **Session Storage**: PostgreSQL session storage using connect-pg-simple
- **User Management**: User entity with username/password authentication
- **Role-based Access**: User roles for different permission levels

## Development & Build System
The project uses a monorepo structure with shared TypeScript configurations:

- **Build**: Vite for frontend bundling, esbuild for server bundling
- **TypeScript**: Shared tsconfig with path mapping for imports
- **Development**: Hot reload for both client and server
- **Scripts**: npm scripts for development, building, and database operations

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: TypeScript-first ORM for database operations
- **connect-pg-simple**: PostgreSQL session store for Express

## Frontend Libraries
- **React**: Core UI framework with TypeScript
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

## UI Components & Styling
- **Radix UI**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

## Build Tools & Development
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server bundling for production
- **TypeScript**: Type safety across the entire application
- **PostCSS**: CSS processing with Tailwind integration

## Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling (conditional)
- **Replit dev banner**: Development environment indicators