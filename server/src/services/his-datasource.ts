import {
  IHisDataSource, Patient, Department, User, LabResult, MedicalOrder,
} from '../types';
import {
  patients, departments, users, labResults,
} from '../data/mock-data';

/**
 * 模拟 HIS 数据源实现
 *
 * 实际对接时：
 * 1. 替换此类为真实数据库连接（如 Oracle/SQL Server/MySQL）
 * 2. 实现 IHisDataSource 接口的所有方法
 * 3. 在 config 中配置数据库连接字符串
 *
 * 接口预留点：
 * - constructor 接受连接配置 { host, port, database, username, password }
 * - 所有方法返回 Promise，兼容异步数据库查询
 */
export class MockHisDataSource implements IHisDataSource {
  // ---- 对接时替换为真实数据库连接 ----
  // private dbPool: DatabasePool;
  //
  // constructor(config: { host: string; port: number; database: string; username: string; password: string }) {
  //   this.dbPool = createPool(config);
  // }

  async getPatients(departmentId?: string): Promise<Patient[]> {
    // 对接时: SELECT * FROM patients WHERE department_id = ?
    if (departmentId) {
      return patients.filter(p => p.departmentId === departmentId && p.status === 'admitted');
    }
    return patients.filter(p => p.status === 'admitted');
  }

  async getPatientById(id: string): Promise<Patient | null> {
    // 对接时: SELECT * FROM patients WHERE id = ?
    return patients.find(p => p.id === id) || null;
  }

  async getDepartments(): Promise<Department[]> {
    // 对接时: SELECT * FROM departments
    return departments;
  }

  async getStaff(departmentId?: string): Promise<User[]> {
    // 对接时: SELECT * FROM staff WHERE department_id = ?
    if (departmentId) {
      return users.filter(u => u.departmentId === departmentId);
    }
    return users;
  }

  async getLabResults(patientId: string): Promise<LabResult[]> {
    // 对接时: SELECT * FROM lab_results WHERE patient_id = ? ORDER BY reported_at DESC
    return labResults.filter(l => l.patientId === patientId);
  }

  async getMedicalOrders(_patientId: string): Promise<MedicalOrder[]> {
    // 对接时: SELECT * FROM medical_orders WHERE patient_id = ?
    return [];
  }
}

/** 全局单例 — 对接时替换 MockHisDataSource 为真实实现 */
let dataSourceInstance: IHisDataSource | null = null;

export function getHisDataSource(): IHisDataSource {
  if (!dataSourceInstance) {
    dataSourceInstance = new MockHisDataSource();
    // 对接时:
    // dataSourceInstance = new RealHisDataSource({
    //   host: process.env.HIS_DB_HOST || 'localhost',
    //   port: parseInt(process.env.HIS_DB_PORT || '1521'),
    //   database: process.env.HIS_DB_NAME || 'HIS',
    //   username: process.env.HIS_DB_USER || '',
    //   password: process.env.HIS_DB_PASS || '',
    // });
  }
  return dataSourceInstance;
}
