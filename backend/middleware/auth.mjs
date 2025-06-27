import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  // 🔐 Логируем заголовок авторизации
  console.log('🔐 [authMiddleware] Authorization Header:', authHeader);

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ authMiddleware → Токен отсутствует или неправильный формат');
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🧾 [authMiddleware] JWT token:', token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('📬 [authMiddleware] Decoded JWT payload:', decoded);

    if (!decoded?.userId) {
      console.warn('⚠️ authMiddleware → JWT без userId');
      return res.status(401).json({ error: 'Неверный токен авторизации: userId отсутствует' });
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role || 'USER',
    };

    console.log('✅ [authMiddleware] req.user сформирован:', req.user);

    next();
  } catch (err) {
    console.error('❌ authMiddleware → JWT ошибка:', err.message);
    return res.status(401).json({ error: 'Неверный токен авторизации' });
  }
}
