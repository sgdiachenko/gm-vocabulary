import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('API contracts with disposable MongoDB', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let ownerToken: string;
  let readerToken: string;
  let ownerId: string;
  const password = 'StructureTest123!';
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ownerEmail = `owner-${suffix}@example.com`;

  const api = () => request(app.getHttpServer());
  const asOwner = () => ({ Authorization: `Bearer ${ownerToken}` });
  const asReader = () => ({ Authorization: `Bearer ${readerToken}` });

  beforeAll(async () => {
    const uri = process.env['MONGODB_URI'] ?? '';
    if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/gm_structure_[\w-]+$/.test(uri)) {
      throw new Error('Set MONGODB_URI to a disposable local gm_structure_* database');
    }
    if (!process.env['JWT_SECRET']) throw new Error('Set a test JWT_SECRET');
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    connection = app.get<Connection>(getConnectionToken());
    await Promise.all(Object.values(connection.models).map((model) => model.init()));
    for (const [email, username] of [
      [ownerEmail, 'Owner'],
      [`reader-${suffix}@example.com`, 'Reader'],
    ]) {
      const signup = await api()
        .post('/api/auth/signup')
        .send({ email, username, password })
        .expect(201);
      expect(signup.body).toEqual({ _id: expect.any(String), email, username });
      const login = await api().post('/api/auth/login').send({ email, password }).expect(200);
      expect(login.body).toEqual({
        token: expect.any(String),
        expiresInSeconds: 3600,
        userId: signup.body._id,
        username,
      });
      if (username === 'Owner') {
        ownerToken = login.body.token;
        ownerId = signup.body._id;
      } else readerToken = login.body.token;
    }
  }, 30_000);

  afterAll(async () => {
    await app?.close();
  });

  it('keeps model names, physical collections, references and the populate virtual', async () => {
    expect(Object.keys(connection.models).sort()).toEqual(['Auth', 'Word', 'WordCollection']);
    expect(connection.models['Auth'].collection.name).toBe('users');
    expect(connection.models['Word'].collection.name).toBe('words');
    expect(connection.models['WordCollection'].collection.name).toBe('wordgroups');
    expect(connection.models['Word'].schema.path('userId').options['ref']).toBe('Auth');
    expect(connection.models['Word'].schema.path('groupId').options['ref']).toBe('WordCollection');
    expect(connection.models['WordCollection'].schema.path('userId').options['ref']).toBe('Auth');
    expect(connection.models['WordCollection'].schema.virtualpath('words')).toBeDefined();
  });

  it('rejects missing/invalid bearer tokens and invalid credentials', async () => {
    for (const path of ['/api/words', '/api/collections', '/api/collections/shared']) {
      await api().get(path).expect(401);
      await api().get(path).set('Authorization', 'Bearer invalid').expect(401);
    }
    await api().post('/api/auth/login').send({ email: ownerEmail, password: 'wrong' }).expect(401);
    await api()
      .post('/api/auth/signup')
      .send({
        email: ownerEmail,
        username: 'Duplicate',
        password,
      })
      .expect(409);
  });

  it('preserves production validation, transformation and object ID errors', async () => {
    const invalid = await api()
      .post('/api/auth/signup')
      .send({
        email: 'invalid',
        username: ' ',
        password: 'z',
        unexpected: true,
      })
      .expect(400);
    expect(invalid.body.message).toEqual(
      expect.arrayContaining([
        'property unexpected should not exist',
        'email must be an email',
        'Password must contain at least 8 characters',
      ]),
    );
    await api().post('/api/words').set(asOwner()).send({ word: '', extra: true }).expect(400);
    await api()
      .post('/api/words')
      .set(asOwner())
      .send({ word: 'cat', groupId: 'invalid' })
      .expect(400);
    await api().post('/api/words/copy').set(asOwner()).send({ ids: [] }).expect(400);
    await api()
      .delete('/api/words')
      .set(asOwner())
      .send({ ids: ['invalid'] })
      .expect(400);
    await api().get('/api/collections/invalid').set(asOwner()).expect(400);
    await api()
      .post('/api/collections/bulk')
      .set(asOwner())
      .send([{ name: '' }])
      .expect(400);
  });

  it('runs collection/word CRUD, populated reads and ownership checks against MongoDB', async () => {
    const group = await api()
      .post('/api/collections')
      .set(asOwner())
      .send({ name: 'Private' })
      .expect(201);
    const groupId = group.body._id;
    expect(group.body).toMatchObject({ name: 'Private', isShared: false, userId: ownerId });
    const word = await api()
      .post('/api/words')
      .set(asOwner())
      .send({
        word: 'cat',
        translation: 'кіт',
        description: 'animal',
        groupId,
      })
      .expect(201);
    const wordId = word.body._id;
    expect(word.body).toMatchObject({ word: 'cat', groupId, userId: ownerId });
    const populated = await api().get(`/api/collections/${groupId}`).set(asOwner()).expect(200);
    expect(populated.body.words).toEqual([expect.objectContaining({ _id: wordId, word: 'cat' })]);
    const list = await api().get('/api/collections').set(asOwner()).expect(200);
    expect(list.body).toContainEqual(
      expect.objectContaining({ _id: groupId, words: populated.body.words }),
    );
    const foreignWords = await api().get('/api/words').set(asReader()).expect(200);
    expect(foreignWords.body).not.toContainEqual(expect.objectContaining({ _id: wordId }));
    await api().get(`/api/collections/${groupId}`).set(asReader()).expect(404);
    await api()
      .put(`/api/collections/${groupId}`)
      .set(asReader())
      .send({ name: 'Forbidden' })
      .expect(404);
    await api().delete(`/api/collections/${groupId}`).set(asReader()).expect(404);
    await api().put(`/api/words/${wordId}`).set(asReader()).send({ word: 'Forbidden' }).expect(404);
    const foreignDelete = await api()
      .delete('/api/words')
      .set(asReader())
      .send({ ids: [wordId] })
      .expect(200);
    expect(foreignDelete.body).toEqual({ message: 'Words deleted', deletedCount: 0 });
    await api()
      .put(`/api/collections/${groupId}`)
      .set(asOwner())
      .send({ name: 'Renamed' })
      .expect(200, '');
    await api()
      .put(`/api/words/${wordId}`)
      .set(asOwner())
      .send({ translation: 'котик' })
      .expect(200, '');
    const words = await api().get('/api/words').set(asOwner()).expect(200);
    expect(words.body).toContainEqual(
      expect.objectContaining({ _id: wordId, translation: 'котик' }),
    );
    const removed = await api()
      .delete('/api/words')
      .set(asOwner())
      .send({ ids: [wordId] })
      .expect(200);
    expect(removed.body).toEqual({ message: 'Words deleted', deletedCount: 1 });
    await api().delete(`/api/collections/${groupId}`).set(asOwner()).expect(200, '');
    await api().get(`/api/collections/${groupId}`).set(asOwner()).expect(404);
  });

  it('preserves bulk, shared read/populate and copy without a target collection', async () => {
    const groups = await api()
      .post('/api/collections/bulk')
      .set(asOwner())
      .send([{ name: 'Shared', isShared: true }, { name: 'Private bulk' }])
      .expect(201);
    expect(groups.body).toHaveLength(2);
    const sharedId = groups.body[0]._id;
    const word = await api()
      .post('/api/words')
      .set(asOwner())
      .send({ word: 'dog', groupId: sharedId })
      .expect(201);
    const shared = await api().get('/api/collections/shared').set(asReader()).expect(200);
    expect(shared.body).toContainEqual(
      expect.objectContaining({
        _id: sharedId,
        words: [expect.objectContaining({ _id: word.body._id, word: 'dog' })],
      }),
    );
    await api().get(`/api/collections/${sharedId}`).set(asReader()).expect(200);
    const copy = await api()
      .post('/api/words/copy')
      .set(asReader())
      .send({ ids: [word.body._id] })
      .expect(201);
    expect(copy.body).toHaveLength(1);
    expect(copy.body[0]).toMatchObject({ word: 'dog' });
    expect(copy.body[0]._id).not.toBe(word.body._id);
    expect(copy.body[0].userId).not.toBe(ownerId);
    expect(copy.body[0]).not.toHaveProperty('groupId');
    await api()
      .post('/api/words/copy')
      .set(asReader())
      .send({ ids: [new Types.ObjectId().toString()] })
      .expect(404);
  });

  it('backfills a legacy username in the existing users collection', async () => {
    await connection
      .collection('users')
      .updateOne({ _id: new Types.ObjectId(ownerId) }, { $unset: { username: '' } });
    const login = await api()
      .post('/api/auth/login')
      .send({ email: ownerEmail, password })
      .expect(200);
    expect(login.body.username).toBe(ownerEmail.split('@')[0]);
    const stored = await connection
      .collection('users')
      .findOne({ _id: new Types.ObjectId(ownerId) });
    expect(stored?.['username']).toBe(login.body.username);
    expect(stored?.['password']).not.toBe(password);
  });
});
