# Stage 1: Build React app + run tests
FROM node:24 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Run tests here
RUN npm test

# Build the app
RUN npm run build

# Stage 2: Serve app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]