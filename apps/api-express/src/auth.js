import { Router } from 'express';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from './http.js';
import { loginInput, signupInput } from './validation.js';

export function authenticate(jwtSecret) {
  return (request, _response, next) => {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) return next(new HttpError(401, 'Authentication failed'));
    try {
      const payload = jwt.verify(token, jwtSecret);
      if (typeof payload !== 'object' || typeof payload.userId !== 'string') {
        throw new Error('Invalid token payload');
      }
      request.user = { id: payload.userId, email: payload.email };
      return next();
    } catch {
      return next(new HttpError(401, 'Authentication failed'));
    }
  };
}

export function authRoutes({ Auth }, jwtSecret) {
  const router = Router();

  router.post('/signup', async (request, response) => {
    const input = signupInput(request.body);
    const user = await Auth.create({
      email: input.email,
      username: input.username,
      password: await hash(input.password, 10),
    });
    return response.status(201).json({ _id: user._id, email: user.email, username: user.username });
  });

  router.post('/login', async (request, response) => {
    const credentials = loginInput(request.body);
    const user = await Auth.findOne({ email: credentials.email });
    if (!user || !(await compare(credentials.password, user.password))) {
      throw new HttpError(401, 'Invalid email or password');
    }
    if (!user.username?.trim()) {
      user.username = user.email.split('@')[0];
      await user.save();
    }
    const expiresInSeconds = 3600;
    const userId = user._id.toString();
    const token = jwt.sign({ email: user.email, userId }, jwtSecret, { expiresIn: expiresInSeconds });
    return response.json({ token, expiresInSeconds, userId, username: user.username });
  });

  return router;
}
