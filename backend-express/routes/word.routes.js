import express from 'express';

import checkAuth from '../middleware/check-auth.js';
import {
  addWord,
  updateWord,
  deleteWords,
  getWords
} from '../controllers/word.controller.js';

const wordRoutes = express.Router();

wordRoutes.get('', checkAuth, getWords);
wordRoutes.post('', checkAuth, addWord);
wordRoutes.put('/:id', checkAuth, updateWord);
wordRoutes.delete('', checkAuth, deleteWords);

export default wordRoutes;
