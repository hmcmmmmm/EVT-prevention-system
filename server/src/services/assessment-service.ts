import { v4 as uuidv4 } from 'uuid';
import {
  RiskAssessment, ScaleType, RiskLevel, JwtPayload, AssessmentFactor,
  TriggerEvent, PreventionPlan, PreventionType, Alert,
} from '../types';
import {
  riskAssessments, preventionPlans, alerts, capriniFactors, paduaFactors,
} from '../data/mock-data';

export class AssessmentService {
  getScaleFactors(scaleType: ScaleType): Omit<AssessmentFactor, 'checked'>[] {
    switch (scaleType) {
      case ScaleType.CAPRINI:
        return capriniFactors;
      case ScaleType.PADUA:
        return paduaFactors;
      default:
        return capriniFactors;
    }
  }

  calculateRiskLevel(scaleType: ScaleType, totalScore: number): RiskLevel {
    if (scaleType === ScaleType.CAPRINI) {
      if (totalScore <= 1) return RiskLevel.LOW;
      if (totalScore <= 2) return RiskLevel.MODERATE;
      if (totalScore <= 4) return RiskLevel.HIGH;
      return RiskLevel.VERY_HIGH;
    }
    // Padua
    if (totalScore < 4) return RiskLevel.LOW;
    return RiskLevel.HIGH;
  }

  getAssessmentsByPatient(patientId: string): RiskAssessment[] {
    return riskAssessments.filter(a => a.patientId === patientId);
  }

  getLatestAssessment(patientId: string): RiskAssessment | undefined {
    const assessments = this.getAssessmentsByPatient(patientId);
    return assessments.sort((a, b) =>
      new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
    )[0];
  }

  createAssessment(data: {
    patientId: string;
    scaleType: ScaleType;
    factors: AssessmentFactor[];
    triggerEvent: TriggerEvent;
    bleedingScore?: number;
    notes?: string;
  }, user: JwtPayload): RiskAssessment {
    const totalScore = data.factors
      .filter(f => f.checked)
      .reduce((sum, f) => sum + f.score, 0);

    const assessment: RiskAssessment = {
      id: `ra-${uuidv4().slice(0, 8)}`,
      patientId: data.patientId,
      scaleType: data.scaleType,
      totalScore,
      riskLevel: this.calculateRiskLevel(data.scaleType, totalScore),
      bleedingScore: data.bleedingScore,
      bleedingRisk: data.bleedingScore != null
        ? (data.bleedingScore >= 7 ? RiskLevel.HIGH : data.bleedingScore >= 4 ? RiskLevel.MODERATE : RiskLevel.LOW)
        : undefined,
      factors: data.factors,
      triggerEvent: data.triggerEvent,
      assessorId: user.userId,
      assessedAt: new Date().toISOString(),
      notes: data.notes,
    };

    riskAssessments.push(assessment);
    return assessment;
  }

  // 预防方案
  getPreventionPlans(patientId: string): PreventionPlan[] {
    return preventionPlans.filter(p => p.patientId === patientId);
  }

  createPreventionPlan(data: Omit<PreventionPlan, 'id' | 'createdAt'>, user: JwtPayload): PreventionPlan {
    const plan: PreventionPlan = {
      ...data,
      id: `pp-${uuidv4().slice(0, 8)}`,
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
    };
    preventionPlans.push(plan);
    return plan;
  }

  // 预警
  getAlerts(departmentId?: string): Alert[] {
    if (departmentId) {
      const deptPatientIds = new Set(
        require('../data/mock-data').patients
          .filter((p: any) => p.departmentId === departmentId)
          .map((p: any) => p.id)
      );
      return alerts.filter(a => deptPatientIds.has(a.patientId));
    }
    return alerts;
  }

  getPendingAlerts(departmentId?: string): Alert[] {
    return this.getAlerts(departmentId).filter(a => a.status === 'pending');
  }

  handleAlert(alertId: string, userId: string): Alert | null {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return null;
    alert.status = 'handled';
    alert.handledBy = userId;
    alert.handledAt = new Date().toISOString();
    return alert;
  }
}
