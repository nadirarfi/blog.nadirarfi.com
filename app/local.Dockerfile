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

# Expose the default Astro development port
EXPOSE 8080

# Start development server with specified host and port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]