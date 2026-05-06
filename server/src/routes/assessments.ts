import { Router, Request, Response } from 'express';
import { authMiddleware, requireRoles } from '../middleware/auth';
import { AssessmentService } from '../services/assessment-service';
import { Role } from '../types';

const router = Router();
const assessmentService = new AssessmentService();

router.use(authMiddleware);

router.get('/scale-factors/:scaleType', (req: Request, res: Response) => {
  const factors = assessmentService.getScaleFactors(req.params.scaleType as any);
  res.json({ success: true, data: factors });
});

router.get('/patient/:patientId', (req: Request, res: Response) => {
  const assessments = assessmentService.getAssessmentsByPatient(req.params.patientId);
  res.json({ success: true, data: assessments });
});

router.post(
  '/',
  requireRoles(Role.DEPT_DIRECTOR, Role.ATTENDING, Role.RESIDENT, Role.HEAD_NURSE, Role.NURSE),
  (req: Request, res: Response) => {
    try {
      const assessment = assessmentService.createAssessment(req.body, req.user!);
      res.status(201).json({ success: true, data: assessment });
    } catch (err) {
      res.status(500).json({ success: false, message: '创建评估失败' });
    }
  }
);

// 预防方案
router.get('/prevention/:patientId', (req: Request, res: Response) => {
  const plans = assessmentService.getPreventionPlans(req.params.patientId);
  res.json({ success: true, data: plans });
});

router.post(
  '/prevention',
  requireRoles(Role.DEPT_DIRECTOR, Role.ATTENDING),
  (req: Request, res: Response) => {
    try {
      const plan = assessmentService.createPreventionPlan(req.body, req.user!);
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      res.status(500).json({ success: false, message: '创建预防方案失败' });
    }
  }
);

// 预警
router.get('/alerts', (req: Request, res: Response) => {
  const deptId = req.query.departmentId as string | undefined;
  const pendingOnly = req.query.pending === 'true';
  const alertList = pendingOnly
    ? assessmentService.getPendingAlerts(deptId)
    : assessmentService.getAlerts(deptId);
  res.json({ success: true, data: alertList, total: alertList.length });
});

router.patch('/alerts/:id/handle', authMiddleware, (req: Request, res: Response) => {
  const alert = assessmentService.handleAlert(req.params.id, req.user!.userId);
  if (!alert) {
    res.status(404).json({ success: false, message: '预警不存在' });
    return;
  }
  res.json({ success: true, data: alert });
});

export default router;
