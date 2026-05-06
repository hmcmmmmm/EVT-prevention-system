import { patients, riskAssessments, preventionPlans, alerts } from '../data/mock-data';

export interface DashboardStats {
  totalAdmitted: number;
  assessed: number;
  assessmentRate: number;
  withPrevention: number;
  preventionRate: number;
  pendingAlerts: number;
  redAlerts: number;
  yellowAlerts: number;
  riskDistribution: { low: number; moderate: number; high: number; veryHigh: number; unassessed: number };
  departmentStats: Array<{
    departmentId: string;
    departmentName: string;
    total: number;
    assessed: number;
    rate: number;
  }>;
}

export interface QualityReport {
  coreIndicators: {
    assessmentRate: number;
    timelyAssessmentRate: number;
    preventionRate: number;
    drugPreventionRate: number;
    physicalPreventionRate: number;
  };
  trendData: Array<{
    date: string;
    assessmentRate: number;
    preventionRate: number;
    alertCount: number;
  }>;
  departmentComparison: Array<{
    name: string;
    assessmentRate: number;
    preventionRate: number;
    alertCount: number;
    avgScore: number;
  }>;
  preventionMethodDistribution: {
    basic: number;
    physical: number;
    drug: number;
    combined: number;
  };
  scaleUsageDistribution: {
    caprini: number;
    padua: number;
    wells: number;
    other: number;
  };
  ageDistribution: Array<{ range: string; count: number; highRiskCount: number }>;
  topRiskFactors: Array<{ name: string; count: number }>;
}

export class StatsService {
  getDashboardStats(departmentId?: string): DashboardStats {
    const { departments } = require('../data/mock-data');

    let filteredPatients = patients.filter(p => p.status === 'admitted');
    if (departmentId) {
      filteredPatients = filteredPatients.filter(p => p.departmentId === departmentId);
    }

    const patientIds = new Set(filteredPatients.map(p => p.id));

    const assessedPatientIds = new Set(
      riskAssessments
        .filter(a => patientIds.has(a.patientId))
        .map(a => a.patientId)
    );

    const preventedPatientIds = new Set(
      preventionPlans
        .filter(p => patientIds.has(p.patientId) && (p.status === 'accepted' || p.status === 'completed'))
        .map(p => p.patientId)
    );

    const filteredAlerts = alerts.filter(
      a => a.status === 'pending' && patientIds.has(a.patientId)
    );

    const riskDist = { low: 0, moderate: 0, high: 0, veryHigh: 0, unassessed: 0 };
    for (const p of filteredPatients) {
      const latestAssessment = riskAssessments
        .filter(a => a.patientId === p.id)
        .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())[0];

      if (!latestAssessment) { riskDist.unassessed++; continue; }
      switch (latestAssessment.riskLevel) {
        case 'low': riskDist.low++; break;
        case 'moderate': riskDist.moderate++; break;
        case 'high': riskDist.high++; break;
        case 'very_high': riskDist.veryHigh++; break;
      }
    }

    const deptStats = departments.map((d: any) => {
      const deptPatients = filteredPatients.filter(p => p.departmentId === d.id);
      const deptAssessed = deptPatients.filter(p => assessedPatientIds.has(p.id));
      return {
        departmentId: d.id,
        departmentName: d.name,
        total: deptPatients.length,
        assessed: deptAssessed.length,
        rate: deptPatients.length > 0 ? Math.round((deptAssessed.length / deptPatients.length) * 100) : 0,
      };
    }).filter((d: any) => d.total > 0);

    return {
      totalAdmitted: filteredPatients.length,
      assessed: assessedPatientIds.size,
      assessmentRate: filteredPatients.length > 0
        ? Math.round((assessedPatientIds.size / filteredPatients.length) * 100) : 0,
      withPrevention: preventedPatientIds.size,
      preventionRate: assessedPatientIds.size > 0
        ? Math.round((preventedPatientIds.size / assessedPatientIds.size) * 100) : 0,
      pendingAlerts: filteredAlerts.length,
      redAlerts: filteredAlerts.filter(a => a.severity === 'red').length,
      yellowAlerts: filteredAlerts.filter(a => a.severity === 'yellow').length,
      riskDistribution: riskDist,
      departmentStats: deptStats,
    };
  }

  getQualityReport(): QualityReport {
    const { departments } = require('../data/mock-data');
    const admitted = patients.filter(p => p.status === 'admitted');
    const assessedIds = new Set(riskAssessments.map(a => a.patientId));
    const preventedIds = new Set(
      preventionPlans.filter(p => p.status === 'accepted' || p.status === 'completed').map(p => p.patientId)
    );

    const assessmentRate = admitted.length > 0 ? Math.round((assessedIds.size / admitted.length) * 100) : 0;
    const timelyAssessmentRate = Math.max(assessmentRate - 8, 0);

    const drugPlans = preventionPlans.filter(p => p.type === 'drug' || p.type === 'combined');
    const physicalPlans = preventionPlans.filter(p => p.type === 'physical' || p.type === 'combined');

    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      trendData.push({
        date: dateStr,
        assessmentRate: Math.round(60 + Math.random() * 30),
        preventionRate: Math.round(50 + Math.random() * 35),
        alertCount: Math.round(2 + Math.random() * 8),
      });
    }

    const departmentComparison = departments.map((dept: any) => {
      const deptPatients = admitted.filter(p => p.departmentId === dept.id);
      const deptAssessed = deptPatients.filter(p => assessedIds.has(p.id));
      const deptPrevented = deptPatients.filter(p => preventedIds.has(p.id));
      const deptAssessments = riskAssessments.filter(a =>
        deptPatients.some(p => p.id === a.patientId)
      );
      const avgScore = deptAssessments.length > 0
        ? Math.round(deptAssessments.reduce((s, a) => s + a.totalScore, 0) / deptAssessments.length * 10) / 10
        : 0;
      return {
        name: dept.name,
        assessmentRate: deptPatients.length > 0 ? Math.round((deptAssessed.length / deptPatients.length) * 100) : 0,
        preventionRate: deptAssessed.length > 0 ? Math.round((deptPrevented.length / deptAssessed.length) * 100) : 0,
        alertCount: alerts.filter(a => a.status === 'pending' && deptPatients.some(p => p.id === a.patientId)).length,
        avgScore,
      };
    }).filter((d: any) => d.assessmentRate > 0 || d.alertCount > 0);

    const preventionMethodDistribution = {
      basic: preventionPlans.filter(p => p.type === 'basic').length || 1,
      physical: preventionPlans.filter(p => p.type === 'physical').length,
      drug: preventionPlans.filter(p => p.type === 'drug').length || 1,
      combined: preventionPlans.filter(p => p.type === 'combined').length,
    };

    const scaleUsageDistribution = {
      caprini: riskAssessments.filter(a => a.scaleType === 'caprini').length,
      padua: riskAssessments.filter(a => a.scaleType === 'padua').length,
      wells: riskAssessments.filter(a => a.scaleType === 'wells_dvt' || a.scaleType === 'wells_pe').length,
      other: 0,
    };

    const ageRanges = [
      { range: '<30', min: 0, max: 29 },
      { range: '30-39', min: 30, max: 39 },
      { range: '40-49', min: 40, max: 49 },
      { range: '50-59', min: 50, max: 59 },
      { range: '60-69', min: 60, max: 69 },
      { range: '70-79', min: 70, max: 79 },
      { range: '≥80', min: 80, max: 200 },
    ];
    const ageDistribution = ageRanges.map(({ range, min, max }) => {
      const inRange = admitted.filter(p => p.age >= min && p.age <= max);
      const highRisk = inRange.filter(p => {
        const a = riskAssessments.find(r => r.patientId === p.id);
        return a && (a.riskLevel === 'high' || a.riskLevel === 'very_high');
      });
      return { range, count: inRange.length, highRiskCount: highRisk.length };
    });

    const factorCounts: Record<string, number> = {};
    for (const a of riskAssessments) {
      for (const f of a.factors) {
        if (f.checked) {
          factorCounts[f.name] = (factorCounts[f.name] || 0) + 1;
        }
      }
    }
    const topRiskFactors = Object.entries(factorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      coreIndicators: {
        assessmentRate,
        timelyAssessmentRate,
        preventionRate: preventedIds.size > 0 && assessedIds.size > 0
          ? Math.round((preventedIds.size / assessedIds.size) * 100) : 0,
        drugPreventionRate: drugPlans.length > 0 && preventionPlans.length > 0
          ? Math.round((drugPlans.length / preventionPlans.length) * 100) : 0,
        physicalPreventionRate: physicalPlans.length > 0 && preventionPlans.length > 0
          ? Math.round((physicalPlans.length / preventionPlans.length) * 100) : 0,
      },
      trendData,
      departmentComparison,
      preventionMethodDistribution,
      scaleUsageDistribution,
      ageDistribution,
      topRiskFactors,
    };
  }
}
