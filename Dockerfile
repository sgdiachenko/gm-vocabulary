# Dev Angular
FROM node:20.19.0
WORKDIR /app
COPY . .
RUN npm install

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--configuration", "playwright"]
