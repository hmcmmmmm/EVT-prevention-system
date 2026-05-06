import { Router, Request, Response } from 'express';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { users, departments } from '../data/mock-data';
import { Role, ROLE_PERMISSIONS } from '../types';

const router = Router();
router.use(authMiddleware);
router.use(requireRoles(Role.ADMIN));

router.get('/', (_req: Request, res: Response) => {
  const safeUsers = users.map(({ passwordHash, ...rest }) => ({
    ...rest,
    permissions: ROLE_PERMISSIONS[rest.role],
    departmentName: departments.find(d => d.id === rest.departmentId)?.name || '-',
  }));
  res.json({ success: true, data: safeUsers, total: safeUsers.length });
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

router.patch('/:id/toggle', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' });
    return;
  }
  user.isActive = !user.isActive;
  res.json({ success: true, data: { id: user.id, isActive: user.isActive } });
});

export default router;
