# UnifyDesk User Registration System

## Overview

UnifyDesk is a modern web application featuring a comprehensive user registration system with robust authentication, verification, and modern UI components. The application is built as a full-stack solution with React frontend and Express.js backend, utilizing PostgreSQL for data persistence and modern development tools for optimal developer experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system supporting light/dark modes
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (Neon serverless connection)
- **Authentication**: Custom session-based authentication with bcrypt password hashing
- **Validation**: Zod schemas for runtime type validation
- **Rate Limiting**: Express rate limiting for OTP endpoints

### Key Components

#### User Registration Flow
1. **Multi-step Form Validation**: Comprehensive client-side validation using Zod schemas
2. **Real-time Availability Checking**: Username and email availability verification
3. **Dual Verification System**: Both email and phone number verification via OTP
4. **Password Security**: Strength meter and secure hashing with bcrypt
5. **Visual Captcha**: Custom captcha implementation for bot protection
6. **Optional Google OAuth**: Firebase-based Google authentication (configurable)

#### Database Schema
- **Users Table**: Comprehensive user profile with verification status tracking
- **OTP Codes Table**: Secure OTP management with attempt limits and expiration
- **Sessions Table**: Session-based authentication tracking

#### Security Features
- Rate limiting on OTP requests (5 attempts per 3 minutes)
- Password strength requirements and validation
- Email and phone verification before account activation
- Session-based authentication with secure cookie handling
- Input validation and sanitization at multiple layers

## Data Flow

### Registration Process
1. User fills registration form with client-side validation
2. Username/email availability checked via API endpoints
3. Form submission triggers user creation with encrypted password
4. OTP sent to both email and phone for verification
5. User verifies both email and phone via OTP system
6. Account activated upon successful dual verification

### Authentication Flow
1. Session-based authentication using secure session IDs
2. Password verification against bcrypt hashes
3. Session persistence in PostgreSQL with expiration tracking
4. Optional Google OAuth integration for simplified login

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Components**: Radix UI primitives, Lucide icons, Tailwind CSS
- **Backend**: Express.js, bcrypt for password hashing, express-rate-limit
- **Database**: Drizzle ORM, @neondatabase/serverless, PostgreSQL

### Optional Integrations
- **Email Service**: Nodemailer and SendGrid support (disabled in demo mode)
- **Firebase**: Google OAuth authentication (configurable)
- **3D Graphics**: Three.js for enhanced UI animations

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **Type Safety**: TypeScript across full stack
- **Database Management**: Drizzle Kit for migrations and schema management
- **Development Experience**: Replit integration, runtime error handling

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts development server on port 5000
- **Database**: Drizzle push for schema synchronization during development
- **Hot Reload**: Vite HMR for instant frontend updates, tsx for backend restart

### Production Deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles backend
- **Database**: Migration-based deployment using Drizzle Kit
- **Environment**: Node.js production server with environment variable configuration
- **Scaling**: Replit autoscale deployment target configured

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment designation (development/production)
- Firebase configuration variables (optional for Google OAuth)
- Email service configuration (optional, defaults to demo mode)

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
- September 4, 2025. GitHub import completed and Replit environment configured:
  * Node.js 20 and all dependencies installed successfully
  * PostgreSQL database configured and schema migrations applied
  * Development workflow running on port 5000 with Vite HMR
  * Deployment configuration set for autoscale target
  * All TypeScript compilation issues resolved
  * Full-stack application ready for development and production
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```