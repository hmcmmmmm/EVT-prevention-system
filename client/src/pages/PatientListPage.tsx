import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Card, Space, Button, Tooltip, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';
import { Patient } from '../types';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const riskLevelConfig: Record<string, { label: string; color: string }> = {
  low: { label: '低危', color: 'green' },
  moderate: { label: '中危', color: 'gold' },
  high: { label: '高危', color: 'red' },
  very_high: { label: '极高危', color: '#cf1322' },
};

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { permissions } = useAuth();

  useEffect(() => {
    patientApi.getList().then(res => {
      setPatients(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.includes(search) || p.medicalRecordNo.includes(search) || p.bedNo.includes(search)
  );

  const columns = [
    {
      title: '床号', dataIndex: 'bedNo', width: 80, sorter: (a: Patient, b: Patient) => a.bedNo.localeCompare(b.bedNo),
    },
    {
      title: '姓名', dataIndex: 'name', width: 100,
      render: (name: string, record: Patient) => (
        <Button type="link" onClick={() => navigate(`/patients/${record.id}`)}>{name}</Button>
      ),
    },
    {
      title: '性别', dataIndex: 'gender', width: 60,
      render: (g: string) => g === 'male' ? '男' : '女',
    },
    { title: '年龄', dataIndex: 'age', width: 60, sorter: (a: Patient, b: Patient) => a.age - b.age },
    { title: '病历号', dataIndex: 'medicalRecordNo', width: 130 },
    {
      title: '入院日期', dataIndex: 'admissionDate', width: 110,
      render: (d: string) => d?.slice(0, 10),
    },
    {
      title: '诊断', dataIndex: 'diagnosis', ellipsis: true,
      render: (diag: string[]) => (
        <Tooltip title={diag.join('; ')}>
          <Text ellipsis style={{ maxWidth: 200 }}>{diag.join('; ')}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'VTE风险', key: 'risk', width: 100, align: 'center' as const,
      render: (_: any, record: Patient) => {
        if (!record.latestAssessment) {
          return <Tag color="default">未评估</Tag>;
        }
        const cfg = riskLevelConfig[record.latestAssessment.riskLevel];
        return <Tag color={cfg?.color}>{cfg?.label} ({record.latestAssessment.totalScore}分)</Tag>;
      },
      sorter: (a: Patient, b: Patient) => {
        const scoreA = a.latestAssessment?.totalScore ?? -1;
        const scoreB = b.latestAssessment?.totalScore ?? -1;
        return scoreA - scoreB;
      },
    },
    {
      title: '操作', key: 'action', width: 150, align: 'center' as const,
      render: (_: any, record: Patient) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/patients/${record.id}`)}>
            详情
          </Button>
          {permissions?.canAssess && (
            <Button size="small" type="primary" icon={<FormOutlined />} onClick={() => navigate(`/patients/${record.id}/assess`)}>
              评估
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={`患者列表 (${filteredPatients.length})`}
      extra={
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索姓名/病历号/床号"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      }
    >
      <Table
        dataSource={filteredPatients}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: t => `共 ${t} 条` }}
        rowClassName={(record) => {
          if (!record.latestAssessment) return 'row-unassessed';
          if (record.latestAssessment.riskLevel === 'very_high') return 'row-very-high';
          if (record.latestAssessment.riskLevel === 'high') return 'row-high';
          return '';
        }}
      />
    </Card>
  );
};

export default PatientListPage;
