FROM node:16-alpine

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port
EXPOSE 5173

# Start the application
CMD ["sh", "-c", "npm install && npm run dev -- --host"]