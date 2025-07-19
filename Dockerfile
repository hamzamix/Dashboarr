# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
# Use 'npm ci' for faster, more reliable builds in CI/CD environments
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# As root, create the data directory for the volume and set ownership to the 'node' user
RUN mkdir -p /data && chown node:node /data

# Copy built assets, server files, and package manifests from the build stage
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY package-lock.json ./
COPY server.js ./

# Install only production dependencies for a smaller image
RUN npm install --omit=dev

# Switch to the non-root 'node' user for enhanced security
USER node

# Expose the port the Node.js server will run on inside the container
EXPOSE 3000

# The command to start the server when the container launches
CMD ["node", "server.js"]
