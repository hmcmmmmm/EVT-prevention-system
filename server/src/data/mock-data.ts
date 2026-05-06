import bcrypt from 'bcryptjs';
import {
  User, Role, Department, MedicalTeam, Patient, RiskAssessment,
  ScaleType, RiskLevel, TriggerEvent, PreventionPlan, PreventionType,
  Alert, LabResult, AssessmentFactor,
} from '../types';

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

// ============================================================
// 科室数据
// ============================================================
export const departments: Department[] = [
  { id: 'dept-ortho', name: '骨科', code: 'ORTHO', type: 'surgical', bedCount: 45, directorId: 'user-zhang' },
  { id: 'dept-general', name: '普外科', code: 'GS', type: 'surgical', bedCount: 40, directorId: 'user-wang' },
  { id: 'dept-oncology', name: '肿瘤科', code: 'ONCO', type: 'oncology', bedCount: 50, directorId: 'user-chen' },
  { id: 'dept-neuro', name: '神经内科', code: 'NEURO', type: 'medical', bedCount: 35, directorId: 'user-liu' },
  { id: 'dept-icu', name: '重症医学科', code: 'ICU', type: 'icu', bedCount: 20, directorId: 'user-zhao' },
  { id: 'dept-ob', name: '产科', code: 'OB', type: 'obstetrics', bedCount: 30, directorId: 'user-sun' },
];

// ============================================================
// 用户数据（含默认登录账号）
//
// ╔════════════════════════════════════════════════════════════╗
// ║  默认登录账号                                              ║
// ╠══════════════╦═══════════╦══════════════╦════════════════╣
// ║ 用户名        ║ 密码       ║ 角色          ║ 科室            ║
// ╠══════════════╬═══════════╬══════════════╬════════════════╣
// ║ admin        ║ admin123  ║ 系统管理员     ║ 全院            ║
// ║ zhangwei     ║ 123456    ║ 科室主任       ║ 骨科            ║
// ║ liming       ║ 123456    ║ 主治医师       ║ 骨科            ║
// ║ wangjie      ║ 123456    ║ 住院医师       ║ 骨科            ║
// ║ zhaomin      ║ 123456    ║ 护士长         ║ 骨科            ║
// ║ liuna        ║ 123456    ║ 护士           ║ 骨科            ║
// ╚══════════════╩═══════════╩══════════════╩════════════════╝
// ============================================================
export const users: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    passwordHash: hash('admin123'),
    name: '系统管理员',
    role: Role.ADMIN,
    departmentId: 'dept-ortho',
    title: '管理员',
    isActive: true,
  },
  {
    id: 'user-zhang',
    username: 'zhangwei',
    passwordHash: hash('123456'),
    name: '张伟',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-ortho',
    teamId: 'team-ortho-1',
    title: '主任医师',
    phone: '13800000001',
    isActive: true,
  },
  {
    id: 'user-li',
    username: 'liming',
    passwordHash: hash('123456'),
    name: '李明',
    role: Role.ATTENDING,
    departmentId: 'dept-ortho',
    teamId: 'team-ortho-1',
    title: '副主任医师',
    phone: '13800000002',
    isActive: true,
  },
  {
    id: 'user-wangjie',
    username: 'wangjie',
    passwordHash: hash('123456'),
    name: '王杰',
    role: Role.RESIDENT,
    departmentId: 'dept-ortho',
    teamId: 'team-ortho-1',
    title: '住院医师',
    phone: '13800000003',
    isActive: true,
  },
  {
    id: 'user-zhaomin',
    username: 'zhaomin',
    passwordHash: hash('123456'),
    name: '赵敏',
    role: Role.HEAD_NURSE,
    departmentId: 'dept-ortho',
    title: '副主任护师',
    phone: '13800000004',
    isActive: true,
  },
  {
    id: 'user-liuna',
    username: 'liuna',
    passwordHash: hash('123456'),
    name: '刘娜',
    role: Role.NURSE,
    departmentId: 'dept-ortho',
    teamId: 'team-ortho-1',
    title: '护师',
    phone: '13800000005',
    isActive: true,
  },
  // 普外科人员
  {
    id: 'user-wang',
    username: 'wangqiang',
    passwordHash: hash('123456'),
    name: '王强',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-general',
    teamId: 'team-gs-1',
    title: '主任医师',
    isActive: true,
  },
  {
    id: 'user-huang',
    username: 'huangfang',
    passwordHash: hash('123456'),
    name: '黄芳',
    role: Role.ATTENDING,
    departmentId: 'dept-general',
    teamId: 'team-gs-1',
    title: '主治医师',
    isActive: true,
  },
  // 肿瘤科
  {
    id: 'user-chen',
    username: 'chenyu',
    passwordHash: hash('123456'),
    name: '陈宇',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-oncology',
    title: '主任医师',
    isActive: true,
  },
  // 神经内科
  {
    id: 'user-liu',
    username: 'liuyang',
    passwordHash: hash('123456'),
    name: '刘阳',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-neuro',
    title: '主任医师',
    isActive: true,
  },
  // ICU
  {
    id: 'user-zhao',
    username: 'zhaolei',
    passwordHash: hash('123456'),
    name: '赵磊',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-icu',
    title: '主任医师',
    isActive: true,
  },
  // 产科
  {
    id: 'user-sun',
    username: 'sunli',
    passwordHash: hash('123456'),
    name: '孙丽',
    role: Role.DEPT_DIRECTOR,
    departmentId: 'dept-ob',
    title: '主任医师',
    isActive: true,
  },
];

// ============================================================
// 医疗组
// ============================================================
export const medicalTeams: MedicalTeam[] = [
  {
    id: 'team-ortho-1',
    name: '骨科一组',
    departmentId: 'dept-ortho',
    leaderId: 'user-li',
    memberIds: ['user-li', 'user-wangjie', 'user-liuna'],
  },
  {
    id: 'team-ortho-2',
    name: '骨科二组',
    departmentId: 'dept-ortho',
    leaderId: 'user-zhang',
    memberIds: ['user-zhang'],
  },
  {
    id: 'team-gs-1',
    name: '普外一组',
    departmentId: 'dept-general',
    leaderId: 'user-huang',
    memberIds: ['user-huang'],
  },
];

// ============================================================
// 患者数据
// ============================================================
export const patients: Patient[] = [
  {
    id: 'pat-001', medicalRecordNo: 'MRN20260001', name: '陈建国', gender: 'male', age: 67,
    birthDate: '1959-03-15', admissionDate: '2026-05-01', departmentId: 'dept-ortho',
    bedNo: '03-12', diagnosis: ['左股骨颈骨折', '高血压病3级', '2型糖尿病'],
    attendingDoctorId: 'user-li', primaryNurseId: 'user-liuna', status: 'admitted',
    bmi: 26.8, weight: 78, height: 170,
  },
  {
    id: 'pat-002', medicalRecordNo: 'MRN20260002', name: '王秀英', gender: 'female', age: 72,
    birthDate: '1954-08-22', admissionDate: '2026-05-02', departmentId: 'dept-ortho',
    bedNo: '03-15', diagnosis: ['右膝关节退行性变', '骨质疏松症'],
    attendingDoctorId: 'user-li', primaryNurseId: 'user-liuna', status: 'admitted',
    bmi: 24.1, weight: 58, height: 155,
  },
  {
    id: 'pat-003', medicalRecordNo: 'MRN20260003', name: '李志强', gender: 'male', age: 55,
    birthDate: '1971-01-10', admissionDate: '2026-05-03', departmentId: 'dept-ortho',
    bedNo: '03-08', diagnosis: ['腰椎间盘突出症', '腰椎管狭窄'],
    attendingDoctorId: 'user-wangjie', primaryNurseId: 'user-zhaomin', status: 'admitted',
    bmi: 28.5, weight: 85, height: 172,
  },
  {
    id: 'pat-004', medicalRecordNo: 'MRN20260004', name: '张桂兰', gender: 'female', age: 80,
    birthDate: '1946-06-30', admissionDate: '2026-04-28', departmentId: 'dept-ortho',
    bedNo: '03-20', diagnosis: ['右侧股骨粗隆间骨折', '冠心病', '房颤'],
    attendingDoctorId: 'user-zhang', primaryNurseId: 'user-zhaomin', status: 'admitted',
    bmi: 22.0, weight: 52, height: 154,
  },
  // 普外科患者
  {
    id: 'pat-005', medicalRecordNo: 'MRN20260005', name: '刘伟', gender: 'male', age: 48,
    birthDate: '1978-11-05', admissionDate: '2026-05-04', departmentId: 'dept-general',
    bedNo: '05-03', diagnosis: ['结肠癌', '肝转移'],
    attendingDoctorId: 'user-huang', primaryNurseId: 'user-huang', status: 'admitted',
    bmi: 21.5, weight: 65, height: 174,
  },
  {
    id: 'pat-006', medicalRecordNo: 'MRN20260006', name: '赵丽华', gender: 'female', age: 62,
    birthDate: '1964-04-18', admissionDate: '2026-05-03', departmentId: 'dept-general',
    bedNo: '05-07', diagnosis: ['胆囊结石', '慢性胆囊炎'],
    attendingDoctorId: 'user-huang', primaryNurseId: 'user-huang', status: 'admitted',
    bmi: 27.3, weight: 70, height: 160,
  },
  // 肿瘤科
  {
    id: 'pat-007', medicalRecordNo: 'MRN20260007', name: '孙明华', gender: 'male', age: 58,
    birthDate: '1968-09-12', admissionDate: '2026-04-30', departmentId: 'dept-oncology',
    bedNo: '07-11', diagnosis: ['右肺腺癌 IIIa期', '肺栓塞病史'],
    attendingDoctorId: 'user-chen', primaryNurseId: 'user-chen', status: 'admitted',
    bmi: 20.1, weight: 58, height: 170,
  },
  {
    id: 'pat-008', medicalRecordNo: 'MRN20260008', name: '周婷', gender: 'female', age: 45,
    birthDate: '1981-02-14', admissionDate: '2026-05-02', departmentId: 'dept-oncology',
    bedNo: '07-05', diagnosis: ['乳腺癌术后', '化疗期'],
    attendingDoctorId: 'user-chen', primaryNurseId: 'user-chen', status: 'admitted',
    bmi: 23.4, weight: 60, height: 160,
  },
  // 神经内科
  {
    id: 'pat-009', medicalRecordNo: 'MRN20260009', name: '马建设', gender: 'male', age: 70,
    birthDate: '1956-07-25', admissionDate: '2026-05-01', departmentId: 'dept-neuro',
    bedNo: '04-09', diagnosis: ['脑梗死', '高血压病', '高脂血症'],
    attendingDoctorId: 'user-liu', primaryNurseId: 'user-liu', status: 'admitted',
    bmi: 25.6, weight: 72, height: 168,
  },
  {
    id: 'pat-010', medicalRecordNo: 'MRN20260010', name: '林秀珍', gender: 'female', age: 65,
    birthDate: '1961-12-03', admissionDate: '2026-05-04', departmentId: 'dept-neuro',
    bedNo: '04-14', diagnosis: ['帕金森病', '认知功能障碍'],
    attendingDoctorId: 'user-liu', primaryNurseId: 'user-liu', status: 'admitted',
    bmi: 22.8, weight: 55, height: 156,
  },
  // ICU
  {
    id: 'pat-011', medicalRecordNo: 'MRN20260011', name: '吴大伟', gender: 'male', age: 52,
    birthDate: '1974-05-20', admissionDate: '2026-05-04', departmentId: 'dept-icu',
    bedNo: 'ICU-03', diagnosis: ['多发伤', '失血性休克', '右侧血气胸'],
    attendingDoctorId: 'user-zhao', primaryNurseId: 'user-zhao', status: 'admitted',
    bmi: 24.0, weight: 75, height: 177,
  },
  // 产科
  {
    id: 'pat-012', medicalRecordNo: 'MRN20260012', name: '杨芳', gender: 'female', age: 32,
    birthDate: '1994-10-08', admissionDate: '2026-05-03', departmentId: 'dept-ob',
    bedNo: '08-06', diagnosis: ['孕38+2周', '妊娠期高血压', '剖宫产术后'],
    attendingDoctorId: 'user-sun', primaryNurseId: 'user-sun', status: 'admitted',
    bmi: 29.1, weight: 76, height: 162,
  },
];

// ============================================================
// Caprini 评估因子模板
// ============================================================
export const capriniFactors: Omit<AssessmentFactor, 'checked'>[] = [
  { code: 'age_41_60', name: '年龄41-60岁', score: 1, source: 'auto' },
  { code: 'age_61_74', name: '年龄61-74岁', score: 2, source: 'auto' },
  { code: 'age_75_plus', name: '年龄≥75岁', score: 3, source: 'auto' },
  { code: 'minor_surgery', name: '小手术', score: 1, source: 'manual' },
  { code: 'major_surgery', name: '大手术(>45min)', score: 2, source: 'manual' },
  { code: 'bmi_25_plus', name: 'BMI≥25', score: 1, source: 'auto' },
  { code: 'bed_rest', name: '卧床制动(>72h)', score: 2, source: 'manual' },
  { code: 'vte_history', name: '既往VTE病史', score: 3, source: 'manual' },
  { code: 'family_vte', name: 'VTE家族史', score: 3, source: 'manual' },
  { code: 'cancer', name: '活动性恶性肿瘤', score: 2, source: 'auto' },
  { code: 'central_line', name: '中心静脉置管', score: 2, source: 'manual' },
  { code: 'chf', name: '充血性心力衰竭', score: 1, source: 'auto' },
  { code: 'sepsis', name: '脓毒症(<1月)', score: 1, source: 'manual' },
  { code: 'pneumonia', name: '严重肺部疾病', score: 1, source: 'auto' },
  { code: 'leg_cast', name: '下肢石膏固定', score: 2, source: 'manual' },
  { code: 'hip_fracture', name: '髋、骨盆或下肢骨折', score: 5, source: 'auto' },
  { code: 'stroke', name: '脑卒中(<1月)', score: 5, source: 'auto' },
  { code: 'dvt_pe', name: '急性脊髓损伤(<1月)', score: 5, source: 'manual' },
  { code: 'oral_contra', name: '口服避孕药/激素', score: 1, source: 'manual' },
  { code: 'pregnancy', name: '妊娠或产后', score: 1, source: 'auto' },
  { code: 'varicose', name: '静脉曲张', score: 1, source: 'manual' },
  { code: 'edema', name: '下肢水肿', score: 1, source: 'manual' },
  { code: 'immobility', name: '活动受限(当前疾病)', score: 1, source: 'manual' },
];

// ============================================================
// Padua 评估因子模板
// ============================================================
export const paduaFactors: Omit<AssessmentFactor, 'checked'>[] = [
  { code: 'active_cancer', name: '活动性肿瘤', score: 3, source: 'auto' },
  { code: 'previous_vte', name: '既往VTE史(不含浅静脉血栓)', score: 3, source: 'manual' },
  { code: 'reduced_mobility', name: '活动能力减退', score: 3, source: 'manual' },
  { code: 'thrombophilia', name: '已知血栓形成倾向', score: 3, source: 'manual' },
  { code: 'trauma_surgery', name: '近期(≤1月)创伤和/或手术', score: 2, source: 'manual' },
  { code: 'age_70_plus', name: '年龄≥70岁', score: 1, source: 'auto' },
  { code: 'heart_respiratory', name: '心脏和/或呼吸衰竭', score: 1, source: 'auto' },
  { code: 'mi_stroke', name: '急性心梗和/或缺血性脑卒中', score: 1, source: 'auto' },
  { code: 'infection', name: '急性感染和/或风湿性疾病', score: 1, source: 'manual' },
  { code: 'obesity', name: '肥胖(BMI≥30)', score: 1, source: 'auto' },
  { code: 'hormonal', name: '正在使用激素治疗', score: 1, source: 'manual' },
];

// ============================================================
// 风险评估记录
// ============================================================
export const riskAssessments: RiskAssessment[] = [
  {
    id: 'ra-001', patientId: 'pat-001', scaleType: ScaleType.CAPRINI,
    totalScore: 7, riskLevel: RiskLevel.HIGH,
    bleedingScore: 3, bleedingRisk: RiskLevel.LOW,
    factors: [
      { code: 'age_61_74', name: '年龄61-74岁', score: 2, source: 'auto', checked: true },
      { code: 'hip_fracture', name: '髋、骨盆或下肢骨折', score: 5, source: 'auto', checked: true },
    ],
    triggerEvent: TriggerEvent.ADMISSION,
    assessorId: 'user-li', assessedAt: '2026-05-01T10:30:00',
  },
  {
    id: 'ra-002', patientId: 'pat-002', scaleType: ScaleType.CAPRINI,
    totalScore: 4, riskLevel: RiskLevel.HIGH,
    bleedingScore: 2, bleedingRisk: RiskLevel.LOW,
    factors: [
      { code: 'age_61_74', name: '年龄61-74岁', score: 2, source: 'auto', checked: true },
      { code: 'major_surgery', name: '大手术(>45min)', score: 2, source: 'manual', checked: true },
    ],
    triggerEvent: TriggerEvent.ADMISSION,
    assessorId: 'user-li', assessedAt: '2026-05-02T09:15:00',
  },
  {
    id: 'ra-003', patientId: 'pat-004', scaleType: ScaleType.CAPRINI,
    totalScore: 10, riskLevel: RiskLevel.VERY_HIGH,
    bleedingScore: 6, bleedingRisk: RiskLevel.HIGH,
    factors: [
      { code: 'age_75_plus', name: '年龄≥75岁', score: 3, source: 'auto', checked: true },
      { code: 'hip_fracture', name: '髋、骨盆或下肢骨折', score: 5, source: 'auto', checked: true },
      { code: 'bed_rest', name: '卧床制动(>72h)', score: 2, source: 'manual', checked: true },
    ],
    triggerEvent: TriggerEvent.ADMISSION,
    assessorId: 'user-zhang', assessedAt: '2026-04-28T14:20:00',
  },
  {
    id: 'ra-004', patientId: 'pat-007', scaleType: ScaleType.PADUA,
    totalScore: 8, riskLevel: RiskLevel.HIGH,
    factors: [
      { code: 'active_cancer', name: '活动性肿瘤', score: 3, source: 'auto', checked: true },
      { code: 'previous_vte', name: '既往VTE史', score: 3, source: 'manual', checked: true },
      { code: 'reduced_mobility', name: '活动能力减退', score: 3, source: 'manual', checked: false },
      { code: 'trauma_surgery', name: '近期创伤/手术', score: 2, source: 'manual', checked: false },
      { code: 'age_70_plus', name: '年龄≥70岁', score: 1, source: 'auto', checked: false },
    ],
    triggerEvent: TriggerEvent.ADMISSION,
    assessorId: 'user-chen', assessedAt: '2026-04-30T16:00:00',
  },
];

// ============================================================
// 预防方案
// ============================================================
export const preventionPlans: PreventionPlan[] = [
  {
    id: 'pp-001', assessmentId: 'ra-001', patientId: 'pat-001',
    type: PreventionType.COMBINED,
    measures: ['低分子肝素皮下注射', '间歇充气加压装置(IPC)', '鼓励早期活动'],
    drugName: '依诺肝素', dosage: '40mg', frequency: '每日1次',
    status: 'accepted', createdBy: 'user-li', createdAt: '2026-05-01T11:00:00',
    acceptedBy: 'user-li', acceptedAt: '2026-05-01T11:05:00',
  },
  {
    id: 'pp-002', assessmentId: 'ra-002', patientId: 'pat-002',
    type: PreventionType.PHYSICAL,
    measures: ['弹力袜', '间歇充气加压装置(IPC)', '抬高患肢'],
    status: 'accepted', createdBy: 'user-li', createdAt: '2026-05-02T09:30:00',
    acceptedBy: 'user-li', acceptedAt: '2026-05-02T09:35:00',
  },
  {
    id: 'pp-003', assessmentId: 'ra-003', patientId: 'pat-004',
    type: PreventionType.PHYSICAL,
    measures: ['间歇充气加压装置(IPC)', '被动活动'],
    status: 'recommended', createdBy: 'user-zhang', createdAt: '2026-04-28T14:40:00',
  },
];

// ============================================================
// 预警
// ============================================================
export const alerts: Alert[] = [
  {
    id: 'alert-001', patientId: 'pat-003', type: 'unassessed', severity: 'red',
    message: '患者李志强入院超过24h未完成VTE风险评估',
    status: 'pending', createdAt: '2026-05-04T10:00:00',
  },
  {
    id: 'alert-002', patientId: 'pat-005', type: 'unassessed', severity: 'red',
    message: '患者刘伟（结肠癌）入院超过24h未完成VTE风险评估',
    status: 'pending', createdAt: '2026-05-05T10:00:00',
  },
  {
    id: 'alert-003', patientId: 'pat-004', type: 'no_prevention', severity: 'yellow',
    message: '患者张桂兰评估为极高危但预防方案尚未执行（出血风险高）',
    status: 'pending', createdAt: '2026-04-29T08:00:00',
  },
  {
    id: 'alert-004', patientId: 'pat-009', type: 'unassessed', severity: 'yellow',
    message: '患者马建设入院超过48h未完成VTE风险评估',
    status: 'pending', createdAt: '2026-05-03T10:00:00',
  },
  {
    id: 'alert-005', patientId: 'pat-011', type: 'high_risk', severity: 'red',
    message: '患者吴大伟（ICU多发伤）D-二聚体显著升高',
    status: 'pending', createdAt: '2026-05-05T06:30:00',
  },
];

// ============================================================
// 检验结果
// ============================================================
export const labResults: LabResult[] = [
  { id: 'lab-001', patientId: 'pat-001', itemName: 'D-二聚体', itemCode: 'DDI', value: 2.35, unit: 'mg/L', referenceRange: '0-0.5', isAbnormal: true, reportedAt: '2026-05-01T08:00:00' },
  { id: 'lab-002', patientId: 'pat-001', itemName: '血小板计数', itemCode: 'PLT', value: 186, unit: '×10⁹/L', referenceRange: '125-350', isAbnormal: false, reportedAt: '2026-05-01T08:00:00' },
  { id: 'lab-003', patientId: 'pat-001', itemName: 'INR', itemCode: 'INR', value: 1.1, unit: '', referenceRange: '0.8-1.2', isAbnormal: false, reportedAt: '2026-05-01T08:00:00' },
  { id: 'lab-004', patientId: 'pat-004', itemName: 'D-二聚体', itemCode: 'DDI', value: 5.8, unit: 'mg/L', referenceRange: '0-0.5', isAbnormal: true, reportedAt: '2026-04-28T12:00:00' },
  { id: 'lab-005', patientId: 'pat-004', itemName: '血小板计数', itemCode: 'PLT', value: 89, unit: '×10⁹/L', referenceRange: '125-350', isAbnormal: true, reportedAt: '2026-04-28T12:00:00' },
  { id: 'lab-006', patientId: 'pat-007', itemName: 'D-二聚体', itemCode: 'DDI', value: 3.2, unit: 'mg/L', referenceRange: '0-0.5', isAbnormal: true, reportedAt: '2026-04-30T14:00:00' },
  { id: 'lab-007', patientId: 'pat-011', itemName: 'D-二聚体', itemCode: 'DDI', value: 12.5, unit: 'mg/L', referenceRange: '0-0.5', isAbnormal: true, reportedAt: '2026-05-05T05:00:00' },
  { id: 'lab-008', patientId: 'pat-011', itemName: '血小板计数', itemCode: 'PLT', value: 62, unit: '×10⁹/L', referenceRange: '125-350', isAbnormal: true, reportedAt: '2026-05-05T05:00:00' },
];
