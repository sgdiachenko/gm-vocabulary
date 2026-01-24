# Build Angular
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ng build --configuration docker

# Serve
FROM nginx:alpine
COPY --from=build /app/dist/gm-vocabulary-angular-spa /usr/share/nginx/html
