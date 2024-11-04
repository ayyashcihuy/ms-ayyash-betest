# Use an official Node.js runtime as a base image
FROM node:20.8.1-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

RUN npm run build && \
    rm -rf node_modules && \
    npm ci --production

# Start the application
CMD ["npm", "start"]
