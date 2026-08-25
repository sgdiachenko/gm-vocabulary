FROM node:24-alpine AS development

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npx", "nx", "serve", "api"]

FROM development AS build

RUN npx nx build api --configuration=production

FROM node:24-alpine AS production

WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=build --chown=node:node /workspace/dist/apps/api ./api
RUN cd api && npm ci --omit=dev

USER node
EXPOSE 3000

CMD ["node", "api/main.js"]
