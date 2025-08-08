# user-service/Dockerfile

# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# to install dependencies first. This leverages Docker's build cache:
# if only source code changes, dependencies aren't reinstalled.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application source code
# This includes your src/ directory, .env file, etc.
COPY . .

# Build the TypeScript code into JavaScript
# This runs the 'build' script defined in your package.json
RUN npm run build

# Expose the port the Express app runs on
# This tells Docker that the container listens on this port
EXPOSE 5000

# Command to run the application when the container starts
# This runs the 'start' script defined in your package.json
CMD ["npm", "start"]
