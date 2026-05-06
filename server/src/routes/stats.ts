import { Router, Request, Response } from 'express';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { StatsService } from '../services/stats-service';
import { Role, ROLE_PERMISSIONS, DataScope } from '../types';

const router = Router();
const statsService = new StatsService();

router.use(authMiddleware);

router.get(
  '/dashboard',
  requireRoles(Role.ADMIN, Role.DEPT_DIRECTOR, Role.ATTENDING, Role.HEAD_NURSE),
  (req: Request, res: Response) => {
    const permissions = ROLE_PERMISSIONS[req.user!.role];
    const deptId = permissions.dataScope === DataScope.ALL
      ? (req.query.departmentId as string | undefined)
      : req.user!.departmentId;

    const stats = statsService.getDashboardStats(deptId);
    res.json({ success: true, data: stats });
  }
);

router.get(
  '/quality-report',
  requireRoles(Role.ADMIN, Role.DEPT_DIRECTOR, Role.ATTENDING, Role.HEAD_NURSE),
  (_req: Request, res: Response) => {
    const report = statsService.getQualityReport();
    res.json({ success: true, data: report });
  }
);

router.get('/departments', authMiddleware, async (req: Request, res: Response) => {
  const { departments } = require('../data/mock-data');
  res.json({ success: true, data: departments });
});

export default router;
