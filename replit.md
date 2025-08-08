# IntentMesh - Private Trade Intents on Namada

## Overview

IntentMesh is a production-grade decentralized application that enables users to create and fulfill private trade intents using Anoma-style logic with complete privacy via Namada's shielded transfers. The platform combines 70% client-side intent matching with 30% blockchain execution, providing a fully privacy-preserving trading experience without traditional gas fees or EVM dependencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent UI patterns
- **State Management**: React Context API with custom hooks for wallet and intent management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management and caching

### Client-Side Logic (70% Anoma-Style)
- **Intent Storage**: IndexedDB for persistent local storage of trade intents
- **Intent Matching**: Client-side solver algorithm that finds compatible trading pairs
- **Privacy-First**: All intent discovery and matching happens locally without server dependencies
- **Local State**: Browser-based storage for user intents, matches, and transaction history

### Blockchain Integration (30% Namada)
- **Wallet Integration**: Namada Keychain browser extension for user authentication and transaction signing
- **Shielded Transfers**: All trades executed via Namada's MASP (Multi-Asset Shielded Pool)
- **Multi-Asset Support**: NAM, ATOM, OSMO, USDC tokens via IBC protocol
- **Mainnet Ready**: Production deployment on Namada mainnet (not testnet)

### Backend Architecture
- **Minimal Server**: Express.js server primarily for static file serving and development tooling
- **No Database Dependencies**: Application runs entirely client-side with optional in-memory storage for development
- **Decentralized Storage**: Uses browser IndexedDB instead of traditional backend database

### Data Layer
- **Schema Validation**: Zod for runtime type checking and validation
- **Intent Models**: Structured data types for trade intents, transactions, and wallet state
- **Local Persistence**: IndexedDB for storing user intents and transaction history
- **Optional Database**: Drizzle ORM configured for PostgreSQL but not actively used in production

### Privacy and Security
- **Zero-Knowledge Privacy**: All trades use Namada's shielded pool for complete transaction privacy
- **No Metadata Leakage**: Intent matching runs entirely client-side without exposing trade details
- **Decentralized Architecture**: No backend dependencies reduce attack surface and improve privacy

## External Dependencies

### Blockchain Infrastructure
- **Namada Network**: Primary blockchain for shielded token transfers and MASP functionality
- **Namada Keychain**: Browser extension wallet for user authentication and transaction signing
- **IBC Protocol**: Inter-blockchain communication for multi-asset support (ATOM, OSMO, USDC)

### Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript for component architecture
- **UI Components**: Radix UI primitives with shadcn/ui for accessible component patterns
- **Styling**: TailwindCSS for utility-first styling with custom design system
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript with strict configuration for compile-time safety
- **Database**: PostgreSQL with Drizzle ORM (configured but optional)
- **Hosting**: Replit-optimized configuration for easy deployment and development

### Optional Services
- **Neon Database**: Serverless PostgreSQL provider for optional backend storage
- **Analytics**: No tracking or analytics services to maintain privacy
- **External APIs**: No external API dependencies to ensure decentralized operation