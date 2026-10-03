import mongoose from 'mongoose';

// Same MongoDB collections and document fields as the Nest API.
const authSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  username: { type: String, trim: true },
  password: { type: String, required: true },
}, { collection: 'users' });

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, default: undefined },
  description: { type: String, default: undefined },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Auth' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordCollection', default: undefined },
});

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isShared: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Auth' },
}, {
  collection: 'wordgroups',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

collectionSchema.virtual('words', {
  ref: 'Word',
  localField: '_id',
  foreignField: 'groupId',
});

export function createModels(connection) {
  return {
    Auth: connection.model('Auth', authSchema),
    Word: connection.model('Word', wordSchema),
    WordCollection: connection.model('WordCollection', collectionSchema),
  };
}
