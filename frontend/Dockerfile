# Use the official Node.js image from the Docker Hub
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the rest of the code into the container
COPY . .

# Expose the port the app runs on (Vite dev server default is 5173)
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]