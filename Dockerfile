# Build Angular
FROM node:20.19.0 as build
WORKDIR /app
COPY . .
RUN npm install

RUN npm run build:docker

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/gm-vocabulary-angular-spa /usr/share/nginx/html
