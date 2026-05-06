import {
  JwtPayload, Patient, DataScope, ROLE_PERMISSIONS, Role,
} from '../types';
import { patients, medicalTeams } from '../data/mock-data';
import { getHisDataSource } from './his-datasource';

export class PatientService {
  /**
   * 根据用户角色和权限范围过滤患者列表
   * - ADMIN / 全院权限: 所有在院患者
   * - 科室主任 / 护士长: 本科室全部患者
   * - 主治医师: 本医疗组患者
   * - 住院医师 / 护士: 仅自己负责的患者
   */
  async getPatientsByPermission(user: JwtPayload): Promise<Patient[]> {
    const his = getHisDataSource();
    const permissions = ROLE_PERMISSIONS[user.role];
    const allPatients = await his.getPatients();

    switch (permissions.dataScope) {
      case DataScope.ALL:
        return allPatients.filter(p => p.status === 'admitted');

      case DataScope.DEPARTMENT:
        return allPatients.filter(
          p => p.departmentId === user.departmentId && p.status === 'admitted'
        );

      case DataScope.TEAM: {
        const team = medicalTeams.find(
          t => t.departmentId === user.departmentId && t.memberIds.includes(user.userId)
        );
        if (!team) {
          return allPatients.filter(
            p => p.attendingDoctorId === user.userId && p.status === 'admitted'
          );
        }
        return allPatients.filter(
          p => team.memberIds.includes(p.attendingDoctorId) && p.status === 'admitted'
        );
      }

      case DataScope.SELF:
        return allPatients.filter(
          p =>
            (p.attendingDoctorId === user.userId || p.primaryNurseId === user.userId) &&
            p.status === 'admitted'
        );

      default:
        return [];
    }
  }

  async getPatientDetail(patientId: string, user: JwtPayload): Promise<Patient | null> {
    const accessiblePatients = await this.getPatientsByPermission(user);
    return accessiblePatients.find(p => p.id === patientId) || null;
  }
}
