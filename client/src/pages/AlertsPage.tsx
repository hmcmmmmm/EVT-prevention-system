import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Badge, Typography } from 'antd';
import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import { Alert } from '../types';

const { Text } = Typography;

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAlerts = () => {
    setLoading(true);
    assessmentApi.getAlerts({ pending: true }).then(res => {
      setAlerts(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleAlert = async (id: string) => {
    try {
      await assessmentApi.handleAlert(id);
      message.success('预警已处理');
      fetchAlerts();
    } catch {
      message.error('处理失败');
    }
  };

  const columns = [
    {
      title: '级别', dataIndex: 'severity', width: 80, align: 'center' as const,
      render: (s: string) => s === 'red'
        ? <Badge status="error" text={<Text type="danger" strong>紧急</Text>} />
        : <Badge status="warning" text={<Text style={{ color: '#faad14' }} strong>警告</Text>} />,
      sorter: (a: Alert, b: Alert) => (a.severity === 'red' ? 0 : 1) - (b.severity === 'red' ? 0 : 1),
    },
    {
      title: '预警类型', dataIndex: 'type', width: 120,
      render: (t: string) => {
        const map: Record<string, { label: string; color: string }> = {
          unassessed: { label: '未评估', color: 'red' },
          no_prevention: { label: '未预防', color: 'orange' },
          lab_abnormal: { label: '检验异常', color: 'purple' },
          high_risk: { label: '高危预警', color: 'volcano' },
          overdue_reassess: { label: '需复评', color: 'gold' },
        };
        return <Tag color={map[t]?.color}>{map[t]?.label || t}</Tag>;
      },
    },
    { title: '预警内容', dataIndex: 'message', ellipsis: true },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 160,
      render: (t: string) => t?.slice(0, 16).replace('T', ' '),
      sorter: (a: Alert, b: Alert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    },
    {
      title: '操作', key: 'action', width: 180, align: 'center' as const,
      render: (_: any, record: Alert) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/patients/${record.patientId}`)}>
            查看患者
          </Button>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleAlert(record.id)}>
            处理
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title={`预警中心 (${alerts.length} 条待处理)`}>
      <Table
        dataSource={alerts}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={false}
        rowClassName={(r: Alert) => r.severity === 'red' ? 'row-red-alert' : ''}
      />
    </Card>
  );
};

export default AlertsPage;
