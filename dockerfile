# Multi-stage build for optimized Docker image

# Build stage for client
FROM node:16-alpine AS client-builder
WORKDIR /app/client
# Copy client package files and install dependencies
COPY client/package*.json ./
RUN npm ci --only=production
# Copy client source code
COPY client/ ./
# Build client
RUN npm run build

# Build stage for server
FROM node:16-alpine AS server-builder
WORKDIR /app/server
# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm ci --only=production
# Copy server source code
COPY server/ ./

# Final stage
FROM node:16-alpine
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built client from client-builder stage
COPY --from=client-builder /app/client/dist /app/client/dist

# Copy server files from server-builder stage
COPY --from=server-builder /app/server /app/server

# Set working directory to server
WORKDIR /app/server

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start server
CMD ["node", "app.js"]
