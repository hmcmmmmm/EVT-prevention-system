export enum Role {
  ADMIN = 'admin',
  DEPT_DIRECTOR = 'dept_director',
  ATTENDING = 'attending',
  RESIDENT = 'resident',
  HEAD_NURSE = 'head_nurse',
  NURSE = 'nurse',
}

export enum DataScope {
  ALL = 'all',
  DEPARTMENT = 'dept',
  TEAM = 'team',
  SELF = 'self',
}

export interface Permissions {
  dataScope: DataScope;
  canAssess: boolean;
  canPrescribe: boolean;
  canViewStats: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  label: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  departmentId: string;
  teamId?: string;
  title: string;
  phone?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  type: string;
  bedCount: number;
}

export interface Patient {
  id: string;
  medicalRecordNo: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  admissionDate: string;
  departmentId: string;
  bedNo: string;
  diagnosis: string[];
  attendingDoctorId: string;
  primaryNurseId: string;
  status: string;
  bmi?: number;
  latestAssessment?: {
    riskLevel: string;
    totalScore: number;
    scaleType: string;
    assessedAt: string;
  } | null;
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  scaleType: string;
  totalScore: number;
  riskLevel: string;
  bleedingScore?: number;
  bleedingRisk?: string;
  factors: AssessmentFactor[];
  triggerEvent: string;
  assessorId: string;
  assessedAt: string;
  notes?: string;
}

export interface AssessmentFactor {
  code: string;
  name: string;
  score: number;
  source: 'auto' | 'manual';
  checked: boolean;
}

export interface PreventionPlan {
  id: string;
  assessmentId: string;
  patientId: string;
  type: string;
  measures: string[];
  drugName?: string;
  dosage?: string;
  frequency?: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  patientId: string;
  type: string;
  severity: 'red' | 'yellow';
  message: string;
  status: string;
  createdAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  itemName: string;
  itemCode: string;
  value: number;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  reportedAt: string;
}

export interface DashboardStats {
  totalAdmitted: number;
  assessed: number;
  assessmentRate: number;
  withPrevention: number;
  preventionRate: number;
  pendingAlerts: number;
  redAlerts: number;
  yellowAlerts: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    veryHigh: number;
    unassessed: number;
  };
  departmentStats: Array<{
    departmentId: string;
    departmentName: string;
    total: number;
    assessed: number;
    rate: number;
  }>;
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: Permissions;
}
