# Multi-stage build for Node.js application
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Backend build stage
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY backend/src ./src/
COPY backend/tsconfig.json ./
COPY common ../common/
RUN pnpm run build

# Frontend build stage
FROM base AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend ./
COPY common ../common/
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend package files
COPY --chown=nodejs:nodejs backend/package.json backend/pnpm-lock.yaml ./

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install production dependencies and allow builds
RUN pnpm install --prod --frozen-lockfile
RUN pnpm config set node-gyp-cache ~/.pnpm-store/.node-gyp-cache
RUN cd node_modules/.pnpm/sqlite3@5.1.7/node_modules/sqlite3 && npm run install

# Copy built backend
COPY --from=backend-build --chown=nodejs:nodejs /app/backend/dist ./dist
# Copy database from source
COPY --chown=nodejs:nodejs backend/smart10.db ./smart10.db

# Copy built frontend
COPY --from=frontend-build --chown=nodejs:nodejs /app/dist ./dist/frontend/dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { if (res.statusCode !== 200) process.exit(1) })"

# Start the application
CMD ["node", "dist/backend/src/index.js"]