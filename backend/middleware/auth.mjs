import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ authMiddleware → Токен отсутствует или неправильный формат');
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.userId) {
      console.warn('⚠️ authMiddleware → JWT без userId');
      return res.status(401).json({ error: 'Неверный токен авторизации' });
    }

    // ✅ Исправлено: используем "id" для совместимости со всеми роутами
    req.user = {
      id: decoded.userId,
      role: decoded.role || 'USER',
    };

    next();
  } catch (err) {
    console.error('❌ authMiddleware → JWT ошибка:', err.message);
    return res.status(401).json({ error: 'Неверный токен авторизации' });
  }
}
