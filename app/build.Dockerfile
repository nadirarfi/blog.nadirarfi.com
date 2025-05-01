FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from website directory
COPY website/package*.json website/bun.lock ./

# Install dependencies
RUN npm install

# Copy the content and website application
COPY website ./
COPY content ./src/content

# Build the static site
RUN npm run build 