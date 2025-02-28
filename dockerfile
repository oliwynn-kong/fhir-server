# Use the official Node.js LTS image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose port 3000 for the FHIR server
EXPOSE 3000

# Start the server
CMD [ "node", "fhir-server.js" ]