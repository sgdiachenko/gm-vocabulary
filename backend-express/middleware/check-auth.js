import jwt from 'jsonwebtoken';

const checkAuth = function(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'long_secret_string');
    req.user = {email: decodedToken.email, id: decodedToken.userId};
    next();
  } catch (error) {
    res.status(401).json({message: `Authentication failed`});
  }
}

export default checkAuth;
