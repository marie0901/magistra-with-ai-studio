# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Install yarn globally
RUN npm install -g yarn

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
# Use npm ci for reliable dependency installation in Cloud Run
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]