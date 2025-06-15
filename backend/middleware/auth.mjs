import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error('❌ JWT ошибка:', err.message);
    return res.status(401).json({ error: 'Неверный токен авторизации' });
  }
}
