# ---- Base Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the entire source code
COPY . .

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy the production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose application port
EXPOSE 80

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Start the application
CMD ["node", "Server.js"]
