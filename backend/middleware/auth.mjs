import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  console.log('Authorization header:', header);  // Лог заголовка

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);  // Лог декодированного токена
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
}
