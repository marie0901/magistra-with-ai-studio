# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install

# Copy source code
COPY . .

# Accept build argument for API key
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Debug: Show environment variables
RUN echo "Build-time VITE_GEMINI_API_KEY: $VITE_GEMINI_API_KEY"
RUN env | grep VITE

# Build the application
RUN yarn build

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