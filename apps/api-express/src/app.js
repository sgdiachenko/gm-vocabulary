import express from 'express';
import { authenticate, authRoutes } from './auth.js';
import { collectionRoutes } from './collections.js';
import { errorHandler } from './http.js';
import { wordRoutes } from './words.js';

const allowedOrigins = new Set([
  'http://localhost:4200',
  'https://vocabulary-angular.vercel.app',
]);

export function createApp({ models, jwtSecret }) {
  const app = express();
  app.use(express.json());
  app.use((request, response, next) => {
    const origin = request.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      if (request.method === 'OPTIONS') return response.sendStatus(204);
    }
    return next();
  });

  const requireAuth = authenticate(jwtSecret);
  app.use('/api/auth', authRoutes(models, jwtSecret));
  app.use('/api/words', wordRoutes(models, requireAuth));
  app.use('/api/collections', collectionRoutes(models, requireAuth));
  app.use(errorHandler);
  return app;
}
