# ---------- Build Angular ----------
    FROM node:24-alpine AS frontend-build

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps
    
    COPY angular.json ./
    COPY tsconfig*.json ./
    COPY src ./src
    
    RUN npm run build
    
    
    # ---------- Backend deps (root package-lock) ----------
    FROM node:24-alpine AS backend-build
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --omit=dev  --legacy-peer-deps
    
    COPY backend ./backend
    
    
    # ---------- Production ----------
    FROM node:24-alpine
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    COPY --from=backend-build /app ./
    COPY --from=frontend-build /app/dist/gm-vocabulary/browser ./backend/public
    
    WORKDIR /app
    
    EXPOSE 3000
    
    CMD ["node", "backend/server.js"]