FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json files for workspaces
COPY package.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/common/package.json ./packages/common/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build backend and its dependencies
RUN npm run build --workspace=backend

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Copy necessary files
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/packages/backend/package.json /app/packages/backend/
COPY --from=builder /app/packages/backend/dist /app/packages/backend/dist
COPY --from=builder /app/packages/common/dist /app/packages/common/dist
COPY --from=builder /app/packages/types/dist /app/packages/types/dist

# Install production dependencies only
RUN npm install --omit=dev

# Create storage directory for media files
RUN mkdir -p /app/storage

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Start the backend
CMD ["node", "packages/backend/dist/index.js"] 