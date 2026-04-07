# Use Node image
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy all code
COPY . .

# Build app
RUN npm run build

# Default command
CMD ["npm", "run", "preview"]