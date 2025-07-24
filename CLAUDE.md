# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack blog application with:
- **Frontend**: React 18 + Vite + Material Tailwind + Redux Toolkit
- **Backend**: Node.js + Express + PostgreSQL (Sequelize ORM) + Redis
- **Real-time**: Socket.io for chat functionality
- **Deployment**: Docker-based with docker-compose

## Essential Commands

### Development
```bash
# Start development environment (recommended)
make dev

# Or manually:
cd client && npm run dev  # Frontend at localhost:5173
cd server && npm run dev  # Backend at localhost:3000
```

### Production
```bash
# Build and start production
make prod

# Or step by step:
make build  # Build Docker images
make up     # Start services
```

### Testing & Linting
```bash
# Run tests (server only)
make test
# Or: cd server && npm test

# Run linting
make lint
# Fix linting issues
make lint-fix

# Run specific test
cd server && npm test -- <test-file-path>
```

### Database & Services
```bash
# View logs
make logs

# Clean up everything (containers, volumes, networks)
make clean

# Connect to PostgreSQL
docker exec -it postgres psql -U admin -d blogdb
```

## Architecture

### Backend Structure
```
server/
├── controllers/    # Request handlers - handle HTTP requests
├── services/       # Business logic - complex operations
├── models/         # Sequelize models - database schema
├── routers/        # Express routes - API endpoints
├── middlewares/    # Authentication, validation, error handling
└── utils/          # Helpers (email, file upload, etc.)
```

### Frontend Structure
```
client/
├── src/api/        # API client configuration and endpoints
├── src/hooks/      # Custom React hooks for data fetching
├── src/store/      # Redux slices (auth, theme, language)
├── src/pages/      # Page components
└── src/components/ # Reusable UI components
```

### Key Patterns

**API Request Flow**:
1. Client makes request via hooks (e.g., `usePost`, `useCategory`)
2. Request hits Express router
3. Middleware validates (Joi) and authenticates (JWT)
4. Controller calls service layer
5. Service interacts with database via Sequelize models
6. Response sent back through middleware chain

**Authentication**:
- JWT-based with access and refresh tokens
- Tokens stored in httpOnly cookies
- Auth middleware checks tokens on protected routes

**Real-time Features**:
- Socket.io handles chat functionality
- Events: join-room, send-message, typing indicators
- Room-based architecture for private conversations

## Database Schema

Main entities:
- **User**: Authentication, profile, roles (admin/member)
- **Post**: Blog posts with status (draft/published/scheduled)
- **Category/Tag**: Post categorization
- **Community**: User communities with posts
- **Room/Message**: Chat system

## Environment Variables

Critical environment variables needed:
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: Token signing
- `EMAIL_*`: Email service configuration
- `UPLOAD_MAX_SIZE`: File upload limits

## API Documentation

Swagger UI available at: `http://localhost:3000/api-docs`

## Common Development Tasks

### Adding a New API Endpoint
1. Create route in `server/routers/`
2. Add controller method in `server/controllers/`
3. Implement business logic in `server/services/`
4. Add validation schema using Joi
5. Update Swagger documentation

### Adding a New Frontend Feature
1. Create API hook in `client/src/hooks/`
2. Add page/component in appropriate directory
3. Use Material Tailwind components for UI
4. Connect to Redux store if needed
5. Add translations to `client/src/i18n/locales/`

### Database Changes
1. Modify Sequelize model in `server/models/`
2. Update seed data if needed
3. Test with `make dev` (auto-syncs in development)
4. For production, create migration scripts

## Important Notes

- The project recently migrated from MongoDB to PostgreSQL
- Multi-language support for TR, EN, AR, FR
- File uploads handled by Multer, stored in `server/uploads/`
- Rate limiting configured on auth endpoints
- CORS configured for development (localhost:5173)