import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role || 'USER',
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ошибка проверки токена' });
  }
}
