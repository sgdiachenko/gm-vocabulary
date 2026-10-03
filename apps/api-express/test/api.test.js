import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { createApp } from '../src/app.js';

const secret = 'test-secret';
const ownerId = new Types.ObjectId();
const wordId = new Types.ObjectId();
const token = jwt.sign({ email: 'owner@example.com', userId: ownerId.toString() }, secret);

function makeModels() {
  return {
    Auth: { create: vi.fn(), findOne: vi.fn() },
    Word: {
      create: vi.fn(), find: vi.fn(), updateOne: vi.fn(), deleteMany: vi.fn(), insertMany: vi.fn(),
    },
    WordCollection: {
      create: vi.fn(), find: vi.fn(), findOne: vi.fn(), updateOne: vi.fn(),
      deleteOne: vi.fn(), insertMany: vi.fn(),
    },
  };
}

describe('Express comparison API', () => {
  it('rejects unauthenticated word requests', async () => {
    const response = await request(createApp({ models: makeModels(), jwtSecret: secret }))
      .get('/api/words');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication failed');
  });

  it('rejects unknown fields and invalid input before a model call', async () => {
    const models = makeModels();
    const app = createApp({ models, jwtSecret: secret });
    const response = await request(app).post('/api/words').set('Authorization', `Bearer ${token}`)
      .send({ word: 'cat', userId: new Types.ObjectId().toString() });
    expect(response.status).toBe(400);
    expect(models.Word.create).not.toHaveBeenCalled();
  });

  it('never returns a password from signup', async () => {
    const models = makeModels();
    models.Auth.create.mockResolvedValue({
      _id: ownerId, email: 'owner@example.com', username: 'Owner', password: 'hashed',
    });
    const response = await request(createApp({ models, jwtSecret: secret }))
      .post('/api/auth/signup')
      .send({ username: ' Owner ', email: 'owner@example.com', password: 'Strong123!' });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      _id: ownerId.toString(), email: 'owner@example.com', username: 'Owner',
    });
    expect(models.Auth.create.mock.calls[0][0].password).not.toBe('Strong123!');
  });

  it('scopes word updates to the authenticated owner', async () => {
    const models = makeModels();
    models.Word.updateOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ matchedCount: 0 }) });
    const response = await request(createApp({ models, jwtSecret: secret }))
      .put(`/api/words/${wordId}`).set('Authorization', `Bearer ${token}`)
      .send({ translation: 'кіт' });
    expect(response.status).toBe(404);
    expect(models.Word.updateOne).toHaveBeenCalledWith(
      { _id: wordId, userId: ownerId },
      { word: undefined, translation: 'кіт', description: undefined },
    );
  });

  it('scopes bulk word deletion to the authenticated owner', async () => {
    const models = makeModels();
    models.Word.deleteMany.mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) });
    const response = await request(createApp({ models, jwtSecret: secret }))
      .delete('/api/words').set('Authorization', `Bearer ${token}`)
      .send({ ids: [wordId.toString()] });
    expect(response.status).toBe(200);
    expect(models.Word.deleteMany).toHaveBeenCalledWith({
      _id: { $in: [wordId] }, userId: ownerId,
    });
  });

  it('copies only words from another user’s shared collection', async () => {
    const models = makeModels();
    const groupId = new Types.ObjectId();
    const sourceWord = {
      _id: wordId, word: 'cat', translation: 'кіт', description: 'animal', groupId,
    };
    models.Word.find.mockReturnValue({
      lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([sourceWord]) }),
    });
    models.WordCollection.find.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([{ _id: groupId }]) }),
      }),
    });
    models.Word.insertMany.mockResolvedValue([{ word: 'cat', userId: ownerId }]);
    const response = await request(createApp({ models, jwtSecret: secret }))
      .post('/api/words/copy').set('Authorization', `Bearer ${token}`)
      .send({ ids: [wordId.toString()] });
    expect(response.status).toBe(201);
    expect(models.WordCollection.find).toHaveBeenCalledWith({
      _id: { $in: [groupId] }, isShared: true, userId: { $ne: ownerId },
    });
    expect(models.Word.insertMany).toHaveBeenCalledWith([{
      word: 'cat', translation: 'кіт', description: 'animal', userId: ownerId,
    }]);
  });

  it('rejects access to a private collection owned by another user', async () => {
    const models = makeModels();
    models.WordCollection.findOne.mockReturnValue({
      populate: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
    });
    const response = await request(createApp({ models, jwtSecret: secret }))
      .get(`/api/collections/${wordId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(models.WordCollection.findOne).toHaveBeenCalledWith({
      _id: wordId,
      $or: [{ userId: ownerId }, { isShared: true }],
    });
  });
});
