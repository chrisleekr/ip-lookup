# Build stage
FROM node:20.11-alpine AS builder

# Add build-time labels
LABEL stage=builder

# Add build arguments for better versioning
ARG VERSION
ARG BUILD_DATE
ARG COMMIT_SHA

WORKDIR /app

# Add package files for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies with specific npm version for consistency
RUN npm ci && \
  # Clean npm cache to reduce image size
  npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20.11-alpine AS production

# Add labels following OCI image spec
LABEL org.opencontainers.image.authors="chris@chrislee.kr" \
  org.opencontainers.image.description="IP Lookup Service" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.created=${BUILD_DATE} \
  org.opencontainers.image.revision=${COMMIT_SHA}

# Set Node.js to run in production mode and other security configs
ENV NODE_ENV=production \
  # Disable npm update notifier
  NO_UPDATE_NOTIFIER=1 \
  # Disable npm funding message
  DISABLE_OPENCOLLECTIVE=true \
  # Set proper timezone
  TZ=UTC

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and setup security
RUN apk add --no-cache \
  curl=8.11.1-r0 \
  tzdata=2024b-r0 && \
  npm ci --omit=dev && \
  # Clean npm cache and remove unnecessary files
  npm cache clean --force && \
  rm -rf /tmp/* && \
  # Set proper permissions
  chown -R node:node /app

# Copy built files from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist/

RUN ls -la /app && ls -la /app/dist

# Create directory for MaxMind databases
RUN mkdir -p /app/data && \
  chown -R node:node /app/data

# Switch to non-root user
USER node

# Download MaxMind databases
RUN npm run update-db

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
