import { v4 as uuidv4 } from 'uuid';

export interface FollowupRecord {
  id: string;
  patientId: string;
  patientName: string;
  dischargeDate: string;
  followupDate: string;
  followupType: 'phone' | 'outpatient' | 'online';
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  daysAfterDischarge: number;
  anticoagulantCompliance: 'good' | 'partial' | 'poor' | null;
  symptoms: string[];
  vteOccurred: boolean;
  bleedingOccurred: boolean;
  notes?: string;
  followedBy?: string;
  completedAt?: string;
}

const mockFollowups: FollowupRecord[] = [
  {
    id: 'fu-001', patientId: 'pat-101', patientName: '王大海',
    dischargeDate: '2026-04-15', followupDate: '2026-04-22',
    followupType: 'phone', status: 'completed', daysAfterDischarge: 7,
    anticoagulantCompliance: 'good', symptoms: [], vteOccurred: false,
    bleedingOccurred: false, notes: '恢复良好，继续服用利伐沙班',
    followedBy: 'user-liuna', completedAt: '2026-04-22T10:00:00',
  },
  {
    id: 'fu-002', patientId: 'pat-101', patientName: '王大海',
    dischargeDate: '2026-04-15', followupDate: '2026-04-29',
    followupType: 'phone', status: 'completed', daysAfterDischarge: 14,
    anticoagulantCompliance: 'good', symptoms: [], vteOccurred: false,
    bleedingOccurred: false, followedBy: 'user-liuna', completedAt: '2026-04-29T14:30:00',
  },
  {
    id: 'fu-003', patientId: 'pat-101', patientName: '王大海',
    dischargeDate: '2026-04-15', followupDate: '2026-05-13',
    followupType: 'outpatient', status: 'pending', daysAfterDischarge: 28,
    anticoagulantCompliance: null, symptoms: [], vteOccurred: false,
    bleedingOccurred: false,
  },
  {
    id: 'fu-004', patientId: 'pat-102', patientName: '赵秀兰',
    dischargeDate: '2026-04-20', followupDate: '2026-04-27',
    followupType: 'phone', status: 'completed', daysAfterDischarge: 7,
    anticoagulantCompliance: 'partial', symptoms: ['轻微下肢肿胀'],
    vteOccurred: false, bleedingOccurred: false,
    notes: '患者反映偶有忘记服药，已再次宣教', followedBy: 'user-liuna',
    completedAt: '2026-04-27T09:00:00',
  },
  {
    id: 'fu-005', patientId: 'pat-102', patientName: '赵秀兰',
    dischargeDate: '2026-04-20', followupDate: '2026-05-04',
    followupType: 'phone', status: 'missed', daysAfterDischarge: 14,
    anticoagulantCompliance: null, symptoms: [], vteOccurred: false,
    bleedingOccurred: false, notes: '患者未接听，已安排次日再拨',
  },
  {
    id: 'fu-006', patientId: 'pat-103', patientName: '钱伟明',
    dischargeDate: '2026-04-25', followupDate: '2026-05-02',
    followupType: 'phone', status: 'completed', daysAfterDischarge: 7,
    anticoagulantCompliance: 'poor', symptoms: ['小腿疼痛', '下肢肿胀'],
    vteOccurred: true, bleedingOccurred: false,
    notes: '疑似DVT，已建议立即返院复查超声', followedBy: 'user-zhaomin',
    completedAt: '2026-05-02T11:00:00',
  },
  {
    id: 'fu-007', patientId: 'pat-104', patientName: '孙丽萍',
    dischargeDate: '2026-04-28', followupDate: '2026-05-05',
    followupType: 'phone', status: 'pending', daysAfterDischarge: 7,
    anticoagulantCompliance: null, symptoms: [], vteOccurred: false,
    bleedingOccurred: false,
  },
  {
    id: 'fu-008', patientId: 'pat-105', patientName: '周建华',
    dischargeDate: '2026-04-30', followupDate: '2026-05-07',
    followupType: 'phone', status: 'pending', daysAfterDischarge: 7,
    anticoagulantCompliance: null, symptoms: [], vteOccurred: false,
    bleedingOccurred: false,
  },
  {
    id: 'fu-009', patientId: 'pat-106', patientName: '吴志刚',
    dischargeDate: '2026-05-01', followupDate: '2026-05-08',
    followupType: 'phone', status: 'pending', daysAfterDischarge: 7,
    anticoagulantCompliance: null, symptoms: [], vteOccurred: false,
    bleedingOccurred: false,
  },
];

export class FollowupService {
  getFollowups(status?: string): FollowupRecord[] {
    if (status) return mockFollowups.filter(f => f.status === status);
    return mockFollowups;
  }

  getFollowupsByPatient(patientId: string): FollowupRecord[] {
    return mockFollowups.filter(f => f.patientId === patientId);
  }

  completeFollowup(id: string, data: {
    anticoagulantCompliance: string;
    symptoms: string[];
    vteOccurred: boolean;
    bleedingOccurred: boolean;
    notes?: string;
  }, userId: string): FollowupRecord | null {
    const record = mockFollowups.find(f => f.id === id);
    if (!record) return null;
    record.status = 'completed';
    record.anticoagulantCompliance = data.anticoagulantCompliance as any;
    record.symptoms = data.symptoms;
    record.vteOccurred = data.vteOccurred;
    record.bleedingOccurred = data.bleedingOccurred;
    record.notes = data.notes;
    record.followedBy = userId;
    record.completedAt = new Date().toISOString();
    return record;
  }

  getFollowupStats() {
    const total = mockFollowups.length;
    const completed = mockFollowups.filter(f => f.status === 'completed').length;
    const pending = mockFollowups.filter(f => f.status === 'pending').length;
    const missed = mockFollowups.filter(f => f.status === 'missed').length;
    const vteEvents = mockFollowups.filter(f => f.vteOccurred).length;
    const bleedingEvents = mockFollowups.filter(f => f.bleedingOccurred).length;
    const complianceGood = mockFollowups.filter(f => f.anticoagulantCompliance === 'good').length;
    const compliancePoor = mockFollowups.filter(f => f.anticoagulantCompliance === 'poor').length;

    return {
      total, completed, pending, missed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      vteEvents, bleedingEvents,
      complianceGood, compliancePoor,
    };
  }
}
