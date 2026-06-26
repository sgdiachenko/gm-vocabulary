import express from 'express';

import {
  addGroup,
  addGroups,
  deleteGroup, getGroup,
  getSharedGroups,
  getUserGroups,
  updateGroup
} from "../controllers/wordGroup.controller.js";
import checkAuth from '../middleware/check-auth.js';

const wordGroupRoutes = express.Router();

wordGroupRoutes.get('', checkAuth, getUserGroups);
wordGroupRoutes.get('/shared', checkAuth, getSharedGroups);
wordGroupRoutes.get('/:id', checkAuth, getGroup);
wordGroupRoutes.post('', checkAuth, addGroup);
wordGroupRoutes.post('/bulk', checkAuth, addGroups);
wordGroupRoutes.put('/:id', checkAuth, updateGroup);
wordGroupRoutes.delete('/:id', checkAuth, deleteGroup);

export default wordGroupRoutes;
