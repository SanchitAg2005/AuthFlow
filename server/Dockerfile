# Stage 1: Build & Prune Development Dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all packages (including devDependencies for TypeScript/tests if applicable)
RUN npm ci

# Copy server codebase
COPY . .

# Stage 2: Production Execution Image
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy clean source code files from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 5000

CMD ["node", "src/server.js"]
