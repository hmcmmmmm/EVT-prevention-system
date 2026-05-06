// ============================================================
// VTE 预防管理系统 — 核心类型定义
// ============================================================

/** 用户角色 */
export enum Role {
  ADMIN = 'admin',               // 系统管理员
  DEPT_DIRECTOR = 'dept_director', // 科室主任
  ATTENDING = 'attending',        // 主治医师
  RESIDENT = 'resident',          // 住院医师
  HEAD_NURSE = 'head_nurse',      // 护士长
  NURSE = 'nurse',                // 护士
}

/** 角色权限范围 */
export enum DataScope {
  ALL = 'all',           // 全院
  DEPARTMENT = 'dept',   // 本科室
  TEAM = 'team',         // 本医疗组
  SELF = 'self',         // 仅自己负责的患者
}

/** 权限映射 */
export const ROLE_PERMISSIONS: Record<Role, {
  dataScope: DataScope;
  canAssess: boolean;
  canPrescribe: boolean;
  canViewStats: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  label: string;
}> = {
  [Role.ADMIN]: {
    dataScope: DataScope.ALL,
    canAssess: false,
    canPrescribe: false,
    canViewStats: true,
    canManageUsers: true,
    canExportData: true,
    label: '系统管理员',
  },
  [Role.DEPT_DIRECTOR]: {
    dataScope: DataScope.DEPARTMENT,
    canAssess: true,
    canPrescribe: true,
    canViewStats: true,
    canManageUsers: false,
    canExportData: true,
    label: '科室主任',
  },
  [Role.ATTENDING]: {
    dataScope: DataScope.TEAM,
    canAssess: true,
    canPrescribe: true,
    canViewStats: true,
    canManageUsers: false,
    canExportData: false,
    label: '主治医师',
  },
  [Role.RESIDENT]: {
    dataScope: DataScope.SELF,
    canAssess: true,
    canPrescribe: false,
    canViewStats: false,
    canManageUsers: false,
    canExportData: false,
    label: '住院医师',
  },
  [Role.HEAD_NURSE]: {
    dataScope: DataScope.DEPARTMENT,
    canAssess: true,
    canPrescribe: false,
    canViewStats: true,
    canManageUsers: false,
    canExportData: false,
    label: '护士长',
  },
  [Role.NURSE]: {
    dataScope: DataScope.SELF,
    canAssess: true,
    canPrescribe: false,
    canViewStats: false,
    canManageUsers: false,
    canExportData: false,
    label: '护士',
  },
};

/** 用户 */
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: Role;
  departmentId: string;
  teamId?: string;
  title: string;        // 职称
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

/** 科室 */
export interface Department {
  id: string;
  name: string;
  code: string;
  type: 'surgical' | 'medical' | 'icu' | 'emergency' | 'obstetrics' | 'oncology' | 'other';
  bedCount: number;
  directorId: string;
}

/** 医疗组 */
export interface MedicalTeam {
  id: string;
  name: string;
  departmentId: string;
  leaderId: string;     // 组长（主治医师）
  memberIds: string[];
}

/** 患者 */
export interface Patient {
  id: string;
  medicalRecordNo: string;  // 病历号
  name: string;
  gender: 'male' | 'female';
  age: number;
  birthDate: string;
  idCard?: string;
  phone?: string;
  admissionDate: string;
  dischargeDate?: string;
  departmentId: string;
  bedNo: string;
  diagnosis: string[];
  attendingDoctorId: string;
  primaryNurseId: string;
  status: 'admitted' | 'discharged' | 'transferred';
  bmi?: number;
  weight?: number;
  height?: number;
}

/** VTE 风险等级 */
export enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/** 评估量表类型 */
export enum ScaleType {
  CAPRINI = 'caprini',
  PADUA = 'padua',
  WELLS_DVT = 'wells_dvt',
  WELLS_PE = 'wells_pe',
  KHORANA = 'khorana',
}

/** 评估触发事件 */
export enum TriggerEvent {
  ADMISSION = 'admission',
  TRANSFER = 'transfer',
  PRE_SURGERY = 'pre_surgery',
  POST_SURGERY = 'post_surgery',
  CONDITION_CHANGE = 'condition_change',
  DISCHARGE = 'discharge',
  MANUAL = 'manual',
}

/** 风险评估记录 */
export interface RiskAssessment {
  id: string;
  patientId: string;
  scaleType: ScaleType;
  totalScore: number;
  riskLevel: RiskLevel;
  bleedingScore?: number;
  bleedingRisk?: RiskLevel;
  factors: AssessmentFactor[];
  triggerEvent: TriggerEvent;
  assessorId: string;
  assessedAt: string;
  notes?: string;
}

/** 评估因子 */
export interface AssessmentFactor {
  code: string;
  name: string;
  score: number;
  source: 'auto' | 'manual';
  checked: boolean;
}

/** 预防措施类型 */
export enum PreventionType {
  BASIC = 'basic',        // 基础预防（早期活动）
  PHYSICAL = 'physical',  // 物理预防（弹力袜/IPC）
  DRUG = 'drug',          // 药物预防（抗凝）
  COMBINED = 'combined',  // 联合预防
}

/** 预防方案 */
export interface PreventionPlan {
  id: string;
  assessmentId: string;
  patientId: string;
  type: PreventionType;
  measures: string[];
  drugName?: string;
  dosage?: string;
  frequency?: string;
  status: 'recommended' | 'accepted' | 'rejected' | 'completed';
  createdBy: string;
  createdAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
}

/** 预警 */
export interface Alert {
  id: string;
  patientId: string;
  type: 'unassessed' | 'no_prevention' | 'lab_abnormal' | 'high_risk' | 'overdue_reassess';
  severity: 'red' | 'yellow';
  message: string;
  status: 'pending' | 'handled' | 'escalated';
  createdAt: string;
  handledBy?: string;
  handledAt?: string;
}

/** JWT Payload */
export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
  departmentId: string;
  teamId?: string;
}

/** API 响应 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
  permissions: typeof ROLE_PERMISSIONS[Role];
}

// ============================================================
// HIS 数据库接口（预留对接）
// ============================================================

/** HIS 数据源接口 — 实际对接时实现此接口 */
export interface IHisDataSource {
  getPatients(departmentId?: string): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient | null>;
  getDepartments(): Promise<Department[]>;
  getStaff(departmentId?: string): Promise<User[]>;
  getLabResults(patientId: string): Promise<LabResult[]>;
  getMedicalOrders(patientId: string): Promise<MedicalOrder[]>;
}

/** 检验结果 */
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

/** 医嘱 */
export interface MedicalOrder {
  id: string;
  patientId: string;
  orderType: 'drug' | 'exam' | 'treatment' | 'nursing';
  content: string;
  dosage?: string;
  frequency?: string;
  status: 'active' | 'completed' | 'cancelled';
  orderedBy: string;
  orderedAt: string;
}
