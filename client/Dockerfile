# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed dependencies
RUN npm install --silent

# Copy the rest of the application code to the working directory
COPY . .

# Build the React application
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy the built React application from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 3000

# Command to start Nginx (already the default, but good to be explicit)
CMD ["nginx", "-g", "daemon off;"]