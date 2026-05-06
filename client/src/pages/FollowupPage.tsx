import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Tabs, Statistic, Row, Col, Space, Typography, Badge, Button, Modal,
  Form, Select, Checkbox, Input, Radio, message,
} from 'antd';
import {
  PhoneOutlined, CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { followupApi } from '../services/api';

const { Text } = Typography;
const { TextArea } = Input;

interface FollowupRecord {
  id: string; patientId: string; patientName: string; dischargeDate: string;
  followupDate: string; followupType: string; status: string; daysAfterDischarge: number;
  anticoagulantCompliance: string | null; symptoms: string[];
  vteOccurred: boolean; bleedingOccurred: boolean; notes?: string; completedAt?: string;
}

interface FollowupStats {
  total: number; completed: number; pending: number; missed: number;
  completionRate: number; vteEvents: number; bleedingEvents: number;
  complianceGood: number; compliancePoor: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待随访', color: 'orange' },
  completed: { label: '已完成', color: 'green' },
  missed: { label: '未联系上', color: 'red' },
  cancelled: { label: '已取消', color: 'default' },
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  phone: { label: '电话随访', icon: <PhoneOutlined /> },
  outpatient: { label: '门诊复查', icon: <CalendarOutlined /> },
  online: { label: '线上随访', icon: <CheckCircleOutlined /> },
};

const symptomOptions = [
  '下肢肿胀', '下肢疼痛', '小腿压痛', '皮肤发红发热', '呼吸困难',
  '胸痛', '咯血', '牙龈出血', '皮肤瘀斑', '鼻出血', '黑便', '无症状',
];

const FollowupPage: React.FC = () => {
  const [records, setRecords] = useState<FollowupRecord[]>([]);
  const [stats, setStats] = useState<FollowupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FollowupRecord | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, statsRes] = await Promise.all([
        followupApi.getList(), followupApi.getStats(),
      ]);
      setRecords(recordsRes.data.data);
      setStats(statsRes.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCompleteModal = (record: FollowupRecord) => {
    setSelectedRecord(record);
    form.resetFields();
    setModalVisible(true);
  };

  const handleComplete = async () => {
    if (!selectedRecord) return;
    try {
      const values = await form.validateFields();
      await followupApi.complete(selectedRecord.id, values);
      message.success('随访记录已保存');
      setModalVisible(false);
      fetchData();
    } catch { /* validation failed */ }
  };

  const columns = [
    {
      title: '患者', dataIndex: 'patientName', width: 100,
    },
    {
      title: '出院日期', dataIndex: 'dischargeDate', width: 110,
      render: (d: string) => d?.slice(0, 10),
    },
    {
      title: '随访日期', dataIndex: 'followupDate', width: 110,
      render: (d: string) => d?.slice(0, 10),
    },
    {
      title: '天数', dataIndex: 'daysAfterDischarge', width: 80, align: 'center' as const,
      render: (d: number) => <Tag>D+{d}</Tag>,
    },
    {
      title: '方式', dataIndex: 'followupType', width: 100,
      render: (t: string) => (
        <Space size={4}>
          {typeConfig[t]?.icon}
          <Text>{typeConfig[t]?.label || t}</Text>
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label || s}</Tag>,
    },
    {
      title: '用药依从', dataIndex: 'anticoagulantCompliance', width: 100,
      render: (c: string | null) => {
        if (!c) return <Text type="secondary">-</Text>;
        const map: Record<string, { label: string; color: string }> = {
          good: { label: '良好', color: 'green' },
          partial: { label: '部分', color: 'orange' },
          poor: { label: '差', color: 'red' },
        };
        return <Tag color={map[c]?.color}>{map[c]?.label}</Tag>;
      },
    },
    {
      title: 'VTE事件', dataIndex: 'vteOccurred', width: 90, align: 'center' as const,
      render: (v: boolean) => v
        ? <Tag color="red" icon={<WarningOutlined />}>是</Tag>
        : <Tag color="green">否</Tag>,
    },
    {
      title: '症状', dataIndex: 'symptoms',
      render: (s: string[]) => s.length > 0
        ? s.map((sym, i) => <Tag key={i} color="orange" style={{ marginBottom: 2 }}>{sym}</Tag>)
        : <Text type="secondary">无</Text>,
    },
    {
      title: '操作', key: 'action', width: 100, align: 'center' as const,
      render: (_: any, record: FollowupRecord) =>
        record.status === 'pending' || record.status === 'missed' ? (
          <Button size="small" type="primary" onClick={() => openCompleteModal(record)}>
            记录
          </Button>
        ) : (
          <Text type="secondary">{record.completedAt?.slice(0, 10)}</Text>
        ),
    },
  ];

  const pendingRecords = records.filter(r => r.status === 'pending');
  const completedRecords = records.filter(r => r.status === 'completed');
  const missedRecords = records.filter(r => r.status === 'missed');

  return (
    <div>
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="总随访数" value={stats.total} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="已完成" value={stats.completed}
                valueStyle={{ color: '#52c41a' }} suffix={<Tag color="green">{stats.completionRate}%</Tag>} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="待随访" value={stats.pending} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="未联系上" value={stats.missed} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="VTE事件" value={stats.vteEvents}
                prefix={<WarningOutlined />} valueStyle={{ color: stats.vteEvents > 0 ? '#ff4d4f' : '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card size="small">
              <Statistic title="用药依从良好" value={stats.complianceGood}
                prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs defaultActiveKey="pending" items={[
          {
            key: 'pending',
            label: <Badge count={pendingRecords.length} size="small" offset={[10, 0]}>待随访</Badge>,
            children: <Table dataSource={pendingRecords} columns={columns} rowKey="id" loading={loading}
              size="middle" pagination={false} />,
          },
          {
            key: 'completed',
            label: <Badge count={completedRecords.length} size="small" offset={[10, 0]} color="green">已完成</Badge>,
            children: <Table dataSource={completedRecords} columns={columns} rowKey="id" loading={loading}
              size="middle" pagination={false} />,
          },
          {
            key: 'missed',
            label: <Badge count={missedRecords.length} size="small" offset={[10, 0]} color="red">未联系上</Badge>,
            children: <Table dataSource={missedRecords} columns={columns} rowKey="id" loading={loading}
              size="middle" pagination={false} />,
          },
          {
            key: 'all',
            label: `全部 (${records.length})`,
            children: <Table dataSource={records} columns={columns} rowKey="id" loading={loading}
              size="middle" pagination={{ pageSize: 20 }} />,
          },
        ]} />
      </Card>

      <Modal
        title={`随访记录 — ${selectedRecord?.patientName}`}
        open={modalVisible}
        onOk={handleComplete}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        width={560}
      >
        <Form form={form} layout="vertical"
          initialValues={{ anticoagulantCompliance: 'good', vteOccurred: false, bleedingOccurred: false, symptoms: [] }}
        >
          <Form.Item name="anticoagulantCompliance" label="抗凝药物依从性" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="good">良好（按时按量）</Radio>
              <Radio value="partial">部分（偶有遗漏）</Radio>
              <Radio value="poor">差（经常遗漏/自行停药）</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="symptoms" label="症状">
            <Checkbox.Group options={symptomOptions} />
          </Form.Item>
          <Form.Item name="vteOccurred" label="是否发生VTE事件" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是（疑似/确诊DVT或PE）</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="bleedingOccurred" label="是否发生出血事件">
            <Radio.Group>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="随访记录补充说明..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FollowupPage;
