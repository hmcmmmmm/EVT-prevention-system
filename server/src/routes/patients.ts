import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { PatientService } from '../services/patient-service';
import { AssessmentService } from '../services/assessment-service';
import { getHisDataSource } from '../services/his-datasource';

const router = Router();
const patientService = new PatientService();
const assessmentService = new AssessmentService();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const patients = await patientService.getPatientsByPermission(req.user!);
    const patientsWithAssessment = patients.map(p => {
      const latest = assessmentService.getLatestAssessment(p.id);
      return {
        ...p,
        latestAssessment: latest ? {
          riskLevel: latest.riskLevel,
          totalScore: latest.totalScore,
          scaleType: latest.scaleType,
          assessedAt: latest.assessedAt,
        } : null,
      };
    });
    res.json({ success: true, data: patientsWithAssessment, total: patientsWithAssessment.length });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取患者列表失败' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const patient = await patientService.getPatientDetail(req.params.id, req.user!);
    if (!patient) {
      res.status(404).json({ success: false, message: '患者不存在或无权访问' });
      return;
    }

    const his = getHisDataSource();
    const [assessments, plans, labs] = await Promise.all([
      Promise.resolve(assessmentService.getAssessmentsByPatient(patient.id)),
      Promise.resolve(assessmentService.getPreventionPlans(patient.id)),
      his.getLabResults(patient.id),
    ]);

    res.json({
      success: true,
      data: { patient, assessments, preventionPlans: plans, labResults: labs },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取患者详情失败' });
  }
});

router.get('/:id/labs', async (req: Request, res: Response) => {
  try {
    const his = getHisDataSource();
    const labs = await his.getLabResults(req.params.id);
    res.json({ success: true, data: labs });
  } catch (err) {
    res.status(500).json({ success: false, message: '获取检验结果失败' });
  }
});

export default router;
