# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove any existing registry configurations and lock files
RUN rm -f .yarnrc .npmrc yarn.lock package-lock.json

# Configure yarn to use public registry
RUN yarn config set registry https://registry.npmjs.org/

# Install patch-package globally first to avoid build issues
RUN yarn global add patch-package

# Install all dependencies (including dev dependencies for build)
RUN yarn install

# Copy source code
COPY . .

# Accept build argument for API key
ARG VITE_GEMINI_API_KEY=AIzaSyAVyDA3997ih9xNXdy9phEiThmEOsxIq_0
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