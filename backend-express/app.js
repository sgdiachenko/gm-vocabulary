import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import wordGroupRoutes from './routes/wordGroup.routes.js';
import wordRoutes from './routes/word.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb://localhost:27017/gm-vocabulary'
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.error("Connection failed!", err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use('/api/user', userRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/collections', wordGroupRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

export default app;
