import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { authMiddleware } from '../middleware/auth';
import { users } from '../data/mock-data';
import { ROLE_PERMISSIONS } from '../types';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: '请输入用户名和密码' });
      return;
    }

    const result = await authService.login({ username, password });
    if (!result) {
      res.status(401).json({ success: false, message: '用户名或密码错误' });
      return;
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({
    success: true,
    data: {
      user: safeUser,
      permissions: ROLE_PERMISSIONS[user.role],
    },
  });
});

export default router;
