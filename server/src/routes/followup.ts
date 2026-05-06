import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { FollowupService } from '../services/followup-service';

const router = Router();
const followupService = new FollowupService();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const records = followupService.getFollowups(status);
  res.json({ success: true, data: records, total: records.length });
});

router.get('/stats', (_req: Request, res: Response) => {
  const stats = followupService.getFollowupStats();
  res.json({ success: true, data: stats });
});

router.get('/patient/:patientId', (req: Request, res: Response) => {
  const records = followupService.getFollowupsByPatient(req.params.patientId);
  res.json({ success: true, data: records });
});

router.patch('/:id/complete', (req: Request, res: Response) => {
  const record = followupService.completeFollowup(req.params.id, req.body, req.user!.userId);
  if (!record) {
    res.status(404).json({ success: false, message: '随访记录不存在' });
    return;
  }
  res.json({ success: true, data: record });
});

export default router;
