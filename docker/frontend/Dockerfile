FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files for workspaces
COPY package.json turbo.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend and its dependencies
RUN npm run build --workspace=frontend

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/packages/frontend/.next/standalone ./
COPY --from=builder /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the frontend
CMD ["node", "packages/frontend/server.js"] 