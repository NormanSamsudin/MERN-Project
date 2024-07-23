# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Define environment variables for ngrok
ENV NGROK_AUTHTOKEN=2iMAMjsxKNJUABhg6y1MAYNCnZY_6hXg5naXLefKKdjJ3afGe

# Define the command to run your app with ngrok
CMD ["npm", "run", "start:ngrok"]
