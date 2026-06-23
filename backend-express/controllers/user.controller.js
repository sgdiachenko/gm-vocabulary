import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Password hashing failed' });
    }
    try {
      const user = new User({
        email: req.body.email,
        password: hashedPassword
      });
      await user.save();
      return res.status(201).json(user);

    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: err.message });
    }
  })
};

export const login = (req, res) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        throw new Error('User does not exist');
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        throw new Error('Password does not match');
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'long_secret_string',
        { expiresIn: '1h' }
      );
      return res.status(200).json({token, expiresInSeconds: 3600, userId: fetchedUser._id});
    })
    .catch((err) => {
      return res.status(401).json({ message: err.message });
    });
};
