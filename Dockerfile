# This Dockerfile is optimized for the Payload Website Template.
# It uses a multi-stage build to create a small, secure production image.

# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including devDependencies) needed for the build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Generate Payload types and build the application
RUN pnpm generate:types
RUN pnpm build

# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install pnpm and runtime OS dependencies
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/start-and-migrate.sh ./start-and-migrate.sh

# Install only production dependencies to create a smaller final image
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

# Run the startup script
CMD ["./start-and-migrate.sh"]
