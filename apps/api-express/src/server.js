import mongoose from 'mongoose';
import { createApp } from './app.js';
import { createModels } from './models.js';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET is not configured');

const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/gm-vocabulary';
await mongoose.connect(mongoUri);

const app = createApp({ models: createModels(mongoose.connection), jwtSecret });
const port = process.env.PORT ?? 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Express comparison API listening on ${port}`);
});
